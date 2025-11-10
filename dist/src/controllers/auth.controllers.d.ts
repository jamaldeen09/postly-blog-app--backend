import { Request } from "express";
import { ApiResponse, ControllerResponse } from "../types/auth.types.js";
declare const signupController: (req: Request, res: ApiResponse) => ControllerResponse;
declare const loginController: (req: Request, res: ApiResponse) => ControllerResponse;
declare const getAuthStateController: (req: Request, res: ApiResponse) => ControllerResponse;
declare const refreshTokenController: (req: Request, res: ApiResponse) => ControllerResponse;
export { signupController, loginController, getAuthStateController, refreshTokenController, };
//# sourceMappingURL=auth.controllers.d.ts.map