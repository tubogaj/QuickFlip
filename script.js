const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwBRkuawkeCNJ4907J7X7pAM64sRwcA8xzHZ1zuCd7lgRLDdxHxLZ6BcDC-9LRaFJu9/exec";

let lastDealData = null;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  // GOLD AUTO
  ["goldPrice","weight","askingPrice","pricePerGramInput"]
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calculateGold);
  });

  const purityEl = document.getElementById("purity");
  if (purityEl) purityEl.addEventListener("change", calculateGold);

  // ✅ FIXED LOAN EVENTS
  const principalEl = document.getElementById("principal");
  if (principalEl) principalEl.addEventListener("input", generateLoan);

  const loanTermEl = document.getElementById("loanTerm");
  if (loanTermEl) loanTermEl.addEventListener("change", generateLoan);

});

// ================= TAB =================
function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

  const tabEl = document.getElementById(tab);
  if (tabEl) tabEl.classList.add("active");

  const panel = document.getElementById("goldPanel");

  if (!panel) return;

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
  const resultsEl = document.getElementById("results");

  const goldPrice24k = parseFloat(document.getElementById("goldPrice")?.value) || 0;
  const weight = parseFloat(document.getElementById("weight")?.value) || 0;
  const asking = parseFloat(document.getElementById("askingPrice")?.value) || 0;
  const ppg = parseFloat(document.getElementById("pricePerGramInput")?.value) || 0;
  const purityInput = document.getElementById("purity")?.value;

  if (!goldPrice24k || !weight) {
    if (resultsEl) resultsEl.innerHTML = "";
    return;
  }

  const purityMap = {
    "24K": 1,
    "22K": 0.916,
    "21K": 0.875,
    "18K": 0.75,
    "16K": 0.667,
    "14K": 0.585
  };

  const purity = purityMap[purityInput];
  if (!purity) return;

  const currentGoldPrice = goldPrice24k * purity;

  let buyPPG = 0;
  let totalCost = 0;

  if (ppg > 0 && asking === 0) {
    buyPPG = ppg;
    totalCost = ppg * weight;
  } else if (asking > 0 && ppg === 0) {
    totalCost = asking;
    buyPPG = asking / weight;
  } else if (ppg > 0 && asking > 0) {
    buyPPG = ppg;
    totalCost = asking;
  } else {
    if (resultsEl) resultsEl.innerHTML = "";
    return;
  }

  const percent = (buyPPG / currentGoldPrice) * 100;

  let label = "";
  if (percent > 100) label = "❌ Bad Deal";
  else if (percent >= 95) label = "⚠️ Risky Deal";
  else if (percent >= 85) label = "✅ Good Deal";
  else label = "🔥 Steal Deal!";

  function computeROI(roi) {
    const sellTotal = totalCost * (1 + roi);
    const sellPPG = sellTotal / weight;
    const profit = sellTotal - totalCost;

    return { sellTotal, sellPPG, profit, percent: roi * 100 };
  }

  const quick = computeROI(0.03);
  const good = computeROI(0.065);
  const steal = computeROI(0.10);

  if (resultsEl) {
    resultsEl.innerHTML = `
      <h3>${label}</h3>

      <strong>Current Gold Price:</strong> ₱${currentGoldPrice.toFixed(2)}<br>
      <strong>Asking Price (buy):</strong> ₱${totalCost.toFixed(0)}<br>
      <strong>Price per gram (buy):</strong> ₱${buyPPG.toFixed(2)}<br>
      <strong>Weight:</strong> ${weight}g

      <hr>

      <strong>Quick Flip (2–4%)</strong><br>
      Selling price: ₱${quick.sellTotal.toFixed(0)}<br>
      Price per gram: ₱${quick.sellPPG.toFixed(2)}<br>
      Profit: ₱${quick.profit.toFixed(0)} | (${quick.percent}%)

      <br><br>

      <strong>Good Deal (5–8%)</strong><br>
      Selling price: ₱${good.sellTotal.toFixed(0)}<br>
      Price per gram: ₱${good.sellPPG.toFixed(2)}<br>
      Profit: ₱${good.profit.toFixed(0)} | (${good.percent}%)

      <br><br>

      <strong>Steal (10%)</strong><br>
      Selling price: ₱${steal.sellTotal.toFixed(0)}<br>
      Price per gram: ₱${steal.sellPPG.toFixed(2)}<br>
      Profit: ₱${steal.profit.toFixed(0)} | (${steal.percent}%)
    `;
  }

  lastDealData = {
    type: "gold",
    goldPrice: currentGoldPrice,
    weight: weight,
    purity: purityInput,
    soldPrice: totalCost,
    pricePerGram: buyPPG,
    dealRating: label
  };
}

// ================= SAVE GOLD =================
function saveDeal() {
  if (!lastDealData) {
    alert("No data - calculate first");
    return;
  }
console.log("Sending:", lastDealData);
  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(lastDealData),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.text())
  .then(data => {
    console.log("Server response:", data);
    alert("Saved to sheet ✅");
  })
  .catch(err => {
    console.error("Save error:", err);
    alert("Error saving ❌");
  });
}

// ================= LOANS =================
function generateLoan() {
  const principal = +document.getElementById("principal").value;
  const term = document.getElementById("loanTerm").value;

  if (!principal) {
    document.getElementById("loanResult").innerHTML = "";
    return;
  }

  const interest = principal * 0.20;
  const total = principal + interest;

  let interval = 30;
  if (term === "Weekly") interval = 7;
  if (term === "Bi-Monthly") interval = 15;

  const today = new Date();
  let dates = [];
  let temp = new Date(today);

  while (true) {
    temp = new Date(temp);
    temp.setDate(temp.getDate() + interval);

    if ((temp - today) / (1000 * 60 * 60 * 24) > 30) break;

    dates.push(temp.toLocaleDateString());
  }

  document.getElementById("loanResult").innerHTML = `
    <h3>Loan Breakdown</h3>
    Capital: ₱${principal}<br>
    Interest: ₱${interest.toFixed(0)} | 20%<br>
    Amount Due: ₱${total.toFixed(0)}<br>
    <strong>Due Dates:</strong><br>
    ${dates.join("<br>")}
  `;

  window.loanData = {
    type:"loan",
    name:document.getElementById("name").value,
    address:document.getElementById("address").value,
    idType:document.getElementById("idType").value,
    idNumber:document.getElementById("idNumber").value,
    principal,
    interest,
    profit:interest,
    loanTerm:term,
    dueDate:dates.join(", ")
  };
}

// ================= SAVE LOAN =================
function saveLoan() {
  if (!window.loanData) return alert("No loan");

  fetch(SCRIPT_URL, {
    method:"POST",
    body:JSON.stringify(window.loanData),
    headers:{ "Content-Type":"text/plain;charset=utf-8" }
  })
  .then(res => res.text())
  .then(() => alert("Loan Saved ✅"))
  .catch(() => alert("Error ❌"));
}

