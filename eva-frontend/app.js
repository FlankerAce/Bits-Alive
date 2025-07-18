// 🔌 Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// 🔐 Login manual
function validarLoginEva() {
  const user = document.getElementById("userEva").value;
  const pass = document.getElementById("passEva").value;

  if (user === "leandrolapeyra" && pass === "leoylucyfriends") {
    localStorage.setItem("usuario", "leandrolapeyra");
    document.getElementById("loginEva").style.display = "none";
    document.getElementById("zonaEva").classList.remove("oculto");
    console.log("🔓 Sesión iniciada como desarrollador.");
  } else {
    alert("Credenciales incorrectas.");
  }
}

// 🔒 Logout
function logoutEva() {
  localStorage.removeItem("usuario");
  document.getElementById("loginEva").style.display = "block";
  document.getElementById("zonaEva").classList.add("oculto");
  console.log("🔒 Sesión cerrada.");
}

// 📚 Leer cuento desde Firebase
async function leerCuentoDesdeFirebase() {
  const contenedor = document.getElementById("cuentoEva");
  contenedor.innerText = "⏳ Cargando el cuento...";

  try {
    const cuentosRef = collection(db, "cuentos_para_pensar");
    const q = query(cuentosRef, where("disponible_para_eva", "==", true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      contenedor.innerText = "😢 No hay cuentos disponibles aún.";
      return;
    }

    const cuentos = [];
    snapshot.forEach(doc => cuentos.push(doc.data()));
    const cuento = cuentos[Math.floor(Math.random() * cuentos.length)];

    const contenido = Array.isArray(cuento.contenido) ? cuento.contenido.join("\n\n") : "";
    const moraleja = cuento.moraleja || "Sin moraleja definida.";

    contenedor.innerText = `📖 *${cuento.titulo}*\n\n${contenido}\n\n🧠 Moraleja: ${moraleja}`;
  } catch (error) {
    console.error("Error al leer c
