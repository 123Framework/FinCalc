let messages = [];

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }

});



async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) return;
    addMessage(message, "user");
    messageInput.value = "";

    try {
        const response = await fetch("https://localhost:7227/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });
        const data = await response.json();
        if (!response.ok) {
            addMessage("Ошибка:" + (data.error || "не удалось получить ответ"), "bot");
            return;
        }
        addMessage(data.answer, "bot");
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
    div.className = `message ${type}`;
    div.textContent = text;

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}
function saveMessages() {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
    window.onload = () => {
        const saved = localStorage.getItem("chatHistory");
        if (saved) {
            messages = JSON.parse(saved);

            messages.forEach(m => renderMessage(m));
        }
    }
}

function clearChat() {
    localStorage.removeItem("chatHistory");
    messages = [];
    chatBox.innerHTML = "";
}


