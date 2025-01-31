import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import cors from 'cors'
import { v4 as uuid } from 'uuid';
import { pgquery } from './utils/pgquery.js';
import session from "express-session";

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
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: null, secure: process.env.NODE_ENV === 'production' },
    })
);
console.log('node env: ', process.env.NODE_ENV);

const sessionMiddleware = (req, res, next) => {
    const existingSessionId = req.session.sessionId;

    if (!existingSessionId) {
        // Generate a new sessionId
        const newSessionId = uuid();
        console.log(`req.session: ${JSON.stringify(req.session, null, 2)}`);
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
        console.log(`Existing sessionId detected: ${existingSessionId}`);
    }

    next();
};

app.use(sessionMiddleware);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/auth', authRoutes);

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});