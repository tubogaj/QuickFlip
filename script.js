const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyMdQUS_AVAxB2-Yk7RMznO_3SDGRHKy0xk-TcITObVVevl8tyhFtVqIWpVE9WVqzyp/exec";

let lastDealData = null;

// TAB SWITCH WITH ANIMATION + RESIZE
function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => {
    t.classList.remove("active");
  });

  const selected = document.getElementById(tab);
  selected.classList.add("active");

  const goldPanel = document.getElementById("goldPanel");

  if (tab === "gold") {
    goldPanel.style.display = "block";
    goldPanel.style.width = "420px";
  } else {
    goldPanel.style.width = "0px";

    setTimeout(() => {
      goldPanel.style.display = "none";
    }, 300);
  }
}

// ================= GOLD =================
function calculateGold() {
  const goldPrice = +goldPrice.value;
  const weight = +weight.value;
  const asking = +askingPrice.value;
  const ppgInput = +pricePerGramInput.value;
  const purity = +purity.value;

  if (!goldPrice || !weight) return alert("Fill inputs");

  const buyPPG = ppgInput || (asking / weight);
  const totalCost = asking || (ppgInput * weight);
  const marketPPG = goldPrice * purity;

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

  results.innerHTML = `
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
    purity,
    soldPrice: totalCost,
    pricePerGram: marketPPG,
    dealRating: label
  };
}

// SAVE GOLD
function saveDeal() {
  if (!lastDealData) return alert("Calculate first");

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(lastDealData),
    headers: { "Content-Type": "text/plain" }
  }).then(() => alert("Saved ✅"));
}

// ================= LOANS =================
function generateLoan() {
  const principal = +principal.value;
  const term = loanTerm.value;

  if (!principal) return alert("Enter principal");

  const interest = principal * 0.20;
  const total = principal + interest;

  let days = 30;
  if (term === "Weekly") days = 7;
  if (term === "Bi-Monthly") days = 15;

  const due = new Date();
  due.setDate(due.getDate() + days);

  loanResult.innerHTML = `
    <h3>Loan Breakdown</h3>
    Capital: ₱${principal}<br>
    Interest: ₱${interest.toFixed(0)} | 20%<br>
    Due Date: ${due.toLocaleDateString()}<br>
    Amount Due: ₱${total.toFixed(0)}
  `;

  window.loanData = {
    type: "loan",
    name: name.value,
    address: address.value,
    idType: idType.value,
    idNumber: idNumber.value,
    principal,
    interest,
    profit: interest,
    loanTerm: term,
    dueDate: due.toISOString()
  };
}

// SAVE LOAN
function saveLoan() {
  if (!window.loanData) return alert("Calculate loan first");

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(window.loanData),
    headers: { "Content-Type": "text/plain" }
  }).then(() => alert("Loan Saved ✅"));
}