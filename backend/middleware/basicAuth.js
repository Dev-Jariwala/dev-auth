import jwt, { decode } from 'jsonwebtoken';
import { pgquery } from "../utils/pgquery.js";
import { generateAccessTokenFromRefreshToken } from '../helpers/auth.helpers.js';

const verifykey = process.env.JWT_SECRET;

export const basicAuth = async (req, res, next) => {
    let token = req.cookies?.accessToken;
    console.log(req.session);
    if (!token) {
        return res.status(401).send({ message: "No token provided" });
    }
    const [result] = await pgquery('SELECT * FROM refresh_tokens WHERE access_token = $1', [token]);
    if (!result) {
        return res.status(401).send({ message: "Refresh token not found for specified access_token" });
    }
    if (result.revoked) {
        return res.status(401).send({ message: "Refresh token has been revoked" });
    }
    jwt.verify(token, verifykey, async (err, decoded) => {
        if (err) {
            console.log('Error in basicAuth middleware: ', err.message);
            if (err.message === 'jwt expired') {
                const accessToken = await generateAccessTokenFromRefreshToken(result.token);
                if (!accessToken) {
                    return res.status(500).send({ message: "Failed to generate access token" });
                }
                const updateResult = await pgquery('UPDATE refresh_tokens SET access_token = $1 WHERE token = $2 returning *', [accessToken, result.token]);
                if (!updateResult) {
                    return res.status(500).send({ message: "Failed to update access token" });
                }

                res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none'
                });
                req.cookies.accessToken = accessToken;
                req.accessToken = accessToken;
                req.refreshToken = result.token;
                // decode the new token and set the decoded object on the request
                decoded = decode(accessToken);
                if (!decoded) {
                    return res.status(401).send({ message: "Unauthorized" });
                }
                req.user = decoded.user;

                return next();
            }
            return res.status(401).send({ message: "Unauthorized" });
        }
        req.accessToken = token;
        req.refreshToken = result.token;
        req.user = decoded.user;
        next();
    });
};