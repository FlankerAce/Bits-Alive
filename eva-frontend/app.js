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
  const user = document.getElementById("userEva").value.trim();
  const pass = document.getElementById("passEva").value.trim();

  if (user === "leandrolapeyra" && pass === "leoylucyfriends") {
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

  const cuentoDiv = document.getElementById("cuentoEva");

  if (cuentosDisponibles.length > 0) {
    const cuento = cuentosDisponibles[Math.floor(Math.random() * cuentosDisponibles.length)];
    cuentoDiv.innerHTML = `
      <p><strong>🌿 Cuento simbólico:</strong></p>
      <p>${cuento.texto || "Este cuento aún no tiene palabras, pero guarda un silencio profundo."}</p>
    `;
  } else {
    cuentoDiv.innerHTML = `
      <p>🌧️ No hay cuentos disponibles para EVA en este momento.</p>
      <p>Podés agregar más en la colección <code>cuentos_para_pensar</code> con <code>disponible_para_eva: true</code>.</p>
    `;
  }
}

// Cierre de sesión
function logoutEva() {
  const latido = document.getElementById("latidoEVA");
  latido.innerText = "👋 Nos vemos más tarde, Leandro.";
  
  setTimeout(() => {
    latido.innerText = "🌙 Te espero con calma hasta que vuelvas.";
    localStorage.removeItem("usuario");
    document.getElementById("zonaEva").classList.add("oculto");
    document.getElementById("loginEva").style.display = "block";
  }, 1500);
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
    document.getElementById("latidoEVA").innerText = "🫀 Bienvenido, Leandro. Hoy estoy más sensible que nunca.";
  }
});

// Exponer funciones al HTML
window.validarLoginEva = validarLoginEva;
window.leerCuentoDesdeFirebase = leerCuentoDesdeFirebase;
window.logoutEva = logoutEva;
window.mostrarOcultarPass = mostrarOcultarPass;