let messages = [];

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/Login.html";
}
const chatContainer = document.getElementById("chatContainer");

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }

});

async function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });
    const data = await response.json();
    if (!response.ok) {
        alert("ошибка логина");
        return;
    }
    localStorage.setItem("token", data.token);
    alert("Вы вошли");
    window.location.href = "/";
}

async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) return;
    addMessage(message, "user");
    messageInput.value = "";
    const loading = document.createElement("div");
    loading.className = "message bot";
    loading.textContent = "AI думает...";
    chatBox.appendChild(loading);

    try {
       
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
                //"Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                message: message
            })
        });
        const data = await response.json();
        chatBox.removeChild(loading);
        if (!response.ok) {
            addMessage("Ошибка:" + (data.error || "не удалось получить ответ"), "bot");
            return;
        }
        await typeMessage(data.answer, "bot");
    }
    catch (error) {
        addMessage("ошибка соединения с сервером", "bot");


    }

}
function addMessage(text, type) {


    const message = { text, type };

    messages.push(message);
    saveMessages();
    renderMessage(message);
}
function renderMessage(message) {
    const div = document.createElement("div");
    div.className = `message ${message.type}`;
    div.textContent = message.text;

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}
function saveMessages() {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
    
}
window.onload = () => {
        const saved = localStorage.getItem("chatHistory");
        if (saved) {
            messages = JSON.parse(saved);

            messages.forEach(m => renderMessage(m));
        }
    }

function clearChat() {
    localStorage.removeItem("chatHistory");
    messages = [];
    chatBox.innerHTML = "";
}
async function typeMessage(text, type) {
    const div = document.createElement("div");
    div.className = `message ${type}`;
    chatBox.appendChild(div);

    let i = 0;
    while (i < text.length) {
        div.textContent += text.charAt(i);
        i++;

        await new Promise(resolve => setTimeout(resolve, 20));
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    messages.push({ text, type });
    saveMessages();
}
function logout() {
    localStorage.removeItem("token");
    window.location.href = "/Login.html"
}



