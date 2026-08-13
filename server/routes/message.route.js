import express from "express"
import { protectedRoute } from "../middleware/auth.middleware.js";
import { deleteMessage, forwardMessage, getMessages, getUsersForSideBar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users",protectedRoute,getUsersForSideBar)
router.get("/:id",protectedRoute,getMessages);
router.post("/send/:id",protectedRoute,sendMessage);
router.delete("/:id",protectedRoute,deleteMessage);
router.post("/forward",protectedRoute,forwardMessage);
export default router;