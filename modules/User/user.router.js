const { auth } = require("../../middlewear/auth");
const handelValidation = require("../../middlewear/handelValidation");
const { signup, confirmEmail, signin, profile, editProfilePic, editCoverPic, allUser, resendConfirmationEmail, loginWithGoogle, searchUser } = require("./controller/user");
const endPoint = require("./endPoint");
const { signUpValidator } = require("./user.validation");

const router = require("express").Router();



//signup

router.post('/user/signup', signUpValidator, handelValidation(), signup)

//confirmEmail
router.get("/user/confirm/:token", confirmEmail)
//resend email
router.get("/user/email/re_send/:token", resendConfirmationEmail)

    //sigin 
router.post('/user/signin', signUpValidator[1, 2], handelValidation(), signin)

//google sign in

router.post("/user/googleLogin" , loginWithGoogle)
router.get("/user/profile", auth(endPoint.Profile), profile)

router.patch('/user/profile/pic' ,  auth(endPoint.Profile), editProfilePic)
router.patch('/user/profile/cover/pic' ,  auth(endPoint.Profile), editCoverPic)


router.get("/admin/allUser" ,  auth(endPoint.allUser) ,allUser)


router.get("/user/search" , searchUser)
module.exports = router;