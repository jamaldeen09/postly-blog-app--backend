import { readOperation, writeOperation } from "../services/cache.services.js";
import { User } from "../models/User.js";
const getProfileController = async (req, res) => {
    try {
        // ** Extract the user's id attached to request ** \\
        const userId = req.accessTokenPayload.userId;
        // ** Check if the user exists in cache ** \\
        const cachedUser = readOperation(`user:${userId}`);
        if (!cachedUser) {
            // ** Cache miss ** \\
            const user = await User.findById(userId)
                .lean()
                .select("_id username email createdAt updatedAt");
            if (!user)
                return res.status(404).json({
                    success: false,
                    message: "Account was not found",
                    statusCode: 404,
                    error: "Not found"
                });
            const stringifiedUserId = user._id.toString();
            writeOperation(user, `user:${stringifiedUserId}`);
            return res.status(200).json({
                success: true,
                message: "Profile fetched successfully",
                statusCode: 200,
                data: { profile: user }
            });
        }
        else {
            // ** Cache hit ** \\
            const parsedCachedUser = JSON.parse(cachedUser);
            return res.status(200).json({
                success: true,
                message: "Profile fetched successfully",
                statusCode: 200,
                data: { profile: parsedCachedUser }
            });
        }
    }
    catch (err) {
        console.error(`Error occured in "getProfileController" in file "profile.controllers.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to refresh your token, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        });
    }
};
export { getProfileController };
//# sourceMappingURL=profile.controllers.js.map