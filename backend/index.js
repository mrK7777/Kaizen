const express = require("express");
const app = express();
const Pool = require("pg").Pool;
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { resourceLimits } = require("worker_threads");
const verifyAuth = require("./middlewares/auth");
const cors = require("cors");

const pool = new Pool({
  connectionString:
    "postgres://qwckpxbg:hs8IvxbZzrmKtRZ3IyzDKoJJun0BUkg6@trumpet.db.elephantsql.com/qwckpxbg",
});

const ACCESS_TOKEN_SECRET =
  "60V8LAdnIKTjyBl2CwN5lJqydR2Pre8OmSHNzHx3NW5Rk7+QjpafExQWDPwjXR/PNnYgtyAPwOl411WgSRo48Q==";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  })
);

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.post("/api/registration", async function (req, res) {
  const body = req.body;
  console.log(body);
  if (!body.name || !body.email || !body.password) {
    return res.status(400).json("Fill all the field");
  }
  if (body.password.lenght < 8) {
    return res.status(400).json("Password must be least 8");
  }
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    body.email,
  ]);
  if (result.rows.length > 0) {
    return res.status(400).json("A user with that email already exists");
  }

  const id = crypto.randomUUID();
  const hashedPassword = bcrypt.hashSync(body.password, 8);

  await pool.query(
    "INSERT INTO users (id, name, email, password, avatar_url) VALUES ($1, $2, $3, $4, $5)",
    [id, body.name, body.email, hashedPassword, body.avatar_url]
  );

  console.log(body);
  res.json({ message: "User created", userId: id });
});

app.post("/api/login", async function (req, res) {
  const body = req.body;
  if (!body.email || !body.password) {
    return res.status(400).json("Fill all the fields");
  }
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    body.email,
  ]);
  const user = result.rows[0];
  if (!user) {
    return res.status(400).json("Incorrect email or password");
  }
  if (!bcrypt.compareSync(body.password, user.password)) {
    return res.status(400).json("Incorrect email or password");
  }

  const accessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    accessToken,
    avatar_url: user.avatar_url,
  });
});

app.delete("/api/logout", async function (reg, res) {
  res.clearCookie("accessToken");
  return res.json("You logged out");
});

app.post("/api/tasks/new", verifyAuth, async function (req, res) {
  const { task, topic } = req.body;
  if (!task || !topic) {
    return res.status(400).json("Task text and topic area is required");
  }
  const user = res.locals.user;

  const taskId = crypto.randomUUID();
  const taskCreatedAt = Date.now();
  const totalTasksCount = Math.floor(Math.random() * 15);
  const tasksDoneCount = Math.floor(Math.random() * totalTasksCount);

  await pool.query(
    "INSERT INTO tasks(id, text, status, created_at, user_id, tasks_done_count, total_tasks_count, topic) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    [
      taskId,
      task,
      "todo",
      taskCreatedAt,
      user.id,
      tasksDoneCount,
      totalTasksCount,
      topic,
    ]
  );

  return res.json({ id: taskId });
});

app.put("/api/tasks/edit/status", verifyAuth, async function (req, res) {
  try {
    const { task_id, status } = req.body;
    if (!task_id || !status) {
      return res.status(400).json("Task id and status are required");
    }
    const user = res.locals.user;
    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [task_id, user.id]
    );

    if (result.rows.length == 0) {
      return res.status(404).json("Task not foud");
    }
    await pool.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 AND user_id = $3",
      [status, task_id, user.id]
    );
    return res.json("Task status updated");
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong");
  }
});

app.put("/api/tasks/edit/text", verifyAuth, async function (req, res) {
  try {
    const { task_id, text, topic } = req.body;
    if (!task_id || !text || !topic) {
      return res.status(400).json("Task id and text are required");
    }
    const user = res.locals.user;
    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [task_id, user.id]
    );
    if (result.rows.length == 0) {
      return res.status(404).json("Task not found");
    }
    await pool.query(
      "UPDATE tasks SET text = $1 , topic = $2 WHERE id = $3 AND user_id = $4",
      [text, topic, task_id, user.id]
    );
    return res.json("Task text updated");
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong");
  }
});

app.delete("/api/tasks/delete", verifyAuth, async function (req, res) {
  try {
    const { task_id } = req.body;
    if (!task_id) {
      return res.status(400).json("Task id is required");
    }

    const user = res.locals.user;
    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [task_id, user.id]
    );
    if (result.rows.length == 0) {
      return res.status(404).json("Task not found");
    }

    await pool.query("DELETE FROM tasks WHERE id =$1 AND user_id = $2", [
      task_id,
      user.id,
    ]);
    return res.json("Task deleted");
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong");
  }
});

app.get("/api/tasks/all", verifyAuth, async function (req, res) {
  try {
    const user = res.locals.user;
    const result = await pool.query("SELECT * FROM tasks WHERE user_id = $1 ", [
      user.id,
    ]);
    return res.json(result.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Something went wrong");
  }
});

app.listen(3000, function () {
  console.log("Server has started on http://localhost:3000");
});
