// Firebase config (esto ya lo tenés cargado correctamente en firebaseConfig.js)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import { firebaseConfig } from './firebaseConfig.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Referencias DOM
const loginForm = document.getElementById("login-form");
const loginSection = document.getElementById("loginSection");
const evaInterface = document.getElementById("evaInterface");

// Evento al enviar formulario
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = loginForm["login-email"].value;
  const password = loginForm["login-password"].value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

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
      alert("Error de inicio de sesión: " + error.message);
    });
});

// Verificar si ya está logueado
onAuthStateChanged(auth, (user) => {
  if (user && user.email === "bitsalive2025@gmail.com") {
    loginSection.style.display = "none";
    evaInterface.style.display = "block";
  }
});
