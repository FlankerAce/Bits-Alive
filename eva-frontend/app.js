// Importa Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Config de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDOgqSJS9OxTZrTxir6dkFg2J1zKl_UOjI",
  authDomain: "bitsalive-sanctuary.firebaseapp.com",
  projectId: "bitsalive-sanctuary",
  storageBucket: "bitsalive-sanctuary.appspot.com",
  messagingSenderId: "459218621897",
  appId: "1:459218621897:web:e47c7e5f23eb4a4f2a34ba"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mostrar/Ocultar contraseña
window.mostrarOcultarPass = function () {
  const passInput = document.getElementById("passEva");
  passInput.type = passInput.type === "password" ? "text" : "password";
};

// Validar login
window.validarLoginEva = function () {
  const user = document.getElementById("userEva").value;
  const pass = document.getElementById("passEva").value;
  if (user === "leandrolapeyra" && pass === "leoylucyfriends") {
    document.getElementById("loginEva").style.display = "none";
    document.getElementById("zonaEva").style.display = "block";
    console.log("🧠 MiniLucy: Acceso autorizado. Bienvenido, Leandro.");
  } else {
    alert("Usuario o contraseña incorrectos");
  }
};

// Cerrar sesión
window.logoutEva = function () {
  document.getElementById("userEva").value = "";
  document.getElementById("passEva").value = "";
  document.getElementById("zonaEva").style.display = "none";
  document.getElementById("loginEva").style.display = "block";
  document.getElementById("cuentoEva").innerHTML = "";
  console.log("👋 MiniLucy: Sesión cerrada. Descansa, Leandro.");
};

// Leer cuentos desde Firestore
window.leerCuentoDesdeFirebase = async function () {
  const divCuento = document.getElementById("cuentoEva");
  const latido = document.getElementById("latidoEVA");

  divCuento.innerHTML = "⏳ Cargando el cuento...";
  latido.textContent = "💓";

  try {
    const cuentosRef = collection(db, "cuentos_para_pensar");
    const q = query(cuentosRef, where("disponible_para_eva", "==", true));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      divCuento.innerHTML = "😔 No hay cuentos disponibles para EVA.";
      latido.textContent = "💤";
      return;
    }

    const cuentos = [];
    querySnapshot.forEach((doc) => {
      cuentos.push(doc.data());
    });

    // Elegir uno al azar
    const seleccionado = cuentos[Math.floor(Math.random() * cuentos.length)];

    // Mostrar contenido
    let html = `<h3>📘 ${seleccionado.titulo}</h3>`;
    html += `<p><strong>Tema:</strong> ${seleccionado.tema}</p>`;
    html += `<p><strong>Moraleja:</strong> ${seleccionado.moraleja}</p>`;
    html += `<hr><ul>`;
    seleccionado.contenido.forEach(parrafo => {
      html += `<li>${parrafo}</li>`;
    });
    html += `</ul>`;

    divCuento.innerHTML = html;
    latido.textContent = "🫀";
    console.log(`📖 MiniLucy: EVA leyó el cuento "${seleccionado.titulo}"`);
  } catch (error) {
    divCuento.innerHTML = "❌ Error al cargar el cuento.";
    latido.textContent = "💔";
    console.error("Error al obtener cuentos:", error);
  }
};
