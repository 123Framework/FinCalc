const token = localStorage.getItem("token");
if (token && (window.location.pathname.includes("login") || window.location.pathname.includes("register"))){
    window.location.href = "/";
}
async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });
    const text = await response.text();
    let data = {};

    try {
         data = JSON.parse(text);
    } catch {
        data.error = text;
    }
    if (!response.ok) {
        alert(data || "login failed");
        return;
    }
    localStorage.setItem("token", data.token);
    window.location.href = "/";
}
async function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    if (!response.ok) {
        alert(data || "register failed");
        return;
    }
    alert("Регистрация успешна");

    window.location.href = "/Login.html";
}