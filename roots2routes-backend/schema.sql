CREATE EXTENSION IF NOT EXISTS postgis;

DROP TABLE IF EXISTS Alternate_Routes CASCADE;
DROP TABLE IF EXISTS Telemetry_Logs CASCADE;
DROP TABLE IF EXISTS Destinations CASCADE;

CREATE TABLE Destinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    category VARCHAR(80) NOT NULL,
    tag VARCHAR(100),
    max_capacity INT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    coords GEOGRAPHY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Telemetry_Logs (
    id SERIAL PRIMARY KEY,
    destination_id INT REFERENCES Destinations(id) ON DELETE CASCADE,
    current_visitors INT NOT NULL,
    queue_time_mins INT DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Alternate_Routes (
    id SERIAL PRIMARY KEY,
    source_destination_id INT REFERENCES Destinations(id),
    target_destination_id INT REFERENCES Destinations(id),
    travel_time_mins INT NOT NULL,
    notes TEXT
);

CREATE INDEX idx_destinations_coords ON Destinations USING GIST(coords);