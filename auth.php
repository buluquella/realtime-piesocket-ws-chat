<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "45.84.205.255";
$username = "u827696153_chatting_user";
$password = "#72o2oQaR37mWWPSaT0JVtqZA^y1rmUre#OAeWl1^t";
$dbname = "u827696153_chatting_test";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  http_response_code(500);
  die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $conn->connect_error]));
}

$action = $_POST['action'];

if ($action === 'login') {
  $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
  $password = filter_var($_POST['password'], FILTER_SANITIZE_STRING);

  $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
  $stmt->bind_param("s", $email);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {
      echo json_encode(['status' => 'success']);
    } else {
      echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
    }
  } else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
  }

  $stmt->close();
} elseif ($action === 'register') {
  $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
  $password = filter_var($_POST['password'], FILTER_SANITIZE_STRING);

  $hashed_password = password_hash($password, PASSWORD_DEFAULT);

  $stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
  $stmt->bind_param("ss", $email, $hashed_password);

  if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
  } else {
    echo json_encode(["status" => "error", "message" => "Error registering: " . $stmt->error]);
  }

  $stmt->close();
} elseif ($action === 'createRoom') {

  $roomId = substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 6);

  $stmt = $conn->prepare("INSERT INTO rooms (id) VALUES (?)");
  $stmt->bind_param("s", $roomId);

  if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'roomId' => $roomId]);
  } else {
    echo json_encode(['status' => 'error', 'message' => 'Error creating room']);
  }

  $stmt->close();
}

$conn->close();
