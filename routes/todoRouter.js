const express = require("express");
const router = new express.Router();
const Todo = require("../models/TodoSchema");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  
  try {
    const match = {};
    const sort = {}
    // const todos = await Todo.find({owner : req.user._id});

    if (req.query.completed) {
      match.completed = req.query.completed == "true";
    }

    if(req.query.sortBy){
      const parts = req.query.sortBy.split(':')
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    await req.user.populate({
      path: "tasks",
      match,
      options : {
        limit : parseInt(req.query.limit),
        skip : parseInt(req.query.skip),
        sort : {
          createdAt : -1
        }
      }
    });

    return res.status(200).json(req.user.tasks);
  } catch (err) {
    console.log(err);
  }
});

router.post("/create", auth, async (req, res) => {
  try {
    const todoList = new Todo({
      ...req.body,
      owner: req.user._id,
    });

    const user = await todoList.save();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
});

router.get("/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Todo.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.send(400).json();
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const task = await Todo.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    console.log(task);
    if (!task) {
      return res.status(400).json("Wrong User");
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.status(200).json(task);
  } catch (err) {
    console.log(err);
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Todo.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      res.status(400).send("Invalid Operation");
    }
    return res.status(200).json(task);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
