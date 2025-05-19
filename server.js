const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

const DATA_FILE = "data.json";
const UPLOAD_FOLDER = "uploads";

fs.ensureFileSync(DATA_FILE);
fs.ensureDirSync(UPLOAD_FOLDER);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE);
    return raw ? JSON.parse(raw) : { users: [], posts: [] };
  } catch {
    return { users: [], posts: [] };
  }
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/posts/:username", (req, res) => {
  const { username } = req.params;
  const data = readData();
  const userPosts = data.posts.filter(p => p.owner === username);
  res.json(userPosts);
});

app.post("/upload", upload.single("image"), (req, res) => {
  const { username, caption } = req.body;
  if (!username || !req.file) return res.status(400).send("Eksik bilgi");

  const data = readData();
  data.posts.push({
    owner: username,
    caption: caption || "",
    path: `/uploads/${req.file.filename}`,
    created: Date.now()
  });

  writeData(data);
  res.status(200).json({ success: true });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const data = readData();
  const user = data.users.find(u => u.username === username && u.password === password);

  if (username === "admin" && password === "1234") return res.json({ type: "admin" });
  if (user) return res.json({ type: "user" });
  res.status(401).send("Hatalı giriş");
});

app.post("/users", (req, res) => {
  const { username, password, bio } = req.body;
  const data = readData();
  if (!username || !password) return res.status(400).send("Eksik bilgi");
  if (data.users.find(u => u.username === username)) return res.status(409).send("Zaten var");

  data.users.push({ username, password, bio: bio || "" });
  writeData(data);
  res.status(201).send("Oluşturuldu");
});

app.get("/users", (req, res) => {
  const data = readData();
  res.json(data.users);
});

app.delete("/posts/:username/:filename", (req, res) => {
  const { username, filename } = req.params;
  const data = readData();
  data.posts = data.posts.filter(p => !(p.owner === username && p.path.includes(filename)));

  fs.removeSync(path.join(__dirname, "uploads", filename));
  writeData(data);
  res.status(200).send("Silindi");
});

app.get("/", (req, res) => {
  res.redirect("/public/index.html");
});

app.listen(PORT, () => console.log(`✅ Server running: http://localhost:${PORT}`));
