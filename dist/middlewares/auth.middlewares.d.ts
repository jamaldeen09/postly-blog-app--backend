import { NextFunction, Request } from "express";
import { ApiResponse, MiddlewareResponse } from "../types/auth.types.js";
declare const verifyAccessToken: (req: Request, res: ApiResponse, next: NextFunction) => MiddlewareResponse;
declare const verifyRefreshToken: (req: Request, res: ApiResponse, next: NextFunction) => MiddlewareResponse;
declare const expressValidationHandler: (req: Request, res: ApiResponse, next: NextFunction) => MiddlewareResponse;
export { verifyAccessToken, verifyRefreshToken, expressValidationHandler, };
//# sourceMappingURL=auth.middlewares.d.ts.map