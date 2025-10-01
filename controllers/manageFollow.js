import express from "express";
import Register from "../models/register.model.js";
import { validationResult, param } from "express-validator";
import fetchuser from "../middleware/Fetchuser.js";

const router = express.Router();

// Follow a user
router.post(
  "/follow/:id",
  fetchuser,
  param("id").isMongoId().withMessage("Invalid user ID"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const userId = req.params.id;
      const myId = req.user.id;

      const user = await Register.findById(userId);
      const myself = await Register.findById(myId);

      if (!user || !myself)
        return res.status(500).json({ success: false, error: "User not found" });

      user.followers += 1;
      myself.followings += 1;

      await user.save();
      await myself.save();

      res.status(200).json({ success: true, user, myself });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Unfollow a user
router.post(
  "/unfollow/:id",
  fetchuser,
  param("id").isMongoId().withMessage("Invalid user ID"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const userId = req.params.id;
      const myId = req.user.id;

      const user = await Register.findById(userId);
      const myself = await Register.findById(myId);

      if (!user || !myself)
        return res.status(500).json({ success: false, error: "User not found" });

      user.followers = Math.max(0, user.followers - 1);
      myself.followings = Math.max(0, myself.followings - 1);

      await user.save();
      await myself.save();

      res.status(200).json({ success: true, user, myself });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default router;

