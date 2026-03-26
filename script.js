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
    console.log("Using fallback FX rate");
  }
}
fetchRate();

// BUTTONS
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
    totalCost = buyPPG * weight;
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

  // PURITY LABEL
  const purityLabelMap = {
    0.999: "24k",
    0.916: "22k",
    0.875: "21k",
    0.750: "18k",
    0.585: "14k"
  };

  const selectedPurityLabel = purityLabelMap[purity] || "";

  // MARKET PRICE
  const marketPPG = goldPrice * purity;

  // SELL LEVELS (PH REALISTIC)
  const quickPPG = marketPPG * 0.95;
  const goodPPG = marketPPG;
  const stealPPG = marketPPG * 1.075;

  function compute(ppg) {
    const selling = ppg * weight;
    const profit = selling - totalCost;
    const percent = (profit / totalCost) * 100;

    return {
      selling,
      profit,
      percent,
      usdSelling: selling * phpToUsd,
      usdProfit: profit * phpToUsd
    };
  }

  const quick = compute(quickPPG);
  const good = compute(goodPPG);
  const steal = compute(stealPPG);

  // MARKET % INDICATOR
  const buyPercent = (buyPPG / marketPPG) * 100;

  let marketLabel = "";
  let marketColor = "";
  let decisionText = "";

  if (buyPercent > 100) {
    marketLabel = "Above market";
    marketColor = "red";
    decisionText = "❌ Bad deal";
  } else if (buyPercent >= 95) {
    marketLabel = "Near market";
    marketColor = "orange";
    decisionText = "⚠️ Tight deal";
  } else if (buyPercent >= 85) {
    marketLabel = "Below market";
    marketColor = "lightgreen";
    decisionText = "✅ Good Deal";
  } else {
    marketLabel = "Deep value";
    marketColor = "gold";
    decisionText = "🔥 Steal Deal!";
  }

  // FORMATTERS
  function php(val) {
    return `₱${val.toFixed(0)}`;
  }

  function usd(val) {
    return `$${val.toFixed(0)}`;
  }

  // OUTPUT
  document.getElementById("results").innerHTML = `
    <h3>Result</h3>

    <p><strong>Price per gram (buy):</strong> ₱${buyPPG.toFixed(2)}</p>
    <p><strong>Market price (${selectedPurityLabel}):</strong> ₱${marketPPG.toFixed(2)}</p>

    <p>
    <strong>Market position:</strong> 
    <span style="color:${marketColor}">
    ${buyPercent.toFixed(1)}% of market (${marketLabel})
    </span>
    </p>

    <p style="font-size:20px; font-weight:bold;">${decisionText}</p>

    <p><strong>Weight:</strong> ${weight}g</p>

    <hr>

    <p><strong>Quick Flip</strong><br>
    Capital: ${php(totalCost)} (${usd(totalCost * phpToUsd)})<br>
    Selling price: ${php(quick.selling)} (${usd(quick.usdSelling)})<br>
    Price per gram (sell): ₱${quickPPG.toFixed(2)}<br>
    Profit: ${php(quick.profit)} (${usd(quick.usdProfit)}) | (${quick.percent.toFixed(1)}%)</p>

    <p><strong>Good Deal</strong><br>
    Capital: ${php(totalCost)} (${usd(totalCost * phpToUsd)})<br>
    Selling price: ${php(good.selling)} (${usd(good.usdSelling)})<br>
    Price per gram (sell): ₱${goodPPG.toFixed(2)}<br>
    Profit: ${php(good.profit)} (${usd(good.usdProfit)}) | (${good.percent.toFixed(1)}%)</p>

    <p><strong>Steal</strong><br>
    Capital: ${php(totalCost)} (${usd(totalCost * phpToUsd)})<br>
    Selling price: ${php(steal.selling)} (${usd(steal.usdSelling)})<br>
    Price per gram (sell): ₱${stealPPG.toFixed(2)}<br>
    Profit: ${php(steal.profit)} (${usd(steal.usdProfit)}) | (${steal.percent.toFixed(1)}%)</p>
  `;

  // SAVE DATA
  lastDealData = {
    goldPrice,
    weight,
    purity,
    soldPrice: good.selling.toFixed(0),
    pricePerGram: buyPPG.toFixed(2),
    dealRanking: decisionText
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

        const weight = +row[2];
        const sold = +row[4];
        const ppg = +row[5];
        const rank = row[6];

        const capitalUsed = ppg * weight;
        capital += capitalUsed;
        profit += sold - capitalUsed;

        if (rank.includes("Good") || rank.includes("Steal")) wins++;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${new Date(row[0]).toLocaleDateString()}</td>
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
