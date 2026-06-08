let messages = [];
let expenseChart = null;
let incomeChart = null;
let isSharing = false;

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

        <button class="repeat-btn" onclick="repeatTransaction(${transaction.amount},'${transaction.type}','${transaction.category}','${transaction.description}')"></button>
        <button class="share-btn" onclick="shareTransaction('${transaction.type}','${transaction.amount}','${transaction.category}','${transaction.description}')">Поделиться</button>
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
window.repeatTransaction = function (amount, type, category, description) {
    document.getElementById("amountInput").value = amount;
    document.getElementById("typeInput").value = type;
    document.getElementById("categoryInput").value = category;
    document.getElementById("descriptionInput").value = description;
}
window.shareTransaction = async function (type, amount, category, description) {
    if (isSharing) return;
    isSharing = true;
    


        const sign = type === "income" ? "+" : "-";
        const title = type === "income" ? "Доход" : "Расход";

        const canvas = document.getElementById("receiptCanvas");
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.roundRect(50, 60, 500, 680, 30);
        ctx.fill();

        ctx.fillStyle = "#111827";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Finance Ai Receipt", 300, 130);
        ctx.fillStyle = type === "income" ? "#16a34a" : "#dc2626";
        ctx.font = "bold 54px Arial";
        ctx.fillText(`${sign}${amount}`, 300, 230);
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(90, 280);
        ctx.lineTo(510, 280);
        ctx.stroke();
        ctx.textAlign = "left";
        ctx.fillStyle = "#6b7280";
        ctx.font = "22px Arial";
        ctx.fillText("Тип операции", 90, 340);
        ctx.fillText("Категория", 90, 430);
        ctx.fillText("Описание", 90, 520);
        ctx.fillText("Дата", 90, 610);
        ctx.fillStyle = "111827";
    ctx.font = "bold 24px Arial";
        ctx.fillText(title, 90, 375);
        ctx.fillText(category || "Без категории", 90, 465);
        ctx.fillText(description || "Без описания", 90, 555);
        ctx.fillText(new Date().toLocaleDateString("ru-RU"), 90, 645);
    ctx.textAlign = "center";
    ctx.fillStyle = "#9ca3af";
    ctx.font = "18px Arial";
    ctx.fillText("Created with Finance Ai Assistant", 300, 700);




    canvas.toBlob(async function (blob) {
        try {


            const file = new File(
                [blob],
                "finance-receipt.png",
                { type: "image/png" }
            );
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: "Чек транзакции",
                    text: " Мой финансовый чек",
                    files: [file]
                });
            }
            else {
                const link = document.createElement("a");
                link.download = "finance-receipt.png";
                link.href = URL.createObjectURL(blob);
                link.click();

                alert("Браузер не поддерживает отправку файла. Чек скачан");
            }
        } finally {
            isSharing = false;
        }
        });
       
    
    
}
window.exportPdf = async function () {


    const report = document.getElementById("reportSection");
    const oldGap = report.style.gap;
    report.style.gap = "20px";
    const canvas = await html2canvas(report);
    report.style.gap = oldGap;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jspdf.jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    const margin = 10;
    pdf.addImage(imgData, "PNG", margin, margin, 190, imgHeight);
    heightLeft -= pdfHeight;
    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
       
    
    heightLeft -= pdfHeight;
    }
    pdf.save("finance-report.pdf");

    
}
