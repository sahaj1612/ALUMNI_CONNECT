<?php
session_start();
include "../../config/db.php";

$usn = $_POST['susn'];
$email = $_POST['semail'];
$password = $_POST['spassword'];

$user = $db->students->findOne([
    "usn" => $usn,
    "email" => $email,
    "password" => $password
]);

if($user){

    $_SESSION['student_usn'] = $usn;

    header("Location: ../../student_panel.php");
    exit();

}else{
    echo "<script>
        alert('Invalid Login');
        window.location.href='../../index.php';
    </script>";
}
?>