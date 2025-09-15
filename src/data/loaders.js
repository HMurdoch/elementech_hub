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
export async function loadCV() { return getOverride('cv') ?? await readJson('data/cv.json') }
export async function loadBrainbox() { return getOverride('brainbox') ?? await readJson('data/brainbox.json') }