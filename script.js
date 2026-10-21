// Wikipedia REST API (gratuit, fara cheie API):
// https://en.wikipedia.org/api/rest_v1/#/Page%20content/get_page_summary__title_
const API_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/";

const form = document.getElementById("facts-form");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("facts-list");
const submitBtn = document.getElementById("submit-btn");

function setError(inputId, message) {
  document.getElementById(inputId + "-error").textContent = message;
  document.getElementById(inputId).classList.toggle("invalid", Boolean(message));
}

function validate() {
  let ok = true;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const amount = Number(form.amount.value);

  setError("name", "");
  setError("email", "");
  setError("amount", "");

  if (name.length < 2) {
    setError("name", "Introdu un nume de minim 2 caractere.");
    ok = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("email", "Introdu o adresă de email validă.");
    ok = false;
  }
  if (!Number.isInteger(amount) || amount < 1 || amount > 5) {
    setError("amount", "Alege un număr între 1 și 5.");
    ok = false;
  }
  return ok;
}

// Cere rezumatul animalului si il imparte in propozitii (= curiozitati)
async function fetchFacts(animal, amount) {
  const response = await fetch(API_URL + encodeURIComponent(animal));
  if (!response.ok) throw new Error(`Eroare server (${response.status})`);
  const data = await response.json();

  const sentences = data.extract.match(/[^.!?]+[.!?]+/g) || [data.extract];
  return sentences.slice(0, amount).map((s) => ({
    text: s.trim(),
    animal: data.title,
  }));
}

function renderFacts(facts) {
  listEl.innerHTML = "";
  facts.forEach((fact) => {
    const li = document.createElement("li");
    li.textContent = fact.text; // textContent = fara risc XSS

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = `Animal: ${fact.animal} • Sursă: Wikipedia`;

    li.appendChild(meta);
    listEl.appendChild(li);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validate()) return;

  statusEl.className = "status";
  statusEl.textContent = "Se încarcă...";
  listEl.innerHTML = "";
  submitBtn.disabled = true;

  try {
    const facts = await fetchFacts(form.animal.value, Number(form.amount.value));
    statusEl.textContent = `Salut, ${form.name.value.trim()}! Iată ${facts.length} curiozități:`;
    renderFacts(facts);
  } catch (err) {
    statusEl.className = "status error-msg";
    statusEl.textContent = "Nu am putut încărca datele: " + err.message;
  } finally {
    submitBtn.disabled = false;
  }
});
