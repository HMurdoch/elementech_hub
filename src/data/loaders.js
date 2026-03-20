// src/data/loaders.js
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') // no trailing slash
const OV_PREFIX = 'cms.override.'

async function readJson(path) {
    const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`
    const r = await fetch(url, { cache: 'no-cache' })
    if (!r.ok) throw new Error(`Failed to load ${url} (${r.status})`)
    return await r.json()
}

function getOverride(key) {
    try { return JSON.parse(localStorage.getItem(OV_PREFIX + key)) } catch { return null }
}
export function setOverride(key, data) {
    localStorage.setItem(OV_PREFIX + key, JSON.stringify(data))
}
export function clearOverride(key) {
    localStorage.removeItem(OV_PREFIX + key)
}

// Public APIs
export async function loadTechnologies() { return getOverride('technologies') ?? await readJson('data/technologies.json') }
export async function loadProjects() { return getOverride('projects') ?? await readJson('data/projects.json') }
export async function loadCourses() { return getOverride('courses') ?? await readJson('data/courses.json') }
export async function loadCV() { 
    const override = getOverride('cv');
    if (override) return override;
    
    // Try to fetch from API first
    try {
        const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');
        const response = await fetch(`${apiUrl}/api/cv`, { cache: 'no-cache' });
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn('Failed to load CV from API, falling back to JSON file:', error);
    }
    
    // Fallback to JSON file
    return await readJson('data/cv.json');
}
export async function loadBrainbox() { return getOverride('brainbox') ?? await readJson('data/brainbox.json') }