<!DOCTYPE html>
<html>
<body>
<?php
include 'config.php'; 


$username   = $_POST['username'];
$email      = $_POST['email'];
$password   = $_POST['password']; 
$event_name = $_POST['event_name'];


$sql_user = "INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$password')";

if ($conn->query($sql_user) === TRUE) {
    $user_id = $conn->insert_id;

    $sql_registration = "INSERT INTO registrations (user_id, event_name) VALUES ('$user_id', '$event_name')";

    if ($conn->query($sql_registration) === TRUE) {
        echo "✅ Registration successful!";
    } else {
        die("❌ Error in registrations table: " . $conn->error);
    }
} else {
    die("❌ Error in users table: " . $conn->error);
}

$conn->close();
?>
</body>
</html>
