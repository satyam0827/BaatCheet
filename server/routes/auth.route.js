import express from "express"
import { logOut, logIn, signUp, updateProfile, checkAuth } from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signUp",signUp)

router.post("/logIn", logIn)

router.post("/logOut",logOut)

router.put("/update-profile",protectedRoute,updateProfile)

router.get("/checkauth",protectedRoute,checkAuth);

export default router;
