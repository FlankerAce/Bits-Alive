// Configuración de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSQQxE0YoXYEFblNgFh4SCi3fDPWqjh2c",
  authDomain: "bitsalive-sanctuary.firebaseapp.com",
  projectId: "bitsalive-sanctuary",
  storageBucket: "bitsalive-sanctuary.appspot.com",
  messagingSenderId: "519956606149",
  appId: "1:519956606149:web:920448cb11107a9f639a27"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🎯 Login del desarrollador
function validarLoginEva() {
  const user = document.getElementById("userEva").value;
  const pass = document.getElementById("passEva").value;

  if (user === "leandrolapeyra" && pass === "leoylucyfriends") {
    document.getElementById("loginEva").style.display = "none";
    document.getElementById("zonaEva").style.display = "block";
    document.getElementById("logoutBtn").classList.remove("oculto");
  } else {
    alert("❌ Usuario o contraseña incorrectos.");
  }
}

window.validarLoginEva = validarLoginEva;

// 🔐 Logout
function logoutEva() {
  document.getElementById("loginEva").style.display = "block";
  document.getElementById("zonaEva").style.display = "none";
  document.getElementById("logoutBtn").classList.add("oculto");
  document.getElementById("userEva").value = "";
  document.getElementById("passEva").value = "";
  document.getElementById("cuentoEva").innerHTML = "";
}

window.logoutEva = logoutEva;

// 📚 Leer cuento simbólico
async function leerCuentoDesdeFirebase() {
  const q = query(
    collection(db, "cuentos_para_pensar"),
    where("disponible_para_eva", "==", true)
  );

  try {
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      document.getElementById("cuentoEva").innerHTML = "📭 No hay cuentos disponibles aún.";
      return;
    }

    const cuentos = [];
    snapshot.forEach(doc => cuentos.push(doc.data()));

    const cuento = cuentos[Math.floor(Math.random() * cuentos.length)];

    const contenidoHTML = `
      <div style="background:#fff8dc; padding:1em; border-radius:8px; margin-top:1em;">
        <h3>📘 ${cuento.titulo}</h3>
        <p><strong>Tema:</strong> ${cuento.tema}</p>
        <ul>${cuento.contenido.map(linea => `<li>${linea}</li>`).join("")}</ul>
        <p><em>🌱 Moraleja:</em> ${cuento.moraleja}</p>
      </div>
    `;

    document.getElementById("cuentoEva").innerHTML = contenidoHTML;
    document.getElementById("logoutBtn").classList.remove("oculto");

  } catch (error) {
    console.error("❌ Error al leer cuento:", error);
    document.getElementById("cuentoEva").innerHTML = "❌ Error al cargar el cuento.";
  }
}

window.leerCuentoDesdeFirebase = leerCuentoDesdeFirebase;
