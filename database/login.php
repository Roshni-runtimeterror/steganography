<?php
include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'];
$password = $data['password'];

$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

$response = [];

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password'])) {
        $response['status'] = "success";
        $response['fullname'] = $user['fullname'];
    } else {
        $response['status'] = "error";
        $response['message'] = "Invalid password.";
    }
} else {
    $response['status'] = "error";
    $response['message'] = "User not found.";
}

echo json_encode($response);
$conn->close();
?>