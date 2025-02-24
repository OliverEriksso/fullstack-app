import express from "express";
import cors from "cors";
import helmet from "helmet";

import session from "express-session";
import passport from "passport";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import { generateCsrfToken, validateCsrfToken } from "./services/csrf.js";


const server = express();

server.use(express.json());
server.use(express.static("public"));
server.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

server.use(session({ secret: "secretkey", resave: false, saveUninitialized: false }));
server.use(passport.initialize());
server.use(passport.session());

server.use("/auth", authRoutes);
server.use("/posts", postRoutes);
server.use("/users", userRoutes);

server.use(generateCsrfToken); 
server.use("/posts", validateCsrfToken); 
server.use("/users", validateCsrfToken);

server.use(helmet());

export default server;