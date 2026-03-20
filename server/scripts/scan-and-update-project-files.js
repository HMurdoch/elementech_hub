#!/usr/bin/env node

/**
 * Scan project source folders and update database with real file trees
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../..');

// Gitignore patterns to exclude
const IGNORE_PATTERNS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.env',
    '.env.local',
    '.DS_Store',
    'npm-debug.log',
    '*.log',
    'coverage',
    '.vscode',
    '.idea',
    'tmp_rovodev_*',
    '.cache',
    'package-lock.json'
];

// Language mapping based on file extension
const LANGUAGE_MAP = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.json': 'json',
    '.css': 'css',
    '.html': 'html',
    '.md': 'markdown',
    '.sql': 'sql',
    '.sh': 'bash',
    '.py': 'python',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.cs': 'csharp',
    '.xml': 'xml',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.txt': 'text'
};

function shouldIgnore(filePath, basePath) {
    const relativePath = path.relative(basePath, filePath);
    const parts = relativePath.split(path.sep);
    
    for (const pattern of IGNORE_PATTERNS) {
        if (pattern.includes('*')) {
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
            if (parts.some(part => regex.test(part))) {
                return true;
            }
        } else {
            if (parts.includes(pattern)) {
                return true;
            }
        }
    }
    
    return false;
}

function getLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return LANGUAGE_MAP[ext] || null;
}

function readFileContent(filePath, maxSize = 500000) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size > maxSize) {
            return `// File too large (${Math.round(stats.size / 1024)}KB). Content not included.`;
        }
        return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        return `// Error reading file: ${error.message}`;
    }
}

function buildFileTree(dirPath, basePath, parentPath = '') {
    const items = [];
    
    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        // Sort: folders first, then files
        entries.sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
        });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
            
            if (shouldIgnore(fullPath, basePath)) {
                continue;
            }
            
            if (entry.isDirectory()) {
                const children = buildFileTree(fullPath, basePath, relativePath);
                
                if (children.length > 0) {
                    items.push({
                        type: 'folder',
                        name: entry.name,
                        path: relativePath,
                        children: children
                    });
                }
            } else if (entry.isFile()) {
                const language = getLanguage(entry.name);
                const fileNode = {
                    type: 'file',
                    name: entry.name,
                    path: relativePath,
                    language: language
                };
                
                // Include code for text files
                if (language) {
                    fileNode.code = readFileContent(fullPath);
                }
                
                items.push(fileNode);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error.message);
    }
    
    return items;
}

async function updateProjectFiles(projectId, slug, sourcePath, fileTree) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Delete existing files for this project
        await client.query(
            'DELETE FROM project_file_code WHERE file_id IN (SELECT id FROM project_files WHERE project_id = $1)',
            [projectId]
        );
        await client.query('DELETE FROM project_files WHERE project_id = $1', [projectId]);
        
        // Insert new file tree
        async function insertFile(fileNode, parentId = null) {
            const fileResult = await client.query(
                `INSERT INTO project_files (project_id, parent_id, type, name, path, language)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id`,
                [projectId, parentId, fileNode.type, fileNode.name, fileNode.path, fileNode.language || null]
            );
            
            const fileId = fileResult.rows[0].id;
            
            if (fileNode.type === 'file' && fileNode.code) {
                await client.query(
                    `INSERT INTO project_file_code (file_id, code)
                     VALUES ($1, $2)`,
                    [fileId, fileNode.code]
                );
            }
            
            if (fileNode.children && Array.isArray(fileNode.children)) {
                for (const child of fileNode.children) {
                    await insertFile(child, fileId);
                }
            }
        }
        
        for (const fileNode of fileTree) {
            await insertFile(fileNode);
        }
        
        await client.query('COMMIT');
        
        // Count results
        const counts = await client.query(
            `SELECT 
                COUNT(CASE WHEN type = 'file' THEN 1 END) as files,
                COUNT(CASE WHEN type = 'folder' THEN 1 END) as folders
             FROM project_files 
             WHERE project_id = $1`,
            [projectId]
        );
        
        return counts.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function scanAndUpdateProjects() {
    console.log('🔍 Scanning project source folders...\n');
    
    try {
        // Get projects with source paths
        const result = await pool.query(
            `SELECT id, slug, title, source_path 
             FROM projects 
             WHERE source_path IS NOT NULL AND source_path != ''
             ORDER BY slug`
        );
        
        if (result.rows.length === 0) {
            console.log('❌ No projects with source_path found.');
            return;
        }
        
        console.log(`Found ${result.rows.length} projects with source paths:\n`);
        
        for (const project of result.rows) {
            console.log(`📂 Processing: ${project.slug}`);
            console.log(`   Title: ${project.title}`);
            console.log(`   Path: ${project.source_path}`);
            
            const fullPath = path.join(projectRoot, project.source_path);
            
            if (!fs.existsSync(fullPath)) {
                console.log(`   ⚠️  Path does not exist: ${fullPath}\n`);
                continue;
            }
            
            // Build file tree
            console.log('   Scanning files...');
            const fileTree = buildFileTree(fullPath, fullPath);
            
            // Count stats
            let fileCount = 0;
            let folderCount = 0;
            function countNodes(nodes) {
                for (const node of nodes) {
                    if (node.type === 'file') fileCount++;
                    else if (node.type === 'folder') {
                        folderCount++;
                        if (node.children) countNodes(node.children);
                    }
                }
            }
            countNodes(fileTree);
            
            console.log(`   Found: ${fileCount} files, ${folderCount} folders`);
            
            // Update database
            console.log('   Updating database...');
            const counts = await updateProjectFiles(project.id, project.slug, project.source_path, fileTree);
            
            console.log(`   ✅ Updated: ${counts.files} files, ${counts.folders} folders\n`);
        }
        
        console.log('✅ All projects updated successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the script
scanAndUpdateProjects().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
