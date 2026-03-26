function generateLoan() {
  const principal = +document.getElementById("principal").value;
  const term = document.getElementById("loanTerm").value;

  if (!principal) {
    alert("Enter principal");
    return;
  }

  // 🔹 FIXED INTEREST
  const interestRate = 0.20;
  const interest = principal * interestRate;
  const total = principal + interest;

  // 🔹 DUE DATE LOGIC
  let days = 30;
  if (term === "Weekly") days = 7;
  if (term === "Bi-Monthly") days = 15;
  if (term === "Monthly") days = 30;

  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + days);

  // 🔹 USD
  const usdRate = 56;
  const principalUSD = principal / usdRate;
  const interestUSD = interest / usdRate;
  const totalUSD = total / usdRate;

  // ✅ FINAL OUTPUT (WHAT YOU WANT)
  document.getElementById("loanResult").innerHTML = `
    <h3>Loan Breakdown</h3>

    <p><strong>Capital:</strong> ₱${principal.toFixed(0)} ($${principalUSD.toFixed(0)})</p>

    <p><strong>Interest:</strong> ₱${interest.toFixed(0)} ($${interestUSD.toFixed(0)}) | 20%</p>

    <p><strong>Due Date:</strong> ${due.toLocaleDateString()}</p>

    <p><strong>Amount Due:</strong> ₱${total.toFixed(0)} ($${totalUSD.toFixed(0)})</p>
  `;

  // 🔹 SAVE DATA FOR PDF + SHEET
  window.loanData = {
    name: document.getElementById("name").value,
    address: document.getElementById("address").value,
    idType: document.getElementById("idType").value,
    idNumber: document.getElementById("idNumber").value,
    principal,
    interest,
    total,
    loanTerm: term,
    dueDate: due,
    today: today
  };
}
