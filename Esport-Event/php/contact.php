<?php
session_start();
require_once '../config.php';
require_once '../db_connection.php';

$errors = [];
$success = '';

// Process form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verify CSRF token
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        $errors[] = "Invalid CSRF token";
    } else {
        // Sanitize inputs
        $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
        $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
        $subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
        $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

        // Validate inputs
        if (empty($name)) {
            $errors[] = "Name is required";
        }
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Valid email is required";
        }
        if (empty($subject)) {
            $errors[] = "Subject is required";
        }
        if (empty($message)) {
            $errors[] = "Message is required";
        }

        if (empty($errors)) {
            try {
                // Insert into database
                $stmt = $conn->prepare("INSERT INTO contacts 
                    (name, email, subject, message, ip_address, created_at)
                    VALUES (?, ?, ?, ?, ?, NOW())");
                
                $ip_address = $_SERVER['REMOTE_ADDR'];
                $stmt->bind_param("sssss", $name, $email, $subject, $message, $ip_address);
                $stmt->execute();

                // Send email notification
                $to = ADMIN_EMAIL;
                $email_subject = "New Contact Form Submission: $subject";
                $email_body = "Name: $name\nEmail: $email\nSubject: $subject\nMessage:\n$message";
                $headers = "From: " . SITE_EMAIL;
                
                mail($to, $email_subject, $email_body, $headers);

                $success = "Your message has been sent successfully!";
            } catch (Exception $e) {
                $errors[] = "Error submitting form: " . $e->getMessage();
            }
        }
    }
}

// Generate CSRF token
$csrf_token = bin2hex(random_bytes(32));
$_SESSION['csrf_token'] = $csrf_token;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <?php include '../partials/head.php'; ?>
    <title>Contact Us - GameZone</title>
</head>
<body>
    <?php include '../partials/navbar.php'; ?>

    <main class="container">
        <section class="contact-section">
            <h1 class="section-title">Contact GameZone</h1>
            
            <?php if (!empty($errors)): ?>
                <div class="error-message">
                    <?php foreach ($errors as $error): ?>
                        <p><?= htmlspecialchars($error) ?></p>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <?php if ($success)): ?>
                <div class="success-message">
                    <p><?= htmlspecialchars($success) ?></p>
                </div>
            <?php endif; ?>

            <form method="POST" class="contact-form">
                <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">
                
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" name="name" required 
                           value="<?= htmlspecialchars($_POST['name'] ?? '') ?>">
                </div>

                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required
                           value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
                </div>

                <div class="form-group">
                    <label for="subject">Subject</label>
                    <input type="text" id="subject" name="subject" required
                           value="<?= htmlspecialchars($_POST['subject'] ?? '') ?>">
                </div>

                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" rows="5" required><?= 
                        htmlspecialchars($_POST['message'] ?? '') ?></textarea>
                </div>

                <button type="submit" class="cta-button">Send Message</button>
            </form>
        </section>
    </main>

    <?php include '../partials/footer.php'; ?>
</body>
</html>