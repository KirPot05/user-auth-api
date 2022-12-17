import { Router } from "express";
import {
  createProfile,
  fetchUserProfile,
  fetchUsers,
  registerUser,
  userLogin,
  verifyUser,
} from "../controllers/user.controller.js";
import {
  profileValidation,
  userCredentials,
  userVerify,
  validateErrors,
} from "../lib/validator.js";
import isValidUser from "../middlewares/isValidUser.js";

const router = Router();

// Unauthenticated routes
router.post("/login", userCredentials, validateErrors, userLogin);

router.post("/users/new", userCredentials, validateErrors, registerUser);

router.post("/users/verify", userVerify, validateErrors, verifyUser);

// Authenticated Routes
router.post(
  "/users/profile/new",
  profileValidation,
  validateErrors,
  isValidUser,
  profileValidation,
  createProfile
);

router.get("/users/profile", isValidUser, fetchUserProfile);

router.get("/users", isValidUser, fetchUsers);

export default router;
