import express from "express";
import Post from "../models/post.js";
import { verifyToken } from "../services/auth.js";

const router = express.Router();

router.get("/", async (req, res) => { //guest user view
    try {
        const posts = await Post.find().populate("author", "username _id");
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/", verifyToken, async (req, res) => {
    try {
        const posts = await Post.find().populate("author", "username _id");
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.post("/", verifyToken, async (req, res) => {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id, 
    });
    await post.save();
    res.status(201).json(post);
});

router.put("/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id);

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not Authorized" });
        }

        const updatedPost = await Post.findByIdAndUpdate(req.params.id, { title: req.body.title, content: req.body.content }, { new: true });
        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (req.user.role !== "admin" && post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this post" });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})



//comment post
router.post("/:id/comment", verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        post.comments.push({ text, author: req.user.id });
        await post.save();

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//like or unlike a post
router.post("/:id/like", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        const likedIndex = post.likes.indexOf(req.user.id);

        if (likedIndex === -1) {
            post.likes.push(req.user.id);
        } else {
            post.likes.splice(likedIndex, 1);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//get comments and likes for a post
router.get("/:id/details", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("comments.author", "username").populate("likes", "username");

        if (!post) return res.status(404).json({ message: "Post not found" });

        res.json({
            comments: post.comments,
            likes: post.likes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
