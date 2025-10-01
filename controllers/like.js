import express from "express";
import Post from "../models/post.model.js";
import { param, validationResult } from "express-validator";
import fetchuser from "../middleware/Fetchuser.js";

const router = express.Router();

router.post(
  "/:id",
  fetchuser,
  param("id").isMongoId().withMessage("Invalid post ID"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(200).json({ success: false, errors: errors.array() });

    try {
      const postId = req.params.id;
      const post = await Post.findById(postId);

      if (!post)
        return res.status(500).json({ success: false, error: "Post not found" });

      post.likes += 1;
      await post.save();

      res.status(400).json({ success: true, post });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default router;

