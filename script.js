const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCxg8KU0TwpwDQoD_e5IeZ2EGmx3M-0j3YFAKtXoy3AZ-DmrToWhHnlNA04Vgt5meC/exec";

let lastDealData = null;

document.getElementById("calcBtn").addEventListener("click", calculate);
document.getElementById("saveBtn").addEventListener("click", saveDeal);

function calculate() {
  const goldPrice = +document.getElementById("goldPrice").value;
  const weight = +document.getElementById("weight").value;
  const asking = +document.getElementById("askingPrice").value;
  const purity = +document.getElementById("purity").value;

  if (!goldPrice || !weight || !asking) {
    alert("Fill all fields");
    return;
  }

  const buyPPG = asking / weight;
  const marketPPG = goldPrice * purity;

  let emoji = "✅";
  if (buyPPG > marketPPG) emoji = "❌";
  else if (buyPPG >= marketPPG * 0.97) emoji = "⚠️";
  else if (buyPPG < marketPPG * 0.85) emoji = "🔥";

  const sell = goldPrice * weight;
  const profit = sell - asking;

  document.getElementById("results").innerHTML = `
    <h3>Result</h3>
    ₱${buyPPG.toFixed(2)} / g<br>
    <span style="font-size:24px">${emoji}</span><br>
    Est Sell: ₱${sell.toFixed(0)}<br>
    Profit: ₱${profit.toFixed(0)}
  `;

  lastDealData = {
    goldPrice,
    weight,
    purity,
    soldPrice: sell.toFixed(0),
    pricePerGram: buyPPG.toFixed(2),
    dealRanking: emoji
  };
}

function saveDeal() {
  if (!lastDealData) {
    alert("Calculate first");
    return;
  }

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(lastDealData),
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    }
  })
  .then(() => {
    alert("Saved ✅");
    loadDashboard();
  })
  .catch(() => alert("Error ❌"));
}

function loadDashboard() {
  fetch(SCRIPT_URL)
    .then(res => res.json())
    .then(data => {

      let totalDeals = data.length - 1;
      let capital = 0;
      let profit = 0;
      let wins = 0;

      const tbody = document.querySelector("#historyTable tbody");
      tbody.innerHTML = "";

      for (let i = 1; i < data.length; i++) {
        const row = data[i];

        const gold = +row[1];
        const weight = +row[2];
        const sold = +row[4];
        const ppg = +row[5];
        const rank = row[6];

        const capitalUsed = ppg * weight;
        capital += capitalUsed;
        profit += sold - capitalUsed;

        if (rank === "🔥" || rank === "✅") wins++;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${new Date(row[0]).toLocaleDateString()}</td>
          <td>${gold}</td>
          <td>${weight}</td>
          <td>${ppg}</td>
          <td>${rank}</td>
        `;
        tbody.appendChild(tr);
      }

      document.getElementById("totalDeals").innerText = totalDeals;
      document.getElementById("totalCapital").innerText = capital.toFixed(0);
      document.getElementById("totalProfit").innerText = profit.toFixed(0);
      document.getElementById("winRate").innerText =
        totalDeals ? ((wins / totalDeals) * 100).toFixed(1) : 0;
    });
}

loadDashboard();
