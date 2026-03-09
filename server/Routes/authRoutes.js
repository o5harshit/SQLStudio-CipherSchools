import express from "express"
import { getUserInfo, login, Logout, signup } from "../Controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";





const AuthRoutes = express.Router();

AuthRoutes.post("/signup",signup);
AuthRoutes.get("/user-info",verifyToken,getUserInfo);
AuthRoutes.post("/login",login);
AuthRoutes.get("/logout",Logout);



export default AuthRoutes;


