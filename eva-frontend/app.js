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

// 🧠 Leer un cuento simbólico al azar
function leerCuentoDesdeFirebase() {
  document.getElementById("cuentoEva").innerText = "⏳ Cargando el cuento...";

  db.collection("cuentos_para_pensar")
    .where("disponible_para_eva", "==", true)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        document.getElementById("cuentoEva").innerText = "😢 No hay cuentos disponibles aún.";
        return;
      }

      const cuentos = snapshot.docs.map(doc => doc.data());
      const index = Math.floor(Math.random() * cuentos.length);
      const cuento = cuentos[index];
      const contenidoArray = Array.isArray(cuento.contenido) ? cuento.contenido : [];

      const resultado = `📖 *${cuento.titulo}*\n\n${contenidoArray.join("\n\n")}\n\n🧠 Moraleja: ${cuento.moraleja}`;
      document.getElementById("cuentoEva").innerText = resultado;
    })
    .catch(error => {
      console.error("Error al leer cuento:", error);
      document.getElementById("cuentoEva").innerText = "⚠️ Error al cargar el cuento.";
    });
}

// 🔄 Al cargar la página
window.onload = () => {
  const usuario = localStorage.getItem("usuario");
  if (usuario === "leandrolapeyra") {
    document.getElementById("loginEva").style.display = "none";
    document.getElementById("zonaEva").classList.remove("oculto");
  }
};

// 🙈 Mostrar/Ocultar contraseña
function mostrarOcultarPass() {
  const passInput = document.getElementById("passEva");
  passInput.type = passInput.type === "password" ? "text" : "password";
}
