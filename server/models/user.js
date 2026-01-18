import bcrypt from 'bcryptjs';
import { query, transaction } from '../db/config.js';

/**
 * User Model - PostgreSQL Implementation
 * Handles all user-related database operations
 */

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new user
 */
export async function createUser(userData) {
  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insert user
  const result = await query(
    `INSERT INTO users (name, email, password) 
     VALUES ($1, $2, $3) 
     RETURNING id, name, email, created_at, onboarding_completed, onboarding_step,
               vision, reminder_time, review_day, tone, current_goal`,
    [name, email.toLowerCase(), hashedPassword]
  );

  const user = result.rows[0];

  console.log(`✅ User created: ${user.email}`);

  return formatUserResponse(user);
}

/**
 * Create or update user from Google OAuth
 */
export async function createOrUpdateGoogleUser(googleData) {
  const { googleId, name, email, photo } = googleData;

  // Check if user exists by email
  let user = await findUserByEmail(email);

  if (user) {
    // Update existing user with Google ID if not already set
    if (!user.google_id) {
      await query(
        `UPDATE users SET google_id = $1, photo = $2 WHERE id = $3`,
        [googleId, photo, user.id]
      );
    }
    // Update name if it changed
    if (name && name !== user.name) {
      await query(
        `UPDATE users SET name = $1 WHERE id = $2`,
        [name, user.id]
      );
    }
    // Get updated user
    user = await findUserById(user.id);
  } else {
    // Check if user exists by Google ID
    const result = await query(
      `SELECT * FROM users WHERE google_id = $1`,
      [googleId]
    );

    if (result.rows.length > 0) {
      user = result.rows[0];
    } else {
      // Create new user with Google OAuth
      const insertResult = await query(
        `INSERT INTO users (name, email, google_id, photo, password) 
         VALUES ($1, $2, $3, $4, NULL) 
         RETURNING id, name, email, created_at, onboarding_completed, onboarding_step,
                   vision, reminder_time, review_day, tone, current_goal`,
        [name, email.toLowerCase(), googleId, photo]
      );

      user = insertResult.rows[0];
      console.log(`✅ Google user created: ${user.email}`);
    }
  }

  return formatUserResponse(user);
}

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Find user by email
 */
export async function findUserByEmail(email) {
  const result = await query(
    `SELECT * FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  return result.rows[0] || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id) {
  const result = await query(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Get user with full profile (including values, roles, focus areas)
 */
export async function getUserProfile(id) {
  // Get user
  const userResult = await query(
    `SELECT id, name, email, created_at, onboarding_completed, onboarding_step,
            vision, reminder_time, review_day, tone, current_goal, life_phase
     FROM users WHERE id = $1`,
    [id]
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  const user = userResult.rows[0];

  // Get values
  const valuesResult = await query(
    `SELECT value FROM user_values WHERE user_id = $1`,
    [id]
  );

  // Get roles
  const rolesResult = await query(
    `SELECT role FROM user_roles WHERE user_id = $1`,
    [id]
  );

  // Get focus areas
  const focusResult = await query(
    `SELECT focus_area FROM user_focus_areas WHERE user_id = $1`,
    [id]
  );

  return formatUserResponse(user, {
    values: valuesResult.rows.map(r => r.value),
    roles: rolesResult.rows.map(r => r.role),
    focusAreas: focusResult.rows.map(r => r.focus_area),
  });
}

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update user profile
 */
export async function updateUser(id, updates) {
  const allowedFields = ['name', 'vision', 'reminder_time', 'review_day', 'tone', 'current_goal'];
  const setClause = [];
  const values = [];
  let paramIndex = 1;

  // Map camelCase to snake_case
  const fieldMapping = {
    reminderTime: 'reminder_time',
    reviewDay: 'review_day',
    currentGoal: 'current_goal',
  };

  for (const [key, value] of Object.entries(updates)) {
    const dbField = fieldMapping[key] || key;
    if (allowedFields.includes(dbField) && value !== undefined) {
      setClause.push(`${dbField} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    return getUserProfile(id);
  }

  values.push(id);

  await query(
    `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramIndex}`,
    values
  );

  return getUserProfile(id);
}

/**
 * Update user identity (vision, values, roles)
 */
export async function updateIdentity(id, identity) {
  return transaction(async (client) => {
    // Update vision
    if (identity.vision !== undefined) {
      await client.query(
        `UPDATE users SET vision = $1 WHERE id = $2`,
        [identity.vision, id]
      );
    }

    // Update values
    if (identity.values) {
      // Delete existing values
      await client.query(
        `DELETE FROM user_values WHERE user_id = $1`,
        [id]
      );

      // Insert new values
      for (const value of identity.values) {
        await client.query(
          `INSERT INTO user_values (user_id, value) VALUES ($1, $2)`,
          [id, value]
        );
      }
    }

    // Update roles
    if (identity.roles) {
      // Delete existing roles
      await client.query(
        `DELETE FROM user_roles WHERE user_id = $1`,
        [id]
      );

      // Insert new roles
      for (const role of identity.roles) {
        await client.query(
          `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
          [id, role]
        );
      }
    }

    return getUserProfile(id);
  });
}

/**
 * Update focus areas
 */
export async function updateFocusAreas(id, focusAreas) {
  return transaction(async (client) => {
    // Delete existing focus areas
    await client.query(
      `DELETE FROM user_focus_areas WHERE user_id = $1`,
      [id]
    );

    // Insert new focus areas
    for (const area of focusAreas) {
      await client.query(
        `INSERT INTO user_focus_areas (user_id, focus_area) VALUES ($1, $2)`,
        [id, area]
      );
    }

    return getUserProfile(id);
  });
}

/**
 * Update preferences
 */
export async function updatePreferences(id, preferences) {
  const { reminderTime, reviewDay, tone } = preferences;

  await query(
    `UPDATE users SET 
       reminder_time = COALESCE($1, reminder_time),
       review_day = COALESCE($2, review_day),
       tone = COALESCE($3, tone)
     WHERE id = $4`,
    [reminderTime, reviewDay, tone, id]
  );

  return getUserProfile(id);
}

/**
 * Update onboarding progress
 */
export async function updateOnboardingStep(id, step, data = {}) {
  return transaction(async (client) => {
    // Update step and completion status (5 steps total now)
    const completed = step >= 5;
    
    console.log(`📝 Updating onboarding step ${step} for user ${id}`, {
      step,
      completed,
      hasVision: data.identity?.vision !== undefined,
      hasValues: data.identity?.values?.length > 0,
      hasRoles: data.identity?.roles?.length > 0,
      hasLifePhase: data.lifePhase !== undefined,
      hasChallenges: data.challenges?.length > 0,
    });
    
    await client.query(
      `UPDATE users SET 
         onboarding_step = $1,
         onboarding_completed = $2
       WHERE id = $3`,
      [step, completed, id]
    );

    // Update identity if provided
    if (data.identity) {
      if (data.identity.vision !== undefined && data.identity.vision !== null && data.identity.vision.trim() !== '') {
        await client.query(
          `UPDATE users SET vision = $1 WHERE id = $2`,
          [data.identity.vision.trim(), id]
        );
        console.log(`✅ Saved vision: ${data.identity.vision.substring(0, 50)}...`);
      }

      if (data.identity.values && Array.isArray(data.identity.values) && data.identity.values.length > 0) {
        await client.query(`DELETE FROM user_values WHERE user_id = $1`, [id]);
        for (const value of data.identity.values) {
          await client.query(
            `INSERT INTO user_values (user_id, value) VALUES ($1, $2)`,
            [id, value]
          );
        }
        console.log(`✅ Saved ${data.identity.values.length} values:`, data.identity.values);
      }

      if (data.identity.roles && Array.isArray(data.identity.roles) && data.identity.roles.length > 0) {
        await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [id]);
        for (const role of data.identity.roles) {
          await client.query(
            `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
            [id, role]
          );
        }
        console.log(`✅ Saved ${data.identity.roles.length} roles:`, data.identity.roles);
      }
    }

    // Update life phase if provided
    if (data.lifePhase !== undefined && data.lifePhase !== null && data.lifePhase.trim() !== '') {
      await client.query(
        `UPDATE users SET life_phase = $1 WHERE id = $2`,
        [data.lifePhase.trim(), id]
      );
      console.log(`✅ Saved life phase: ${data.lifePhase}`);
    }

    // Update challenges (stored as focus areas)
    if (data.challenges && Array.isArray(data.challenges) && data.challenges.length > 0) {
      await client.query(`DELETE FROM user_focus_areas WHERE user_id = $1`, [id]);
      for (const challenge of data.challenges) {
        await client.query(
          `INSERT INTO user_focus_areas (user_id, focus_area) VALUES ($1, $2)`,
          [id, challenge]
        );
      }
      console.log(`✅ Saved ${data.challenges.length} challenges:`, data.challenges);
    }

    // Query profile using the transaction client to see uncommitted changes
    const profileResult = await client.query(
      `SELECT id, name, email, created_at, onboarding_completed, onboarding_step,
              vision, reminder_time, review_day, tone, current_goal, life_phase
       FROM users WHERE id = $1`,
      [id]
    );

    if (profileResult.rows.length === 0) {
      throw new Error('User not found after update');
    }

    const user = profileResult.rows[0];

    // Get values, roles, and focus areas using transaction client
    const [valuesResult, rolesResult, focusAreasResult] = await Promise.all([
      client.query('SELECT value FROM user_values WHERE user_id = $1', [id]),
      client.query('SELECT role FROM user_roles WHERE user_id = $1', [id]),
      client.query('SELECT focus_area FROM user_focus_areas WHERE user_id = $1', [id])
    ]);

    const profile = formatUserResponse({
      ...user,
      values: valuesResult.rows.map(r => r.value),
      roles: rolesResult.rows.map(r => r.role),
      focus_areas: focusAreasResult.rows.map(r => r.focus_area)
    });

    console.log(`✅ Onboarding step ${step} saved. Completed: ${profile.onboardingCompleted}`);
    
    return profile;
  });
}

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Delete user account
 */
export async function deleteUser(id) {
  await query(`DELETE FROM users WHERE id = $1`, [id]);
  return true;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format user response (remove password, format structure)
 */
function formatUserResponse(user, extras = {}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    onboardingCompleted: user.onboarding_completed,
    onboardingStep: user.onboarding_step,
    identity: {
      vision: user.vision || null,
      values: extras.values || [],
      roles: extras.roles || [],
    },
    focusAreas: extras.focusAreas || [],
    lifePhase: user.life_phase || null,
    currentGoal: user.current_goal || null,
    preferences: {
      reminderTime: user.reminder_time || '09:00',
      reviewDay: user.review_day || 'sunday',
      tone: user.tone || 'coach',
    },
  };
}

/**
 * Verify password
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Get all users (admin function)
 */
export async function getAllUsers() {
  const result = await query(
    `SELECT id, name, email, created_at, onboarding_completed 
     FROM users ORDER BY created_at DESC`
  );

  return result.rows;
}


/**
 * User Model - PostgreSQL Implementation
 * Handles all user-related database operations
 */

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new user
 */
export async function createUser(userData) {
  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insert user
  const result = await query(
    `INSERT INTO users (name, email, password) 
     VALUES ($1, $2, $3) 
     RETURNING id, name, email, created_at, onboarding_completed, onboarding_step,
               vision, reminder_time, review_day, tone, current_goal`,
    [name, email.toLowerCase(), hashedPassword]
  );

  const user = result.rows[0];

  console.log(`✅ User created: ${user.email}`);

  return formatUserResponse(user);
}

/**
 * Create or update user from Google OAuth
 */
export async function createOrUpdateGoogleUser(googleData) {
  const { googleId, name, email, photo } = googleData;

  // Check if user exists by email
  let user = await findUserByEmail(email);

  if (user) {
    // Update existing user with Google ID if not already set
    if (!user.google_id) {
      await query(
        `UPDATE users SET google_id = $1, photo = $2 WHERE id = $3`,
        [googleId, photo, user.id]
      );
    }
    // Update name if it changed
    if (name && name !== user.name) {
      await query(
        `UPDATE users SET name = $1 WHERE id = $2`,
        [name, user.id]
      );
    }
    // Get updated user
    user = await findUserById(user.id);
  } else {
    // Check if user exists by Google ID
    const result = await query(
      `SELECT * FROM users WHERE google_id = $1`,
      [googleId]
    );

    if (result.rows.length > 0) {
      user = result.rows[0];
    } else {
      // Create new user with Google OAuth
      const insertResult = await query(
        `INSERT INTO users (name, email, google_id, photo, password) 
         VALUES ($1, $2, $3, $4, NULL) 
         RETURNING id, name, email, created_at, onboarding_completed, onboarding_step,
                   vision, reminder_time, review_day, tone, current_goal`,
        [name, email.toLowerCase(), googleId, photo]
      );

      user = insertResult.rows[0];
      console.log(`✅ Google user created: ${user.email}`);
    }
  }

  return formatUserResponse(user);
}

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Find user by email
 */
export async function findUserByEmail(email) {
  const result = await query(
    `SELECT * FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  return result.rows[0] || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id) {
  const result = await query(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Get user with full profile (including values, roles, focus areas)
 */
export async function getUserProfile(id) {
  // Get user
  const userResult = await query(
    `SELECT id, name, email, created_at, onboarding_completed, onboarding_step,
            vision, reminder_time, review_day, tone, current_goal, life_phase
     FROM users WHERE id = $1`,
    [id]
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  const user = userResult.rows[0];

  // Get values
  const valuesResult = await query(
    `SELECT value FROM user_values WHERE user_id = $1`,
    [id]
  );

  // Get roles
  const rolesResult = await query(
    `SELECT role FROM user_roles WHERE user_id = $1`,
    [id]
  );

  // Get focus areas
  const focusResult = await query(
    `SELECT focus_area FROM user_focus_areas WHERE user_id = $1`,
    [id]
  );

  return formatUserResponse(user, {
    values: valuesResult.rows.map(r => r.value),
    roles: rolesResult.rows.map(r => r.role),
    focusAreas: focusResult.rows.map(r => r.focus_area),
  });
}

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update user profile
 */
export async function updateUser(id, updates) {
  const allowedFields = ['name', 'vision', 'reminder_time', 'review_day', 'tone', 'current_goal'];
  const setClause = [];
  const values = [];
  let paramIndex = 1;

  // Map camelCase to snake_case
  const fieldMapping = {
    reminderTime: 'reminder_time',
    reviewDay: 'review_day',
    currentGoal: 'current_goal',
  };

  for (const [key, value] of Object.entries(updates)) {
    const dbField = fieldMapping[key] || key;
    if (allowedFields.includes(dbField) && value !== undefined) {
      setClause.push(`${dbField} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    return getUserProfile(id);
  }

  values.push(id);

  await query(
    `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramIndex}`,
    values
  );

  return getUserProfile(id);
}

/**
 * Update user identity (vision, values, roles)
 */
export async function updateIdentity(id, identity) {
  return transaction(async (client) => {
    // Update vision
    if (identity.vision !== undefined) {
      await client.query(
        `UPDATE users SET vision = $1 WHERE id = $2`,
        [identity.vision, id]
      );
    }

    // Update values
    if (identity.values) {
      // Delete existing values
      await client.query(
        `DELETE FROM user_values WHERE user_id = $1`,
        [id]
      );

      // Insert new values
      for (const value of identity.values) {
        await client.query(
          `INSERT INTO user_values (user_id, value) VALUES ($1, $2)`,
          [id, value]
        );
      }
    }

    // Update roles
    if (identity.roles) {
      // Delete existing roles
      await client.query(
        `DELETE FROM user_roles WHERE user_id = $1`,
        [id]
      );

      // Insert new roles
      for (const role of identity.roles) {
        await client.query(
          `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
          [id, role]
        );
      }
    }

    return getUserProfile(id);
  });
}

/**
 * Update focus areas
 */
export async function updateFocusAreas(id, focusAreas) {
  return transaction(async (client) => {
    // Delete existing focus areas
    await client.query(
      `DELETE FROM user_focus_areas WHERE user_id = $1`,
      [id]
    );

    // Insert new focus areas
    for (const area of focusAreas) {
      await client.query(
        `INSERT INTO user_focus_areas (user_id, focus_area) VALUES ($1, $2)`,
        [id, area]
      );
    }

    return getUserProfile(id);
  });
}

/**
 * Update preferences
 */
export async function updatePreferences(id, preferences) {
  const { reminderTime, reviewDay, tone } = preferences;

  await query(
    `UPDATE users SET 
       reminder_time = COALESCE($1, reminder_time),
       review_day = COALESCE($2, review_day),
       tone = COALESCE($3, tone)
     WHERE id = $4`,
    [reminderTime, reviewDay, tone, id]
  );

  return getUserProfile(id);
}

/**
 * Update onboarding progress
 */
export async function updateOnboardingStep(id, step, data = {}) {
  return transaction(async (client) => {
    // Update step and completion status (5 steps total now)
    const completed = step >= 5;
    
    console.log(`📝 Updating onboarding step ${step} for user ${id}`, {
      step,
      completed,
      hasVision: data.identity?.vision !== undefined,
      hasValues: data.identity?.values?.length > 0,
      hasRoles: data.identity?.roles?.length > 0,
      hasLifePhase: data.lifePhase !== undefined,
      hasChallenges: data.challenges?.length > 0,
    });
    
    await client.query(
      `UPDATE users SET 
         onboarding_step = $1,
         onboarding_completed = $2
       WHERE id = $3`,
      [step, completed, id]
    );

    // Update identity if provided
    if (data.identity) {
      if (data.identity.vision !== undefined && data.identity.vision !== null && data.identity.vision.trim() !== '') {
        await client.query(
          `UPDATE users SET vision = $1 WHERE id = $2`,
          [data.identity.vision.trim(), id]
        );
        console.log(`✅ Saved vision: ${data.identity.vision.substring(0, 50)}...`);
      }

      if (data.identity.values && Array.isArray(data.identity.values) && data.identity.values.length > 0) {
        await client.query(`DELETE FROM user_values WHERE user_id = $1`, [id]);
        for (const value of data.identity.values) {
          await client.query(
            `INSERT INTO user_values (user_id, value) VALUES ($1, $2)`,
            [id, value]
          );
        }
        console.log(`✅ Saved ${data.identity.values.length} values:`, data.identity.values);
      }

      if (data.identity.roles && Array.isArray(data.identity.roles) && data.identity.roles.length > 0) {
        await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [id]);
        for (const role of data.identity.roles) {
          await client.query(
            `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
            [id, role]
          );
        }
        console.log(`✅ Saved ${data.identity.roles.length} roles:`, data.identity.roles);
      }
    }

    // Update life phase if provided
    if (data.lifePhase !== undefined && data.lifePhase !== null && data.lifePhase.trim() !== '') {
      await client.query(
        `UPDATE users SET life_phase = $1 WHERE id = $2`,
        [data.lifePhase.trim(), id]
      );
      console.log(`✅ Saved life phase: ${data.lifePhase}`);
    }

    // Update challenges (stored as focus areas)
    if (data.challenges && Array.isArray(data.challenges) && data.challenges.length > 0) {
      await client.query(`DELETE FROM user_focus_areas WHERE user_id = $1`, [id]);
      for (const challenge of data.challenges) {
        await client.query(
          `INSERT INTO user_focus_areas (user_id, focus_area) VALUES ($1, $2)`,
          [id, challenge]
        );
      }
      console.log(`✅ Saved ${data.challenges.length} challenges:`, data.challenges);
    }

    // Query profile using the transaction client to see uncommitted changes
    const profileResult = await client.query(
      `SELECT id, name, email, created_at, onboarding_completed, onboarding_step,
              vision, reminder_time, review_day, tone, current_goal, life_phase
       FROM users WHERE id = $1`,
      [id]
    );

    if (profileResult.rows.length === 0) {
      throw new Error('User not found after update');
    }

    const user = profileResult.rows[0];

    // Get values, roles, and focus areas using transaction client
    const [valuesResult, rolesResult, focusAreasResult] = await Promise.all([
      client.query('SELECT value FROM user_values WHERE user_id = $1', [id]),
      client.query('SELECT role FROM user_roles WHERE user_id = $1', [id]),
      client.query('SELECT focus_area FROM user_focus_areas WHERE user_id = $1', [id])
    ]);

    const profile = formatUserResponse({
      ...user,
      values: valuesResult.rows.map(r => r.value),
      roles: rolesResult.rows.map(r => r.role),
      focus_areas: focusAreasResult.rows.map(r => r.focus_area)
    });

    console.log(`✅ Onboarding step ${step} saved. Completed: ${profile.onboardingCompleted}`);
    
    return profile;
  });
}

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Delete user account
 */
export async function deleteUser(id) {
  await query(`DELETE FROM users WHERE id = $1`, [id]);
  return true;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format user response (remove password, format structure)
 */
function formatUserResponse(user, extras = {}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    onboardingCompleted: user.onboarding_completed,
    onboardingStep: user.onboarding_step,
    identity: {
      vision: user.vision || null,
      values: extras.values || [],
      roles: extras.roles || [],
    },
    focusAreas: extras.focusAreas || [],
    lifePhase: user.life_phase || null,
    currentGoal: user.current_goal || null,
    preferences: {
      reminderTime: user.reminder_time || '09:00',
      reviewDay: user.review_day || 'sunday',
      tone: user.tone || 'coach',
    },
  };
}

/**
 * Verify password
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Get all users (admin function)
 */
export async function getAllUsers() {
  const result = await query(
    `SELECT id, name, email, created_at, onboarding_completed 
     FROM users ORDER BY created_at DESC`
  );

  return result.rows;
}


/**
 * User Model - PostgreSQL Implementation
 * Handles all user-related database operations
 */

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new user
 */
export async function createUser(userData) {
  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insert user
  const result = await query(
    `INSERT INTO users (name, email, password) 
     VALUES ($1, $2, $3) 
     RETURNING id, name, email, created_at, onboarding_completed, onboarding_step,
               vision, reminder_time, review_day, tone, current_goal`,
    [name, email.toLowerCase(), hashedPassword]
  );

  const user = result.rows[0];

  console.log(`✅ User created: ${user.email}`);

  return formatUserResponse(user);
}

/**
 * Create or update user from Google OAuth
 */
export async function createOrUpdateGoogleUser(googleData) {
  const { googleId, name, email, photo } = googleData;

  // Check if user exists by email
  let user = await findUserByEmail(email);

  if (user) {
    // Update existing user with Google ID if not already set
    if (!user.google_id) {
      await query(
        `UPDATE users SET google_id = $1, photo = $2 WHERE id = $3`,
        [googleId, photo, user.id]
      );
    }
    // Update name if it changed
    if (name && name !== user.name) {
      await query(
        `UPDATE users SET name = $1 WHERE id = $2`,
        [name, user.id]
      );
    }
    // Get updated user
    user = await findUserById(user.id);
  } else {
    // Check if user exists by Google ID
    const result = await query(
      `SELECT * FROM users WHERE google_id = $1`,
      [googleId]
    );

    if (result.rows.length > 0) {
      user = result.rows[0];
    } else {
      // Create new user with Google OAuth
      const insertResult = await query(
        `INSERT INTO users (name, email, google_id, photo, password) 
         VALUES ($1, $2, $3, $4, NULL) 
         RETURNING id, name, email, created_at, onboarding_completed, onboarding_step,
                   vision, reminder_time, review_day, tone, current_goal`,
        [name, email.toLowerCase(), googleId, photo]
      );

      user = insertResult.rows[0];
      console.log(`✅ Google user created: ${user.email}`);
    }
  }

  return formatUserResponse(user);
}

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Find user by email
 */
export async function findUserByEmail(email) {
  const result = await query(
    `SELECT * FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  return result.rows[0] || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id) {
  const result = await query(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Get user with full profile (including values, roles, focus areas)
 */
export async function getUserProfile(id) {
  // Get user
  const userResult = await query(
    `SELECT id, name, email, created_at, onboarding_completed, onboarding_step,
            vision, reminder_time, review_day, tone, current_goal, life_phase
     FROM users WHERE id = $1`,
    [id]
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  const user = userResult.rows[0];

  // Get values
  const valuesResult = await query(
    `SELECT value FROM user_values WHERE user_id = $1`,
    [id]
  );

  // Get roles
  const rolesResult = await query(
    `SELECT role FROM user_roles WHERE user_id = $1`,
    [id]
  );

  // Get focus areas
  const focusResult = await query(
    `SELECT focus_area FROM user_focus_areas WHERE user_id = $1`,
    [id]
  );

  return formatUserResponse(user, {
    values: valuesResult.rows.map(r => r.value),
    roles: rolesResult.rows.map(r => r.role),
    focusAreas: focusResult.rows.map(r => r.focus_area),
  });
}

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update user profile
 */
export async function updateUser(id, updates) {
  const allowedFields = ['name', 'vision', 'reminder_time', 'review_day', 'tone', 'current_goal'];
  const setClause = [];
  const values = [];
  let paramIndex = 1;

  // Map camelCase to snake_case
  const fieldMapping = {
    reminderTime: 'reminder_time',
    reviewDay: 'review_day',
    currentGoal: 'current_goal',
  };

  for (const [key, value] of Object.entries(updates)) {
    const dbField = fieldMapping[key] || key;
    if (allowedFields.includes(dbField) && value !== undefined) {
      setClause.push(`${dbField} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (setClause.length === 0) {
    return getUserProfile(id);
  }

  values.push(id);

  await query(
    `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramIndex}`,
    values
  );

  return getUserProfile(id);
}

/**
 * Update user identity (vision, values, roles)
 */
export async function updateIdentity(id, identity) {
  return transaction(async (client) => {
    // Update vision
    if (identity.vision !== undefined) {
      await client.query(
        `UPDATE users SET vision = $1 WHERE id = $2`,
        [identity.vision, id]
      );
    }

    // Update values
    if (identity.values) {
      // Delete existing values
      await client.query(
        `DELETE FROM user_values WHERE user_id = $1`,
        [id]
      );

      // Insert new values
      for (const value of identity.values) {
        await client.query(
          `INSERT INTO user_values (user_id, value) VALUES ($1, $2)`,
          [id, value]
        );
      }
    }

    // Update roles
    if (identity.roles) {
      // Delete existing roles
      await client.query(
        `DELETE FROM user_roles WHERE user_id = $1`,
        [id]
      );

      // Insert new roles
      for (const role of identity.roles) {
        await client.query(
          `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
          [id, role]
        );
      }
    }

    return getUserProfile(id);
  });
}

/**
 * Update focus areas
 */
export async function updateFocusAreas(id, focusAreas) {
  return transaction(async (client) => {
    // Delete existing focus areas
    await client.query(
      `DELETE FROM user_focus_areas WHERE user_id = $1`,
      [id]
    );

    // Insert new focus areas
    for (const area of focusAreas) {
      await client.query(
        `INSERT INTO user_focus_areas (user_id, focus_area) VALUES ($1, $2)`,
        [id, area]
      );
    }

    return getUserProfile(id);
  });
}

/**
 * Update preferences
 */
export async function updatePreferences(id, preferences) {
  const { reminderTime, reviewDay, tone } = preferences;

  await query(
    `UPDATE users SET 
       reminder_time = COALESCE($1, reminder_time),
       review_day = COALESCE($2, review_day),
       tone = COALESCE($3, tone)
     WHERE id = $4`,
    [reminderTime, reviewDay, tone, id]
  );

  return getUserProfile(id);
}

/**
 * Update onboarding progress
 */
export async function updateOnboardingStep(id, step, data = {}) {
  return transaction(async (client) => {
    // Update step and completion status (5 steps total now)
    const completed = step >= 5;
    
    console.log(`📝 Updating onboarding step ${step} for user ${id}`, {
      step,
      completed,
      hasVision: data.identity?.vision !== undefined,
      hasValues: data.identity?.values?.length > 0,
      hasRoles: data.identity?.roles?.length > 0,
      hasLifePhase: data.lifePhase !== undefined,
      hasChallenges: data.challenges?.length > 0,
    });
    
    await client.query(
      `UPDATE users SET 
         onboarding_step = $1,
         onboarding_completed = $2
       WHERE id = $3`,
      [step, completed, id]
    );

    // Update identity if provided
    if (data.identity) {
      if (data.identity.vision !== undefined && data.identity.vision !== null && data.identity.vision.trim() !== '') {
        await client.query(
          `UPDATE users SET vision = $1 WHERE id = $2`,
          [data.identity.vision.trim(), id]
        );
        console.log(`✅ Saved vision: ${data.identity.vision.substring(0, 50)}...`);
      }

      if (data.identity.values && Array.isArray(data.identity.values) && data.identity.values.length > 0) {
        await client.query(`DELETE FROM user_values WHERE user_id = $1`, [id]);
        for (const value of data.identity.values) {
          await client.query(
            `INSERT INTO user_values (user_id, value) VALUES ($1, $2)`,
            [id, value]
          );
        }
        console.log(`✅ Saved ${data.identity.values.length} values:`, data.identity.values);
      }

      if (data.identity.roles && Array.isArray(data.identity.roles) && data.identity.roles.length > 0) {
        await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [id]);
        for (const role of data.identity.roles) {
          await client.query(
            `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
            [id, role]
          );
        }
        console.log(`✅ Saved ${data.identity.roles.length} roles:`, data.identity.roles);
      }
    }

    // Update life phase if provided
    if (data.lifePhase !== undefined && data.lifePhase !== null && data.lifePhase.trim() !== '') {
      await client.query(
        `UPDATE users SET life_phase = $1 WHERE id = $2`,
        [data.lifePhase.trim(), id]
      );
      console.log(`✅ Saved life phase: ${data.lifePhase}`);
    }

    // Update challenges (stored as focus areas)
    if (data.challenges && Array.isArray(data.challenges) && data.challenges.length > 0) {
      await client.query(`DELETE FROM user_focus_areas WHERE user_id = $1`, [id]);
      for (const challenge of data.challenges) {
        await client.query(
          `INSERT INTO user_focus_areas (user_id, focus_area) VALUES ($1, $2)`,
          [id, challenge]
        );
      }
      console.log(`✅ Saved ${data.challenges.length} challenges:`, data.challenges);
    }

    // Query profile using the transaction client to see uncommitted changes
    const profileResult = await client.query(
      `SELECT id, name, email, created_at, onboarding_completed, onboarding_step,
              vision, reminder_time, review_day, tone, current_goal, life_phase
       FROM users WHERE id = $1`,
      [id]
    );

    if (profileResult.rows.length === 0) {
      throw new Error('User not found after update');
    }

    const user = profileResult.rows[0];

    // Get values, roles, and focus areas using transaction client
    const [valuesResult, rolesResult, focusAreasResult] = await Promise.all([
      client.query('SELECT value FROM user_values WHERE user_id = $1', [id]),
      client.query('SELECT role FROM user_roles WHERE user_id = $1', [id]),
      client.query('SELECT focus_area FROM user_focus_areas WHERE user_id = $1', [id])
    ]);

    const profile = formatUserResponse({
      ...user,
      values: valuesResult.rows.map(r => r.value),
      roles: rolesResult.rows.map(r => r.role),
      focus_areas: focusAreasResult.rows.map(r => r.focus_area)
    });

    console.log(`✅ Onboarding step ${step} saved. Completed: ${profile.onboardingCompleted}`);
    
    return profile;
  });
}

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Delete user account
 */
export async function deleteUser(id) {
  await query(`DELETE FROM users WHERE id = $1`, [id]);
  return true;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format user response (remove password, format structure)
 */
function formatUserResponse(user, extras = {}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    onboardingCompleted: user.onboarding_completed,
    onboardingStep: user.onboarding_step,
    identity: {
      vision: user.vision || null,
      values: extras.values || [],
      roles: extras.roles || [],
    },
    focusAreas: extras.focusAreas || [],
    lifePhase: user.life_phase || null,
    currentGoal: user.current_goal || null,
    preferences: {
      reminderTime: user.reminder_time || '09:00',
      reviewDay: user.review_day || 'sunday',
      tone: user.tone || 'coach',
    },
  };
}

/**
 * Verify password
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Get all users (admin function)
 */
export async function getAllUsers() {
  const result = await query(
    `SELECT id, name, email, created_at, onboarding_completed 
     FROM users ORDER BY created_at DESC`
  );

  return result.rows;
}
