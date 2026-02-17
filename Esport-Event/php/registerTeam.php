<?php
// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "gamezone";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Process form data
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize inputs
    $team_name = mysqli_real_escape_string($conn, $_POST['team_name']);
    $selected_game = mysqli_real_escape_string($conn, $_POST['selected_game']);
    $team_captain = mysqli_real_escape_string($conn, $_POST['team_captain']);
    $player1 = mysqli_real_escape_string($conn, $_POST['player1']);
    $player2 = mysqli_real_escape_string($conn, $_POST['player2']);
    $player3 = mysqli_real_escape_string($conn, $_POST['player3']);

    // Validate required fields
    if (empty($team_name) || empty($selected_game) || empty($team_captain) || 
        empty($player1) || empty($player2) || empty($player3)) {
        die("All fields are required!");
    }

    // Insert into database
    $sql = "INSERT INTO registerTeam (team_name, selected_game, team_captain, player1, player2, player3)
            VALUES ('$team_name', '$selected_game', '$team_captain', '$player1', '$player2', '$player3')";

    if ($conn->query($sql) === TRUE) {
        echo "<script>alert('Team registered successfully!'); window.location.href='registerTeam.html';</script>";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

    $conn->close();
}
?>