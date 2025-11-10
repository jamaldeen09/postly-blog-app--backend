// ** Services that aid authentication ** \\
import jwt from "jsonwebtoken";
import envData from "../config/env.config.js";
// ** Custom service to validate both access and refresh tokens ** \\
const validateToken = async (req, res, tokenType) => {
    try {
        // ** Extract token conditionally ** \\
        let accessToken;
        let refreshToken;
        if (tokenType === "accessToken") {
            accessToken = req.headers.authorization?.split(" ")[1];
            if (!accessToken)
                return {
                    success: false,
                    message: "Unauthorized",
                    statusCode: 401,
                };
            // ** Attach decoded access token to request ** \\
            const decoded = jwt.verify(accessToken, envData.ACCESS_TOKEN_SECRET);
            req.accessTokenPayload = { username: decoded.username, userId: decoded.userId };
            return {
                success: true,
                message: "Token validated successfully",
                statusCode: 200,
            };
        }
        else {
            refreshToken = req.headers["x-refresh-token"];
            if (!refreshToken)
                return {
                    success: false,
                    message: "Unauthorized",
                    statusCode: 401,
                };
            // ** Attach decoded refresh token to request ** \\
            const decoded = jwt.verify(refreshToken, envData.REFRESH_TOKEN_SECRET);
            req.refreshTokenPayload = { userId: decoded.userId };
            return {
                success: true,
                message: "Token validated successfully",
                statusCode: 200,
            };
        }
        ;
    }
    catch (err) {
        // ** Error handling ** \\
        if (err instanceof jwt.JsonWebTokenError) {
            // ** Malformed token ** \\
            return {
                success: false,
                message: "Invalid token",
                statusCode: 401,
                error: "Token error"
            };
        }
        ;
        if (err instanceof jwt.TokenExpiredError) {
            // ** Expired token ** \\
            return {
                success: false,
                message: "Token has expired",
                statusCode: 401,
                error: "Token error"
            };
        }
        ;
        console.error(`Error in "validateToken" service in file "auth.services.ts": ${err}`);
        return {
            success: false,
            message: "A server error occured during token validation",
            statusCode: 500,
            error: "Internal server error"
        };
    }
};
const createToken = (tokenType, payload) => {
    if (tokenType === "accessToken") {
        const typedPayload = payload;
        return jwt.sign(typedPayload, envData.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    }
    if (tokenType === "refreshToken") {
        const typedPayload = payload;
        return jwt.sign(typedPayload, envData.REFRESH_TOKEN_SECRET, { expiresIn: "5d" });
    }
    return "";
};
const prepareTokens = (userId, username) => {
    const accessToken = createToken("accessToken", { username, userId });
    const refreshToken = createToken("refreshToken", { userId });
    return { accessToken, refreshToken };
};
export { validateToken, createToken, prepareTokens, };
//# sourceMappingURL=auth.services.js.map