const express = require("express");
const router = new express.Router();
const User = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const {sendWelcomeEmail, sendCancelEmail} = require('../emails/account')


router.get("/users/me", auth, async (req, res) => {
  console.log(req.user);
  res.send(req.user);
});

router.post("/users", async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      age: req.body.age,
    });
    const newuser = await user.save();
    sendWelcomeEmail(newuser.email, newuser.name)
    const { _id, name, email, age } = newuser;
    return res.status(200).json({ _id, name, email, age });
  } catch (e) {
    res.status(400).json(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const { _id, name, email, age } = user;
    const token = jwt.sign({ _id: user._id.toString() }, "secret");
    if (!user) return res.status(400).json("User not found");

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (isMatch) {
      user.tokens = user.tokens.concat({ token });
      await user.save();

      return res.status(200).json({ _id, name, email, age, token });
    }
  } catch (e) {
    res.status(400).json(e);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).json(e);
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send("Logged out from all devices");
  } catch (e) {
    res.status(500).send("Failed to logout from all the devices");
  }
});

router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send("Failed to retrieve the users data");
  }
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation)
    return res.status(400).send({ error: "Invalid updates!" });

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    console.log(req.user);
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    sendCancelEmail(user.email, user.name)
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
    // console.log(object)
    // await req.user.remove()
    // console.log("object")
    // res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please Upload PDF or an Image"));
    }

    cb(undefined, true);
  },
});

router.post(
  "/me/upload",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();

    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/me/upload", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("/:id/upload", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/jpeg");
    res.send(user.avatar);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
