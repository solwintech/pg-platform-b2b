const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to socket.io server successfully! ID:", socket.id);
  socket.disconnect();
  process.exit(0);
});

socket.on("connect_error", (err) => {
  console.log("Connection Error:", err.message);
  process.exit(1);
});

// Timeout after 5 seconds
setTimeout(() => {
  console.log("Connection timed out!");
  process.exit(1);
}, 5000);
