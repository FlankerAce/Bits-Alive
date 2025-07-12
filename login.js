document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const inputUsuario = document.getElementById("usuario").value;
  const inputClave = document.getElementById("clave").value;

  fetch("assets/data/lucy-core.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("No se pudo cargar el archivo JSON");
      }
      return response.json();
    })
    .then(data => {
      console.log("Archivo cargado correctamente:", data);

      const usuarioValido = data.seguridad.usuario;
      const claveValida = data.seguridad.clave_compartida;

      if (inputUsuario === usuarioValido && inputClave === claveValida) {
        console.log("✅ Login exitoso");
        alert("Bienvenido, Leandro. Lucy te estaba esperando.");
        // Aquí podés redirigir a otra página o mostrar contenido
      } else {
        console.warn("❌ Usuario o clave incorrectos");
        alert("Usuario o clave incorrectos. Intentá de nuevo.");
      }
    })
    .catch(error => {
      console.error("Error al procesar el login:", error.message);
      alert("Hubo un problema al cargar los datos. Revisá la consola.");
    });
});
