import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateCV() {
    try {
        console.log('🔄 Starting CV migration to database...\n');

        // Read CV JSON file
        const cvPath = path.join(__dirname, '../../public/data/cv.json');
        const cvData = JSON.parse(fs.readFileSync(cvPath, 'utf-8'));

        // Create tables
        console.log('📋 Creating database tables...');
        const createTablesSQL = fs.readFileSync(
            path.join(__dirname, '../db/migrate_cv_to_db.sql'),
            'utf-8'
        );
        await pool.query(createTablesSQL);
        console.log('✓ Tables created\n');

        // Clear existing data
        console.log('🗑️  Clearing existing CV data...');
        await pool.query('DELETE FROM elementech_hub.experience');
        await pool.query('DELETE FROM elementech_hub.education');
        await pool.query('DELETE FROM elementech_hub.cv_profile');
        console.log('✓ Existing data cleared\n');

        // Insert profile
        console.log('👤 Inserting profile data...');
        await pool.query(
            `INSERT INTO elementech_hub.cv_profile (details, position) 
             VALUES ($1, $2)`,
            [cvData.details || '', cvData.position || '']
        );
        console.log('✓ Profile inserted\n');

        // Insert education
        console.log('🎓 Inserting education records...');
        if (Array.isArray(cvData.education)) {
            for (let i = 0; i < cvData.education.length; i++) {
                const edu = cvData.education[i];
                
                // Convert subjects array to JSONB format
                const subjects = Array.isArray(edu.subjects) ? JSON.stringify(edu.subjects) : '[]';
                
                await pool.query(
                    `INSERT INTO elementech_hub.education 
                     (course, institute, years, qualification_type, subjects, sourcelink, display_order)
                     VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)`,
                    [
                        edu.course || '',
                        edu.institute || '',
                        edu.years || '',
                        edu.qualificationType || '',
                        subjects,
                        edu.sourcelink || '',
                        i
                    ]
                );
            }
            console.log(`✓ Inserted ${cvData.education.length} education records\n`);
        }

        // Insert experience
        console.log('💼 Inserting experience records...');
        if (Array.isArray(cvData.experience)) {
            for (let i = 0; i < cvData.experience.length; i++) {
                const exp = cvData.experience[i];
                
                // Parse dates in YYYY-MM format
                let dateFrom = null;
                let dateTo = null;
                
                if (exp.from && exp.from !== 'Present') {
                    // Convert "YYYY-MM" to "YYYY-MM-01" for date parsing
                    dateFrom = exp.from + '-01';
                }
                
                if (exp.to && exp.to !== 'Present') {
                    dateTo = exp.to + '-01';
                }
                // If exp.to is 'Present' or empty, dateTo stays null
                
                // Convert arrays to JSONB format
                const duties = Array.isArray(exp.duties) ? JSON.stringify(exp.duties) : '[]';
                const technologies = Array.isArray(exp.technologies) ? JSON.stringify(exp.technologies) : '[]';
                
                await pool.query(
                    `INSERT INTO elementech_hub.experience 
                     (company, title, date_from, date_to, description, duties, technologies, sourcelink, display_order)
                     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9)`,
                    [
                        exp.company || '',
                        exp.title || '',
                        dateFrom,
                        dateTo,
                        exp.description || '',
                        duties,
                        technologies,
                        exp.sourcelink || '',
                        i
                    ]
                );
            }
            console.log(`✓ Inserted ${cvData.experience.length} experience records\n`);
        }

        // Verify data
        console.log('🔍 Verifying migration...');
        const profileCount = await pool.query('SELECT COUNT(*) FROM elementech_hub.cv_profile');
        const eduCount = await pool.query('SELECT COUNT(*) FROM elementech_hub.education');
        const expCount = await pool.query('SELECT COUNT(*) FROM elementech_hub.experience');
        
        console.log(`✓ Profile records: ${profileCount.rows[0].count}`);
        console.log(`✓ Education records: ${eduCount.rows[0].count}`);
        console.log(`✓ Experience records: ${expCount.rows[0].count}`);
        
        console.log('\n✅ CV migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrateCV();
