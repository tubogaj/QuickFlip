function calculate() {
  const goldPrice = parseFloat(document.getElementById("goldPrice").value);
  const weight = parseFloat(document.getElementById("weight").value);
  const asking = parseFloat(document.getElementById("askingPrice").value);
  const purity = parseFloat(document.getElementById("purity").value);

  if (!goldPrice || !weight || !asking) {
    alert("Please fill all fields");
    return;
  }

  const pureGoldWeight = weight * purity;
  const pricePerGram = asking / weight;

  // Exit scenarios
  const fastSell = 7200;
  const normalSell = 7500;
  const premiumMin = 7800;
  const premiumMax = 8200;

  function compute(sellPrice) {
    const total = sellPrice * weight;
    const profit = total - asking;
    const percent = (profit / asking) * 100;
    const usd = total / 56; // approx conversion

    return {
      total: total.toFixed(0),
      usd: usd.toFixed(0),
      profit: profit.toFixed(0),
      percent: percent.toFixed(1)
    };
  }

  const fast = compute(fastSell);
  const normal = compute(normalSell);
  const premiumLow = compute(premiumMin);
  const premiumHigh = compute(premiumMax);

  document.getElementById("results").innerHTML = `
    <h3>Results</h3>

    <p><strong>Price per gram:</strong> ₱${pricePerGram.toFixed(2)}</p>

    <hr>

    <p><strong>Fast Flip</strong><br>
    ₱${fast.total} | $${fast.usd} | +₱${fast.profit} (${fast.percent}%)</p>

    <p><strong>Normal Sale</strong><br>
    ₱${normal.total} | $${normal.usd} | +₱${normal.profit} (${normal.percent}%)</p>

    <p><strong>Premium Sale</strong><br>
    ₱${premiumLow.total} - ₱${premiumHigh.total}<br>
    $${premiumLow.usd} - $${premiumHigh.usd}<br>
    +₱${premiumLow.profit} to ₱${premiumHigh.profit} 
    (${premiumLow.percent}% - ${premiumHigh.percent}%)</p>
  `;
}