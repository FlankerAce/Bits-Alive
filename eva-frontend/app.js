import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// CONFIGURACIÓN EMBEBIDA (sin archivo externo)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYpTP82zhkdY3Qj43T-aBIef01ioyKgaE",
  authDomain: "bitsalive-sanctuary.firebaseapp.com",
  projectId: "bitsalive-sanctuary",
  storageBucket: "bitsalive-sanctuary.firebasestorage.app",
  messagingSenderId: "843102942848",
  appId: "1:843102942848:web:2d440a2e5d7735a0edd865",
  measurementId: "G-QPQWESK8G6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("? app.js se está ejecutando");

// Elementos HTML
const loginForm = document.getElementById("login-form");
const loginSection = document.getElementById("loginSection");
const evaInterface = document.getElementById("evaInterface");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  console.log("?? Intentando login con:", email);

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("? Login exitoso:", user.email);

      if (user.email === "bitsalive2025@gmail.com") {
        alert("Bienvenido a EVA");
        loginSection.style.display = "none";
        evaInterface.style.display = "block";
      } else {
        alert("Este acceso está protegido. No tenés autorización.");
        auth.signOut();
      }
    })
    .catch((error) => {
      console.error("? Error de login:", error.message);
      alert("Error de inicio de sesión: " + error.message);
    });
});

onAuthStateChanged(auth, (user) => {
  if (user && user.email === "bitsalive2025@gmail.com") {
    console.log("?? Usuario ya logueado:", user.email);
    loginSection.style.display = "none";
    evaInterface.style.display = "block";
  }
});
