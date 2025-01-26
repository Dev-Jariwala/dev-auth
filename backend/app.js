import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import cors from 'cors'
import { v4 as uuid } from 'uuid';
import { pgquery } from './utils/pgquery.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: ['https://work.memighty.com', 'http://localhost:5173'],
    credentials: true,
}));

const sessionMiddleware = (req, res, next) => {
    const existingSessionId = req.cookies.session_id;
    if (!existingSessionId) {
        // Generate a new sessionId
        const newSessionId = uuid();
        req.cookies.session_id = newSessionId;
        res.cookie('session_id', newSessionId, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
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