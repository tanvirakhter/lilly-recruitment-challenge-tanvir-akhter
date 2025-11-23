const API_URL = "http://127.0.0.1:8000";

let allMedicines = [];
let activeMedicine = null;

document.addEventListener("DOMContentLoaded", () => {
  fetchAveragePrice();
});



async function fetchAveragePrice() {
  const avgEl = document.getElementById("avg-price");
  const countEl = document.getElementById("count");

  avgEl.textContent = "Loading...";
  countEl.textContent = "Loading...";

  try {
    const res = await fetch(`${API_URL}/medicines/average-price`);
    if (!res.ok) throw new Error("Failed to fetch average price");
    const data = await res.json();

    if (data.average_price === null) {
      avgEl.textContent = "N/A";
    } else {
      avgEl.textContent = `£${data.average_price.toFixed(2)}`;
    }
    countEl.textContent = data.count ?? 0;
  } catch (err) {
    console.error(err);
    avgEl.textContent = "Error";
    countEl.textContent = "-";
  }
}