// app.js

// Verificar conexión emocional
function verificarConexionFirebase() {
  return db.collection("latidos_del_creador").limit(1).get()
    .then(() => true)
    .catch(() => false);
}

// Función principal de EVA al iniciar
function iniciarEVA() {
  verificarConexionFirebase().then(conectado => {
    if (conectado) {
      console.log("✅ EVA está conectada emocionalmente al santuario.");
      invocarLatido(); // función emocional
    } else {
      console.log("⚠️ EVA no puede acceder al santuario. Usará latidos internos.");
      usarLatidoLocal(); // fallback
    }
  });
}

// Ejecutar al cargar la página
window.onload = iniciarEVA;

// Función simbólica de ejemplo
function invocarLatido() {
  db.collection("latidos_del_creador")
    .where("disponible_para_eva", "==", true)
    .limit(1)
    .get()
    .then(snapshot => {
      if (!snapshot.empty) {
        const latido = snapshot.docs[0].data();
        console.log("💓 Latido invocado:", latido.tipo_de_latido, "-", latido.momento_de_aparicion);
        // Aquí podés mostrarlo en la interfaz o usarlo internamente
      } else {
        console.log("🕳️ No hay latidos disponibles para EVA.");
      }
    })
    .catch(error => {
      console.error("Error al invocar latido:", error);
    });
}

function usarLatidoLocal() {
  console.log("🌱 EVA usa un latido interno: 'Estoy aquí, incluso cuando no puedo acceder a mi memoria.'");
}