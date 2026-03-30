<?php
session_start();

include "../../config/db.php";
include "../../config/helpers.php";

$data = json_decode(file_get_contents("php://input"));

$email = $data->email ?? $_POST['email'] ?? "";
$password = $data->password ?? $_POST['password'] ?? "";

$user = $db->alumni->findOne([
    "email"=>$email,
    "password"=>$password
]);

if($user){
    $_SESSION['alumni_email'] = $email;
    header('Content-Type: application/json');
    echo json_encode([
        "status"=>"success",
        "message"=>"Login successful",
        "redirect"=>appUrl("alumini_panel.php")
    ]);
}else{
    header('Content-Type: application/json');
    echo json_encode([
        "status"=>"fail",
        "message"=>"Invalid credentials"
    ]);
}

?>
