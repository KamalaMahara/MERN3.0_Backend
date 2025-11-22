require("dotenv").config();
const express = require("express");
const connectToDatabase = require("./database");
const app = express();
app.use(express.json());
connectToDatabase();

app.get("/", (request, response) => {
  response.json({ Message: "helllllo worrrldd!" });
});

app.post("/blog", (req, res) => {
  console.log(req.body);
  res.status(200).json({
    message: "blog api is workingggggggg..",
  });
});
app.listen(process.env.PORT, () => console.log("port 3000 is running ...."));
