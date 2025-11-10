import { Request, Response } from "express";
import { ApiResponsePayload, TokenPayload } from "../types/auth.types.js";
declare const validateToken: (req: Request, res: Response, tokenType: "accessToken" | "refreshToken") => Promise<ApiResponsePayload>;
declare const createToken: (tokenType: "accessToken" | "refreshToken", payload: TokenPayload["accessTokenPayload"] | TokenPayload["refreshTokenPayload"]) => string;
declare const prepareTokens: (userId: string, username: string) => {
    accessToken: string;
    refreshToken: string;
};
export { validateToken, createToken, prepareTokens, };
//# sourceMappingURL=auth.services.d.ts.map