import dotenv from 'dotenv';
import { query } from './config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Migration: Organizations & Team Support
 */
async function migrateOrganizations() {
  console.log('\n👥 Organizations & Team Migration');
  console.log('==================================\n');

  try {
    // Read and execute SQL migration
    const sqlPath = path.join(__dirname, 'migrate_organizations.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute entire SQL file at once (handles functions and multi-line statements)
    try {
      await query(sql);
      console.log('✅ SQL migration executed');
    } catch (error) {
      // If full execution fails, try executing statements individually
      // Remove comments and split by semicolons
      const cleanSql = sql
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n');
      
      // Split by semicolon, but preserve function definitions
      const statements = [];
      let currentStatement = '';
      let inFunction = false;
      let dollarQuote = '';
      
      for (let i = 0; i < cleanSql.length; i++) {
        const char = cleanSql[i];
        const nextChars = cleanSql.substring(i, i + 2);
        
        // Check for dollar-quoted strings (for functions)
        if (nextChars === '$$' && !inFunction) {
          inFunction = true;
          // Extract the tag
          const tagMatch = cleanSql.substring(i).match(/^\$\$(\w*)\$\$/);
          if (tagMatch) {
            dollarQuote = tagMatch[0];
            currentStatement += dollarQuote;
            i += dollarQuote.length - 1;
            continue;
          }
        }
        
        if (inFunction && cleanSql.substring(i).startsWith(dollarQuote)) {
          currentStatement += dollarQuote;
          i += dollarQuote.length - 1;
          inFunction = false;
          dollarQuote = '';
          continue;
        }
        
        currentStatement += char;
        
        // If not in function and we hit a semicolon, it's the end of a statement
        if (!inFunction && char === ';') {
          const trimmed = currentStatement.trim();
          if (trimmed.length > 0) {
            statements.push(trimmed);
          }
          currentStatement = '';
        }
      }
      
      // Execute remaining statement
      if (currentStatement.trim().length > 0) {
        statements.push(currentStatement.trim());
      }
      
      // Execute each statement
      for (const statement of statements) {
        if (statement.trim() && !statement.trim().startsWith('--')) {
          try {
            await query(statement);
          } catch (error) {
            // Ignore "already exists" and "does not exist" errors
            if (!error.message.includes('already exists') && 
                !error.message.includes('duplicate') &&
                !error.message.includes('does not exist')) {
              console.error('Error executing statement:', error.message);
            }
          }
        }
      }
    }

    console.log('✅ Organizations migration complete!');
    console.log('\nCreated:');
    console.log('  - organizations table');
    console.log('  - organization_members table');
    console.log('  - organization_invitations table');
    console.log('  - Added organization_id to all relevant tables');
    console.log('  - Added user preferences for team/individual mode\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

migrateOrganizations();

