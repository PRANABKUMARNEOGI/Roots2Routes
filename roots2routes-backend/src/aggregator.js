const cron = require('node-cron');
const { db, cache } = require('./config');

async function syncCapacity() {
    try {
        console.log('[Worker] Refreshing live capacity telemetry in Redis...');

        const query = `
            SELECT DISTINCT ON (d.id)
                d.id, d.name, d.district, d.category, d.tag, d.max_capacity,
                d.latitude, d.longitude,
                t.current_visitors, t.queue_time_mins, t.recorded_at
            FROM Destinations d
            LEFT JOIN Telemetry_Logs t ON d.id = t.destination_id
            ORDER BY d.id, t.recorded_at DESC;
        `;
        const { rows } = await db.query(query);

        for (const site of rows) {
            const current = site.current_visitors || 0;
            const percentage = Math.min(100, Math.round((current / site.max_capacity) * 100));

            let status = 'low';
            if (percentage >= 80) status = 'high';
            else if (percentage >= 50) status = 'mod';

            // Cache destination telemetry
            await cache.hSet(`dest:${site.id}`, {
                id: site.id.toString(),
                name: site.name,
                district: site.district,
                category: site.category,
                tag: site.tag || '',
                percentage: percentage.toString(),
                status: status,
                queue_time_mins: (site.queue_time_mins || 0).toString(),
                lat: site.latitude.toString(),
                lon: site.longitude.toString()
            });

            // Index in Redis GEO for geospatial radius queries
            await cache.geoAdd('destinations:geo', {
                longitude: site.longitude,
                latitude: site.latitude,
                member: site.id.toString()
            });
        }
        console.log(`[Worker] Synced ${rows.length} destinations.`);
    } catch (err) {
        console.error('[Worker Error]', err);
    }
}

function startAggregator() {
    // Run an initial sync immediately on startup
    syncCapacity();
    // Run periodically every 15 minutes
    cron.schedule('*/15 * * * *', syncCapacity);
}

module.exports = { startAggregator, syncCapacity };