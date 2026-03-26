const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzOZlfoIfPYaejN7RpMLuvDmNtDjTy8myxzI1x6x-rRI823dv1xZUwljHBp_a6SHRqF/exec";

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

  const currentGoldPrice = goldPrice24k * purity;

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

  lastDealData = {
    type: "gold",
    goldPrice: currentGoldPrice.toFixed(2),
    weight: weight,
    purity: purity,
    soldPrice: totalCost.toFixed(0),
    pricePerGram: buyPPG.toFixed(2),
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
  if (!lastDealData) {
    alert("No data");
    return;
  }

  const payload = {
    type: "gold",
    goldPrice: lastDealData.goldPrice,
    weight: lastDealData.weight,
    purity: lastDealData.purity,
    soldPrice: lastDealData.soldPrice,
    pricePerGram: lastDealData.pricePerGram,
    dealRating: lastDealData.dealRating
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    }
  })
  .then(res => res.text())
  .then(res => {
    console.log(res);
    alert("Saved ✅");
  })
  .catch(err => {
    console.error(err);
    alert("Error ❌");
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

// AUTO LOANS
["principal","loanTerm"]
.forEach(id => {
  document.getElementById(id).addEventListener("input", generateLoan);
});

// SAVE LOAN
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

  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const idType = document.getElementById("idType").value;
  const idNumber = document.getElementById("idNumber").value;
  const principal = +document.getElementById("principal").value;
  const loanTerm = document.getElementById("loanTerm").value;

  const today = new Date().toLocaleDateString();

  const interest = principal * 0.20;
  const total = principal + interest;

  const dueDates = window.loanData.dueDate.split(",").map(d => d.trim());
  const finalDueDate = dueDates[dueDates.length - 1];

  let perPayment = total / dueDates.length;

  const peso = (n) => `₱${n.toFixed(0)}`;

  let y = 15;

  function addLine(text, space = 6) {
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 15, y);
    y += lines.length * space;
  }

  // TITLE
  doc.setFont("Times", "Bold");
  doc.setFontSize(14);
  doc.text("LOAN AGREEMENT", 105, y, { align: "center" });
  y += 10;

  doc.setFont("Times", "Normal");
  doc.setFontSize(11);

  addLine(`This Loan Agreement is entered into by and between:`);
  y += 2;

  addLine(`Arnie Joyce A Tubog, of legal age, Filipino, with address at 099 Taal St Libis, Binangonan, Rizal, hereinafter referred to as the “Lender”;`);
  y += 4;

  addLine(`and`);
  y += 4;

  addLine(`${name}, of legal age, Filipino, with address at ${address}, holding valid ID ${idType} ${idNumber}, hereinafter referred to as the “Borrower”.`);
  y += 6;

  doc.setFont("Times", "Bold");
  addLine("1. Loan Amount");
  doc.setFont("Times", "Normal");
  addLine(`The Lender agrees to lend the Borrower the amount of ${peso(principal)}, which the Borrower acknowledges having received.`);
  y += 4;

  doc.setFont("Times", "Bold");
  addLine("2. Interest and Term");
  doc.setFont("Times", "Normal");
  addLine(`Interest is fixed at 20% monthly. Total obligation due on ${finalDueDate}.`);
  y += 4;

  doc.setFont("Times", "Bold");
  addLine("3. Mode of Payment");
  doc.setFont("Times", "Normal");
  addLine("Payment schedule:");
  y += 2;

  dueDates.forEach(d => {
    addLine(`• ${d} - ${peso(perPayment)}`);
  });

  y += 2;
  addLine(`Total Obligation: ${peso(total)}`);
  y += 6;

  addLine(`IN WITNESS WHEREOF, signed on ${today} at ${address}.`);
  y += 10;

  addLine("LENDER: Arnie Joyce A Tubog");
  y += 10;
  addLine("BORROWER: ________________________");
  y += 10;
  addLine("WITNESS: ________________________");
  y += 10;
  addLine("WITNESS: ________________________");

  doc.save(`Loan_Agreement_${name}.pdf`);
}

  // ================= GET INPUTS =================
  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const idType = document.getElementById("idType").value;
  const idNumber = document.getElementById("idNumber").value;
  const principal = +document.getElementById("principal").value;
  const loanTerm = document.getElementById("loanTerm").value;

  const today = new Date();
  const dateStr = today.toLocaleDateString();

  // ================= LOAN CALC =================
  const interest = principal * 0.20;
  const total = principal + interest;

  // due dates (array)
  const dueDatesArray = window.loanData.dueDate.split(",").map(d => d.trim());
  const finalDueDate = dueDatesArray[dueDatesArray.length - 1];

  // ================= PAYMENT PER TERM =================
  let perPayment = total;

  if (loanTerm === "Weekly") {
    perPayment = total / dueDatesArray.length;
  } else if (loanTerm === "Bi-Monthly") {
    perPayment = total / dueDatesArray.length;
  }

  // ================= FORMAT =================
  const peso = (n) => `₱${n.toFixed(0)}`;

  // ================= DOCUMENT CONTENT =================
  const content = `
LOAN AGREEMENT

This Loan Agreement is entered into by and between:

Arnie Joyce A Tubog, of legal age, Filipino, with address at 099 Taal St Libis, Binangonan, Rizal, hereinafter referred to as the “Lender”;

and

${name}, of legal age, Filipino, with address at ${address}, holding valid ID ${idType} ${idNumber}, hereinafter referred to as the “Borrower”.

1. Loan Amount
The Lender agrees to lend the Borrower the amount of ${peso(principal)}, which the Borrower acknowledges having received in full as of the date of this Agreement.

2. Interest and Term
The Borrower agrees to pay interest at the rate of twenty percent (20%) per month. The total loan obligation, including interest, shall be due and payable on or before ${finalDueDate}, in accordance with the agreed loan term.

3. Mode of Payment
Payment shall be made based on the agreed schedule below:

${dueDatesArray.map((d, i) => `• ${d} - ${peso(perPayment)}`).join("\n")}

Total Obligation: ${peso(total)}

4. Obligation to Pay
The Borrower binds himself/herself to pay the full amount of the loan, including interest and any applicable penalties, on the agreed due date without the need for prior demand.

5. Penalties
In case of delayed payment, the Borrower agrees to pay a penalty of One Hundred Pesos (₱100.00) per week from the date of default until full payment of the past-due amount is made.

6. Default
Failure to pay the total obligation on the due date shall constitute default. Upon default, the entire outstanding balance, including principal, accrued interest, penalties, and other lawful charges, shall become immediately due and demandable.

7. Legal Remedies
In the event of default, the Lender shall have the right to pursue all remedies available under the laws of the Republic of the Philippines, including but not limited to filing a civil action for collection of sum of money and damages. The Borrower agrees to pay attorney’s fees equivalent to a reasonable percentage of the amount due, as well as all legal costs and expenses of collection as allowed by law.

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

  // ================= FORMAT PDF =================
  doc.setFont("Times", "Normal");
  doc.setFontSize(11);

  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 10, 10);

  doc.save(`Loan_Agreement_${name}.pdf`);
}
