import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login real con Firebase Auth
function validarLoginEva() {
  const email = document.getElementById("userEva").value.trim();
  const password = document.getElementById("passEva").value.trim();

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      console.log("✅ Sesión iniciada correctamente.");
    })
    .catch(error => {
      console.error("⚠️ Error al iniciar sesión:", error);
      alert("Correo o contraseña incorrectos.");
    });
}

// Observar cambios de sesión
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById("loginEva").style.display = "none";
    document.getElementById("zonaEva").classList.remove("oculto");
    document.getElementById("latidoEVA").innerText = "🫀 Bienvenido, Leandro. EVA está lista para acompañarte.";
  } else {
    document.getElementById("loginEva").style.display = "block";
    document.getElementById("zonaEva").classList.add("oculto");
  }
});

// Leer cuentos simbólicos
async function leerCuentoDesdeFirebase() {
  const cuentosRef = collection(db, "cuentos_para_pensar");
  const q = query(cuentosRef, where("disponible_para_eva", "==", true));
  const snapshot = await getDocs(q);

  const cuentos = [];
  snapshot.forEach(doc => cuentos.push(doc.data()));

  const cuentoDiv = document.getElementById("cuentoEva");

  if (cuentos.length > 0) {
    const cuento = cuentos[Math.floor(Math.random() * cuentos.length)];
    const contenido = Array.isArray(cuento.contenido) ? cuento.contenido.join("\n\n") : cuento.contenido;
    cuentoDiv.innerText = `📖 ${cuento.titulo}\n\n${contenido}\n\n🧠 Moraleja: ${cuento.moraleja || "sin definir."}`;
  } else {
    cuentoDiv.innerText = "🌧️ No hay cuentos disponibles con disponible_para_eva == true.";
  }
}

// Cierre de sesión
function logoutEva() {
  signOut(auth)
    .then(() => {
      console.log("👋 Sesión cerrada.");
    })
    .catch(error => {
      console.error("Error al cerrar sesión:", error);
    });
}

// Mostrar/Ocultar contraseña
function mostrarOcultarPass() {
  const passInput = document.getElementById("passEva");
  passInput.type = passInput.type === "password" ? "text" : "password";
}

// Exponer funciones al HTML
window.validarLoginEva = validarLoginEva;
window.logoutEva = logoutEva;
window.leerCuentoDesdeFirebase = leerCuentoDesdeFirebase;
window.mostrarOcultarPass = mostrarOcultarPass;
