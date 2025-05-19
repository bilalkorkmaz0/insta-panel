let users = [];
let currentUser = null;

async function fetchUsers() {
  const res = await fetch("/api/users");
  users = await res.json();
}

async function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const message = document.getElementById("message");
  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("sessionUser", username);
    message.style.color = "green";
    message.textContent = "Giriş başarılı, yönlendiriliyorsunuz...";

    setTimeout(() => {
      if (data.type === "admin") {
        window.location.href = "/public/admin.html";
      } else {
        window.location.href = "/public/user.html";
      }
    }, 1000);
  } else {
    message.style.color = "red";
    message.textContent = "Giriş başarısız. Bilgileri kontrol edin.";
  }
}

function logout() {
  localStorage.removeItem("sessionUser");
  window.location.href = "/public/index.html";
}

function loadUserGrid() {
  const username = localStorage.getItem("sessionUser");
  if (!username || username === "admin") {
    window.location.href = "/public/index.html";
    return;
  }

  fetch(`/api/posts/${username}`)
    .then(res => res.json())
    .then(posts => {
      const grid = document.getElementById("userGrid");
      grid.innerHTML = "";
      posts.forEach(p => {
        const img = document.createElement("img");
        img.src = p.src || p.path;
        img.style.width = "108px";
        img.style.height = "135px";
        img.style.objectFit = "cover";
        img.style.margin = "2px";
        grid.appendChild(img);
      });

      const title = document.getElementById("userTitle");
      if (title) title.textContent = username + " Paneli";
    });
}

// Otomatik yükleme kontrolü
window.onload = () => {
  const path = window.location.pathname;
  if (path.includes("user.html")) {
    loadUserGrid();
  }
};
