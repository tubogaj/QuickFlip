let live24k = 10000;
let lastDeal = null;

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw8bIvE__qOXduEWgvvOKzzoYnA1PJTafXN7YmnyCAcOZ61XGTmO2EO2BJSyCL_1NGF/exec";

// FETCH GOLD PRICE
async function getGoldPrice() {
  try {
    let res = await fetch("https://api.metals.live/v1/spot/gold");
    let data = await res.json();

    let usd = data[0].price;
    let rate = 56;

    live24k = (usd / 31.1035) * rate;

    livePrice.innerText = "₱" + live24k.toFixed(2) + "/g";
  } catch {
    livePrice.innerText = "₱10,000/g (fallback)";
  }
}

getGoldPrice();

// ANALYZE
function analyze() {

let w = parseFloat(weight.value);
let p = parseFloat(price.value);
let purity = parseFloat(karat.value);

if (!w || !p) return;

let market = live24k * purity;
let perGram = p / w;

let pawn = market * 0.85 * w;
let flip = market * 0.95 * w;
let full = market * w;

let flipProfit = flip - p;
let flipPct = (flipProfit / p) * 100;

// TRADE LEVELS
let suggestedBuy = market * 0.90;
let maxBuy = market * 0.95;
let breakEven = perGram;
let targetSell = market * 0.98;

// DECISION ENGINE
let ratio = perGram / market;
let rating = "";
let explanation = "";
let color = "";

if (ratio <= 0.80) {
  rating = "STEAL 🔥";
  color = "good";
  explanation = "You are entering significantly below market value. This is an elite deal with strong profit margin.";
}
else if (ratio <= 0.90) {
  rating = "STRONG BUY 💰";
  color = "good";
  explanation = "You are buying below market. This is the ideal zone for consistent flipping profits.";
}
else if (ratio <= 0.98) {
  rating = "MARGINAL ⚠️";
  color = "warn";
  explanation = "Your margin is tight. Profit depends on execution.";
}
else if (ratio <= 1.05) {
  rating = "HIGH RISK ❗";
  color = "warn";
  explanation = "You are near or above market. Profit is uncertain.";
}
else {
  rating = "AVOID ❌";
  color = "bad";
  explanation = "You are overpaying. This deal has negative edge.";
}

// SAVE
lastDeal = {
  weight: w,
  price: p,
  profit: flipProfit,
  pct: flipPct,
  rating: rating
};

// SHOW RESULT
resultCard.classList.remove("hidden");

resultCard.innerHTML = `
<div class="result-title ${color}">${rating}</div>

<div class="section">
Market: ₱${market.toFixed(2)}/g<br>
Your Entry: ₱${perGram.toFixed(2)}/g
</div>

<div class="section">${explanation}</div>

<div class="section">
<b>📊 Trade Levels</b><br><br>
Suggested Buy: ₱${suggestedBuy.toFixed(2)}/g<br>
Max Buy: ₱${maxBuy.toFixed(2)}/g<br>
Break-even: ₱${breakEven.toFixed(2)}/g<br>
Target Sell: ₱${targetSell.toFixed(2)}/g
</div>

<div class="section">
<b>💰 Profit Breakdown</b><br><br>
Pawn: ₱${pawn.toFixed(0)}<br>
Quick Flip: ₱${flip.toFixed(0)} (${flipPct.toFixed(1)}%)<br>
Full Market: ₱${full.toFixed(0)}
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
    body: JSON.stringify({
      weight: lastDeal.weight,
      price: lastDeal.price,
      profit: lastDeal.profit,
      percent: lastDeal.pct,
      rating: lastDeal.rating
    })
  })
  .then(() => {
    saveLocal(lastDeal);
    resultCard.innerHTML += "<br><span style='color:#4caf50'>Saved to cloud ✅</span>";
  });
}

// LOCAL STORAGE
function saveLocal(deal) {
  let deals = JSON.parse(localStorage.getItem("deals") || "[]");
  deals.push(deal);
  localStorage.setItem("deals", JSON.stringify(deals));
  loadDeals();
}

function loadDeals() {
  let deals = JSON.parse(localStorage.getItem("deals") || "[]");

  let total = 0;
  let html = "";

  deals.reverse().forEach(d => {
    total += d.profit;

    html += `
    <div class="deal">
    ${d.weight}g • ₱${d.price}<br>
    ${d.rating}<br>
    Profit: ₱${d.profit.toFixed(0)} (${d.pct.toFixed(1)}%)
    </div>
    `;
  });

  history.innerHTML = html;
  totalProfit.innerText = total.toFixed(0);
}

loadDeals();
