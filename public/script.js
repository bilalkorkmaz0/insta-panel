const api = "http://localhost:3000"; // yayına aldığında domaininle değiştir
let currentUser = null;
let isAdmin = false;

async function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const res = await fetch(`${api}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) return alert("Giriş başarısız");

  const data = await res.json();
  currentUser = username;
  localStorage.setItem("sessionUser", username);

  document.getElementById("loginPage").classList.add("hidden");

  if (data.type === "admin") {
    isAdmin = true;
    document.getElementById("adminPanel").classList.remove("hidden");
    loadUsers();
  } else {
    isAdmin = false;
    document.getElementById("userPanel").classList.remove("hidden");
    document.getElementById("userTitle").textContent = currentUser;
    loadUserPosts(currentUser);
  }
}

async function loadUserPosts(username) {
  const res = await fetch(`${api}/posts/${username}`);
  const posts = await res.json();
  const grid = isAdmin
    ? document.getElementById("adminUserGridPreview")
    : document.getElementById("userGrid");

  grid.innerHTML = "";
  posts.forEach(p => {
    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    const img = new Image();
    img.src = `${api}${p.path}`;
    img.onclick = () => showPopup(p);
    img.style.cursor = "pointer";

    wrapper.appendChild(img);

    if (isAdmin) {
      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "🗑️";
      delBtn.onclick = async (e) => {
        e.stopPropagation();
        if (confirm("Silmek istediğine emin misin?")) {
          const filename = p.path.split("/").pop();
          await fetch(`${api}/posts/${p.owner}/${filename}`, { method: "DELETE" });
          loadUserPosts(p.owner);
        }
      };
      wrapper.appendChild(delBtn);
    }

    grid.appendChild(wrapper);
  });

  if (isAdmin) {
    document.getElementById("mockupUsername").textContent = username;
    document.getElementById("adminUserPreviewPhone").classList.remove("hidden");
  }
}

async function submitPost() {
  const input = document.getElementById("uploadInput");
  const file = input.files[0];
  const progress = document.getElementById("uploadProgress");
  if (!file || !currentUser) return alert("Eksik bilgi");

  const caption = prompt("Açıklama girin:");
  const formData = new FormData();
  formData.append("image", file);
  formData.append("username", currentUser);
  formData.append("caption", caption || "");

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${api}/upload`, true);

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progress.textContent = `Yükleniyor: %${percent}`;
    }
  };

  xhr.onload = () => {
    progress.textContent = "✅ Yüklendi";
    input.value = "";
    setTimeout(() => {
      progress.textContent = "";
    }, 1500);
    loadUserPosts(currentUser);
  };

  xhr.send(formData);
}

async function loadUsers() {
  const res = await fetch(`${api}/users`);
  const users = await res.json();
  const ul = document.getElementById("userList");
  ul.innerHTML = "";

  users.forEach(u => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${u.username}</strong><br>${u.bio || ""}
      <br>
      <button onclick="selectUser('${u.username}')">Gönderileri Gör</button>
    `;
    ul.appendChild(li);
  });
}

function selectUser(username) {
  currentUser = username;
  loadUserPosts(username);
  document.getElementById("adminUploadControls").classList.remove("hidden");
}

function openSettings() {
  document.getElementById("settingsPanel").classList.remove("hidden");
}

function logout() {
  localStorage.removeItem("sessionUser");
  location.reload();
}

window.onload = () => {
  const sessionUser = localStorage.getItem("sessionUser");
  if (sessionUser) {
    document.getElementById("loginUsername").value = sessionUser;
  }
};
