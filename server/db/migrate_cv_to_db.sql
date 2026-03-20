-- Create CV Profile table
CREATE TABLE IF NOT EXISTS elementech_hub.cv_profile (
    id SERIAL PRIMARY KEY,
    details TEXT NOT NULL,
    position TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Education table (if not exists)
CREATE TABLE IF NOT EXISTS elementech_hub.education (
    id SERIAL PRIMARY KEY,
    course TEXT NOT NULL,
    institute TEXT,
    years TEXT,
    qualification_type TEXT,
    subjects JSONB, -- JSONB for flexible array storage
    sourcelink TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Experience table
CREATE TABLE IF NOT EXISTS elementech_hub.experience (
    id SERIAL PRIMARY KEY,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    date_from DATE,
    date_to DATE, -- NULL means "Present"
    description TEXT,
    duties JSONB, -- JSONB for flexible array storage
    technologies JSONB, -- JSONB for flexible array storage
    sourcelink TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_education_display_order ON elementech_hub.education(display_order);
CREATE INDEX IF NOT EXISTS idx_experience_display_order ON elementech_hub.experience(display_order);
CREATE INDEX IF NOT EXISTS idx_experience_dates ON elementech_hub.experience(date_from, date_to);
