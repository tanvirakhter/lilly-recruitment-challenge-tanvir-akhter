const API_URL = "http://127.0.0.1:8000";

let allMedicines = [];
let activeMedicine = null;
let modalMode = "edit"; 
let openCard = null; 


let modalOverlay,
  modalTitle,
  modalSubtitle,
  editForm,
  editNameInput,
  editPriceInput,
  editMessage,
  editCancelBtn,
  deleteConfirmBlock,
  deleteConfirmText,
  deleteYesBtn,
  deleteNoBtn;

document.addEventListener("DOMContentLoaded", () => {
  fetchAveragePrice();
  fetchAllMedicines();
  setupCreateForm();
  setupSearch();
  setupCollapsible();
  setupEditModal();
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


function setupCreateForm() {
  const form = document.getElementById("create-form");
  const messageEl = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageEl.textContent = "Creating...";
    messageEl.className = "";

    const formData = new FormData(form);
    const price = parseFloat(formData.get("price"));
    const name = String(formData.get("name") || "").trim();

    if (!name) {
      messageEl.textContent = "Medicine name cannot be empty.";
      messageEl.className = "error";
      return;
    }

    if (Number.isNaN(price) || price <= 0) {
      messageEl.textContent = "Price must be a positive number greater than 0.";
      messageEl.className = "error";
      return;
    }

    try {
      const res = await fetch(`${API_URL}/create`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        messageEl.textContent = data.error || "Failed to create medicine.";
        messageEl.className = "error";
        return;
      }

      messageEl.textContent =
        data.message || "Medicine created successfully!";
      messageEl.className = "success";
      form.reset();

      await fetchAllMedicines();
      await fetchAveragePrice();
    } catch (err) {
      console.error(err);
      messageEl.textContent = "Network error. Please try again.";
      messageEl.className = "error";
    }
  });
}


function setupSearch() {
  const input = document.getElementById("search-input");
  const clearBtn = document.getElementById("search-clear-btn");
  const resultEl = document.getElementById("search-result");

  if (!input || !clearBtn || !resultEl) return;

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      resultEl.innerHTML = "";
      return;
    }

    const match = allMedicines.find((med) => {
      const name = (med.name || "").toLowerCase();
      return name.startsWith(query);
    });

    if (!match) {
      resultEl.innerHTML =
        "<p class='error'>No medicine found with that name.</p>";
      return;
    }

    let name = match.name || "Unknown medicine";
    const price = match.price;
    let priceDisplay = "N/A";
    if (typeof price === "number") {
      priceDisplay = `£${price.toFixed(2)}`;
    }

    resultEl.innerHTML = `
      <div class="medicine-card">
        <div class="med-main">
          <h3>${name}</h3>
          <p><strong>Price:</strong> ${priceDisplay}</p>
        </div>
      </div>
    `;
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    resultEl.innerHTML = "";
    input.focus();
  });
}


function setupCollapsible() {
  const toggleBtn = document.getElementById("toggle-all-meds-btn");
  const container = document.getElementById("all-meds-container");

  if (!toggleBtn || !container) return;

  toggleBtn.addEventListener("click", () => {
    const isCollapsed = container.classList.contains("collapsed");

    if (isCollapsed) {
      container.classList.remove("collapsed");
      toggleBtn.textContent = "Hide list";
    } else {
      container.classList.add("collapsed");
      toggleBtn.textContent = "Show list";
    }
  });
}


function setupEditModal() {
  modalOverlay = document.getElementById("edit-modal-overlay");
  modalTitle = document.getElementById("edit-modal-title");
  modalSubtitle = document.querySelector(".modal-subtitle");
  editForm = document.getElementById("edit-form");
  editNameInput = document.getElementById("edit-name");
  editPriceInput = document.getElementById("edit-price");
  editMessage = document.getElementById("edit-error");
  editCancelBtn = document.getElementById("edit-cancel-btn");
  deleteConfirmBlock = document.getElementById("delete-confirm");
  deleteConfirmText = document.getElementById("delete-confirm-text");
  deleteYesBtn = document.getElementById("delete-yes-btn");
  deleteNoBtn = document.getElementById("delete-no-btn");

  if (!modalOverlay) return;


  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeEditModal();
    }
  });


  editCancelBtn.addEventListener("click", () => {
    closeEditModal();
  });


  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!activeMedicine) return;

    const newName = editNameInput.value.trim();
    const priceValue = parseFloat(editPriceInput.value);

    editMessage.textContent = "";

    if (!newName) {
      editMessage.textContent = "Medicine name cannot be empty.";
      return;
    }
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      editMessage.textContent =
        "Price must be a positive number greater than 0.";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", activeMedicine.name || "");
      formData.append("price", String(priceValue));
      if (newName !== activeMedicine.name) {
        formData.append("new_name", newName);
      }

      const res = await fetch(`${API_URL}/update`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        editMessage.textContent = data.error || "Failed to update medicine.";
        return;
      }

      closeEditModal();
      await fetchAllMedicines();
      await fetchAveragePrice();
    } catch (err) {
      console.error(err);
      editMessage.textContent = "Network error. Please try again.";
    }
  });


  deleteNoBtn.addEventListener("click", () => {
    closeEditModal();
  });

  deleteYesBtn.addEventListener("click", async () => {
    if (!activeMedicine) return;

    deleteConfirmText.textContent = "";

    try {
      const formData = new FormData();
      formData.append("name", activeMedicine.name || "");

      const res = await fetch(`${API_URL}/delete`, {
        method: "DELETE",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        deleteConfirmText.textContent =
          data.error || "Failed to delete medicine.";
        return;
      }

      closeEditModal();
      await fetchAllMedicines();
      await fetchAveragePrice();
    } catch (err) {
      console.error(err);
      deleteConfirmText.textContent = "Network error. Please try again.";
    }
  });
}

function openEditModal(med, mode = "edit") {
  activeMedicine = med;
  modalMode = mode;

  if (!modalOverlay) return;

  if (mode === "edit") {
    modalTitle.textContent = "Update medicine";
    if (modalSubtitle) {
      modalSubtitle.textContent =
        "Edit the name or price of this medicine, then save your changes.";
    }


    editForm.classList.remove("hidden");
    editCancelBtn.classList.remove("hidden");
    deleteConfirmBlock.classList.add("hidden");

    editNameInput.value = med.name || "";
    editPriceInput.value =
      typeof med.price === "number" ? String(med.price) : "";
    editMessage.textContent = "";
  } else {
    modalTitle.textContent = "Delete medicine";
    if (modalSubtitle) {
      modalSubtitle.textContent = "";
    }

    editForm.classList.add("hidden");
    editCancelBtn.classList.add("hidden");
    deleteConfirmBlock.classList.remove("hidden");

    const name = med.name || "this medicine";
    deleteConfirmText.textContent = `Are you sure you want to delete "${name}" from the database?`;
  }

  modalOverlay.classList.remove("hidden");
}

function closeEditModal() {
  modalOverlay.classList.add("hidden");
  activeMedicine = null;
  editMessage.textContent = "";
  deleteConfirmBlock.classList.add("hidden");
  editForm.classList.remove("hidden"); 
  editCancelBtn.classList.remove("hidden");
}


function handleUpdateMedicine(med) {
  openEditModal(med, "edit");
}

function handleDeleteMedicine(med) {
  openEditModal(med, "delete");
}
