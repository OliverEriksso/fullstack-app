import jwt from "jsonwebtoken";
import { hash,compare } from "bcrypt";
import User from "../models/user.js";

const getHashedPassword = async (password) => {
    return await hash(password, 3);
}

const comparePasswords = async (password, dbPassword) => {
    return await compare(password, dbPassword);
}


const generateToken = async (user) => {
    return jwt.sign({ id: user._id, role: user.role }, "secretkey", { expiresIn:"1h" });
}

const verifyToken = async (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader) {
        return res.status(401).send("Unauthorized: No token provided");
    }

    const token = bearerHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "secretkey"); //secretkey is not safe to hardcode like this, but let's imagine it's incoming from a safe cloud platform
        const user = await User.findById(decoded.id).select("-password");

        if(!user) {
            return res.status(401).send("User not found");
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).send("Unauthorized Invalid Token");
    }
}

const checkRolePermission = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        next();
    };
};


export {generateToken,verifyToken,getHashedPassword, comparePasswords, checkRolePermission };