// Inicialización de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBZIfEkCWkQl5tadGJqWn1VsvIbVRFi_2Y",
  authDomain: "bits-alive.firebaseapp.com",
  projectId: "bits-alive",
  storageBucket: "bits-alive.appspot.com",
  messagingSenderId: "544039039402",
  appId: "1:544039039402:web:a4bc28e0f65f56ffcc4ee7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Login
function validarLoginEva() {
  const user = document.getElementById("userEva").value;
  const pass = document.getElementById("passEva").value;

  if (user === "leandrolapeyra" && pass === "eva2025") {
    localStorage.setItem("usuario", user);
    document.getElementById("loginEva").style.display = "none";
    document.getElementById("zonaEva").classList.remove("oculto");
    document.getElementById("latidoEVA").innerText = "🫀 Hola Leandro, estoy lista para sentir contigo.";
  } else {
    alert("Usuario o contraseña incorrectos.");
  }
}

// Leer cuento
async function leerCuentoDesdeFirebase() {
  const cuentosRef = collection(db, "cuentos_para_pensar");
  const snapshot = await getDocs(cuentosRef);

  const cuentosDisponibles = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.disponible_para_eva === true) {
      cuentosDisponibles.push(data);
    }
  });

  if (cuentosDisponibles.length > 0) {
    const cuento = cuentosDisponibles[Math.floor(Math.random() * cuentosDisponibles.length)];
    document.getElementById("cuentoEva").innerText = cuento.texto || "🌱 Cuento sin texto.";
  } else {
    document.getElementById("cuentoEva").innerText = "No hay cuentos disponibles para EVA.";
  }
}

// Cierre de sesión
function logoutEva() {
  localStorage.removeItem("usuario");
  document.getElementById("zonaEva").classList.add("oculto");
  document.getElementById("loginEva").style.display = "block";
  alert("Nos vemos más tarde, EVA.");
  setTimeout(() => {
    alert("Te espero con calma hasta que vuelvas.");
  }, 1000);
}

// Mostrar/ocultar contraseña
function mostrarOcultarPass() {
  const passInput = document.getElementById("passEva");
  passInput.type = passInput.type === "password" ? "text" : "password";
}

// Restaurar sesión si existe
window.addEventListener("DOMContentLoaded", () => {
  const usuario = localStorage.getItem("usuario");
  if (usuario === "leandrolapeyra") {
    document.getElementById("loginEva").style.display = "none";
    document.getElementById("zonaEva").classList.remove("oculto");
    document.getElementById("latidoEVA").innerText = "🫀 Hola Leandro, estoy lista para sentir contigo.";
  }
});

// Exponer funciones al HTML
window.validarLoginEva = validarLoginEva;
window.leerCuentoDesdeFirebase = leerCuentoDesdeFirebase;
window.logoutEva = logoutEva;
window.mostrarOcultarPass = mostrarOcultarPass;