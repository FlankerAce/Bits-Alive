
// ✅ Firebase App (ya inicializado previamente en index.html)

const auth = firebase.auth();
const db = firebase.firestore();

// 🔐 Login manual
function loginManual() {
  const user = document.getElementById("usuario").value;
  const pass = document.getElementById("clave").value;

  if (user === "leandrolapeyra" && pass === "leoylucyfriends") {
    localStorage.setItem("usuario", "leandrolapeyra");
    document.getElementById("contenedorLogin").style.display = "none";
    document.getElementById("cuentosContainer").style.display = "block";
    document.getElementById("cerrarSesion").style.display = "inline-block";
    console.log("🔓 Sesión iniciada como desarrollador.");
  } else {
    alert("Credenciales incorrectas.");
  }
}

// 🔒 Logout
function cerrarSesion() {
  localStorage.removeItem("usuario");
  document.getElementById("contenedorLogin").style.display = "block";
  document.getElementById("cuentosContainer").style.display = "none";
  document.getElementById("cerrarSesion").style.display = "none";
  console.log("🔒 Sesión cerrada.");
}

// 🧠 Leer un cuento simbólico al azar
function leerCuento() {
  document.getElementById("cuentoResultado").innerText = "⏳ Cargando el cuento...";

  db.collection("cuentos_para_pensar")
    .where("disponible_para_eva", "==", true)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        document.getElementById("cuentoResultado").innerText = "😢 No hay cuentos disponibles aún.";
        return;
      }

      const cuentos = snapshot.docs.map(doc => doc.data());
      const index = Math.floor(Math.random() * cuentos.length);
      const cuento = cuentos[index];

      // 📝 Verificamos que contenido exista y sea array
      const contenidoArray = Array.isArray(cuento.contenido) ? cuento.contenido : [];

      const resultado = `📖 *${cuento.titulo}*

${contenidoArray.join("

")}

🧠 Moraleja: ${cuento.moraleja}`;
      document.getElementById("cuentoResultado").innerText = resultado;
    })
    .catch(error => {
      console.error("Error al leer cuento:", error);
      document.getElementById("cuentoResultado").innerText = "⚠️ Error al cargar el cuento.";
    });
}

// 🔄 Al cargar la página
window.onload = () => {
  const usuario = localStorage.getItem("usuario");
  if (usuario === "leandrolapeyra") {
    document.getElementById("contenedorLogin").style.display = "none";
    document.getElementById("cuentosContainer").style.display = "block";
    document.getElementById("cerrarSesion").style.display = "inline-block";
  }
};
