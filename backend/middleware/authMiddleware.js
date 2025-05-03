import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler"

const authMiddleware = asyncHandler(async (req, res, next) => {
    const auth = req.header("Authorization");
    const token = auth.split(" ")[1]
    console.log (token);
    if (!token) {
        res.status(401);
        throw new Error("Access Denied");
     }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // if
    console.log(verified);
    req.user = verified;
    next();
});

export default authMiddleware;