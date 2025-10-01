import 'dotenv/config';
import express from 'express';
import Register from '../models/register.model.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetchuser from '../middleware/Fetchuser.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ROUTE 1: Register a user
router.post(
  '/register',
  [
    body('name', 'Enter a valid name').isLength({ min: 5 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'password must be of minimum 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      let user = await Register.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          success: false,
          error: 'Sorry, user already exist with this email',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const secpass = await bcrypt.hash(req.body.password, salt);
      user = await Register.create({
        name: req.body.name,
        email: req.body.email,
        password: secpass,
      });

      const data = { user: { name: user.name } };
      const authtoken = jwt.sign(data, JWT_SECRET);

      res.json({ success: true, msg: 'Registered Successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal Server Error!!!');
    }
  }
);

// ROUTE 2: Login a user
router.post(
  '/login',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'password cannot be blanked').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await Register.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'Please, try to login with correct credentials' });
      }

      const password_compare = await bcrypt.compare(password, user.password);
      if (!password_compare) {
        return res.status(400).json({ success: false, error: 'Please, try to login with correct credentials' });
      }

      const data = { user: { id: user.id, email: user.email } };
      const authtoken = jwt.sign(data, JWT_SECRET);

      res.status(200).send({ success: true, token: authtoken });
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal Server Error!!!');
    }
  }
);

export default router;
