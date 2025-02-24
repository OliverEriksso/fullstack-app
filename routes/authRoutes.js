import express from "express";
import User from "../models/user.js";
import { getHashedPassword, comparePasswords, generateToken } from "../services/auth.js";
import passport from "../services/passport.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, "secretkey", { expiresIn: "1h" });

    res.redirect(
        `http://localhost:3000/?token=${token}` +
        `&username=${req.user.username}` +
        `&role=${req.user.role}` +
        `&userId=${req.user._id}` 
      );
});

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({message: "User already exists"});
        }

        const hashedPassword = await getHashedPassword(password);
        const newUser = new User({ username, password: hashedPassword })
        await newUser.save();

        res.status(201).json({ message: "User registered successfully! "});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "User not found" });

        const matchPass = await comparePasswords(password, user.password);
        if (!matchPass) return res.status(400).json({ message: "Invalid password" });

        const token = await generateToken(user);
        res.json({ message: "Login successful", token, userId: user._id, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

export default router;