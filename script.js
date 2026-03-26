const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCxg8KU0TwpwDQoD_e5IeZ2EGmx3M-0j3YFAKtXoy3AZ-DmrToWhHnlNA04Vgt5meC/exec";

let lastDealData = null;
let phpToUsd = 1 / 56; // fallback

// 🔁 FETCH LIVE FX RATE
async function fetchRate() {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/PHP");
    const data = await res.json();
    phpToUsd = data.rates.USD;
  } catch (e) {
    console.log("Using fallback rate");
  }
}

// INIT FX RATE
fetchRate();

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

  // FLEX INPUT
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

  // DEAL EMOJI
  let emoji = "✅ Good Deal";
  if (buyPPG > marketPPG) emoji = "❌ Bad Deal";
  else if (buyPPG >= marketPPG * 0.97) emoji = "⚠️ Breakeven";
  else if (buyPPG < marketPPG * 0.85) emoji = "🔥 Steal";

  // SELL SCENARIOS
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
      usdTotal: total * phpToUsd,
      usdProfit: profit * phpToUsd
    };
  }

  const quick = compute(quickSell);
  const good = compute(goodSell);
  const stealMin = compute(stealLow);
  const stealMax = compute(stealHigh);

  function formatPHPUSD(php, usd) {
    return `₱${php.toFixed(0)} ($${usd.toFixed(0)})`;
  }

  document.getElementById("results").innerHTML = `
    <h3>Result</h3>

    <p><strong>Price per gram (seller):</strong> ₱${buyPPG.toFixed(2)}</p>
    <p><strong>Total asking price:</strong> ${formatPHPUSD(totalCost, totalCost * phpToUsd)}</p>
    <p><strong>Weight:</strong> ${weight}g</p>

    <p style="font-size:22px">${emoji}</p>

    <hr>

    <p><strong>Quick Flip</strong><br>
    Sale price: ${formatPHPUSD(quick.total, quick.usdTotal)}<br>
    Price per gram (entry point): ₱${buyPPG.toFixed(2)}<br>
    Profit: ${formatPHPUSD(quick.profit, quick.usdProfit)} | (${quick.percent.toFixed(1)}%)</p>

    <p><strong>Good Deal</strong><br>
    Sale price: ${formatPHPUSD(good.total, good.usdTotal)}<br>
    Price per gram (entry point): ₱${buyPPG.toFixed(2)}<br>
    Profit: ${formatPHPUSD(good.profit, good.usdProfit)} | (${good.percent.toFixed(1)}%)</p>

    <p><strong>Steal</strong><br>
    Sale price: ${formatPHPUSD(stealMin.total, stealMin.usdTotal)} - ${formatPHPUSD(stealMax.total, stealMax.usdTotal)}<br>
    Price per gram (entry point): ₱${buyPPG.toFixed(2)}<br>
    Profit: ${formatPHPUSD(stealMin.profit, stealMin.usdProfit)} - ${formatPHPUSD(stealMax.profit, stealMax.usdProfit)}<br>
    (${stealMin.percent.toFixed(1)}% - ${stealMax.percent.toFixed(1)}%)</p>
  `;

  // SAVE
  lastDealData = {
    goldPrice,
    weight,
    purity,
    soldPrice: good.total.toFixed(0),
    pricePerGram: buyPPG.toFixed(2),
    dealRanking: emoji
  };
}

// SAVE
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

// DASHBOARD
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

// INIT
loadDashboard();
