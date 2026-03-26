const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyMdQUS_AVAxB2-Yk7RMznO_3SDGRHKy0xk-TcITObVVevl8tyhFtVqIWpVE9WVqzyp/exec";

let lastDealData = null;

// ================= TAB =================
function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tab).classList.add("active");

  const panel = document.getElementById("goldPanel");

  if (tab === "gold") {
    panel.style.display = "block";
    panel.style.width = "420px";
  } else {
    panel.style.width = "0px";
    setTimeout(() => panel.style.display = "none", 300);
  }
}

// ================= GOLD =================
function calculateGold() {
  const goldPrice = +document.getElementById("goldPrice").value;
  const weight = +document.getElementById("weight").value;
  const asking = +document.getElementById("askingPrice").value;
  const ppg = +document.getElementById("pricePerGramInput").value;
  const purityVal = +document.getElementById("purity").value;

  if (!goldPrice || !weight) {
    document.getElementById("results").innerHTML = "";
    return;
  }

  const buyPPG = ppg || (asking / weight);
  const totalCost = asking || (ppg * weight);
  const marketPPG = goldPrice * purityVal;

  const percent = (buyPPG / marketPPG) * 100;

  let label = "";
  if (percent > 100) label = "❌ Bad Deal";
  else if (percent >= 95) label = "⚠️ Risky Deal";
  else if (percent >= 85) label = "✅ Good Deal";
  else label = "🔥 Steal Deal!";

  function roi(r) {
    const sell = totalCost * (1 + r);
    return {
      sell,
      profit: sell - totalCost,
      percent: r * 100
    };
  }

  const quick = roi(0.03);
  const good = roi(0.065);
  const steal = roi(0.10);

  document.getElementById("results").innerHTML = `
    <h3>${label}</h3>
    Market: ₱${marketPPG.toFixed(2)}<br>
    Position: ${percent.toFixed(1)}%

    <hr>

    Quick Flip: ₱${quick.sell.toFixed(0)} | ₱${quick.profit.toFixed(0)} (${quick.percent}%)
    <br><br>
    Good Deal: ₱${good.sell.toFixed(0)} | ₱${good.profit.toFixed(0)} (${good.percent}%)
    <br><br>
    Steal: ₱${steal.sell.toFixed(0)} | ₱${steal.profit.toFixed(0)} (${steal.percent}%)
  `;

  lastDealData = {
    type: "gold",
    goldPrice,
    weight,
    purity: purityVal,
    soldPrice: totalCost,
    pricePerGram: marketPPG,
    dealRating: label
  };
}

// AUTO GOLD
["goldPrice","weight","askingPrice","pricePerGramInput","purity"]
.forEach(id => {
  document.getElementById(id).addEventListener("input", calculateGold);
});

// SAVE GOLD
function saveDeal() {
  if (!lastDealData) return alert("No data");

  fetch(SCRIPT_URL,{
    method:"POST",
    body:JSON.stringify(lastDealData),
    headers:{ "Content-Type":"text/plain" }
  }).then(()=>alert("Saved ✅"));
}

// ================= LOANS =================
function generateLoan() {
  const principalVal = +document.getElementById("principal").value;
  const term = document.getElementById("loanTerm").value;

  if (!principalVal) {
    document.getElementById("loanResult").innerHTML = "";
    return;
  }

  const interest = principalVal * 0.20;
  const total = principalVal + interest;

  let days = 30;
  if (term === "Weekly") days = 7;
  if (term === "Bi-Monthly") days = 15;

  const due = new Date();
  due.setDate(due.getDate() + days);

  document.getElementById("loanResult").innerHTML = `
    <h3>Loan Breakdown</h3>
    Capital: ₱${principalVal}<br>
    Interest: ₱${interest.toFixed(0)} | 20%<br>
    Due Date: ${due.toLocaleDateString()}<br>
    Amount Due: ₱${total.toFixed(0)}
  `;

  window.loanData = {
    type:"loan",
    name:document.getElementById("name").value,
    address:document.getElementById("address").value,
    idType:document.getElementById("idType").value,
    idNumber:document.getElementById("idNumber").value,
    principal:principalVal,
    interest,
    profit:interest,
    loanTerm:term,
    dueDate:due.toISOString()
  };
}

// AUTO LOAN
["principal","loanTerm"].forEach(id => {
  document.getElementById(id).addEventListener("input", generateLoan);
});

// SAVE LOAN
function saveLoan() {
  if (!window.loanData) return alert("No loan");

  fetch(SCRIPT_URL,{
    method:"POST",
    body:JSON.stringify(window.loanData),
    headers:{ "Content-Type":"text/plain" }
  }).then(()=>alert("Loan Saved ✅"));
}

// ================= PDF =================
async function generatePDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text(`Loan Agreement\n\nBorrower: ${document.getElementById("name").value}\nAmount: ₱${document.getElementById("principal").value}\nInterest: 20%`,10,10);

  doc.save("Loan.pdf");
}
