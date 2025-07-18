
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Bienvenido a EVA");
      // Redirigir o activar funciones de EVA
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
};
