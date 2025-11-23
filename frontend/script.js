const API_URL = "http://127.0.0.1:8000";

let allMedicines = [];
let activeMedicine = null;

document.addEventListener("DOMContentLoaded", () => {
  fetchAveragePrice();
  fetchAllMedicines();
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
async function fetchAllMedicines() {
  const listEl = document.getElementById("med-list");
  listEl.innerHTML = "<p>Loading medicines...</p>";

  try {
    const res = await fetch(`${API_URL}/medicines`);
    if (!res.ok) throw new Error("Failed to fetch medicines");

    const data = await res.json();
    const medicines = data.medicines || [];

    allMedicines = medicines;
    openCard = null; 

    if (!medicines.length) {
      listEl.innerHTML = "<p>No medicines found.</p>";
      return;
    }

    renderMedicines(medicines);
  } catch (err) {
    console.error(err);
    listEl.innerHTML =
      "<p class='error'>Error loading medicines. Please try again.</p>";
  }
}



function renderMedicines(medicines) {
  const listEl = document.getElementById("med-list");
  listEl.innerHTML = "";

  medicines.forEach((med) => {
    const originalName = med.name || "";
    let displayName = med.name;
    if (!displayName || displayName.trim() === "") {
      displayName = "Unknown medicine";
    }

    const price = med.price;
    let priceDisplay = "N/A";
    if (typeof price === "number") {
      priceDisplay = `£${price.toFixed(2)}`;
    }

    const card = document.createElement("div");
    card.className = "medicine-card";
    card.dataset.name = originalName;

    card.innerHTML = `
      <div class="med-main">
        <div class="med-header">
          <h3>${displayName}</h3>
          <span class="med-toggle-icon">▾</span>
        </div>
        <p><strong>Price:</strong> ${priceDisplay}</p>
      </div>
      <div class="med-actions hidden">
        <button type="button" class="primary-btn small update-btn">Update</button>
        <button type="button" class="primary-btn danger-btn small delete-btn">Delete</button>
      </div>
    `;

    const actions = card.querySelector(".med-actions");
    const updateBtn = card.querySelector(".update-btn");
    const deleteBtn = card.querySelector(".delete-btn");

   
    card.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;


      if (openCard && openCard !== card) {
        const prevActions = openCard.querySelector(".med-actions");
        if (prevActions) prevActions.classList.add("hidden");
        openCard.classList.remove("expanded");
      }

      const isHidden = actions.classList.contains("hidden");
      if (isHidden) {
        actions.classList.remove("hidden");
        card.classList.add("expanded");
        openCard = card;
      } else {
        actions.classList.add("hidden");
        card.classList.remove("expanded");
        openCard = null;
      }
    });


    updateBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleUpdateMedicine(med);
    });


    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleDeleteMedicine(med);
    });

    listEl.appendChild(card);
  });
}
