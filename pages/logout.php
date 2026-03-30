<?php
session_start();
session_unset();
session_destroy();

require __DIR__ . '/../config/helpers.php';
header('Location: ' . appUrl('index.php'));
exit();
