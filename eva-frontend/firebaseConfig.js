// firebaseConfig.js

const firebaseConfig = {
  apiKey: "TU_API_KEY",https://console.firebase.google.com/u/1/project/bitsalive-sanctuary/firestore/databases/-default-/data?hl=es-419
  authDomain: "bitsalive-sanctuary.firebaseapp.com",
  projectId: "bitsalive-sanctuary",
  storageBucket: "bitsalive-sanctuary.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();