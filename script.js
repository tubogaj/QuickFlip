const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyMdQUS_AVAxB2-Yk7RMznO_3SDGRHKy0xk-TcITObVVevl8tyhFtVqIWpVE9WVqzyp/exec";

let lastDealData = null;
let phpToUsd = 1/56;

// TAB SWITCH
function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tab).classList.add("active");
}

// FX RATE
fetch("https://api.exchangerate-api.com/v4/latest/PHP")
  .then(res => res.json())
  .then(data => phpToUsd = data.rates.USD);

// GOLD BUTTONS
document.getElementById("calcBtn").addEventListener("click", calculate);
document.getElementById("saveBtn").addEventListener("click", saveDeal);

// ================= GOLD =================
function calculate() {
  const goldPrice = +goldPriceInput.value;
  const weight = +weightInput.value;
  const asking = +askingPrice.value;
  const ppgInput = +pricePerGramInput.value;
  const purity = +purity.value;

  let buyPPG = ppgInput || (asking / weight);
  let totalCost = asking || (ppgInput * weight);

  const marketPPG = goldPrice * purity;

  const buyPercent = (buyPPG / marketPPG) * 100;

  let decision = "";
  let color = "";

  if (buyPercent > 100) { decision = "❌ Bad Deal"; color="red"; }
  else if (buyPercent >= 95) { decision = "⚠️ Risky Deal"; color="orange"; }
  else if (buyPercent >= 85) { decision = "✅ Good Deal"; color="lightgreen"; }
  else { decision = "🔥 Steal Deal!"; color="gold"; }

  function computeROI(r){
    const selling = totalCost*(1+r);
    return {
      selling,
      profit: selling-totalCost,
      percent: r*100,
      ppg: selling/weight
    };
  }

  const quick = computeROI(0.03);
  const good = computeROI(0.065);
  const steal = computeROI(0.10);

  results.innerHTML = `
  <h3>${decision}</h3>
  Market: ₱${marketPPG.toFixed(2)}<br>
  Position: ${buyPercent.toFixed(1)}%

  <hr>

  Quick Flip<br>
  ₱${quick.selling.toFixed(0)} | ₱${quick.profit.toFixed(0)} (${quick.percent}%)

  <br><br>

  Good Deal<br>
  ₱${good.selling.toFixed(0)} | ₱${good.profit.toFixed(0)} (${good.percent}%)

  <br><br>

  Steal<br>
  ₱${steal.selling.toFixed(0)} | ₱${steal.profit.toFixed(0)} (${steal.percent}%)
  `;

  lastDealData = {
    type:"gold",
    goldPrice,
    weight,
    purity,
    soldPrice: totalCost,
    pricePerGram: marketPPG,
    dealRating: decision
  };
}

function saveDeal(){
  fetch(SCRIPT_URL,{
    method:"POST",
    body:JSON.stringify(lastDealData),
    headers:{ "Content-Type":"text/plain" }
  }).then(()=>alert("Saved ✅"));
}

// ================= LOANS =================
function generateLoan(){
  const principal = +principalInput.value;
  const term = loanTerm.value;

  const interest = principal * 0.20;
  const total = principal + interest;

  let days = 30;
  if(term==="Weekly") days=7;
  if(term==="Bi-Monthly") days=15;

  const today = new Date();
  const due = new Date(today);
  due.setDate(today.getDate()+days);

  loanResult.innerHTML = `
  Principal: ₱${principal}<br>
  Interest: ₱${interest}<br>
  Total: ₱${total}<br>
  Due: ${due.toLocaleDateString()}
  `;

  window.loanData = {
    type:"loan",
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

function saveLoan(){
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

  doc.text(`
LOAN AGREEMENT

Borrower: ${name.value}
Address: ${address.value}

Principal: ₱${principal.value}
Interest: 20%

Penalty: ₱100/day late

Signature: __________
  `,10,10);

  doc.save("Loan.pdf");
}