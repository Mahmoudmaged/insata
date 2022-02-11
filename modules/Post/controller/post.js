const sendEmail = require("../../../commen/email");
const postModel = require("../../../DB/model/Post");
const { findByIdAndUpdate, findOneAndUpdate } = require("../../../DB/model/User");
const userModel = require("../../../DB/model/User");

const populateList = [{
        path: "userID",
        select: "email userName profilePic"

    },
    {
        path: "likes",
        select: "email userName profilePic"

    },
    {
        path: "comment.userID",
        select: "email userName profilePic"
    }
]
const createPost = async(req, res) => {
    try {
        let imageURL = []
        if (req.files) {
            for (let i = 0; i < req.files.length; i++) {
                let imagepath = `${req.protocol}://${req.headers.host}/${req.files[i].destination}/${req.files[i].filename}`;
                imageURL.push(imagepath)
            }
        }
        const { desc, tagsList } = req.body;
        console.log(tagsList);
        let tagsEmail = '';
        let validTagsIDS = [];
        for (let i = 0; i < tagsList.length; i++) {
            const findUser = await userModel.findOne({ _id: tagsList[i] }).select("email");
            if (findUser) {
                validTagsIDS.push(findUser._id)
                if (tagsEmail.length > 0) {
                    tagsEmail = tagsEmail + " , " + findUser.email
                } else {
                    tagsEmail = findUser.email
                }
            }
        }
        const newPost = new postModel({ desc, images: imageURL, userID: req.user._id, tags: validTagsIDS })
        const savedPost = await newPost.save()
        console.log(tagsEmail);
        if (tagsEmail.length > 0) {
            await sendEmail(tagsEmail,
                `<p>hi you have been mintioned in ${req.user.userName}
                  </p>  <br> 
                  <a href='${req.protocol}://${req.headers.host}/post/${savedPost._id}'> please follow me to see it </a>`)
        }
        res.status(201).json({ message: 'Done', savedPost, sataus: 201 })
    } catch (error) {
        res.status(500).json({ message: "catch err", satus: 500 })
    }


}


const getPost = async(req, res) => {

    try {
        const { id } = req.params;

        const post = await postModel.findOne({ _id: id }).populate(populateList);
        if (post) {
            res.status(200).json({ message: "Done", post, status: 200 })

        } else {
            res.status(400).json({ message: "not found", status: 400 })

        }
    } catch (error) {
        res.status(500).json({ message: "catch err", satus: 500 })

    }

}


const likePost = async(req, res) => {

    try {
        const { id } = req.params;

        const post = await postModel.findOne({ _id: id })
        if (post) {

            const findUser = post.likes.find((ele) => {
                return ele.toString() == req.user._id.toString()

            })


            if (req.user._id.toString() == post.userID.toString()) {
                res.status(400).json({ message: "sorry you cannot like your own post", status: 400 })

            } else {
                if (findUser) {
                    res.status(400).json({ message: "sorry you cannot like this twice", status: 400 })
                } else {

                    post.likes.push(req.user._id);
                    const updatedPost = await postModel.findByIdAndUpdate(post._id, { likes: post.likes }, { new: true }).populate(populateList);
                    res.status(200).json({ message: "Done", updatedPost, status: 200 })

                }
            }


        } else {
            res.status(400).json({ message: "not found", status: 400 })

        }
    } catch (error) {
        res.status(500).json({ message: "catch err", satus: 500 })

    }

}


const createComment = async(req, res) => {
    console.log("in");
    const { id } = req.params;
    let imageURL = []
    if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
            let imagepath = `${req.protocol}://${req.headers.host}/${req.files[i].destination}/${req.files[i].filename}`;
            imageURL.push(imagepath)
        }
    }
    const { desc, tagsList } = req.body
    let tagsEmail = '';
    let validTagsIDS = [];
    console.log(tagsList);
    for (let i = 0; i < tagsList.length; i++) {
        console.log("kk");
        const findUser = await userModel.findOne({ _id: tagsList[i] }).select("email");
        console.log("ll");
        if (findUser) {
            validTagsIDS.push(findUser._id)
            if (tagsEmail.length > 0) {
                tagsEmail = tagsEmail + " , " + findUser.email
            } else {
                tagsEmail = findUser.email
            }
        }
    }
    console.log("desc");
    if (!desc) {
        desc = ""
    }
    console.log("desc2");

    const post = await postModel.findOne({ _id: id });
    console.log(post);
    if (post) {
        console.log("lol");

        post.comment.push({ userID: req.user._id, desc, images: imageURL, tags: validTagsIDS })
        const updatedPost = await postModel.findOneAndUpdate({ _id: post._id }, { comment: post.comment }, { new: true }).populate(populateList);
        await sendEmail(tagsEmail,
            `<p> you have mintioned in comment on ${updatedPost.userID.userName} post</p>  <br> 
        <a href='${req.protocol}://${req.headers.host}/post/${updatedPost._id}'> please follow me to see it </a>`)
        res.status(200).json({ message: "Done",  updatedPost, sataus: 200 })

    } else {
        res.status(400).json({ message: "in-valid post", sataus: 400 })
    }


}



module.exports = {
    createPost,
    getPost,
    likePost,
    createComment
}