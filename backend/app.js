import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import session from 'express-session';

import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';
import commonRoutes from './routes/common.routes.js';

import { pgquery } from './utils/pgquery.js';
import { redisStore } from './config/redis.js';
import { generalRateLimiter } from './config/rate-limit.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: ['https://work.memighty.com', 'http://localhost:5173', process.env.FRONTEND_DOMAIN],
    credentials: true,
}));

app.use(
    session({
        store: redisStore,
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: null,
            secure: process.env.NODE_ENV === 'production'
        },
    })
);

const sessionMiddleware = async (req, res, next) => {
    const existingSessionId = req.session.sessionId;

    if (!existingSessionId) {
        // Generate a new sessionId
        const newSessionId = uuid();
        req.session.sessionId = newSessionId;
        req.session.visited = true;
        if (req.cookies.accessToken) {
            console.log('Access token exists');
            const updateSessionIdQuery = `UPDATE refresh_tokens SET session_id = $1 WHERE access_token = $2`;
            // Execute the query
            const updateSessionIdResult = pgquery(updateSessionIdQuery, [newSessionId, req.cookies.accessToken]);
            if (!updateSessionIdResult) {
                console.log('Failed to update session id');
            }
        }
        console.log(`New sessionId set: ${newSessionId}`);
    } else {
        console.log(`Existing sessionId detected: ${req.session.id}`);
    }

    next();
};

app.use(sessionMiddleware);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/common', commonRoutes);

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});