-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('citizen', 'admin')) DEFAULT 'citizen',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(200),
    description TEXT,
    type VARCHAR(50), -- pothole, garbage, etc.
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    image_url TEXT,
    urgency_level VARCHAR(20) DEFAULT 'Pending', -- Low, Medium, High (AI assigned)
    status VARCHAR(20) DEFAULT 'Reported', -- Reported, In Progress, Resolved
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Actions / Logs Table
CREATE TABLE actions (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id),
    admin_id INTEGER REFERENCES users(id),
    action_type VARCHAR(50),
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
