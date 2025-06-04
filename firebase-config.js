import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCtXcfK0NYOP2spL3_ZImGwvlouIcATuGM",
  authDomain: "hairhub-team.firebaseapp.com",
  projectId: "hairhub-team",
  storageBucket: "hairhub-team.firebasestorage.app",
  messagingSenderId: "1034035650959",
  appId: "1:1034035650959:web:90139b0d94da6c4c046bfa",
  measurementId: "G-5DRH19FHGT"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
