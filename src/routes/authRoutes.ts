import express, { Request, Response } from "express";
import validator from "../middlewares/validationMiddleware";
import { withAuthUser } from "../middlewares/authUserMiddleware";

import {
  getCurrentUser,
  createUserController,
  googleOauthController,
  loginWithEmailAndPassword,
} from "../controllers/auth/user.controller";

import {
  deleteSession,
  createUserSessionController,
} from "../controllers/auth/session.service";

import { createSessionSchema } from "../schemas/user.session.schema";
import { loginUserSchema, signupUserSchema } from "../schemas/user.schema";

const router = express.Router();

router.get("/user", withAuthUser, getCurrentUser);
router.delete("/api/sessions", withAuthUser, deleteSession);
router.post(
  "/session",
  validator(createSessionSchema),
  createUserSessionController
);

// login with email-password
router.post(
  "/user/email-password/login",
  validator(loginUserSchema),
  loginWithEmailAndPassword
);
// Sign with email-password
router.post("/user/signup", validator(signupUserSchema), createUserController);

// continue with google
router.get("/session/oauth/google", googleOauthController);

export default module.exports = router;
