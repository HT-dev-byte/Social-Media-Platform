import express from "express";
import Post from "../models/post.model.js";
import { body, validationResult } from "express-validator";
import fetchuser from "../middleware/Fetchuser.js";

const router = express.Router();

// Create a new post
router.post(
  "/",
  fetchuser,
  [],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { title, description } = req.body;
      const userId = req.user.id;
      console.log(userId);

      const newPost = await Post.create({
        userId,
        title,
        description,
      });

      res.json({ success: true, newPost });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error!!!");
    }
  }
);

// Delete a post by ID
router.delete(
  "/:id",
  fetchuser,
  [],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const postId = req.params.id;
      const userId = req.user.id;

      const post = await Post.findOne({ _id: postId, userId });
      if (!post) {
        return res.status(500).json({ msg: "No such post available" });
      }

      await post.deleteOne();

      res.json({ success: true, msg: "Post deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error!!!");
    }
  }
);

// Get a post by ID
router.get(
  "/:id",
  fetchuser,
  [],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const postId = req.params.id;
      const post = await Post.findOne({ _id: postId });

      if (!post) {
        return res.status(500).json({ msg: "No such post available" });
      }

      const obj = {
        likes: post.likes,
        comments: post.comments,
      };

      return res.status(200).json({ success: true, post: obj });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error!!!");
    }
  }
);

export default router;
