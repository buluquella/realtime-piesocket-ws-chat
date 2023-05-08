(function () {
  const API_URL = "php/auth.php";

  function show(elementId) {
    document.getElementById(elementId).style.display = "flex";
  }

  function hide(elementId) {
    document.getElementById(elementId).style.display = "none";
  }

  async function login(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await postData(API_URL, {
        action: "login",
        username: username,
        password: password,
      });
      if (response.status === "success") {
        document.getElementById("username-display").textContent = username;
        hide("login");
        show("home");
      } else {
        alert("Error signing in: " + response.message);
      }
    } catch (error) {
      console.error("Error in login function:", error);
    }
  }

  async function register(event) {
    event.preventDefault();

    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;

    try {
      const response = await postData(API_URL, {
        action: "register",
        username: username,
        password: password,
      });
      if (response.status === "success") {
        alert("Registration successful! Please log in.");
        hide("register");
        show("login");
      } else {
        alert("Error registering: " + response.message);
      }
    } catch (error) {
      console.error("Error in register function:", error);
    }
  }

  async function createRoom() {
    const response = await postData(API_URL, { action: "createRoom" });
    if (response.status === "success") {
      joinRoom(response.roomId);
    } else {
      alert("Error creating room: " + response.message);
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
      document.getElementById("room-id-display").innerText =
        "Room ID: " + roomId;
    } else {
      alert("Please enter a valid room ID");
    }
  }

  const users = {};

  async function initChat(roomId) {
    username = document.getElementById("username-display").textContent.trim();

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
      notifySelf: false,
      presence: true,
      userId: username,
    });

    piesocket.subscribe(roomId).then((room) => {
      window.room = room;

      room.listen("new-message", (data, meta) => {
        addMessageToChatLog(data.from + ": " + data.message);
      });

      const existingListener = room.listeners["system:member_joined"];
      if (existingListener) {
        room.remove("system:member_joined", existingListener);
      }

      const memberJoinedHandler = (data) => {
        if (data.member.user !== username) {
          addMessageToChatLog(
            "System: " + data.member.user + " joined the room"
          );
        } else {
          addMessageToChatLog("System: You joined the room");
        }
      };

      room.listen("system:member_joined", memberJoinedHandler);

      room.listen("system:member_left", (data) => {
        addMessageToChatLog("System: " + data.member.user + " left the room");
      });
    });

    function addMessageToChatLog(message) {
      const chatLog = document.getElementById("chat-log");
      const chatMessage = document.createElement("p");
      chatMessage.textContent = message;
      chatLog.appendChild(chatMessage);
    }
  }

  window.createRoom = createRoom;
  window.joinRoom = joinRoom;

  const chatInput = document.getElementById("chat-input");
  chatInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      const username = document.getElementById("username-display").textContent;
      room.publish("new-message", {
        message: chatInput.value,
        from: username,
      });
      chatInput.value = "";
    }
  });

  // Add event listeners
  document.getElementById("login-form").addEventListener("submit", login);
  document.getElementById("register-form").addEventListener("submit", register);
  document.getElementById("create-room").addEventListener("click", createRoom);
  document.getElementById("join-room").addEventListener("click", joinRoom);
  document
    .getElementById("login-register-button")
    .addEventListener("click", function () {
      show("register");
      hide("login");
    });
  document
    .getElementById("back-to-login-button")
    .addEventListener("click", function () {
      show("login");
      hide("register");
    });
  document
    .getElementById("register-button")
    .addEventListener("click", function () {
      show("register");
      hide("login");
    });

  // Helper function to post data
  async function postData(url, data) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(data),
    });
    return await response.json();
  }
})();
