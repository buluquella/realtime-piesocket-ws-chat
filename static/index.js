const API_URL = "php/auth.php";

function show(elementId) {
  document.getElementById(elementId).style.display = "flex";
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

const users = {};

async function initChat(roomId) {
  const username = document.getElementById("username").textContent;

  // Anahtar çifti oluştur ve sakla
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
  users[username] = keyPair;

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

  // Mesajları şifrele ve şifre çöz
  room.listen("new-message", async (data, meta) => {
    const decryptedMessage = await decryptMessage(
      data.encryptedMessage,
      users[username].privateKey
    );
    addMessageToChatLog(data.from + ": " + decryptedMessage);
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

async function encryptMessage(message, publicKey) {
  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);
  const encryptedMessage = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encodedMessage
  );
  return new Uint8Array(encryptedMessage);
}

async function decryptMessage(encryptedMessage, privateKey) {
  const decryptedMessage = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedMessage
  );
  const decoder = new TextDecoder();
  return decoder.decode(decryptedMessage);
}

function addMessageToChatLog(content) {
  const chatLog = document.getElementById("chat-log");
  const message = document.createElement("div");
  message.innerHTML = content;
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}
