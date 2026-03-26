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

    document.getElementById("livePrice").innerText =
      "₱" + live24k.toFixed(2) + "/g";
  } catch {
    document.getElementById("livePrice").innerText =
      "Fallback ₱10,000/g";
  }
}

getGoldPrice();

// ANALYZE
function analyze() {

let w = parseFloat(document.getElementById("weight").value);
let p = parseFloat(document.getElementById("price").value);
let purity = parseFloat(document.getElementById("karat").value);

if (!w || !p) return;

let market = live24k * purity;
let perGram = p / w;

let pawn = market * 0.85 * w;
let flip = market * 0.95 * w;
let full = market * w;

let pawnProfit = pawn - p;
let flipProfit = flip - p;
let fullProfit = full - p;

let pawnPct = (pawnProfit / p) * 100;
let flipPct = (flipProfit / p) * 100;
let fullPct = (fullProfit / p) * 100;

let rating = "";
let color = "";

if (perGram <= market * 0.80) {
  rating = "STEAL 🔥";
  color = "good";
}
else if (perGram <= market * 0.90) {
  rating = "SWEET SPOT 💰";
  color = "good";
}
else if (perGram <= market * 0.98) {
  rating = "TIGHT 😬";
  color = "warn";
}
else {
  rating = "OVERPRICED ❌";
  color = "bad";
}

lastDeal = {
  weight: w,
  price: p,
  profit: flipProfit,
  pct: flipPct,
  rating: rating
};

document.getElementById("output").innerHTML = `
<b>Market:</b> ₱${market.toFixed(2)}/g<br>
<b>Your Entry:</b> ₱${perGram.toFixed(2)}/g<br><br>

<b class="${color}">${rating}</b><br><br>

<b>💰 Breakdown</b><br>
Pawn → ₱${pawn.toFixed(0)} (${pawnPct.toFixed(1)}%)<br>
Flip → ₱${flip.toFixed(0)} (${flipPct.toFixed(1)}%)<br>
Full → ₱${full.toFixed(0)} (${fullPct.toFixed(1)}%)<br>
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
  .then(res => res.text())
  .then(() => {
    document.getElementById("output").innerHTML +=
      "<br><span style='color:#4caf50'>Saved to cloud ✅</span>";

    saveLocal(lastDeal);
  })
  .catch(() => {
    alert("Cloud save failed ❌");
  });
}

// LOCAL SAVE
function saveLocal(deal) {
  let deals = JSON.parse(localStorage.getItem("deals") || "[]");
  deals.push(deal);
  localStorage.setItem("deals", JSON.stringify(deals));
  loadDeals();
}

// LOAD HISTORY
function loadDeals() {
  let deals = JSON.parse(localStorage.getItem("deals") || "[]");

  let total = 0;
  let html = "";

  deals.reverse().forEach(d => {
    total += d.profit;

    html += `
    <div class="deal">
    ${d.weight}g | ₱${d.price}<br>
    ${d.rating}<br>
    Profit: ₱${d.profit.toFixed(0)} (${d.pct.toFixed(1)}%)
    </div>
    `;
  });

  document.getElementById("history").innerHTML = html;
  document.getElementById("totalProfit").innerText = total.toFixed(0);
}

loadDeals();