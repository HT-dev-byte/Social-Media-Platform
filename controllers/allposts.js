import express from "express";
import Post from '../models/post.model.js';
import { body, validationResult } from "express-validator";
import fetchuser from "../middleware/Fetchuser.js";

const router = express.Router();

router.get(
  "/", 
  fetchuser,
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const userId = req.user.id;
      console.log(userId);

      const posts = await Post.find({ userId }).sort({ createdAt: 'descending' });

      if (!posts) {
        return res.status(400).json({ success: false, error: "Sorry, No Post available" });
      }

      res.status(200).json({ success: true, posts });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error!!!");
    }
  }
);

export default router;
