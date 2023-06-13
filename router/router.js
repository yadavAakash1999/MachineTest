const router = require("express").Router();
const {
    newUser, login, logout, fetchUserData, friendsDetails,
    rejectReq, searchFiends, acceptReq, sendRequest, updateUser, deleteFriend,forgotPasswordOtp,
    otpAuth, resetPassword,createNewConversation, getConversation
    ,createMassage , getMassages
} = require('../controller/userController');
const {authentication} = require("../auth/auth")

router.post("/api/registeruser", newUser);
router.post("/api/login", login);
router.get("/api/logout", authentication, logout);
router.get("/api/fetchUserData", authentication, fetchUserData);
router.get("/api/sendrequest/:id", authentication, sendRequest);
router.put("/api/updateuser", authentication, updateUser);
router.get("/api/searchfriends/:value", authentication, searchFiends);
router.delete("/api/rejectrequest/:id", authentication, rejectReq);
router.patch("/api/acceptrequest/:id", authentication, acceptReq);
router.delete("/api/deletefriend/:id", authentication, deleteFriend);
router.get("/api/getoneprofile/:id", authentication, friendsDetails);
router.post("/api/forgetpassword", forgotPasswordOtp)
router.post("/api/checkotp", otpAuth)
router.post("/api/updatepassword", resetPassword)
router.post("/api/conversation/create",authentication, createNewConversation);
router.get("/api/conversation/:userId",getConversation);
router.post("/api/messages",createMassage);
router.get("/api/messages/:conversationId",getMassages)


module.exports = router