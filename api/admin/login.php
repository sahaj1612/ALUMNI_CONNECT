<?php
session_start();
include "../../config/db.php";
include "../../config/helpers.php";

ensureAdminSeed($db);

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

$admin = $db->admins->findOne([
    'email' => $email,
    'password' => $password,
]);

if ($admin) {
    $_SESSION['admin_email'] = $email;
    header('Location: ../../admin_panel.php');
    exit();
}

echo "<script>
    alert('Invalid Admin Login');
    window.location.href='../../index.php';
</script>";

