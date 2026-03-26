const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCxg8KU0TwpwDQoD_e5IeZ2EGmx3M-0j3YFAKtXoy3AZ-DmrToWhHnlNA04Vgt5meC/exec";

let lastDealData = null;

document.getElementById("calcBtn").addEventListener("click", calculate);
document.getElementById("saveBtn").addEventListener("click", saveDeal);

function calculate() {
  const goldPrice = +document.getElementById("goldPrice").value;
  const weight = +document.getElementById("weight").value;
  let asking = +document.getElementById("askingPrice").value;
  let ppgInput = +document.getElementById("pricePerGramInput").value;
  const purity = +document.getElementById("purity").value;

  if (!goldPrice || !weight) {
    alert("Fill gold price and weight");
    return;
  }

  // 🔁 FLEXIBLE INPUT LOGIC
  let buyPPG, totalCost;

  if (ppgInput && !asking) {
    buyPPG = ppgInput;
    totalCost = ppgInput * weight;
  } else if (!ppgInput && asking) {
    totalCost = asking;
    buyPPG = asking / weight;
  } else if (ppgInput && asking) {
    buyPPG = ppgInput;
    totalCost = asking;
  } else {
    alert("Enter asking price or price per gram");
    return;
  }

  const marketPPG = goldPrice * purity;

  // 🎯 DEAL EMOJI
  let emoji = "✅ Good Deal";
  if (buyPPG > marketPPG) emoji = "❌ Bad Deal";
  else if (buyPPG >= marketPPG * 0.97) emoji = "⚠️ Breakeven";
  else if (buyPPG < marketPPG * 0.85) emoji = "🔥 Steal";

  // 💰 SELL SCENARIOS
  const quickSell = goldPrice * 0.92;
  const goodSell = goldPrice;
  const stealLow = goldPrice * 1.05;
  const stealHigh = goldPrice * 1.10;

  function compute(sellPPG) {
    const total = sellPPG * weight;
    const profit = total - totalCost;
    const percent = (profit / totalCost) * 100;

    return {
      total,
      profit,
      percent,
      usdTotal: total / 56,
      usdProfit: profit / 56
    };
  }

  const quick = compute(quickSell);
  const good = compute(goodSell);
  const stealMin = compute(stealLow);
  const stealMax = compute(stealHigh);

  function format(val) {
    return `₱${val.toFixed(0)} ($${(val/56).toFixed(0)})`;
  }

  document.getElementById("results").innerHTML = `
    <h3>Result</h3>

    <p><strong>Price per gram (seller):</strong> ₱${buyPPG.toFixed(2)}</p>
    <p style="font-size:22px">${emoji}</p>

    <hr>

    <p><strong>Quick Flip</strong><br>
    Sale: ${format(quick.total)}<br>
    Profit: ${format(quick.profit)}<br>
    ${quick.percent.toFixed(1)}%</p>

    <p><strong>Good Deal</strong><br>
    Sale: ${format(good.total)}<br>
    Profit: ${format(good.profit)}<br>
    ${good.percent.toFixed(1)}%</p>

    <p><strong>Steal</strong><br>
    Sale: ${format(stealMin.total)} - ${format(stealMax.total)}<br>
    Profit: ${format(stealMin.profit)} - ${format(stealMax.profit)}<br>
    ${stealMin.percent.toFixed(1)}% - ${stealMax.percent.toFixed(1)}%</p>
  `;

  // SAVE CLEAN DATA
  lastDealData = {
    goldPrice,
    weight,
    purity,
    soldPrice: good.total.toFixed(0),
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

// DASHBOARD LOADER (UNCHANGED)
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
