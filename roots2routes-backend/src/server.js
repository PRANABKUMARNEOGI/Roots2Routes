require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { db, cache } = require('./config');
const { startAggregator } = require('./aggregator');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter: 100 requests per minute
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Traffic surge: Please slow down requests.' }
});
app.use('/api/', apiLimiter);

// 1. GET all live destinations
app.get('/api/v1/destinations/live', async (req, res) => {
    try {
        const keys = await cache.keys('dest:*');
        const destinations = [];

        for (const key of keys) {
            const data = await cache.hGetAll(key);
            if (Object.keys(data).length > 0) {
                destinations.push({
                    ...data,
                    percentage: parseInt(data.percentage),
                    queue_time_mins: parseInt(data.queue_time_mins)
                });
            }
        }

        res.json({ count: destinations.length, data: destinations });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch live capacity' });
    }
});

// 2. POST intelligent routing recommendation
app.post('/api/v1/routes/recommend', async (req, res) => {
    try {
        const { category, target_lat, target_lon, max_radius_km = 100 } = req.body;

        const nearbyIds = await cache.geoSearch(
            'destinations:geo',
            { longitude: parseFloat(target_lon), latitude: parseFloat(target_lat) },
            { radius: parseFloat(max_radius_km), unit: 'km' },
            { SORT: 'ASC' }
        );

        let selected = null;
        let originalSite = null;

        for (const id of nearbyIds) {
            const site = await cache.hGetAll(`dest:${id}`);
            if (!site.id) continue;

            if (!category || site.category.toLowerCase() === category.toLowerCase()) {
                if (!originalSite) originalSite = site;

                if (parseInt(site.percentage) < 80) {
                    selected = site;
                    break;
                }
            }
        }

        res.json({
    rerouted: selected && originalSite && selected.id !== originalSite.id,
    ...(selected || originalSite) // Spreads the destination properties (name, percentage, district, etc.) to the root level
});
    } catch (err) {
        res.status(500).json({ error: 'Routing calculation failed' });
    }
});

// Start the server and the background aggregator
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// 3. POST WhatsApp Assistant Webhook (Handles Hindi & English Queries)
app.post('/api/v1/whatsapp/webhook', async (req, res) => {
    try {
        const incomingMsg = (req.body.message || req.body.Body || '').toLowerCase().trim();
        
        if (!incomingMsg) {
            return res.json({ reply: 'Namaste! Ask me about crowd status or destinations. (e.g., "Is Chitrakote crowded?")' });
        }

        const keys = await cache.keys('dest:*');
        let matchedDest = null;

        // 1. Search for matching destination name in message
        for (const key of keys) {
            const site = await cache.hGetAll(key);
            if (site.name && incomingMsg.includes(site.name.toLowerCase().split(' ')[0])) {
                matchedDest = site;
                break;
            }
        }

        // 2. Fallback category matching (e.g., waterfall, temple, wildlife)
        if (!matchedDest) {
            for (const key of keys) {
                const site = await cache.hGetAll(key);
                if (site.category && incomingMsg.includes(site.category.toLowerCase().slice(0, -1))) {
                    matchedDest = site;
                    break;
                }
            }
        }

        if (!matchedDest) {
            return res.json({
                reply: `Namaste! We couldn't find that exact spot. Try asking about Chitrakote, Tirathgarh, Barnawapara, or Kanger Valley.`
            });
        }

        const percentage = parseInt(matchedDest.percentage);
        const isCrowded = percentage >= 80;

        // 3. If overcrowded, fetch alternative low-crowd recommendation
        if (isCrowded) {
            const nearbyIds = await cache.geoSearch(
                'destinations:geo',
                { longitude: parseFloat(matchedDest.lon), latitude: parseFloat(matchedDest.lat) },
                { radius: 100, unit: 'km' },
                { SORT: 'ASC' }
            );

            let alternate = null;
            for (const id of nearbyIds) {
                if (id === matchedDest.id) continue;
                const altSite = await cache.hGetAll(`dest:${id}`);
                if (parseInt(altSite.percentage) < 80 && altSite.category === matchedDest.category) {
                    alternate = altSite;
                    break;
                }
            }

            const altText = alternate 
                ? `\n\n💡 *Recommendation:* ${alternate.name} is only at ${alternate.percentage}% capacity (~45 min away). Would you like route directions?`
                : '';

            return res.json({
                reply: `📍 *${matchedDest.name}* is currently at *${percentage}% capacity* (High Crowd / ~${matchedDest.queue_time_mins} min queue).${altText}`
            });
        }

        // 4. Low/Moderate crowd response
        res.json({
            reply: `📍 *${matchedDest.name}* is currently at *${percentage}% capacity* (Normal conditions / ~${matchedDest.queue_time_mins} min wait). Great time to visit!`
        });

    } catch (err) {
        console.error('WhatsApp Bot Error:', err);
        res.status(500).json({ error: 'Chatbot service error' });
    }
});