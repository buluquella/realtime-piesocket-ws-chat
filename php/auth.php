<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once('dbconfig.php');

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $conn->connect_error]));
}

$action = $_POST['action'];

if ($action === 'login') {
  $username = $_POST['username'];
  $password = $_POST['password'];

  $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
  $stmt->bind_param("s", $username);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {
      echo json_encode(['status' => 'success']);
    } else {
      echo json_encode(['status' => 'error', 'message' => 'Invalid username or password']);
    }
  } else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid username or password']);
  }

  $stmt->close();
} elseif ($action === 'register') {
  $username = $_POST['username'];
  $password = $_POST['password'];

  // Hash the password before storing it in the database
  $hashed_password = password_hash($password, PASSWORD_DEFAULT);

  // Use prepared statements to prevent SQL injection
  $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
  $stmt->bind_param("ss", $username, $hashed_password);

  if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
  } else {
    echo json_encode(["status" => "error", "message" => "Error registering: " . $stmt->error]);
  }

  $stmt->close();
} elseif ($action === 'createRoom') {
  $roomId = substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 6);

  $sql = "INSERT INTO rooms (id) VALUES ('$roomId')";
  if ($conn->query($sql) === TRUE) {
    echo json_encode(['status' => 'success', 'roomId' => $roomId]);
  } else {
    echo json_encode(['status' => 'error', 'message' => 'Error creating room']);
  }
}

$conn->close();
?>
