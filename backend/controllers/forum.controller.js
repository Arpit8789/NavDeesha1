const ForumPost = require('../models/ForumPost');

// Create a new forum post
exports.createPost = async (req, res) => {
  try {
    const post = new ForumPost(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all forum posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find();
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific forum post
exports.getPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
