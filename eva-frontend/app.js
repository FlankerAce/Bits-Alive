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
function leerCuentoDesdeFirebase() {
  const div = document.getElementById("cuentoEva");
  div.innerHTML = "⏳ Cargando cuento...";

  db.collection("cuentos_para_pensar")
    .where("disponible_para_eva", "==", true)
    .orderBy("orden_en_libro")
    .limit(1)
    .get()
    .then(snapshot => {
      if (!snapshot.empty) {
        const cuento = snapshot.docs[0].data();

        // Armado del contenido
        const titulo = cuento.titulo || "📖 Cuento simbólico";
        const tema = cuento.tema ? `Tema: ${cuento.tema}` : "";
        const moraleja = cuento.moraleja ? `<em>Moraleja:</em> ${cuento.moraleja}` : "";
        const contenido = cuento.contenido?.map(p => `<p>${p}</p>`).join("") || "⚠️ Sin contenido.";

        div.innerHTML = `
          <h3>${titulo}</h3>
          <p><strong>${tema}</strong></p>
          ${contenido}
          <p><strong>${moraleja}</strong></p>
        `;
        console.log("📘 Cuento cargado correctamente:", titulo);
      } else {
        div.innerHTML = "❌ No hay cuentos disponibles.";
        console.warn("No se encontraron cuentos disponibles para EVA.");
      }
    })
    .catch(error => {
      div.innerHTML = "❌ Error al cargar el cuento.";
      console.error("Error al obtener cuento:", error);
    });
}


window.leerCuentoDesdeFirebase = leerCuentoDesdeFirebase;
