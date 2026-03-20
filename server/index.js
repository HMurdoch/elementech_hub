import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/connection.js';
import { getProjectFileTree, getFileContent } from './utils/file-scanner.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Elementech Hub API is running' });
});

// Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, tech, slug, title, description, 
                homepage_url as "homepageUrl", 
                repo_url as "repoUrl",
                tags, screenshots, source_path as "sourcePath",
                created_at as "createdAt"
            FROM projects
            ORDER BY created_at DESC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Get code content for a specific file by path (MUST BE BEFORE other /projects/:tech/:slug routes)
app.get('/api/projects/:tech/:slug/file/*', async (req, res) => {
    try {
        const { tech, slug } = req.params;
        const filePath = req.params[0]; // Get the wildcard path
        
        // Get project source path
        const projectResult = await pool.query(
            'SELECT source_path as "sourcePath" FROM projects WHERE tech = $1 AND slug = $2',
            [tech, slug]
        );
        
        if (projectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const sourcePath = projectResult.rows[0].sourcePath;
        
        if (!sourcePath) {
            return res.status(404).json({ error: 'Project has no source path' });
        }
        
        try {
            const fileContent = getFileContent(sourcePath, filePath);
            res.json(fileContent);
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error.message);
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error('Error fetching file code:', error);
        res.status(500).json({ error: 'Failed to fetch file code' });
    }
});

// Get a specific project with its file tree
app.get('/api/projects/:tech/:slug', async (req, res) => {
    try {
        const { tech, slug } = req.params;
        
        // Get project details
        const projectResult = await pool.query(`
            SELECT 
                id, tech, slug, title, description,
                homepage_url as "homepageUrl",
                repo_url as "repoUrl",
                tags, screenshots, source_path as "sourcePath",
                created_at as "createdAt"
            FROM projects
            WHERE tech = $1 AND slug = $2
        `, [tech, slug]);
        
        if (projectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const project = projectResult.rows[0];
        
        // Read file tree from filesystem if source_path exists
        if (project.sourcePath) {
            try {
                project.files = getProjectFileTree(project.sourcePath, true);
            } catch (error) {
                console.error(`Error reading file tree from ${project.sourcePath}:`, error.message);
                project.files = [];
            }
        } else {
            project.files = [];
        }
        
        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// Get project files only (without code)
app.get('/api/projects/:tech/:slug/files', async (req, res) => {
    try {
        const { tech, slug } = req.params;
        
        const projectResult = await pool.query(
            'SELECT source_path as "sourcePath" FROM projects WHERE tech = $1 AND slug = $2',
            [tech, slug]
        );
        
        if (projectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const sourcePath = projectResult.rows[0].sourcePath;
        
        if (!sourcePath) {
            return res.json([]);
        }
        
        try {
            const files = getProjectFileTree(sourcePath, false);
            res.json(files);
        } catch (error) {
            console.error(`Error reading file tree from ${sourcePath}:`, error.message);
            res.status(500).json({ error: 'Failed to read file tree from filesystem' });
        }
    } catch (error) {
        console.error('Error fetching project files:', error);
        res.status(500).json({ error: 'Failed to fetch project files' });
    }
});


// Get all technologies
app.get('/api/technologies', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, summary, examples, created_at as "createdAt"
            FROM technologies
            ORDER BY name
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching technologies:', error);
        res.status(500).json({ error: 'Failed to fetch technologies' });
    }
});

// Get all courses
app.get('/api/courses', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, title, institute, technologies, subjects, 
                lecturer, qualification_type as "qualificationType", 
                site, example_links as "exampleLinks",
                created_at as "createdAt"
            FROM courses
            ORDER BY title
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Get CV data (profile, education, experience)
app.get('/api/cv', async (req, res) => {
    try {
        // Get profile
        const profileResult = await pool.query(`
            SELECT details, position
            FROM cv_profile
            LIMIT 1
        `);
        
        // Get education
        const educationResult = await pool.query(`
            SELECT 
                id, course, institute, years, 
                qualification_type as "qualificationType",
                subjects, sourcelink,
                created_at as "createdAt"
            FROM education
            ORDER BY display_order
        `);
        
        // Get experience
        const experienceResult = await pool.query(`
            SELECT 
                id, company, title,
                CASE 
                    WHEN date_from IS NOT NULL THEN TO_CHAR(date_from, 'YYYY-MM')
                    ELSE NULL
                END as "from",
                CASE 
                    WHEN date_to IS NOT NULL THEN TO_CHAR(date_to, 'YYYY-MM')
                    ELSE 'Present'
                END as "to",
                description, duties, technologies, sourcelink,
                created_at as "createdAt"
            FROM experience
            ORDER BY display_order
        `);
        
        const cv = {
            details: profileResult.rows[0]?.details || '',
            position: profileResult.rows[0]?.position || '',
            education: educationResult.rows,
            experience: experienceResult.rows
        };
        
        res.json(cv);
    } catch (error) {
        console.error('Error fetching CV:', error);
        res.status(500).json({ error: 'Failed to fetch CV data' });
    }
});

// Get all brainbox ideas
app.get('/api/brainbox', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, heading, technologies, overview, details,
                created_at as "createdAt"
            FROM brainbox
            ORDER BY created_at DESC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching brainbox:', error);
        res.status(500).json({ error: 'Failed to fetch brainbox ideas' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Elementech Hub API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log('');
});
