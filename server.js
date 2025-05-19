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

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const data = readData();
  const user = data.users.find(u => u.username === username && u.password === password);
  if (username === "admin" && password === "1234") return res.json({ type: "admin" });
  if (user) return res.json({ type: "user" });
  res.status(401).json({ error: "Unauthorized" });
});

app.get("/", (req, res) => {
  res.redirect("/public/index.html");
});

app.listen(PORT, () => console.log(`✅ Server running: http://localhost:${PORT}`));
