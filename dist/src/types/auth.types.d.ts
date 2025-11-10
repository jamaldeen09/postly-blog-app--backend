import { Response, Request } from "express";
import { ValidationError } from "express-validator";
interface ApiResponsePayload {
    success: boolean;
    message: string;
    statusCode: number;
    error?: string;
    data?: unknown;
}
interface TokenPayload {
    accessTokenPayload: {
        username: string;
        userId: string;
    };
    refreshTokenPayload: Omit<TokenPayload["accessTokenPayload"], "username">;
}
interface ConfiguredRequest extends Request {
    data: unknown;
    accessTokenPayload: TokenPayload["accessTokenPayload"];
    refreshTokenPayload: TokenPayload["refreshTokenPayload"];
}
interface JwtPayload {
    userId: string;
    username: string;
    iat: number;
    exp: number;
}
type ApiResponse = Response<ApiResponsePayload>;
type MiddlewareResponse = Promise<ApiResponse | undefined>;
type ControllerResponse = Promise<ApiResponse>;
type ExtendedValidationError = ValidationError & {
    path?: string;
    param?: string;
};
export { type ApiResponse, type MiddlewareResponse, type ControllerResponse, type ConfiguredRequest, type ApiResponsePayload, type TokenPayload, type JwtPayload, type ExtendedValidationError };
//# sourceMappingURL=auth.types.d.ts.map