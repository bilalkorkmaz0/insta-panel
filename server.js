const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const DATA_PATH = path.join(__dirname, 'data.json');

let data = { users: [], posts: [] };
if (fs.existsSync(DATA_PATH)) {
  data = JSON.parse(fs.readFileSync(DATA_PATH));
}

function saveData() {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '1234') return res.json({ role: 'admin' });
  const user = data.users.find(u => u.username === username && u.password === password);
  if (user) return res.json({ role: 'user', user });
  res.status(401).json({ error: 'Unauthorized' });
});

app.post('/api/users', (req, res) => {
  const { username, password, bio } = req.body;
  if (data.users.find(u => u.username === username)) return res.status(400).json({ error: 'exists' });
  data.users.push({ username, password, bio });
  saveData();
  res.json({ success: true });
});

app.get('/api/users', (req, res) => {
  res.json(data.users);
});

app.post('/api/posts', upload.single('file'), (req, res) => {
  const { owner, caption } = req.body;
  data.posts.push({ owner, caption, src: `/uploads/${req.file.filename}` });
  saveData();
  res.json({ success: true });
});

app.get('/api/posts/:owner', (req, res) => {
  const posts = data.posts.filter(p => p.owner === req.params.owner);
  res.json(posts);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
