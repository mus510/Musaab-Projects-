<?php
$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "esport_event";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');     // Default WAMP username
define('DB_PASS', '');         // Default WAMP password (empty)
define('DB_NAME', 'esport_db');

// Site configuration
define('BASE_URL', 'http://localhost/your-folder-name/');
?>