import { auth, provider, Parse } from './config.js';
import { signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const loginOverlay = document.getElementById('login-overlay');
const appLayout = document.getElementById('app-layout');
const googleLoginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');

// User profile elements
const userNameEl = document.getElementById('user-name');
const userAvatarEl = document.getElementById('user-avatar');
const profileNameEl = document.getElementById('profile-name');
const profileEmailEl = document.getElementById('profile-email');
const profileAvatarEl = document.getElementById('profile-avatar');
const profileBioEl = document.getElementById('profile-bio');
const profileTechsEl = document.getElementById('profile-techs');

let currentUserParse = null;

// Handle Google Sign-In
googleLoginBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await syncUserWithBack4App(user);
    } catch (error) {
        console.error("Error during Google Sign-In:", error);
        alert("Erro ao fazer login. Tente novamente.");
    }
});

// Handle Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        // Clear Parse Session (if any logic depends on it, but we mostly map Firebase UID to Parse Object)
        currentUserParse = null;
    } catch (error) {
        console.error("Error signing out:", error);
    }
});

// Sync Firebase User with Back4App
async function syncUserWithBack4App(firebaseUser) {
    try {
        const User = Parse.Object.extend("DeveloperUser");
        const query = new Parse.Query(User);
        query.equalTo("firebaseUid", firebaseUser.uid);
        let parseUser = await query.first();

        if (!parseUser) {
            // Create new user in Back4App
            parseUser = new User();
            parseUser.set("firebaseUid", firebaseUser.uid);
            parseUser.set("email", firebaseUser.email);
            parseUser.set("name", firebaseUser.displayName);
            parseUser.set("photoURL", firebaseUser.photoURL);
            parseUser.set("bio", "");
            parseUser.set("technologies", "");
            await parseUser.save();
        } else {
            // Update existing user just in case
            parseUser.set("name", firebaseUser.displayName);
            parseUser.set("photoURL", firebaseUser.photoURL);
            await parseUser.save();
        }

        currentUserParse = parseUser;
        updateUI(firebaseUser, parseUser);

    } catch (error) {
        console.error("Error syncing with Back4App:", error);
    }
}

// Auth State Observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        appLayout.classList.remove('hidden');
        loginOverlay.classList.add('hidden');

        // Ensure Back4App sync is done even on reload
        await syncUserWithBack4App(user);

        // Dispatch an event to let other modules know auth is ready
        document.dispatchEvent(new CustomEvent('authReady', { detail: { firebaseUser: user, parseUser: currentUserParse } }));
    } else {
        // User is signed out
        appLayout.classList.add('hidden');
        loginOverlay.classList.remove('hidden');
        currentUserParse = null;
    }
});

// Update UI with User Data
function updateUI(firebaseUser, parseUser) {
    // Sidebar
    userNameEl.textContent = firebaseUser.displayName;
    userAvatarEl.src = firebaseUser.photoURL || 'https://via.placeholder.com/40';

    // Profile View
    if (profileNameEl) profileNameEl.textContent = firebaseUser.displayName;
    if (profileEmailEl) profileEmailEl.textContent = firebaseUser.email;
    if (profileAvatarEl) profileAvatarEl.src = firebaseUser.photoURL || 'https://via.placeholder.com/150';

    if (parseUser) {
        if (profileBioEl) profileBioEl.value = parseUser.get('bio') || '';
        if (profileTechsEl) profileTechsEl.value = parseUser.get('technologies') || '';
    }
}

// Save Profile handler (exporting so we can attach it later or handle it here)
document.getElementById('save-profile-btn')?.addEventListener('click', async () => {
    if (!currentUserParse) return;

    const saveBtn = document.getElementById('save-profile-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Salvando...';
    saveBtn.disabled = true;

    try {
        currentUserParse.set("bio", profileBioEl.value);
        currentUserParse.set("technologies", profileTechsEl.value);
        await currentUserParse.save();

        // Visual feedback
        saveBtn.textContent = 'Salvo!';
        saveBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        saveBtn.classList.add('bg-green-600', 'hover:bg-green-700');

        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
            saveBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            saveBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }, 2000);

    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Erro ao salvar o perfil.");
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
});

export { currentUserParse };
