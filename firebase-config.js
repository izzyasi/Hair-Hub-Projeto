import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD5Z1J60_Ky3DUn9me799LR4WN3fD_Sz8Q",
  authDomain: "hair-hub-7b073.firebaseapp.com",
  projectId: "hair-hub-7b073",
  storageBucket: "hair-hub-7b073.appspot.com",
  messagingSenderId: "622571742843",
  appId: "1:622571742843:web:ff78917a0e4df03db7e4de",
  measurementId: "G-KGSHS7E8HZ"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
