let messages = [];
let expenseChart = null;
let incomeChart = null;

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
            "Content-Type": "application/json"
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
window.onload = async () => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
        messages = JSON.parse(saved);

        messages.forEach(m => renderMessage(m));
    }
    await loadTransactions();
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

window.addTransaction = async function () {
    const amount = document.getElementById("amountInput").value;
    const type = document.getElementById("typeInput").value;
    const category = document.getElementById("categoryInput").value;
    const description = document.getElementById("descriptionInput").value;

    const response = await fetch("/api/transactions", {

        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            amount,
            type,
            category,
            description
        })

    })
    if (!response.ok) {
        alert("Ошибка");
        return;
    }
    alert("Транзакция добавлена");
    await loadTransactions();
}
async function loadTransactions() {
    const response = await fetch("/api/transactions", {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    const data = await response.json();
    const container = document.getElementById("transactionsList");
    container.innerHTML = "";
    let income = 0;
    let expense = 0;
    data.forEach(transaction => {
        const div = document.createElement("div");
        div.className = "transaction-item";
        div.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-category">
                ${transaction.category}
            </div>
            <div class="transaction-description">
                ${transaction.description}
            </div>
        </div>
        <div class="transaction-right">

        
        <div class="transaction-amount ${transaction.type}">
            ${transaction.type === "income"
                ? "+"
                : "-"
            }
            ${transaction.amount}
        </div>
        <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">X</button>
        </div>
        `
        if (transaction.type === "income") {
            income += Number(transaction.amount);
        }
        else {
            expense += Number(transaction.amount);
        }
        container.appendChild(div);
        
    })

    renderCharts(data);
    window.deleteTransaction = async function (id) {
        const response = await fetch(`/api/transactions/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        if (!response.ok) {
            alert("ошибка удаления");
            return;
        }
        await loadTransactions();
    }

    document.getElementById("incomeValue").textContent = `${income}`;
    document.getElementById("expenseValue").textContent = `${expense}`;
    document.getElementById("balanceValue").textContent = `${income - expense}`;
}
function renderCharts(transactions) {
    const expenseData = {};
    const incomeData = {};

    transactions.forEach(transaction => {
        const category = transaction.category || "Без категории";
        const amount = Number(transaction.amount);

        if (transaction.type === "expense") {
            expenseData[category] = (expenseData[category] || 0) + amount;
        } else if (transaction.type === "income") {
            incomeData[category] = (incomeData[category] || 0) + amount;
        }
    })
    renderPieChart(
        "expenseChart",
        expenseChart,
        "Расходы",
        expenseData,
        chart => expenseChart = chart
    );
    renderPieChart(
        "incomeChart",
        incomeChart,
        "Доходы",
        incomeData,
        chart => incomeChart = chart
        );

}
function renderPieChart(canvasId, oldChart, label, dataObject, setChart) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const labels = Object.keys(dataObject);
    const values = Object.values(dataObject);
    if (oldChart) {
        oldChart.destroy();
    }
    const chart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: labels.length ? labels : ["нет данных"],
            datasets: [{
                label: label,
                data: values.length ? values : [1]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
    setChart(chart);
}
