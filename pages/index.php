<?php
session_start();
require __DIR__ . '/../config/helpers.php';

if(isset($_SESSION['student_usn'])){
    redirectToApp('student_panel.php');
}

if(isset($_SESSION['alumni_email'])){
    redirectToApp('alumini_panel.php');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SDMCET AlumniConnect | Dharwad</title>

<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<link rel="stylesheet" href="<?php echo htmlspecialchars(appUrl('assets/css/index.css')); ?>">
</head>

<body>

<div class="navbar">
    <div class="nav-left">
        <img src="https://cache.careers360.mobi/media/colleges/social-media/logo/SDM_College_of_Engineering_and_Technology_Logo_.png">
        <h2>SDMCET AlumniConnect</h2>
    </div>

    <ul>
        <li>About SDMCET</li>
        <li>Alumni</li>
        <li>Events</li>
        <li>Support</li>
    </ul>
</div>

<div class="hero">

<div class="slide slide1"></div>
<div class="slide slide2"></div>
<div class="slide slide3"></div>

<div class="hero-content">

<h1>SDMCET AlumniConnect</h1>

<h3>Shaping Engineers with Knowledge, Values, and Innovation</h3>

<p>
A dedicated alumni engagement platform for
<strong>S.D.M. College of Engineering & Technology, Dharwad</strong>,
encouraging meaningful conversations between students and alumni
to support learning, collaboration, and industry readiness.
</p>

<button class="hero-login-btn" onclick="openModal()">Login</button>

</div>
</div>

<div id="loginModal" class="modal">

<div class="modal-box">

<span class="close" onclick="closeModal()">&times;</span>

<div id="loginChoice">

<h2>Welcome to AlumniConnect</h2>
<p>Select how you want to login</p>


<button class="select-btn" onclick="showStudent()">Student Login</button>
<button class="select-btn" onclick="showAlumni()">Alumni Login</button>

</div>
<div id="studentLogin" class="login-form">
<h3>Student Login</h3>
<form action="<?php echo htmlspecialchars(appUrl('api/student/login.php')); ?>" method="POST">
<input type="text" id="susn"name="susn" placeholder="USN" required>
<input type="email" id="semail" name="semail" placeholder="College Email" required>
<input type="password" id="spassword" name="spassword" placeholder="Password" required>
<button class="submit-btn" type="submit">Login</button>
</form>
<p class="back" onclick="backChoice()">Back</p>
</div>


<div id="alumniLogin" class="login-form">

<h3>Alumni Login</h3>

<input type="email" id="aemail" placeholder="Email" required>
<input type="password" id="apassword" placeholder="Password" required>

<button class="submit-btn" onclick="alumniLogin()">Login</button>

<p class="back" onclick="backChoice()">Back</p>

</div>


</div>
</div>

<footer>
&copy; 2026 S.D.M. College of Engineering & Technology, Dharwad
</footer>

<script src="<?php echo htmlspecialchars(appUrl('assets/js/index.js')); ?>"></script>

</body>
</html>
