import express from "express";
import User from "../models/user.js";
import { verifyToken, checkRolePermission } from "../services/auth.js";

const router = express.Router();


router.get("/", verifyToken, checkRolePermission("admin"), async (req, res) => {
    try {
        const users = await User.find({}, "username role _id");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:id", verifyToken, checkRolePermission("admin"), async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;