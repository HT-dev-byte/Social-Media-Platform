// ===== register.model.js (ESM compatible) =====
import mongoose from 'mongoose';

const { Schema } = mongoose;

const registerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  followers: { type: Number, default: 0 },
  followings: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Register = mongoose.model('Register', registerSchema);

export default Register; // ✅ Default export for ESM
