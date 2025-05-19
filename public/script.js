document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const message = document.getElementById("message");
  if (response.ok) {
    const data = await response.json();
    message.style.color = "green";
    message.textContent = data.type === "admin" ? "Admin girişi başarılı" : "Kullanıcı girişi başarılı";
  } else {
    message.style.color = "red";
    message.textContent = "Giriş başarısız. Bilgileri kontrol edin.";
  }
});
