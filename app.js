require("dotenv").config();
const express = require("express");
const connectToDatabase = require("./database");
const Blog = require("./Model/blogModel");
const app = express();
const fs = require("fs");
const { storage, multer } = require("./Middleware/configMulter");
const upload = multer({ storage: storage });
const cors = require("cors");

app.use(express.json());
connectToDatabase();

// ✅ Allow frontend domains
app.use(cors({
  origin: ["http://localhost:5174", "https://blog-frontend-five-peach.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
}));

// ✅ Serve images from /storage
app.use(express.static("storage"));

app.get("/", (req, res) => {
  res.json({ message: "helllllo worrrldd!" });
});

// CREATE blog
app.post("/blog", upload.single("image"), async (req, res) => {
  try {
    const { title, description, subtitle } = req.body;
    if (!title || !description || !subtitle) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    let filename = null;
    if (req.file) {
      filename = req.file.filename; // store only filename
    }

    const blog = await Blog.create({ title, description, subtitle, image: filename });

    // construct full URL for response
    const imageUrl = filename ? `https://mern3-0-backend-blog.onrender.com/${filename}` : null;

    res.status(201).json({
      message: "Blog created successfully",
      data: { ...blog.toObject(), image: imageUrl }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating blog", error: error.message });
  }
});

// GET all blogs
app.get("/blog", async (req, res) => {
  try {
    const blogs = await Blog.find();
    const blogsWithUrls = blogs.map(b => ({
      ...b.toObject(),
      image: b.image ? `https://mern3-0-backend-blog.onrender.com/${b.image}` : null
    }));
    res.status(200).json({ message: "Blogs fetched successfully", data: blogsWithUrls });
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs", error: error.message });
  }
});

// GET single blog
app.get("/blog/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.status(200).json({
      message: "Blog fetched successfully",
      data: {
        ...blog.toObject(),
        image: blog.image ? `https://mern3-0-backend-blog.onrender.com/${blog.image}` : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error: error.message });
  }
});

// DELETE blog
app.delete("/blog/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.image) {
      fs.unlink(`storage/${blog.image}`, err => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog", error: error.message });
  }
});

// UPDATE blog
app.patch("/blog/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, description, subtitle } = req.body;
    let updateData = { title, description, subtitle };

    if (req.file) {
      const filename = req.file.filename;
      updateData.image = filename;

      const blog = await Blog.findById(req.params.id);
      if (blog && blog.image) {
        fs.unlink(`storage/${blog.image}`, err => {
          if (err) console.error("Error deleting old file:", err);
        });
      }
    }

    await Blog.findByIdAndUpdate(req.params.id, updateData);
    res.status(200).json({ message: "Blog updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating blog", error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Server running..."));