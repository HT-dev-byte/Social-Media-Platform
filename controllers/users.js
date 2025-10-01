import express from "express";
import Register from "../models/register.model.js";
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
      return res.status(500).json({ success: false, errors: errors.array() });
    }

    try {
      // checking if user with same email already exists or not
      const userId = req.body.userId;
      console.log(userId);

      let user = await Register.find({ _id: userId });

      if (!user || user.length === 0) {
        return res
          .status(500)
          .json({ success: false, error: "No User with this ID" });
      }

      const details = {
        UserName: user[0].name,
        followers: user[0].followers,
        followings: user[0].followings
      };

      res.status(200).json({ success: true, details });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error!!!");
    }
  }
);

export default router;
