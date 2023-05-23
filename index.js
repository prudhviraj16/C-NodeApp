const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongoURI = `mongodb+srv://Prudhvi876:Prudhvi876@cluster0.66ack1u.mongodb.net/test`;
const todoRoute = require("./routes/todoRouter");
const userRoute = require("./routes/userRouter");
const User = require("./models/UserSchema");
const multer = require("multer");

mongoose
  .connect(mongoURI)
  .then((res) => {
    console.log("Connected to db successfully");
  })
  .catch((err) => {
    console.log("Failed to connect", err);
  });

const upload = multer({
  dest: "images",
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req,file,cb) {
    if(!file.originalname.match(/\.(doc|docx)$/)){

      return cb(new Error('Please Upload Word Document'))
    }

    cb(undefined,true)
  }
});

app.post("/upload", upload.single("upload"), (req, res) => {
  res.send();
}, (error, req,res,next) => {
  res.status(400).send({error : error.message})
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/todo", todoRoute);
app.use("/user", userRoute);

app.listen(4000, () => {
  console.log("Backend server is running!");
});

const main = async () => {
  // const task = await Todo.findById('6464ab5859324ccb8215da65').populate('owner')
  // console.log(task.owner)

  const user = await User.findById("6464802eeabd342f60a88b8d").populate(
    "tasks"
  );
  // console.log(user.tasks)
};

main();
