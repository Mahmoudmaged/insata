const userModel = require("../../../DB/model/User")
const jwt = require('jsonwebtoken');
const sendEmail = require("../../../commen/email");
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const { paginateService } = require("../../../commen/services/paginate.service");
const { findService } = require("../../../commen/services/find.service");
const { findSearch } = require("../../../commen/services/newFind");
const clint = new OAuth2Client(process.env.GOOGLECLINTID);
const signup = async(req, res) => {

    try {
        const { userName, email, password } = req.body
        const user = await userModel.findOne({ email });

        if (user) {
            res.status(400).json({ message: "email exist" })
        } else {

            const newUser = new userModel({ userName, email, password })
            const savedUser = await newUser.save();

            const token = jwt.sign({ id: savedUser._id }, process.env.SECRETKEY, { expiresIn: 60 });
            const refreshToken = jwt.sign({ id: savedUser._id }, process.env.SECRETKEY);

            const message = `<a href="${req.protocol}://${req.headers.host}/user/confirm/${token}">click me </a> <br>
            <a href="${req.protocol}://${req.headers.host}/user/email/re_send/${refreshToken}">re-send activation  link </a>`
            await sendEmail(email, message)
            res.status(201).json({ message: "Done", status: 201 })

        }

    } catch (error) {
        res.status(500).json({ message: "catch err ", error })
    }
}

const resendConfirmationEmail = async(req, res, next) => {

    const { token } = req.params;

    if (!token || token == undefined || token == null) {
        res.status(400).json({ message: "token err" })

    } else {

        const decoded = jwt.verify(token, process.env.SECRETKEY);
        console.log(decoded);

        const user = await userModel.findOne({ _id: decoded.id, confirmed: false });
        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.SECRETKEY, { expiresIn: 60 });
            const refreshToken = jwt.sign({ id: user._id }, process.env.SECRETKEY);

            const message = `<a href="${req.protocol}://${req.headers.host}/user/confirm/${token}">click me </a> <br>
            <a href="${req.protocol}://${req.headers.host}/user/email/re_send/${refreshToken}">re-send activation  link </a>`
            await sendEmail(user.email, message)
                //resendEmail
            res.status(200).json({ message: "Done", status: 200 })
        } else {
            res.status(400).json({ message: "in-valid link" })
        }
    }


}

const loginWithGoogle = async(req, res) => {

    const { name, photoUrl, firstName, lastName, response } = req.body
    const idToken = response.id_token;
    clint.verifyIdToken({ idToken, audience: process.env.GOOGLECLINTID }).then(async(response) => {
        console.log(response);
        const { email_verified, email } = response.payload


        if (email_verified) {

            const user = await userModel.findOne({ email });

            if (user) {
                //user already exist just login
                const token = jwt.sign({ id: user._id, isLoggedIn: true }, process.env.SECRETKEY, { expiresIn: 3600 })
                res.status(200).json({ message: "Done already exist and login", token, status: 200 })
            } else {
                const newUser = await userModel.insertMany({ userName: name, firstName, lastName, email, confirmed: true, profilePic: photoUrl });
                const token = jwt.sign({ id: newUser._id, isLoggedIn: true }, process.env.SECRETKEY, { expiresIn: 3600 })
                res.status(201).json({ message: "Done signup then login", token, status: 201 })

            }


        } else {
            res.status(400).json({ message: "in-valid google account" })
        }


    })


}

const confirmEmail = async(req, res) => {

    try {

        const { token } = req.params
        if (!token || token == undefined || token == null) {
            res.status(400).json({ message: "token err" })

        } else {

            const decoded = jwt.verify(token, process.env.SECRETKEY);
            console.log(decoded);

            const user = await userModel.findOneAndUpdate({ _id: decoded.id, confirmed: false }, { confirmed: true }, { new: true });
            if (user) {
                res.status(200).json({ message: "confimed pleas login" })
            } else {
                res.status(400).json({ message: "in-valid link" })
            }
        }

    } catch (error) {
        res.status(500).json({ message: "catch err ", error })
    }
}

const signin = async(req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            res.status(400).json({ message: "in-valid user" })
        } else {
            if (!user.confirmed) {
                res.status(400).json({ message: "please confirm your email first" })

            } else {

                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    const token = jwt.sign({ id: user.id, isLoggedIn: true }, process.env.SECRETKEY, { expiresIn: 3600 })
                    res.status(200).json({ message: "Done", token })

                } else {
                    res.status(400).json({ message: "password email mismatch" })

                }
            }
        }
    } catch (error) {
        res.status(500).json({ message: "catch err ", error })
    }
}


const profile = async(req, res) => {
    try {


        const user = await userModel.findOne({ _id: req.user._id }).select('-password');

        if (!user) {
            res.status(400).json({ message: "in-valid user" })
        } else {
            res.status(200).json({ message: "Done", user })

        }
    } catch (error) {
        res.status(500).json({ message: "catch err ", error })
    }
}

const editProfilePic = async(req, res) => {
    try {
        if (!req.files) {
            console.log("not found");
        } else {
            console.log(req.files[0]);

            const imageURl = `${req.protocol}://${req.headers.host}/${req.files[0].destination}/${req.files[0].filename}`;
            const user = await userModel.findOneAndUpdate({ _id: req.user.id }, { profilePic: imageURl })
            if (user) {
                res.status(200).json({ message: "Done", imageURl })
            } else {
                res.status(400).json({ message: "in-valid user" })
            }
        }
    } catch (error) {
        res.status(500).json({ message: "catch err ", error })

    }
}


const editCoverPic = async(req, res) => {
    try {
        if (!req.files) {
            console.log("not found");
        } else {


            let imagesURL = []
            for (let i = 0; i < req.files.length; i++) {
                let imageURl = `${req.protocol}://${req.headers.host}/${req.files[i].destination}/${req.files[i].filename}`;
                imagesURL.push(imageURl)
            }
            const user = await userModel.findOneAndUpdate({ _id: req.user.id }, { coverPic: imagesURL }, { new: true })
            if (user) {
                res.status(200).json({ message: "Done", imagesURL })
            } else {
                res.status(400).json({ message: "in-valid user" })
            }
        }
    } catch (error) {
        res.status(500).json({ message: "catch err ", error })

    }
}

const allUser = async(req, res) => {
    try {
        const { page, size } = req.query
        const { skip, limit } = paginateService(page, size)
        const user = await userModel.find({}).select('-password').limit(limit).skip(skip);
        res.json({ user })
    } catch (error) {
        res.status(500).json({ message: "catch err" })
    }

}


const searchUser = async(req, res) => {
    try {
        const { page, size } = req.query
        const { skip, limit } = paginateService(page, size)
        const searchdata =  await findSearch(userModel , skip , limit , "mahmoud"  , [
          "userName",
            "email",
            "password"
        ])
        res.json({ searchdata })
    } catch (error) {
        res.status(500).json({ message: "catch err" })
    }

}



module.exports = {
    signup,
    confirmEmail,
    signin,
    profile,
    editProfilePic,
    resendConfirmationEmail,
    editCoverPic,
    allUser,
    loginWithGoogle,
    searchUser
}