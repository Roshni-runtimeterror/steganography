<?php
$host = "localhost";
$user = "root"; // default XAMPP username
$pass = ""; // leave empty if no password
$dbname = "steganography_db";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>