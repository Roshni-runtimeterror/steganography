<?php
include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);
$fullname = $data['fullname'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);

$sql = "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $fullname, $email, $password);

$response = [];

if ($stmt->execute()) {
    $response['status'] = "success";
} else {
    $response['status'] = "error";
    $response['message'] = "Email already exists or database error.";
}

echo json_encode($response);
$conn->close();
?>