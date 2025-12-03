// ----------------------------------------------------------
// Configuration
// ----------------------------------------------------------
const participants = [
    "GrandPa",
    "GrandMa",
    "Arnaud",
    "Julie",
    "Valérie",
    "Maxime",
    "Fanny",
    "Corentin"
];

// Date limite : après cette date → purge + blocage
const expirationDate = new Date("2025-12-27");
const today = new Date();

// Récupération du conteneur
const appDiv = document.getElementById("app");

// ----------------------------------------------------------
// Expiration
// ----------------------------------------------------------
if (today >= expirationDate) {
    localStorage.clear();
    appDiv.innerHTML = `
        <div class="expired">
            L’application de cacahuète est expirée depuis le 26 décembre 2025.<br><br>
            Les données ont été supprimées.
        </div>
    `;
    throw new Error("Application expirée");
}

// ----------------------------------------------------------
// Reset secret (pour toi uniquement)
// ----------------------------------------------------------
const SECRET_RESET_CODE = "RESET"; // change la valeur si tu veux

function checkResetRequest() {
    const params = new URLSearchParams(window.location.search);
    const resetCode = params.get("reset");

    if (resetCode && resetCode === SECRET_RESET_CODE) {
        localStorage.clear();
        appDiv.innerHTML = `
            <h1>Reset effectué</h1>
            <p>Toutes les données locales ont été effacées.</p>
            <button onclick="window.location.href='index.html'">Recharger</button>
        `;
        throw new Error("Reset triggered");
    }
}

checkResetRequest();

// ----------------------------------------------------------
// Stockage
// ----------------------------------------------------------
function loadData() {
    return JSON.parse(localStorage.getItem("cacahuete") || "{}");
}
function saveData(data) {
    localStorage.setItem("cacahuete", JSON.stringify(data));
}
function countAssigned() {
    return Object.keys(loadData()).length;
}

// ----------------------------------------------------------
// Rendu
// ----------------------------------------------------------
function render(html) {
    appDiv.innerHTML = html;
}

// ----------------------------------------------------------
// Écran 1 – Sélection du participant
// Boutons désactivés si déjà utilisés
// ----------------------------------------------------------
let currentUser = null;
let selectedTarget = null;

function screenChooseParticipant() {
    const data = loadData();

    const buttonsHtml = participants.map(name => {
        const already = !!data[name];
        const disabledAttr = already ? "disabled class='used'" : "";
        const onClick = already ? "" : `onclick="startFor('${name}')"`;

        return `<button ${onClick} ${disabledAttr}>${name}</button>`;
    }).join("");

    render(`
        <h1>Cacahuète 2025</h1>
        <h2>Qui es-tu ?</h2>

        <div class="grid">${buttonsHtml}</div>

        <div class="footer-info">
            ${countAssigned()} / 8 participants ont déjà encodé leur cacahuète.
        </div>
    `);
}

// ----------------------------------------------------------
// Démarrage pour un participant
// Impossible de revoir son tirage : s’il existe déjà → retour accueil
// ----------------------------------------------------------
function startFor(name) {
    const data = loadData();

    if (data[name]) {
        screenChooseParticipant();
        return;
    }

    currentUser = name;
    selectedTarget = null;
    showSelectionScreen();
}

// ----------------------------------------------------------
// Écran 2 – Sélection du tiré
// Impossible de tirer soi-même
// Impossible de tirer quelqu’un déjà attribué
// Explication volontairement générique (secret)
// ----------------------------------------------------------
function showSelectionScreen(alertMsg = "") {
    render(`
        <h1>Cacahuète 2025</h1>
        <p>Tu es : <strong>${currentUser}</strong></p>

        ${alertMsg ? `<div class="alert">${alertMsg}</div>` : ""}

        <h2>Qui as-tu pêché ?</h2>

        <div class="grid">
            ${participants.map(p => `
                <button onclick="selectTarget('${p}')">${p}</button>
            `).join("")}
        </div>

        <div class="footer-info">
            ${countAssigned()} / 8 participants ont déjà encodé leur cacahuète.
        </div>
    `);
}

// ----------------------------------------------------------
// Contrôle des doublons + interdiction de se tirer soi-même
// ----------------------------------------------------------
function selectTarget(target) {
    const data = loadData();
    const assignedValues = Object.values(data);

    // Impossible de se tirer soi-même
    if (target === currentUser) {
        showSelectionScreen("Ce choix n'est pas possible. Merci de choisir une autre personne.");
        return;
    }

    // Personne déjà attribuée
    if (assignedValues.includes(target)) {
        showSelectionScreen("Ce choix n'est pas possible. Merci de choisir une autre personne.");
        return;
    }

    selectedTarget = target;
    confirmChoice();
}

// ----------------------------------------------------------
// Confirmation
// ----------------------------------------------------------
function confirmChoice() {
    render(`
        <h1>Confirmation</h1>
        <p>Tu es : <strong>${currentUser}</strong></p>
        <p>Tu as sélectionné : <strong>${selectedTarget}</strong></p>

        <div class="confirm-box">
            <button style="background:#c6e1c6" onclick="saveChoice()">Confirmer</button>
            <button onclick="showSelectionScreen()">Annuler</button>
        </div>
    `);
}

// ----------------------------------------------------------
// Sauvegarde + retour écran d'accueil
// ----------------------------------------------------------
function saveChoice() {
    const data = loadData();
    data[currentUser] = selectedTarget;
    saveData(data);

    render(`
        <h1>Merci !</h1>
        <p>C’est enregistré.</p>
        <button onclick="screenChooseParticipant()">Retour à l’accueil</button>
    `);
}

// Lancement
screenChooseParticipant();
