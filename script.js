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

// ✅ FIX FOR DROPDOWN
const purityEl = document.getElementById("purity");
if (purityEl) purityEl.addEventListener("change", calculateGold);

  // LOAN AUTO
  ["principal","loanTerm"]
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", generateLoan);
  });

});

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
  const goldPrice24k = parseFloat(document.getElementById("goldPrice").value) || 0;
  const weight = parseFloat(document.getElementById("weight").value) || 0;
  const asking = parseFloat(document.getElementById("askingPrice").value) || 0;
  const ppg = parseFloat(document.getElementById("pricePerGramInput").value) || 0;
  const purityInput = document.getElementById("purity").value;

  if (!goldPrice24k || !weight) {
    document.getElementById("results").innerHTML = "";
    return;
  }

  // ✅ FIXED PURITY MAP (no auto fallback to 1)
  const purityMap = {
    "24K": 1,
    "22K": 0.916,
    "21K": 0.875,
    "18K": 0.75,
    "16K": 0.667,
    "14K": 0.585
  };

  const purity = purityMap[purityInput];

  // ❌ if invalid purity, stop
  if (!purity) return;

  const currentGoldPrice = goldPrice24k * purity;

  let buyPPG = 0;
  let totalCost = 0;

  // ✅ FIXED LOGIC (no premature return)
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
    document.getElementById("results").innerHTML = "";
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
  if (!lastDealData) return alert("No data");

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(lastDealData),
    headers: { "Content-Type": "text/plain;charset=utf-8" }
  })
  .then(res => res.text())
  .then(() => alert("Saved ✅"))
  .catch(() => alert("Error ❌"));
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

// ================= PDF =================
async function generatePDF() {
  if (!window.loanData) {
    alert("Generate loan first");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // ================= INPUTS =================
  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const idType = document.getElementById("idType").value;
  const idNumber = document.getElementById("idNumber").value;
  const principal = +document.getElementById("principal").value;
  const loanTerm = document.getElementById("loanTerm").value;

  const dateStr = new Date().toLocaleDateString();

  // ================= CALC =================
  const interest = principal * 0.20;
  const total = principal + interest;

  // IMPORTANT: use same structure as your loanData
  const dueDatesArray = window.loanData.dueDate.split(",").map(d => d.trim());
  const finalDueDate = dueDatesArray[dueDatesArray.length - 1];

  // divide based on number of payments
  const perPayment = total / dueDatesArray.length;

  const peso = (n) => `₱${Number(n).toFixed(0)}`;

  // ================= YOUR EXACT CONTENT =================
  const content = `
LOAN AGREEMENT

This Loan Agreement is entered into by and between:

Arnie Joyce A Tubog, of legal age, Filipino, with address at 099 Taal St, Libis, Binangonan, Rizal, hereinafter referred to as the “Lender”;

and

${name}, of legal age, Filipino, with address at ${address}, holding valid ID ${idType} ${idNumber}, hereinafter referred to as the “Borrower”.

1. Loan Amount
The Lender agrees to lend the Borrower the amount of ${peso(principal)}, which the Borrower acknowledges having received in full as of the date of this Agreement.

2. Interest and Term
The Borrower agrees to pay interest at the rate of twenty percent (20%) per month. The total loan obligation, including interest, shall be due and payable on or before ${finalDueDate}, in accordance with the agreed loan term.

3. Mode of Payment
Payment shall be made based on the agreed schedule below:

${dueDatesArray.map((d) => `• ${d} - ${peso(perPayment)}`).join("\n")}

Total Obligation: ${peso(total)}

4. Obligation to Pay
The Borrower binds himself/herself to pay the full amount of the loan, including interest and any applicable penalties, on the agreed due date without the need for prior demand.

5. Penalties
In case of delayed payment, the Borrower agrees to pay a penalty of One Hundred Pesos (₱100.00) per week from the date of default until full payment of the past-due amount is made.

6. Default
Failure to pay the total obligation on the due date shall constitute default. Upon default, the entire outstanding balance, including principal, accrued interest, penalties, and other lawful charges, shall become immediately due and demandable.

7. Legal Remedies
In the event of default, the Lender shall have the right to pursue all remedies available under the laws of the Republic of the Philippines, including but not limited to filing a civil action for the collection of the sum of money and damages. The Borrower agrees to pay attorney’s fees equivalent to a reasonable percentage of the amount due, as well as all legal costs and expenses of collection as allowed by law.

8. Representation of the Borrower
The Borrower represents that all information provided to the Lender is true and correct, and that he/she has the capacity and willingness to fulfill the obligation under this Agreement.

9. Governing Law and Venue
This Agreement shall be governed by the laws of the Republic of the Philippines. Any legal action arising from this Agreement shall be filed exclusively in the proper courts of Rizal.

IN WITNESS WHEREOF, signed on ${dateStr} at ${address}.


LENDER: Arnie Joyce A Tubog


BORROWER: ________________________


WITNESS: ________________________


WITNESS: ________________________
`;

  // ================= FORMAT (FIX CUT TEXT ISSUE) =================
// Better font rendering
doc.setFont("Times", "Normal");
doc.setFontSize(11);

// Proper margins
const marginLeft = 15;
const marginTop = 15;
const pageWidth = 180;
const lineHeight = 6;

const lines = doc.splitTextToSize(content, pageWidth);

let y = marginTop;

lines.forEach(line => {
  if (y > 280) { // page break
    doc.addPage();
    y = marginTop;
  }

  doc.text(line, marginLeft, y);
  y += lineHeight;
});
