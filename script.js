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
  const goldPrice24k = +document.getElementById("goldPrice").value;
  const weight = +document.getElementById("weight").value;
  const asking = +document.getElementById("askingPrice").value;
  const ppg = +document.getElementById("pricePerGramInput").value;
  const purity = +document.getElementById("purity").value;

  if (!goldPrice24k || !weight) {
    document.getElementById("results").innerHTML = "";
    return;
  }

  // ✅ CURRENT GOLD PRICE BASED ON PURITY
  const currentGoldPrice = goldPrice24k * purity;

  // ✅ FLEX INPUT LOGIC
  let buyPPG, totalCost;

  if (ppg && !asking) {
    buyPPG = ppg;
    totalCost = ppg * weight;
  } else if (!ppg && asking) {
    totalCost = asking;
    buyPPG = asking / weight;
  } else if (ppg && asking) {
    buyPPG = ppg;
    totalCost = asking;
  } else {
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

    return {
      sellTotal,
      sellPPG,
      profit,
      percent: roi * 100
    };
  }

  const quick = computeROI(0.03);
  const good = computeROI(0.065);
  const steal = computeROI(0.10);

  document.getElementById("results").innerHTML = `
    <h3>${label}</h3>

    <strong>Current Gold Price:</strong> ₱${currentGoldPrice.toFixed(2)}<br>
    <strong>Asking Price (buy):</strong> ₱${totalCost.toFixed(0)}<br>
    <strong>Price per gram (buy):</strong> ₱${buyPPG.toFixed(2)}<br>
    <strong>Weight:</strong> ${weight}g

    <hr>

    <strong>Quick Flip (2–4%)</strong><br>
    Current Gold Price: ₱${currentGoldPrice.toFixed(2)}<br>
    Selling price (sell): ₱${quick.sellTotal.toFixed(0)}<br>
    Price per gram (sell): ₱${quick.sellPPG.toFixed(2)}<br>
    Profit: ₱${quick.profit.toFixed(0)} | (${quick.percent}%)

    <br><br>

    <strong>Good Deal (5–8%)</strong><br>
    Current Gold Price: ₱${currentGoldPrice.toFixed(2)}<br>
    Selling price (sell): ₱${good.sellTotal.toFixed(0)}<br>
    Price per gram (sell): ₱${good.sellPPG.toFixed(2)}<br>
    Profit: ₱${good.profit.toFixed(0)} | (${good.percent}%)

    <br><br>

    <strong>Steal (10%)</strong><br>
    Current Gold Price: ₱${currentGoldPrice.toFixed(2)}<br>
    Selling price (sell): ₱${steal.sellTotal.toFixed(0)}<br>
    Price per gram (sell): ₱${steal.sellPPG.toFixed(2)}<br>
    Profit: ₱${steal.profit.toFixed(0)} | (${steal.percent}%)
  `;

  // ✅ FIXED SAVE DATA (MATCHES YOUR SHEET)
  lastDealData = {
    type: "gold",
    goldPrice: currentGoldPrice.toFixed(2), // current gold price
    weight: weight,
    purity: purity,
    soldPrice: totalCost.toFixed(0), // asking price
    pricePerGram: buyPPG.toFixed(2),
    dealRating: label
  };
}

// AUTO TRIGGER GOLD
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

  // ✅ GENERATE MULTIPLE DUE DATES (WITHIN 30 DAYS)
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

// AUTO TRIGGER LOANS
["principal","loanTerm"]
.forEach(id => {
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
