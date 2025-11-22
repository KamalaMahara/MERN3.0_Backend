const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  subtitle: {
    type: String,
  },
  Description: {
    type: Text,
  },
  image: {
    type: String,
  },
});
const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
