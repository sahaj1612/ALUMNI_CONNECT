<?php

require __DIR__ . '/../config/db.php';

$students = $db->students->find();

foreach ($students as $s) {
    echo $s["email"] . "<br>";
}

?>
