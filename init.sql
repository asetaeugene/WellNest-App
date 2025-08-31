CREATE TABLE users
(
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(128) NOT NULL,
    name VARCHAR(120),
    is_premium BOOLEAN DEFAULT FALSE,
    profile_picture VARCHAR(512)
);

CREATE TABLE journal_entry
(
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL,
    analysis_json TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);