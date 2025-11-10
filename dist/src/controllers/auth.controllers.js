import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { prepareTokens } from "../services/auth.services.js";
import { readOperation, writeOperation } from "../services/cache.services.js";
// ** Signup controller ** \\
const signupController = async (req, res) => {
    try {
        // ** Extract validated data attached to request ** \\
        const signupCredentials = req.data;
        // ** Check if the user already exists ** \\
        const user = await User.exists({ email: signupCredentials.email });
        if (user)
            return res.status(400).json({
                success: false,
                message: "Account already exists, please log in",
                statusCode: 400,
                error: "Not found"
            });
        // ** Create a new user in the database after confirmation ** \\
        const hashedPassword = await bcrypt.hash(signupCredentials.password, 12);
        const newUser = await User.create({
            ...signupCredentials,
            password: hashedPassword
        });
        // ** Prepare tokens for the user ** \\
        const stringifiedUserId = newUser._id.toString();
        const { accessToken, refreshToken } = prepareTokens(stringifiedUserId, newUser.username);
        // ** Store the user in cache (simulates a session) ** \\
        const cacheData = {
            _id: stringifiedUserId,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt.toISOString(),
            updatedAt: newUser.updatedAt.toISOString(),
        };
        writeOperation(cacheData, `user:${stringifiedUserId}`);
        // ** Send tokens to the frontend as part of the response ** \\
        return res.status(201).json({
            success: true,
            message: "Account successfully created",
            statusCode: 201,
            data: {
                auth: { username: newUser.username, userId: stringifiedUserId },
                accessToken,
                refreshToken,
            }
        });
    }
    catch (err) {
        console.error(`Error occured in "signupController" in file "auth.controllers.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to create your account, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        });
    }
};
const loginController = async (req, res) => {
    try {
        // ** Extract validated data attached to request ** \\
        const loginCredentials = req.data;
        // ** Check if the user already exists in the database ** \\
        const user = await User.findOne({ email: loginCredentials.email })
            .lean()
            .select("_id email createdAt updatedAt username password");
        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                statusCode: 404,
                error: "Not found"
            });
        // ** Validate the users credentials (password) ** \\
        const isPasswordValid = await bcrypt.compare(loginCredentials.password, user.password);
        if (!isPasswordValid)
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
                statusCode: 400,
            });
        // ** Prepare tokens for the user ** \\
        const stringifiedUserId = user._id.toString();
        const { accessToken, refreshToken } = prepareTokens(stringifiedUserId, user.username);
        // ** Store the user in cache (simulates a session) ** \\
        const cacheData = {
            _id: stringifiedUserId,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
        writeOperation(cacheData, `user:${stringifiedUserId}`);
        // ** Send tokens to the frontend as part of the response ** \\
        return res.status(201).json({
            success: true,
            message: "Successfully logged in",
            statusCode: 201,
            data: {
                auth: { username: user.username, userId: stringifiedUserId },
                accessToken,
                refreshToken,
            }
        });
    }
    catch (err) {
        console.error(`Error occured in "loginController" in file "auth.controllers.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to log you into your account, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        });
    }
};
const getAuthStateController = async (req, res) => {
    try {
        // ** Extract user's id from access token payload attached to request ** \\
        const userId = req.accessTokenPayload.userId;
        // ** Check if the user exists in cache firstly ** \\
        const cachedUser = readOperation(`user:${userId}`);
        if (!cachedUser) {
            // ** Cache miss ** \\
            // **  Search for the user in the database ** \\
            const user = await User.findById(userId)
                .lean()
                .select("username _id email createdAt updatedAt");
            if (!user)
                return res.status(404).json({
                    success: false,
                    message: "Account was not found",
                    statusCode: 404,
                    error: "Not found"
                });
            const stringifiedUserId = user._id.toString();
            const authPayload = { username: user.username, userId: stringifiedUserId };
            // ** Store the user in cache ** \\
            const cacheData = {
                _id: stringifiedUserId,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            };
            writeOperation(cacheData, `user:${stringifiedUserId}`);
            // ** Return a success response containing auth state ** \\
            return res.status(200).json({
                success: true,
                message: "Successfully fetched authentication state",
                statusCode: 200,
                data: { auth: authPayload }
            });
        }
        else {
            // ** Cache hit ** \\
            const { username, _id: userId } = JSON.parse(cachedUser);
            const authPayload = { username, userId };
            // ** Return a success response containing auth state ** \\
            return res.status(200).json({
                success: true,
                message: "Successfully fetched authentication state",
                statusCode: 200,
                data: { auth: authPayload }
            });
        }
    }
    catch (err) {
        console.error(`Error occured in "getAuthStateController" in file "auth.controllers.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to fetch your authentication state, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        });
    }
};
const refreshTokenController = async (req, res) => {
    try {
        // ** Extract user's id from access token payload attached to request ** \\
        const userId = req.refreshTokenPayload.userId;
        // **  Search for the user in the database ** \\
        const user = await User.findById(userId)
            .lean()
            .select("username _id");
        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                statusCode: 404,
                error: "Not found"
            });
        // ** Prepare tokens for the user ** \\
        const stringifiedUserId = user._id.toString();
        const { accessToken } = prepareTokens(stringifiedUserId, user.username);
        // ** Return a success response containing access token ** \\
        return res.status(200).json({
            success: true,
            message: "Token refreshed",
            statusCode: 200,
            data: { accessToken }
        });
    }
    catch (err) {
        console.error(`Error occured in "refreshTokenController" in file "auth.controllers.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to refresh your token, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        });
    }
};
export { signupController, loginController, getAuthStateController, refreshTokenController, };
//# sourceMappingURL=auth.controllers.js.map