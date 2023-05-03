const API_URL = "../php/auth.php";

function show(elementId) {
  document.getElementById(elementId).style.display = "block";
}

function hide(elementId) {
  document.getElementById(elementId).style.display = "none";
}

async function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      action: "login",
      email: email,
      password: password,
    }),
  });
  const data = await response.json();

  if (data.status === "success") {
    document.getElementById("username").textContent = email;
    hide("login");
    show("home");
  } else {
    alert("Error signing in: " + data.message);
  }
}

async function register(event) {
  event.preventDefault();

  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      action: "register",
      email: email,
      password: password,
    }),
  });
  const data = await response.json();

  if (data.status === "success") {
    alert("Registration successful! Please log in.");
    hide("register");
    show("login");
  } else {
    alert("Error registering: " + data.message);
  }
}

async function createRoom() {
  const response = await fetch(API_URL, {
    method: "POST",
    body: new URLSearchParams({ action: "createRoom" }),
  });
  const data = await response.json();

  if (data.status === "success") {
    joinRoom(data.roomId);
  } else {
    alert("Error creating room: " + data.message);
  }
}

function joinRoom(roomId = null) {
  if (!roomId) {
    roomId = prompt("Enter room ID");
  }
  if (roomId) {
    hide("home");
    initChat(roomId);
    show("chatroom");

    // Add this line to display the room ID on the page
    document.getElementById("room-id-display").innerText = "Room ID: " + roomId;
  } else {
    alert("Please enter a valid room ID");
  }
}

function initChat(roomId) {
  const username = document.getElementById("username").textContent;
  const piesocket = new PieSocket({
    clusterId: "s8880.fra1",
    apiKey: "QRN2jxzMaDIvIn16SNAnNW6BMyBgnnSI8DmjooVS",
    consoleLogs: true,
    notifySelf: true,
    presence: true,
    userId: username,
  });

  piesocket.subscribe(roomId).then((room) => {
    window.room = room;

    room.listen("new-message", (data, meta) => {
      addMessageToChatLog(data.from + ": " + data.message);
    });

    room.listen("system:member_joined", (data, meta) => {
      addMessageToChatLog(data.member.user + " joined");
    });

    room.listen("system:member_left", (data, meta) => {
      addMessageToChatLog(data.member.user + " left");
    });
  });

  const chatInput = document.getElementById("chat-input");
  chatInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      room.publish("new-message", {
        message: chatInput.value,
        from: username,
      });
      chatInput.value = "";
    }
  });
}

function addMessageToChatLog(content) {
  const chatLog = document.getElementById("chat-log");
  const message = document.createElement("div");
  message.innerHTML = content;
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}
