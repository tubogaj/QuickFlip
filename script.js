function calculate() {
  const goldPrice = parseFloat(document.getElementById("goldPrice").value);
  const weight = parseFloat(document.getElementById("weight").value);
  const asking = parseFloat(document.getElementById("askingPrice").value);
  const purity = parseFloat(document.getElementById("purity").value);

  if (!goldPrice || !weight || !asking) {
    alert("Please fill all fields");
    return;
  }

  const pricePerGram = asking / weight;

  // MARKET-BASED SELL PRICES
  const fastSell = goldPrice * 0.92;
  const goodSell = goldPrice * 1.00;
  const stealLow = goldPrice * 1.05;
  const stealHigh = goldPrice * 1.10;

function calculate() {
  const goldPrice = parseFloat(document.getElementById("goldPrice").value);
  const weight = parseFloat(document.getElementById("weight").value);
  const asking = parseFloat(document.getElementById("askingPrice").value);
  const purity = parseFloat(document.getElementById("purity").value);

  if (!goldPrice || !weight || !asking) {
    alert("Please fill all fields");
    return;
  }

  const buyPricePerGram = asking / weight;
  const marketValuePerGram = goldPrice * purity;

  // DEAL INDICATOR
  let dealLabel = "";
  let dealColor = "";

  if (buyPricePerGram > marketValuePerGram) {
    dealLabel = "❌ LUGI";
    dealColor = "red";
  } else if (buyPricePerGram >= marketValuePerGram * 0.95) {
    dealLabel = "⚠️ BREAK EVEN";
    dealColor = "orange";
  } else if (buyPricePerGram < marketValuePerGram * 0.85) {
    dealLabel = "🔥 STEAL";
    dealColor = "gold";
  } else {
    dealLabel = "✅ GOOD DEAL";
    dealColor = "lightgreen";
  }

  // SELL PRICES (market-based)
  const fastSell = goldPrice * 0.92;
  const goodSell = goldPrice;
  const stealLow = goldPrice * 1.05;
  const stealHigh = goldPrice * 1.10;

  function compute(sellPrice) {
    const total = sellPrice * weight;
    const profit = total - asking;
    const percent = (profit / asking) * 100;
    const usdTotal = total / 56;
    const usdProfit = profit / 56;

    return {
      totalPHP: total.toFixed(0),
      totalUSD: usdTotal.toFixed(0),
      profitPHP: profit.toFixed(0),
      profitUSD: usdProfit.toFixed(0),
      percent: percent.toFixed(1)
    };
  }

  const fast = compute(fastSell);
  const good = compute(goodSell);
  const stealMin = compute(stealLow);
  const stealMax = compute(stealHigh);

  document.getElementById("results").innerHTML = `
    <h3>Results</h3>

    <p><strong>Price per gram:</strong> ₱${buyPricePerGram.toFixed(2)}</p>

    <p style="font-size:18px; font-weight:bold; color:${dealColor}">
      ${dealLabel}
    </p>

    <hr>

    <p><strong>Fast Flip</strong><br>
    ₱${fast.totalPHP} ($${fast.totalUSD})<br>
    Profit: ₱${fast.profitPHP} ($${fast.profitUSD})<br>
    ${fast.percent}%</p>

    <p><strong>Good Deal</strong><br>
    ₱${good.totalPHP} ($${good.totalUSD})<br>
    Profit: ₱${good.profitPHP} ($${good.profitUSD})<br>
    ${good.percent}%</p>

    <p><strong>Steal</strong><br>
    ₱${stealMin.totalPHP} - ₱${stealMax.totalPHP}<br>
    ($${stealMin.totalUSD} - $${stealMax.totalUSD})<br>
    Profit: ₱${stealMin.profitPHP} - ₱${stealMax.profitPHP}<br>
    ($${stealMin.profitUSD} - $${stealMax.profitUSD})<br>
    ${stealMin.percent}% - ${stealMax.percent}%</p>
  `;
}
