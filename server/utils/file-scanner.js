/**
 * File Scanner Utility
 * Dynamically reads file trees and code from the filesystem
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    'package-lock.json',
    '.next',
    'out'
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

/**
 * Read file content from disk
 */
export function readFileContent(filePath, maxSize = 500000) {
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

/**
 * Build file tree structure from filesystem
 * @param {string} dirPath - Absolute path to directory
 * @param {string} basePath - Base path for relative paths
 * @param {string} parentPath - Parent path for nested structure
 * @param {boolean} includeCode - Whether to include code content
 * @returns {Array} File tree structure
 */
export function buildFileTree(dirPath, basePath, parentPath = '', includeCode = false) {
    const items = [];
    
    try {
        if (!fs.existsSync(dirPath)) {
            throw new Error(`Directory does not exist: ${dirPath}`);
        }
        
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        // Sort: folders first, then files alphabetically
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
                const children = buildFileTree(fullPath, basePath, relativePath, includeCode);
                
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
                
                // Include code if requested and file has a recognized language
                if (includeCode && language) {
                    fileNode.code = readFileContent(fullPath);
                }
                
                items.push(fileNode);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error.message);
        throw error;
    }
    
    return items;
}

/**
 * Get file tree for a project
 * @param {string} sourcePath - Relative path from project root
 * @param {boolean} includeCode - Whether to include code content
 * @returns {Array} File tree structure
 */
export function getProjectFileTree(sourcePath, includeCode = false) {
    const fullPath = path.join(projectRoot, sourcePath);
    return buildFileTree(fullPath, fullPath, '', includeCode);
}

/**
 * Get specific file content
 * @param {string} sourcePath - Project source path
 * @param {string} filePath - Relative file path
 * @returns {Object} File information with code
 */
export function getFileContent(sourcePath, filePath) {
    const fullPath = path.join(projectRoot, sourcePath, filePath);
    
    if (!fs.existsSync(fullPath)) {
        throw new Error('File not found');
    }
    
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
        throw new Error('Path is a directory, not a file');
    }
    
    const language = getLanguage(fullPath);
    const code = readFileContent(fullPath);
    
    return {
        name: path.basename(fullPath),
        path: filePath,
        language: language,
        code: code
    };
}

/**
 * Find a file by path in the project
 * @param {string} sourcePath - Project source path
 * @param {string} searchPath - File path to find
 * @returns {Object|null} File node or null if not found
 */
export function findFileByPath(sourcePath, searchPath) {
    try {
        return getFileContent(sourcePath, searchPath);
    } catch (error) {
        return null;
    }
}
