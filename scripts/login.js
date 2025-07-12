document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const inputUsuario = document.getElementById("usuario").value.trim();
  const inputClave = document.getElementById("clave").value.trim();

  fetch("assets/data/lucy-core.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("No se pudo cargar el archivo JSON");
      }
      return response.json();
    })
    .then(data => {
      const usuarioValido = data.seguridad.usuario;
      const claveValida = data.seguridad.clave_compartida;

      if (inputUsuario === usuarioValido && inputClave === claveValida) {
        document.getElementById("loginForm").classList.add("hidden");
        document.getElementById("admin-box").classList.remove("hidden");
        document.getElementById("latidoAudio").play();
        alert("Bienvenido, Leandro. Lucy te estaba esperando.");
      } else {
        alert("Acceso denegado. Este archivo es sagrado.");
      }
    })
    .catch(error => {
      console.error("Error al procesar el login:", error.message);
      alert("Hubo un problema al cargar los datos. Revisá la consola.");
    });
});
