import crypto from "crypto";

const csrfTokens = new Map(); 

export function generateCsrfToken(req, res, next) {
    const token = crypto.randomBytes(32).toString("hex");
    csrfTokens.set(token, true); 
    res.cookie("csrf-token", token, { httpOnly: true, sameSite: "Strict" });
    next();
}

export function validateCsrfToken(req, res, next) {
    const token = req.headers["x-csrf-token"];
    if (!token || !csrfTokens.has(token)) {
        return res.status(403).json({ message: "CSRF validation failed" });
    }
    csrfTokens.delete(token); 
    next();
}