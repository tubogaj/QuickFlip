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

// MARKET LOGIC
let buyerLow = market * 0.95;
let buyerHigh = market * 0.99;

let breakLow = market * 0.93;
let breakHigh = market * 0.95;

let idealLow = market * 0.88;
let idealHigh = market * 0.92;

let strongLow = market * 0.80;
let strongHigh = market * 0.87;

let resale = market * 0.97;
let profitPerGram = resale - perGram;

// REAL TALK
let ratio = perGram / market;
let realTalk = "";

if (ratio <= 0.90) {
  realTalk = "You are in a strong position. This entry gives you flexibility and profit buffer.";
}
else if (ratio <= 0.98) {
  realTalk = "This is a safe entry but not aggressive. You can profit, but execution matters.";
}
else {
  realTalk = "You are entering above optimal levels. This trade depends heavily on finding a buyer.";
}

lastDeal = {
  weight: w,
  price: p,
  profit: profitPerGram,
  rating: "analyzed"
};

resultCard.classList.remove("hidden");

resultCard.innerHTML = `
<div class="result-title">📊 Market Baseline</div>

<div class="section">
Spot equivalent: ₱${market.toFixed(0)}/g<br>
Real buyers usually pay:<br>
👉 ₱${buyerLow.toFixed(0)} – ₱${buyerHigh.toFixed(0)}/g
</div>

<div class="section">
🔒 <b>Break-even Zone</b><br>
👉 ₱${breakLow.toFixed(0)} – ₱${breakHigh.toFixed(0)}/g<br>
Safe even with fast exit.
</div>

<div class="section">
⚖️ <b>Ideal Buying Range</b><br>
👉 ₱${idealLow.toFixed(0)} – ₱${idealHigh.toFixed(0)}/g<br>
Best zone for consistent profits.
</div>

<div class="section">
🔥 <b>High-Margin Deals</b><br>
👉 ₱${strongLow.toFixed(0)} – ₱${strongHigh.toFixed(0)}/g<br>
Strong profit potential.
</div>

<div class="section">
⚡ <b>Quick Rule</b><br>
Target at least ₱500–₱1,000 profit per gram.
</div>

<div class="section">
🧠 <b>Real Talk (Your Entry: ₱${perGram.toFixed(0)}/g)</b><br>
${realTalk}<br><br>
Estimated profit: ₱${profitPerGram.toFixed(0)}/g
</div>

<div class="section">
🔥 <b>Bottom Line</b><br>
₱${breakHigh.toFixed(0)}/g = safe<br>
₱${idealHigh.toFixed(0)}/g below = ideal<br>
₱${strongHigh.toFixed(0)}/g below = strong deal
</div>
`;
}

function saveDeal() {
  if (!lastDeal) return;

  fetch(WEB_APP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(lastDeal)
  });
}
