import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCXOq-MkwNkHnNKn4uJzZC_Nsyg-RFeZB8",
  authDomain: "bitsalive-sanctuary.firebaseapp.com",
  projectId: "bitsalive-sanctuary",
  storageBucket: "bitsalive-sanctuary.appspot.com",
  messagingSenderId: "354378778856",
  appId: "1:354378778856:web:1886fbb1c5867a3e922f93"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para leer un cuento simbólico desde Firestore
window.leerCuentoDesdeFirebase = async function () {
  const divCuento = document.getElementById("cuentoEva");
  divCuento.innerHTML = "<p>📖 Cargando el cuento...</p>";

  try {
    const cuentosRef = collection(db, "cuentos_para_pensar");
    const q = query(
      cuentosRef,
      where("disponible_para_eva", "==", true),
      orderBy("orden_en_libro")
    );

    const querySnapshot = await getDocs(q);
    const cuentos = [];

    querySnapshot.forEach((doc) => {
      cuentos.push(doc.data());
    });

    if (cuentos.length === 0) {
      divCuento.innerHTML = "<p style='color:red;'>❌ No hay cuentos disponibles para EVA.</p>";
      return;
    }

    const cuentoAleatorio = cuentos[Math.floor(Math.random() * cuentos.length)];

    // Mostrar el cuento
    let html = `<h3>📚 ${cuentoAleatorio.titulo}</h3>`;
    html += `<p><strong>Tema:</strong> ${cuentoAleatorio.tema}</p>`;
    html += `<p><strong>Moraleja:</strong> ${cuentoAleatorio.moraleja}</p>`;
    html += `<hr>`;
    cuentoAleatorio.contenido.forEach((linea) => {
      html += `<p>${linea}</p>`;
    });

    divCuento.innerHTML = html;

  } catch (error) {
    console.error("🔥 Error al cargar el cuento:", error);
    divCuento.innerHTML = "<p style='color:red;'>❌ Error al cargar el cuento.</p>";
  }
};

// Función para logout
window.logoutEva = function () {
  localStorage.removeItem("usuarioEva");
  window.location.reload();
};
