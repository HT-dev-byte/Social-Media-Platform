// ===== post.model.js (ESM compatible) =====
import mongoose from 'mongoose';

const { Schema } = mongoose;

const postSchema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: [{ type: String }]
}, {
  timestamps: true
});

const Post = mongoose.model('Post', postSchema);

export default Post; // ✅ Default export for ESM
