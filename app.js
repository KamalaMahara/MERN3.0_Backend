require("dotenv").config();
const express = require("express");
const connectToDatabase = require("./database");
const Blog = require("./Model/blogModel");
const app = express();
app.use(express.json());
connectToDatabase();
// const fs = require("fs");
const { storage, multer } = require("./Middleware/configMulter"); //importing the storage and multer object from configMulter.js
const upload = multer({ storage: storage }); //creating the upload object by passing the storage object to multer function

const cors=require("cors");

app.use(cors(
  {
    origin:["http://localhost:5174" ,"https://blog-frontend-five-peach.vercel.app"],  //allowing request only from this origin 
      methods: ["GET","POST","PUT","DELETE","PATCH"],

  }
));


app.get("/", (request, response) => {
  response.json({ Message: "helllllo worrrldd!" });
});

app.post("/blog", upload.single("image"), async (req, res) => {
  try {
    const { title, description, subtitle } = req.body;

    if (!title || !description || !subtitle) {
      return res.status(400).json({
        message: "please provide all the required fields",
      });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get("host")}/${req.file.filename}`;
    }

    await Blog.create({
      title,
      description,
      subtitle,
      image: imageUrl,
    });

    res.status(201).json({
      message: "blog created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

//get all blogs
app.get("/blog", async (req, res) => {
  const blogs = await Blog.find(); //fetch all blogs from the database in array
  res.status(200).json({
    message: "blogs fetched successfully",
    data: blogs,
  });
});

//get a single blog by id
app.get("/blog/:id", async (req, res) => {
  const id = req.params.id;
  const blogs = await Blog.findById(id); //returns single object
  if (!blogs) {
    return res.status(404).json({
      message: "blog not found",
    });
  }
  res.status(200).json({
    message: "blog fetched successfully",
    data: blogs,
  });
});

//delete blog from database and files from storage folder
app.delete("/blog/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        message: "blog not found",
      });
    }
    // const imageName = blog.image;
    // fs.unlink(`storage/${imageName}`, (err) => {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     console.log("file deleted successfully");
    //   }
    // });
    // Delete the blog document from DB
    await Blog.findByIdAndDelete(id);

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting blog" });
  }
});



//update operation
app.patch("/blog/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, description, subtitle } = req.body;

    const updateData = { title, description, subtitle };

    if (req.file) {
      updateData.image = `${req.protocol}://${req.get("host")}/${req.file.filename}`;
    }

    await Blog.findByIdAndUpdate(req.params.id, updateData);

    res.json({ message: "blog updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.use(express.static("storage")); //to make the storage folder only publically accessible
// note:-- only the storage folder is made publically accessible not the entire project folder.if we did "/" then the entire project folder would be accessible which is a security risk

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
