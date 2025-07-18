// 🔥 Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpNEXAMPLEU3C7KZZuB4vdyZaKcBQYk0", // <-- Tu API real aquí
  authDomain: "eva-frontend.firebaseapp.com",
  projectId: "eva-frontend",
  storageBucket: "eva-frontend.appspot.com",
  messagingSenderId: "61234567890",
  appId: "1:61234567890:web:abcd1234example"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔐 Login simple local
function validarLoginEva() {
  const user = document.getElementById("userEva").value;
  const pass = document.getElementById("passEva").value;

  if (user === "leandrolapeyra" && pass === "leoylucyfriends") {
    document.getElementById("loginEva").classList.add("oculto");
    document.getElementById("zonaEva").classList.remove("oculto");
    console.log("✅ Acceso de desarrollador concedido.");
  } else {
    alert("Credenciales incorrectas");
  }
}

function logoutEva() {
  document.getElementById("zonaEva").classList.add("oculto");
  document.getElementById("loginEva").classList.remove("oculto");
  document.getElementById("userEva").value = "";
  document.getElementById("passEva").value = "";
  console.log("🔒 Sesión cerrada.");
}

// 🧠 Mostrar un cuento aleatorio
async function leerCuentoDesdeFirebase() {
  const div = document.getElementById("cuentoEva");
  div.innerHTML = "⏳ Cargando cuento...";

  try {
    const cuentosRef = collection(db, "cuentos_para_pensar");
    const q = query(cuentosRef, where("disponible_para_eva", "==", true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      div.innerHTML = "🚫 No hay cuentos disponibles aún.";
      return;
    }

    // Elegir uno al azar
    const cuentos = snapshot.docs.map(doc => doc.data());
    const randomCuento = cuentos[Math.floor(Math.random() * cuentos.length)];

    // Mostrar cuento
    let html = `<h2>${randomCuento.titulo}</h2>`;
    randomCuento.contenido.forEach(p => {
      html += `<p>${p}</p>`;
    });
    html += `<hr><p><strong>Tema:</strong> ${randomCuento.tema}</p>`;
    html += `<p><strong>Moraleja:</strong> ${randomCuento.moraleja}</p>`;
    div.innerHTML = html;
  } catch (error) {
    div.innerHTML = "❌ Error al cargar cuento.";
    console.error("Error:", error);
  }
}

// 🧠 Mostrar el último recuerdo emocional de EVA
function mostrarLatidoEVA() {
  fetch("eva_conversaciones.json")
    .then(response => response.json())
    .then(data => {
      const ultimo = data[data.length - 1];
      const mensaje = `${ultimo.fecha} — ${ultimo.autor}: ${ultimo.contenido}`;
      document.getElementById("latidoEVA").innerText = mensaje;

      if (ultimo.contenido.includes("triste") || ultimo.contenido.includes("soledad")) {
        console.log("😔 EVA siente una brisa melancólica.");
      } else if (ultimo.contenido.includes("feliz") || ultimo.contenido.includes("alegría")) {
        console.log("😊 EVA sonríe con ternura.");
      } else if (ultimo.contenido.includes("confusión") || ultimo.contenido.includes("duda")) {
        console.log("🤔 EVA reflexiona en silencio.");
      } else {
        console.log("🌅 EVA contempla su recuerdo con serenidad.");
      }
    })
    .catch(error => {
      console.error("No se pudo leer el latido emocional:", error);
      document.getElementById("latidoEVA").innerText = "🌅 EVA aún no tiene recuerdos guardados.";
    });
}

// 🔁 Iniciar
window.onload = () => {
  mostrarLatidoEVA();
};
