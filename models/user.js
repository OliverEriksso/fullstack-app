import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    googleId: { type: String, unique: true }
}, { collection: "users" })

const User = mongoose.model("User", UserSchema);

export default User;