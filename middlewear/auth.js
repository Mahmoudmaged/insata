const jwt = require("jsonwebtoken");
const userModel = require("../DB/model/User");

const roles = {
    User: "User",
    Admin: "Admin",
    HR: "HR"
}


const auth = (data) => {

    return async(req, res, next) => {
        try {
            const headerToken = req.headers['authorization']
            console.log(headerToken);

            if (!headerToken || headerToken == null || headerToken == undefined || !headerToken.startsWith('Bearer')) {
                res.status(400).json({ message: "in-valid headerToken" })
            } else {
                const token = headerToken.split(" ")[1];
                const decoded = jwt.verify(token, process.env.SECRETKEY)
                const user = await userModel.findOne({ _id: decoded.id }).select("-password")
                if (!user) {
                    res.status(400).json({ message: "in-valid token data" })
                } else {

                    if (data.includes(user.role)) {
                        req.user = user;
                        next()
                    } else {
                        res.status(401).json({
                            message: "Sorry you not authorized"
                        })
                    }
                }

            }
        } catch (error) {
            res.status(500).json({ message: "catch err", error })
        }

    }
}


module.exports = {
    auth,
    roles
}