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
const expirationDate = new Date("2025-12-27"); // Le 27 à 00:00 = après le 26
const today = new Date();

// Purge si expiration dépassée
if (today >= expirationDate) {
    localStorage.clear();
    document.getElementById("app").innerHTML = `
        <div class="expired">
            🎄 L’application de cacahuète est expirée depuis le 26 décembre 2025.<br><br>
            Les données ont été supprimées.
        </div>
    `;
    throw new Error("Application expirée");
}


// ----------------------------------------------------------
// Stockage
// - localStorage.setItem("cacahuete", JSON.stringify({ donneur: tire }))
// Structure : { "GrandPa" : "Julie", ... }
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
// Rendu dynamique dans #app
// ----------------------------------------------------------
function render(html) {
    document.getElementById("app").innerHTML = html;
}


// ----------------------------------------------------------
// Écran 1 : choix du participant
// ----------------------------------------------------------
function screenChooseParticipant() {
    render(`
        <h1>🎄 Cacahuète 2025</h1>
        <h2>Qui es-tu ?</h2>

        <div class="grid">
            ${participants.map(p => `<button onclick="startFor('${p}')">${p}</button>`).join("")}
        </div>

        <div class="footer-info">
            ${countAssigned()} / 8 participants ont déjà encodé leur cacahuète.
        </div>
    `);
}


// ----------------------------------------------------------
// Écran 2 : choix du tiré
// ----------------------------------------------------------
let currentUser = null;
let selectedTarget = null;

function startFor(name) {
    currentUser = name;

    const stored = loadData();
    const already = stored[name];

    // Si déjà encodé → afficher directement le tirage
    if (already) {
        render(`
            <h1>🎄 Cacahuète 2025</h1>
            <p>Tu es : <strong>${name}</strong></p>
            <h2>Tu as pêché : <span style="color:green">${already}</span></h2>
            <button onclick="screenChooseParticipant()">Retour</button>
        `);
        return;
    }

    showSelectionScreen();
}

function showSelectionScreen(alertMsg = "") {
    render(`
        <h1>🎄 Cacahuète 2025</h1>
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
// Vérification doublon + confirmation
// ----------------------------------------------------------
function selectTarget(target) {
    const stored = loadData();
    const assignedValues = Object.values(stored);

    if (assignedValues.includes(target)) {
        showSelectionScreen("Cette personne a déjà été attribuée. Merci de choisir quelqu’un d’autre.");
        return;
    }

    selectedTarget = target;
    confirmChoice();
}

function confirmChoice() {
    render(`
        <h1>🎄 Confirmation</h1>
        <p>Tu es : <strong>${currentUser}</strong></p>
        <p>Tu as sélectionné : <strong>${selectedTarget}</strong></p>

        <div class="confirm-box">
            <button style="background:#c6e1c6" onclick="saveChoice()">Confirmer</button>
            <button onclick="showSelectionScreen()">Annuler</button>
        </div>
    `);
}


// ----------------------------------------------------------
// Sauvegarde
// ----------------------------------------------------------
function saveChoice() {
    const data = loadData();
    data[currentUser] = selectedTarget;
    saveData(data);

    render(`
        <h1>🎄 Merci !</h1>
        <p>C’est enregistré.</p>
        <button onclick="screenChooseParticipant()">OK</button>
    `);
}


// Lancer l’écran d’accueil
screenChooseParticipant();
