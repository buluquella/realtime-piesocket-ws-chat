<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once('dbconfig.php');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  http_response_code(500);
  die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $conn->connect_error]));
}

$action = $_POST['action'];

if ($action === 'login') {
  $email = $_POST['email'];
  $password = $_POST['password'];

  // Check if user exists
  $sql = "SELECT * FROM users WHERE email = '$email'";
  $result = $conn->query($sql);

  if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // Verify the password
    if (password_verify($password, $user['password'])) {
      echo json_encode(['status' => 'success']);
    } else {
      echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
    }
  } else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
  }
} elseif ($action === 'register') {
  $email = $_POST['email'];
  $password = $_POST['password'];

  // Hash the password before storing it in the database
  $hashed_password = password_hash($password, PASSWORD_DEFAULT);

  // Use prepared statements to prevent SQL injection
  $stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
  $stmt->bind_param("ss", $email, $hashed_password);

  if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
  } else {
    echo json_encode(["status" => "error", "message" => "Error registering: " . $stmt->error]);
  }

  $stmt->close();
} elseif ($action === 'createRoom') {
  // Create a new room
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
