require("dotenv").config();
const express = require("express");
const connectToDatabase = require("./database");
const Blog = require("./Model/blogModel");
const app = express();
app.use(express.json());
connectToDatabase();
const fs = require("fs");
const { storage, multer } = require("./Middleware/configMulter"); //importing the storage and multer object from configMulter.js
const upload = multer({ storage: storage }); //creating the upload object by passing the storage object to multer function

const cors=require("cors");

app.use(cors(
  {
    origin:["http://localhost:5174" ,"https://blog-frontend-lyia9o0qa-codecurlys-projects.vercel.app/"],  //allowing request only from this origin 
      methods: "GET,POST,PUT,DELETE,PATCH",

  }
));


app.get("/", (request, response) => {
  response.json({ Message: "helllllo worrrldd!" });
});

app.post("/blog", upload.single("image"), async (req, res) => {
  const { title, description, subtitle, image } = req.body;
  let filename;
if(req.file){
 filename = "https://blog-frontend-lyia9o0qa-codecurlys-projects.vercel.app/"+ req.file.filename;
} //getting the filename of the uploaded fule

  if (!title || !description || !subtitle) {
    return res.status(400).json({
      message: "please provide all the required fields",
    });
  } //validating the required fields

  await Blog.create({ title, description, subtitle, image: filename });

  res.status(200).json({
    message: "blog api is workingggggggg...",
  });
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
    const imageName = blog.image;
    fs.unlink(`storage/${imageName}`, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("file deleted successfully");
      }
    });
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
  const id = req.params.id;
  const { title, description, subtitle } = req.body;
  let imageName;
  if (req.file) {
    imageName = "https://blog-frontend-lyia9o0qa-codecurlys-projects.vercel.app/"+ req.file.filename;
    const blog = await Blog.findById(id);
    const oldImageName = blog.image;
    fs.unlink(`storage/${oldImageName}`, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("file deleted successfully");
      }
    });
  }
  await Blog.findByIdAndUpdate(id, {
    title: title,
    description: description,
    subtitle: subtitle,
    image: imageName,
  });
  res.status(200).json({
    message: "blog upadated successfully",
  });
});

app.use(express.static("storage")); //to make the storage folder only publically accessible
// note:-- only the storage folder is made publically accessible not the entire project folder.if we did "/" then the entire project folder would be accessible which is a security risk

app.listen(process.env.PORT, () => console.log("port 3000 is running ...."));
