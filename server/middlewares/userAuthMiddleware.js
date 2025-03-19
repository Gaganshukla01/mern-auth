import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {

    const token = req.cookies.token || req.headers.Authorization?.split(" ")[1]; 

    console.log("Token:", token);

    if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized. Please log in again." });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecode.id) {
            req.body.userId = tokenDecode.id; 
        } else {
            return res.status(401).json({ success: false, message: "Not Authorized. Please log in again." });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token." });
    }
};

export default userAuth;
