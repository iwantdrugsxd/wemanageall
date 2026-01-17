import { query } from './config.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runWorkspaceCodeMigration() {
  console.log('\n🔐 Workspace Code Migration');
  console.log('==========================\n');

  try {
    // Check if column exists
    const columnCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'organizations' AND column_name = 'workspace_code'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('Adding workspace_code column...');
      // First add column without UNIQUE constraint
      await query(`
        ALTER TABLE organizations 
        ADD COLUMN workspace_code VARCHAR(20)
      `);
      console.log('✅ Added workspace_code column');
    } else {
      console.log('ℹ️  workspace_code column already exists');
    }

    // Generate codes for existing organizations first (before adding UNIQUE constraint)
    const orgsWithoutCode = await query(
      'SELECT id FROM organizations WHERE workspace_code IS NULL'
    );

    if (orgsWithoutCode.rows.length > 0) {
      console.log(`Generating codes for ${orgsWithoutCode.rows.length} existing organizations...`);
      
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      
      for (const org of orgsWithoutCode.rows) {
        let code;
        let exists = true;
        
        while (exists) {
          code = '';
          for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          
          const check = await query(
            'SELECT id FROM organizations WHERE workspace_code = $1',
            [code]
          );
          exists = check.rows.length > 0;
        }
        
        await query(
          'UPDATE organizations SET workspace_code = $1 WHERE id = $2',
          [code, org.id]
        );
        console.log(`✅ Generated code for organization ${org.id}`);
      }
    }

    // Now add UNIQUE constraint if it doesn't exist
    console.log('Adding UNIQUE constraint...');
    try {
      // Check if constraint already exists
      const constraintCheck = await query(`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'organizations' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name LIKE '%workspace_code%'
      `);

      if (constraintCheck.rows.length === 0) {
        await query(`
          ALTER TABLE organizations 
          ADD CONSTRAINT organizations_workspace_code_unique UNIQUE (workspace_code)
        `);
        console.log('✅ Added UNIQUE constraint');
      } else {
        console.log('ℹ️  UNIQUE constraint already exists');
      }
    } catch (error) {
      if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
        console.log(`⚠️  Constraint warning: ${error.message}`);
      }
    }

    // Create index
    console.log('Creating index...');
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_organizations_workspace_code 
        ON organizations(workspace_code)
      `);
      console.log('✅ Created index');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log(`⚠️  Index warning: ${error.message}`);
      }
    }


    console.log('\n================================');
    console.log('✅ Workspace code migration complete!');
    console.log('================================\n');

  } catch (error) {
    console.error('\n❌ Workspace code migration failed:', error.message || error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runWorkspaceCodeMigration();

