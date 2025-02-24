import dotenv from "dotenv";
dotenv.config();
const mongoKey =  process.env.NODE_ENV === "test" 
    ? process.env.TEST_MONGO_URI
    : process.env.MONGO_URI;
export default mongoKey;