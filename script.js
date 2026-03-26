const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCxg8KU0TwpwDQoD_e5IeZ2EGmx3M-0j3YFAKtXoy3AZ-DmrToWhHnlNA04Vgt5meC/exec";

let lastDealData = null;
let phpToUsd = 1 / 56;

// FETCH FX
async function fetchRate() {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/PHP");
    const data = await res.json();
    phpToUsd = data.rates.USD;
  } catch {}
}
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

  // ROI-BASED TARGETS
  const quickROI = 0.03;   // 3%
  const goodROI = 0.065;   // 6.5%
  const stealROI = 0.10;   // 10%

  function computeROI(roi) {
    const selling = totalCost * (1 + roi);
    const profit = selling - totalCost;
    const percent = roi * 100;
    const ppg = selling / weight;

    return {
      selling,
      profit,
      percent,
      ppg,
      usdSelling: selling * phpToUsd,
      usdProfit: profit * phpToUsd
    };
  }

  const quick = computeROI(quickROI);
  const good = computeROI(goodROI);
  const steal = computeROI(stealROI);

  // MARKET % INDICATOR
  const buyPercent = (buyPPG / marketPPG) * 100;

  let decisionText = "";
  let color = "";

  if (buyPercent > 100) {
    decisionText = "❌ Bad deal";
    color = "red";
  } else if (buyPercent >= 95) {
    decisionText = "⚠️ Tight deal";
    color = "orange";
  } else if (buyPercent >= 85) {
    decisionText = "✅ Good Deal";
    color = "lightgreen";
  } else {
    decisionText = "🔥 Steal Deal!";
    color = "gold";
  }

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

    <p style="color:${color}">
      ${buyPercent.toFixed(1)}% of market
    </p>

    <p style="font-size:20px;"><strong>${decisionText}</strong></p>

    <p><strong>Weight:</strong> ${weight}g</p>

    <hr>

    <p><strong>Quick Flip (2–4%)</strong><br>
    Capital: ${php(totalCost)} (${usd(totalCost * phpToUsd)})<br>
    Selling price: ${php(quick.selling)} (${usd(quick.usdSelling)})<br>
    Price per gram (sell): ₱${quick.ppg.toFixed(2)}<br>
    Profit: ${php(quick.profit)} (${usd(quick.usdProfit)}) | (${quick.percent.toFixed(1)}%)</p>

    <p><strong>Good Deal (5–8%)</strong><br>
    Capital: ${php(totalCost)} (${usd(totalCost * phpToUsd)})<br>
    Selling price: ${php(good.selling)} (${usd(good.usdSelling)})<br>
    Price per gram (sell): ₱${good.ppg.toFixed(2)}<br>
    Profit: ${php(good.profit)} (${usd(good.usdProfit)}) | (${good.percent.toFixed(1)}%)</p>

    <p><strong>Steal (10%)</strong><br>
    Capital: ${php(totalCost)} (${usd(totalCost * phpToUsd)})<br>
    Selling price: ${php(steal.selling)} (${usd(steal.usdSelling)})<br>
    Price per gram (sell): ₱${steal.ppg.toFixed(2)}<br>
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

// SAVE TO SHEETS
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
  .then(() => alert("Saved ✅"))
  .catch(() => alert("Error ❌"));
}
