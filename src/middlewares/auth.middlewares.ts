// ** Middlewares for authentication ** \\
import { NextFunction, Request } from "express"
import { ApiResponse, ConfiguredRequest, ExtendedValidationError, MiddlewareResponse } from "../types/auth.types.js"
import { validateToken } from "../services/auth.services.js";
import { matchedData, validationResult } from "express-validator";


// ** Middleware for access token verification ** \\
const verifyAccessToken = async (
    req: Request,
    res: ApiResponse, 
    next: NextFunction
): MiddlewareResponse => {
    try {
        // ** Use custom servie ** \\
        const validationResponse = await validateToken(req, res, "accessToken");

        if (!validationResponse.success) 
            return res.status(validationResponse.statusCode).json(validationResponse);
        
        next();
    } catch (err) {
        console.error(`Error occured in "verifyAccessToken" middleware in file "auth.middlewares.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured during token validation",
            statusCode: 500,
            error: "Internal server error"
        })
    }
}

// ** Middleware for refresh token verification ** \\
const verifyRefreshToken = async (
    req: Request,
    res: ApiResponse,
    next: NextFunction
): MiddlewareResponse => {
    try {
        // ** Use custom servie ** \\
        const validationResponse = await validateToken(req, res, "refreshToken");

        if (!validationResponse.success) 
            return res.status(validationResponse.statusCode).json(validationResponse);
        
        next();
    } catch (err) {
        console.error(`Error occured in "verifyRefreshToken" middleware in file "auth.middlewares.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured during token validation",
            statusCode: 500,
            error: "Internal server error"
        })
    }
}

// ** Middleware to handle express validator responses ** \\
const expressValidationHandler = async (
    req: Request,
    res: ApiResponse,
    next: NextFunction,
): MiddlewareResponse => {
    try {
        // ** Extract errors ** \\
        const errors = validationResult(req);
        
        // ** Check if there are any errors ** \\
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map((err: unknown) => {
                const e = err as ExtendedValidationError;
                return {
                    field: e.path ?? e.param ?? 'unknown',
                    message: e.msg,
                };
            });

            return res.status(400).json({
                success: false,
                message: "An error occured during validation",
                statusCode: 400,
                error: "Validation error",
                data: { errors: formattedErrors },
            })
        }

        // ** Attach matched data to request ** \\
        (req as ConfiguredRequest).data = matchedData(req);

        next();
    } catch (err) {
        console.error(`A server error occured in "expressValidationHandler": ${err}`)

        // ** Error handler ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured during data validation",
            error: "Internal server error",
            statusCode: 500,
        })
    }
}


export {
    verifyAccessToken,
    verifyRefreshToken,
    expressValidationHandler,
}