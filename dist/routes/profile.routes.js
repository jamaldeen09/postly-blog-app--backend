import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middlewares.js";
import { getProfileController } from "../controllers/profile.controllers.js";
const profileRouter = express.Router();
// ** Get current users profile ** \\
profileRouter.get("/me", verifyAccessToken, getProfileController);
export default profileRouter;
//# sourceMappingURL=profile.routes.js.map