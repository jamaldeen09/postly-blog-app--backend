import { Request } from "express";
import { ApiResponse, ConfiguredRequest, ControllerResponse } from "../types/auth.types.js";
import { readOperation, writeOperation } from "../services/cache.services.js";
import { IUserQuery, User } from "../models/User.js";
import { UserProfile } from "../types/profile.types.js";
import mongoose from "mongoose";

const getProfileController = async (
    req: Request,
    res: ApiResponse
): ControllerResponse => {
    try {
        // ** Extract the user's id attached to request ** \\
        const userId = (req as ConfiguredRequest).accessTokenPayload.userId;

        // ** Check if the user exists in cache ** \\
        const cachedUser = readOperation(`user:${userId}`);
        if (!cachedUser) {

            // ** Cache miss ** \\
            const user: IUserQuery = await User.findById(userId)
              .lean<IUserQuery>()
              .select("_id username email createdAt updatedAt");

            if (!user)
                return res.status(404).json({
                    success: false, 
                    message: "Account was not found",
                    statusCode: 404,
                    error: "Not found"
                });

            const stringifiedUserId = (user._id as mongoose.Types.ObjectId).toString()
            writeOperation(user as unknown as UserProfile,`user:${stringifiedUserId}`);

            return res.status(200).json({
                success: true,
                message: "Profile fetched successfully",
                statusCode: 200,
                data: { profile: user }
            });
        } else {
            // ** Cache hit ** \\
            const parsedCachedUser: UserProfile = JSON.parse(cachedUser);
            return res.status(200).json({
                success: true,
                message: "Profile fetched successfully",
                statusCode: 200,
                data: { profile: parsedCachedUser }
            })
        }
    } catch (err) {
        console.error(`Error occured in "getProfileController" in file "profile.controllers.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to refresh your token, please try again shortly",
            statusCode: 500,
            error: "Internal server error"
        })
    }
}


export {
    getProfileController
}