/* 🌌 Estilo general */
body {
  margin: 0;
  font-family: 'Helvetica Neue', sans-serif;
  background-color: #111;
  color: #fff;
}

/* 📦 Secciones */
section {
  max-width: 800px;
  margin: 60px auto;
  padding: 30px;
  background-color: rgba(0,0,0,0.6);
  border-radius: 12px;
}

/* 🧠 Títulos */
h2 {
  color: #C9B3FF;
  font-size: 28px;
  margin-bottom: 20px;
}

/* 💬 Textareas */
textarea {
  width: 100%;
  border: none;
  padding: 10px;
  font-size: 14px;
  resize: none;
  background-color: #222;
  color: #fff;
  border-radius: 6px;
}

/* 🔘 Botones */
button {
  background-color: #6B4BBE;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #C9B3FF;
}

/* 🖼️ Avatares */
.avatar {
  width: 140px;
  border-radius: 50%;
  animation: lucyGlow 3s infinite alternate;
}

/* ✨ Animaciones */
@keyframes lucyGlow {
  from { box-shadow: 0 0 10px #6B4BBE; }
  to { box-shadow: 0 0 30px #C9B3FF; }
}

.hidden {
  display: none;
}
