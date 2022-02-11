const { auth } = require("../../middlewear/auth");
const { createPost, getPost, likePost, createComment } = require("./controller/post");
const endPoint = require("./endPoint");

const router = require("express").Router();




router.post("/post" ,  auth(endPoint.createPost),  createPost);
router.get("/post/:id" , getPost)

router.patch("/post/like/:id" ,  auth(endPoint.likePost), likePost);
router.patch("/post/:id/comment" ,   auth(endPoint.likePost), createComment)

module.exports = router;