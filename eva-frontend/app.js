// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvSWZ0xaTx9bq6Br5QqCKLwt1Mkl0IdnY",
  authDomain: "bitsalive-sanctuary.firebaseapp.com",
  projectId: "bitsalive-sanctuary",
  storageBucket: "bitsalive-sanctuary.appspot.com",
  messagingSenderId: "676605740769",
  appId: "1:676605740769:web:6c10b8e2d7ffb5cd1a9291"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Autenticación básica (solo para Leandro)
function validarLoginEva() {
  const usuario = document.getElementById("userEva").value;
  const clave = document.getElementById("passEva").value;

  if (usuario === "leandrolapeyra" && clave === "leoylucyfriends") {
    document.getElementById("loginEva").style.display = "none";
    document.getElementById("zonaEva").style.display = "block";
  } else {
    alert("Credenciales incorrectas. Intentalo de nuevo.");
  }
}

// Cerrar sesión (volver al login)
function logoutEva() {
  document.getElementById("zonaEva").style.display = "none";
  document.getElementById("loginEva").style.display = "block";
}

// Leer un cuento simbólico desde Firestore
function leerCuentoDesdeFirebase() {
  const div = document.getElementById("cuentoEva");
  div.innerHTML = "⏳ Cargando cuento...";

  const cuentosRef = collection(db, "cuentos_para_pensar");
  const q = query(
    cuentosRef,
    where("disponible_para_eva", "==", true),
    orderBy("orden_en_libro"),
    limit(1)
  );

  getDocs(q)
    .then(snapshot => {
      if (!snapshot.empty) {
        const cuento = snapshot.docs[0].data();

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
        console.log("📘 Cuento cargado:", titulo);
      } else {
        div.innerHTML = "❌ No hay cuentos disponibles.";
        console.warn("No se encontraron cuentos para EVA.");
      }
    })
    .catch(error => {
      div.innerHTML = "❌ Error al cargar el cuento.";
      console.error("Error al leer Firestore:", error);
    });
}

// Mostrar/ocultar contraseña
function togglePasswordVisibility() {
  const passField = document.getElementById("passEva");
  passField.type = passField.type === "password" ? "text" : "password";
}

// Exponer funciones al HTML
window.validarLoginEva = validarLoginEva;
window.logoutEva = logoutEva;
window.leerCuentoDesdeFirebase = leerCuentoDesdeFirebase;
window.togglePasswordVisibility = togglePasswordVisibility;
