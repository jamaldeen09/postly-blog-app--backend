// ** Auth route setup ** \\
import express from "express";
import ValidationHandler from "../services/validation.services.js";
import { expressValidationHandler, verifyAccessToken, verifyRefreshToken } from "../middlewares/auth.middlewares.js";
import { getAuthStateController, loginController, refreshTokenController, signupController } from "../controllers/auth.controllers.js";
const authRouter = express.Router();
// ** Custom service for validation ** \\
const validationService = new ValidationHandler();
// ** Signup route ** \\
authRouter.post("/signup", validationService.newAuthValidation("signup"), expressValidationHandler, signupController);
// ** Login route ** \\
authRouter.post("/login", validationService.newAuthValidation("login"), expressValidationHandler, loginController);
// ** Get the current users auth state ** \\
authRouter.get("/me", verifyAccessToken, getAuthStateController);
// ** Refresh the users token ** \\
authRouter.get("/refresh", verifyRefreshToken, refreshTokenController);
export default authRouter;
//# sourceMappingURL=auth.routes.js.map