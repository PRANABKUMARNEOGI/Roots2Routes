require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function seed() {
// ... rest of your code stays the same
try {
        console.log('Clearing existing data...');
        await pool.query(`TRUNCATE Destinations, Telemetry_Logs, Alternate_Routes RESTART IDENTITY CASCADE;`);

        console.log('Inserting destinations...');
        const destQuery = `
            INSERT INTO Destinations (name, district, category, tag, max_capacity, latitude, longitude, coords)
            VALUES 
            ('Chitrakote Falls', 'Bastar', 'Waterfalls', 'Monsoon peak', 2500, 19.2014, 81.7064, ST_SetSRID(ST_MakePoint(81.7064, 19.2014), 4326)),
            ('Tirathgarh Falls', 'Bastar', 'Waterfalls', 'Easy access', 1800, 18.9167, 81.8667, ST_SetSRID(ST_MakePoint(81.8667, 18.9167), 4326)),
            ('Kanger Valley National Park', 'Bastar', 'Wildlife & forests', 'Rainforest', 1200, 18.8833, 81.9000, ST_SetSRID(ST_MakePoint(81.9000, 18.8833), 4326)),
            ('Kutumsar Caves', 'Bastar', 'Caves', 'Limestone', 800, 18.8778, 81.9361, ST_SetSRID(ST_MakePoint(81.9361, 18.8778), 4326)),
            ('Bhoramdeo Temple', 'Kabirdham', 'Temples & heritage', '11th century', 1500, 22.1158, 81.1558, ST_SetSRID(ST_MakePoint(81.1558, 22.1158), 4326)),
            ('Mainpat', 'Surguja', 'Hill stations', 'Tibetan culture', 3000, 22.8156, 83.2867, ST_SetSRID(ST_MakePoint(83.2867, 22.8156), 4326)),
            ('Barnawapara Wildlife Sanctuary', 'Mahasamund', 'Wildlife & forests', 'Jungle Safari', 1000, 21.3986, 82.4172, ST_SetSRID(ST_MakePoint(82.4172, 21.3986), 4326)),
            ('Sirpur Temples', 'Mahasamund', 'Temples & heritage', 'Archaeological', 2000, 21.3411, 82.1903, ST_SetSRID(ST_MakePoint(82.1903, 21.3411), 4326))
            RETURNING id, name;
        `;
        await pool.query(destQuery);

        console.log('Inserting telemetry logs (Live capacity simulation)...');
        await pool.query(`
            INSERT INTO Telemetry_Logs (destination_id, current_visitors, queue_time_mins)
            VALUES 
            (1, 2350, 42), -- Chitrakote: 94% (High load trigger)
            (2, 558, 5),   -- Tirathgarh: 31% (Ideal alternative)
            (3, 768, 15),  -- Kanger Valley: 64% (Moderate)
            (4, 144, 0),   -- Kutumsar: 18% (Low)
            (5, 870, 10),  -- Bhoramdeo: 58% (Moderate)
            (6, 720, 0),   -- Mainpat: 24% (Low)
            (7, 950, 25),  -- Barnawapara: 95% (High load trigger)
            (8, 400, 0);   -- Sirpur: 20% (Low)
        `);

        console.log('Inserting alternate routing rules...');
        await pool.query(`
            INSERT INTO Alternate_Routes (source_destination_id, target_destination_id, travel_time_mins, notes)
            VALUES 
            (1, 2, 45, 'Try Tirathgarh Falls instead - same monsoon-waterfall mood'),
            (7, 8, 60, 'Barnawapara is nearing capacity; explore the ancient temples of Sirpur nearby');
        `);

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}

seed();