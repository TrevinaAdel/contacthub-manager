
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const form = document.getElementById("contactForm");

const contactIdInput = document.getElementById("contactId");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const addressInput = document.getElementById("address");
const groupInput = document.getElementById("group");
const notesInput = document.getElementById("notes");
const isFavoriteInput = document.getElementById("isFavorite");
const isEmergencyInput = document.getElementById("isEmergency");

const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");
const changePhotoBtn = document.getElementById("changePhotoBtn");

const searchInput = document.getElementById("searchInput");
const contactsList = document.getElementById("contactsList");
const emptyState = document.getElementById("emptyState");
const favList = document.getElementById("favList");
const emergencyList = document.getElementById("emergencyList");

const totalCount = document.getElementById("totalCount");
const favCount = document.getElementById("favCount");
const emergencyCount = document.getElementById("emergencyCount");
const subCount = document.getElementById("subCount");


let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

function saveToStorage() {
  localStorage.setItem("contacts", JSON.stringify(contacts));
}


function getInitials(name) {
  const words = name.trim().split(" ");
  const first = words[0][0] || "";
  const second = words.length > 1 ? words[1][0] : "";
  return (first + second).toUpperCase();
}


function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}


function avatarHTML(contact) {
  return contact.photo
    ? `<img src="${contact.photo}" alt="">`
    : escapeHTML(getInitials(contact.name));
}

let currentPhoto = "";

function setPhotoPreview(src) {
  currentPhoto = src;
  photoPreview.innerHTML = src
    ? `<img src="${src}" alt="photo">`
    : '<i class="fa-solid fa-user"></i>';
}

changePhotoBtn.addEventListener("click", () => photoInput.click());

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) return;


  if (file.size > 1024 * 1024) {
    Swal.fire({
      icon: "error",
      title: "Image too large",
      text: "Please choose an image smaller than 1MB",
    });
    photoInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => setPhotoPreview(reader.result);
  reader.readAsDataURL(file);
});

function openModal(isEdit = false) {
  modal.classList.add("show");
  modalTitle.textContent = isEdit ? "Update Contact" : "Add New Contact";
}

function closeModal() {
  modal.classList.remove("show");
  form.reset();
  setPhotoPreview("");
  photoInput.value = "";
  contactIdInput.value = "";
  clearErrors();
}

openModalBtn.addEventListener("click", () => openModal(false));
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);


modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});


function clearErrors() {
  ["name", "phone", "email"].forEach((field) => {
    document.getElementById(field + "Error").textContent = "";
    document.getElementById(field).classList.remove("invalid");
  });
}

function showError(field, message) {
  document.getElementById(field + "Error").textContent = message;
  document.getElementById(field).classList.add("invalid");
}

function validateForm() {
  clearErrors();
  let valid = true;

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim().replace(/\s+/g, "");
  const email = emailInput.value.trim();
  const currentId = contactIdInput.value;


  const nameRegex = /^[A-Za-z\u0600-\u06FF\s]{2,}$/;
  if (name === "") {
    showError("name", "Name is required");
    valid = false;
  } else if (!nameRegex.test(name)) {
    showError("name", "Name must contain letters only (min 2 characters)");
    valid = false;
  }


  const phoneRegex = /^\+?[0-9]{10,15}$/;
  if (phone === "") {
    showError("phone", "Phone is required");
    valid = false;
  } else if (!phoneRegex.test(phone)) {
    showError("phone", "Enter a valid phone number (10-15 digits)");
    valid = false;
  } else {
  
    const duplicate = contacts.some(
      (c) => c.phone === phone && c.id !== currentId
    );
    if (duplicate) {
      showError("phone", "This phone number already exists");
      valid = false;
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (email !== "" && !emailRegex.test(email)) {
    showError("email", "Enter a valid email address");
    valid = false;
  }

  return valid;
}


form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const id = contactIdInput.value;

  const data = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim().replace(/\s+/g, ""),
    email: emailInput.value.trim(),
    address: addressInput.value.trim(),
    group: groupInput.value,
    notes: notesInput.value.trim(),
    photo: currentPhoto,
    isFavorite: isFavoriteInput.checked,
    isEmergency: isEmergencyInput.checked,
  };

  if (id) {
    const index = contacts.findIndex((c) => c.id === id);
    contacts[index] = { ...contacts[index], ...data };
    Swal.fire({
      icon: "success",
      title: "Updated!",
      text: "Contact updated successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  } else {
    contacts.push({ id: Date.now().toString(), ...data });
    Swal.fire({
      icon: "success",
      title: "Added!",
      text: "Contact added successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  }

  saveToStorage();
  closeModal();
  renderAll();
});


function deleteContact(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This contact will be deleted permanently!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e11d48",
    cancelButtonColor: "#64748b",
    confirmButtonText: "Yes, delete it",
  }).then((result) => {
    if (result.isConfirmed) {
      contacts = contacts.filter((c) => c.id !== id);
      saveToStorage();
      renderAll();
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        timer: 1300,
        showConfirmButton: false,
      });
    }
  });
}


function editContact(id) {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;

  contactIdInput.value = contact.id;
  nameInput.value = contact.name;
  phoneInput.value = contact.phone;
  emailInput.value = contact.email;
  addressInput.value = contact.address || "";
  groupInput.value = contact.group || "";
  notesInput.value = contact.notes || "";
  isFavoriteInput.checked = contact.isFavorite;
  isEmergencyInput.checked = contact.isEmergency;
  setPhotoPreview(contact.photo || "");

  openModal(true);
}


function toggleFavorite(id) {
  const contact = contacts.find((c) => c.id === id);
  contact.isFavorite = !contact.isFavorite;
  saveToStorage();
  renderAll();
}


function getFilteredContacts() {
  const term = searchInput.value.trim().toLowerCase();

  if (term === "") return contacts;

  return contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      (c.email || "").toLowerCase().includes(term)
  );
}

function renderContacts() {
  const filtered = getFilteredContacts();

  contactsList.innerHTML = filtered
    .map(
      (c) => `
      <div class="contact-card">
        <div class="contact-avatar">${avatarHTML(c)}</div>

        <div class="contact-info">
          <h3>
            ${escapeHTML(c.name)}
            ${c.isEmergency ? '<span class="badge-emg">Emergency</span>' : ""}
            ${c.group ? `<span class="badge-group">${escapeHTML(c.group)}</span>` : ""}
          </h3>
          <p><i class="fa-solid fa-phone"></i> ${escapeHTML(c.phone)}</p>
          ${c.email ? `<p><i class="fa-solid fa-envelope"></i> ${escapeHTML(c.email)}</p>` : ""}
        </div>

        <div class="contact-actions">
          <a class="action-btn call" href="tel:${escapeHTML(c.phone)}" title="Call">
            <i class="fa-solid fa-phone"></i>
          </a>
          ${
            c.email
              ? `<a class="action-btn mail" href="mailto:${escapeHTML(c.email)}" title="Email">
                   <i class="fa-solid fa-envelope"></i>
                 </a>`
              : ""
          }
          <button class="action-btn fav ${c.isFavorite ? "active" : ""}"
                  onclick="toggleFavorite('${c.id}')" title="Favorite">
            <i class="fa-solid fa-star"></i>
          </button>
          <button class="action-btn edit" onclick="editContact('${c.id}')" title="Edit">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="action-btn delete" onclick="deleteContact('${c.id}')" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `
    )
    .join("");


  emptyState.style.display = filtered.length === 0 ? "block" : "none";
}

function miniContactHTML(c) {
  return `
    <div class="mini-contact">
      <div class="contact-avatar">${avatarHTML(c)}</div>
      <div class="mini-info">
        <strong>${escapeHTML(c.name)}</strong>
        <span>${escapeHTML(c.phone)}</span>
      </div>
      <a class="mini-call" href="tel:${escapeHTML(c.phone)}">
        <i class="fa-solid fa-phone"></i>
      </a>
    </div>
  `;
}

function renderSidebar() {
  const favs = contacts.filter((c) => c.isFavorite);
  const emergencies = contacts.filter((c) => c.isEmergency);

  favList.innerHTML =
    favs.length > 0
      ? favs.map(miniContactHTML).join("")
      : '<p class="side-empty">No favorites yet</p>';

  emergencyList.innerHTML =
    emergencies.length > 0
      ? emergencies.map(miniContactHTML).join("")
      : '<p class="side-empty">No emergency contacts</p>';
}

function renderStats() {
  totalCount.textContent = contacts.length;
  subCount.textContent = contacts.length;
  favCount.textContent = contacts.filter((c) => c.isFavorite).length;
  emergencyCount.textContent = contacts.filter((c) => c.isEmergency).length;
}

function renderAll() {
  renderContacts();
  renderSidebar();
  renderStats();
}


searchInput.addEventListener("input", renderContacts);

renderAll();