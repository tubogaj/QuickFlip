let lastDeal = null;

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw8bIvE__qOXduEWgvvOKzzoYnA1PJTafXN7YmnyCAcOZ61XGTmO2EO2BJSyCL_1NGF/exec";

const purityMap = {
  24: 0.999,
  22: 0.916,
  21: 0.875,
  18: 0.750,
  14: 0.585
};

function analyze() {

let live24k = parseFloat(goldPrice.value);
let w = parseFloat(weight.value);
let p = parseFloat(price.value);
let k = parseInt(karat.value);

if (!live24k || !w || !p) return;

let purity = purityMap[k];
let market = live24k * purity;
let perGram = p / w;

let pawn = market * 0.85 * w;
let flip = market * 0.95 * w;

let flipProfit = flip - p;
let flipPct = (flipProfit / p) * 100;

// TRADE LEVELS
let suggestedBuy = market * 0.90;
let maxBuy = market * 0.95;
let targetSell = market * 0.98;

// DECISION ENGINE
let ratio = perGram / market;
let rating = "";
let explanation = "";
let color = "";

if (ratio <= 0.80) {
  rating = "STEAL";
  color = "good";
  explanation = "Strong entry. High margin and low risk.";
}
else if (ratio <= 0.90) {
  rating = "STRONG BUY";
  color = "good";
  explanation = "Ideal zone for consistent flipping profit.";
}
else if (ratio <= 0.98) {
  rating = "MARGINAL";
  color = "warn";
  explanation = "Tight margins. Needs good exit.";
}
else {
  rating = "AVOID";
  color = "bad";
  explanation = "Overpriced. High chance of loss.";
}

lastDeal = {
  weight: w,
  price: p,
  profit: flipProfit,
  pct: flipPct,
  rating: rating
};

resultCard.classList.remove("hidden");

resultCard.innerHTML = `
<div class="result-title ${color}">${rating}</div>

<div class="section">
Market: ₱${market.toFixed(2)}/g<br>
Your Entry: ₱${perGram.toFixed(2)}/g
</div>

<div class="section">${explanation}</div>

<div class="section">
<b>Trade Levels</b><br>
Buy Target: ₱${suggestedBuy.toFixed(2)}/g<br>
Max Buy: ₱${maxBuy.toFixed(2)}/g<br>
Target Sell: ₱${targetSell.toFixed(2)}/g
</div>

<div class="section">
<b>Profit</b><br>
Flip: ₱${flip.toFixed(0)} (${flipPct.toFixed(1)}%)
</div>
`;
}

// SAVE TO GOOGLE SHEETS
function saveDeal() {
  if (!lastDeal) return;

  fetch(WEB_APP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(lastDeal)
  })
  .then(() => {
    resultCard.innerHTML += "<br><span style='color:#4caf50'>Saved to cloud ✅</span>";
  });
}
