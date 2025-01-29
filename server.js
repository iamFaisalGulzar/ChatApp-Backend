// backend/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Set up Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://35.180.138.52", // Replace with your actual frontend domain/IP
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Store users and their socket connections
let users = {};

// Serve static files for frontend (if needed)
app.use(express.static('public'));

// Handle user registration (save username to socket ID mapping)
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user registration
  socket.on('register', (username) => {
    users[username] = socket.id;  // Save the user's username and socket ID
    console.log(`${username} registered`);
  });

  // backend/server.js
socket.on('private message', (data) => {
    const { recipient, message } = data;
    const recipientSocketId = users[recipient];
    if (recipientSocketId) {
      // Include the sender's username with the message
      io.to(recipientSocketId).emit('chat message', {
        sender: getUsernameBySocketId(socket.id), // Function to get sender's username
        message: message,
      });
  
      // Optionally, emit a confirmation to the sender's own chat room
      socket.emit('chat message', {
        sender: 'You', // Display 'You' for the sender
        message: message,
      });
    }
  });
  
  // Helper function to get the username by socket ID
  function getUsernameBySocketId(socketId) {
    return Object.keys(users).find((username) => users[username] === socketId);
  }

  // backend/server.js
  // Emit user list to all connected users whenever someone registers
  socket.on('register', (username) => {
    users[username] = socket.id;
    io.emit('user list', Object.keys(users));  // Emit updated user list
  });
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
    // Remove the user from the list when they disconnect
    for (let username in users) {
      if (users[username] === socket.id) {
        delete users[username];
        break;
      }
    }
  });
});

// Start server on port 4000
server.listen(4000, () => {
  console.log('Socket.io server is running on port 4000');
});
