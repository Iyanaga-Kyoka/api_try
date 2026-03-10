const express = require("express");
const app = express();
app.use(express.json());

const users = {};

const validate = (uid, pw) => {
  if (!uid || !pw) return "Required user_id and password";
  if (uid.length < 6 || uid.length > 20 || pw.length < 8 || pw.length > 20)
    return "Input length is incorrect";
  if (!/^[a-zA-Z0-9]+$/.test(uid) || !/^[\x21-\x7e]+$/.test(pw))
    return "Incorrect character pattern";
  return null;
};

const auth = (req) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Basic ")) return null;
  const [uid, pw] = Buffer.from(h.split(" ")[1], "base64")
    .toString()
    .split(":");
  return users[uid] && users[uid].password === pw ? uid : null;
};

app.post("/signup", (req, res) => {
  const { user_id, password } = req.body;
  const err = validate(user_id, password);
  if (err)
    return res
      .status(400)
      .json({ message: "Account creation failed", cause: err });
  if (users[user_id])
    return res.status(400).json({
      message: "Account creation failed",
      cause: "Already same user_id is used",
    });

  users[user_id] = { user_id, password, nickname: user_id, comment: "" };
  res.status(200).json({
    message: "Account successfully created",
    user: { user_id, nickname: user_id },
  });
});

app.get("/users/:user_id", (req, res) => {
  const uid = auth(req);
  if (!uid) return res.status(401).json({ message: "Authentication failed" });
  const target = users[req.params.user_id];
  if (!target) return res.status(404).json({ message: "No user found" });

  res.status(200).json({
    message: "User details by user_id",
    user: {
      user_id: target.user_id,
      nickname: target.nickname,
      comment: target.comment,
    },
  });
});

app.patch("/users/:user_id", (req, res) => {
  const uid = auth(req);
  if (!uid) return res.status(401).json({ message: "Authentication failed" });
  if (uid !== req.params.user_id)
    return res.status(403).json({ message: "No permission to update" });

  const { nickname, comment } = req.body;
  if (nickname === undefined && comment === undefined) {
    return res.status(400).json({
      message: "User updation failed",
      cause: "Required nickname or comment",
    });
  }

  if (nickname !== undefined) {
    if (nickname.length > 30)
      return res.status(400).json({
        message: "User updation failed",
        cause: "Input length is incorrect",
      });
    users[uid].nickname = nickname === "" ? uid : nickname;
  }
  if (comment !== undefined) {
    if (comment.length > 100)
      return res.status(400).json({
        message: "User updation failed",
        cause: "Input length is incorrect",
      });
    users[uid].comment = comment;
  }
  const responseUser = {
    user_id: users[uid].user_id,
    nickname: users[uid].nickname,
    comment: users[uid].comment,
  };

  res.status(200).json({
    message: "User successfully updated",
    user: responseUser,
  });
});

app.post("/close", (req, res) => {
  const uid = auth(req);
  if (!uid) return res.status(401).json({ message: "Authentication failed" });
  delete users[uid];
  res
    .status(200)
    .json({ message: "Account and user details successfully removed" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
