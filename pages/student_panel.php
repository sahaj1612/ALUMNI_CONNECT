<?php
session_start();
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/helpers.php';

if(!isset($_SESSION['student_usn'])){
    redirectToApp('index.php');
}

$usn = $_SESSION['student_usn'];

$student = $db->students->findOne([
    "usn" => $usn
]);

$studentsCollection = $db->students;
$jobsCollection = $db->jobs;
$eventsCollection = $db->events;
$applicationsCollection = $db->job_applications;
$registrationsCollection = $db->event_registrations;
$notificationsCollection = $db->notifications;

$activeSection = $_GET['section'] ?? 'dashboard';
$allowedSections = ['dashboard', 'jobs', 'events', 'applied', 'registrations', 'notifications', 'profile'];
if(!in_array($activeSection, $allowedSections, true)){
    $activeSection = 'dashboard';
}

// Avoid undefined errors
$name = $student['name'] ?? "";
$email = $student['email'] ?? "";
$phone = $student['phone'] ?? "";
$dept = $student['department'] ?? "";
$batch = $student['batch'] ?? "";
$skills = $student['skills'] ?? "";
$profilePhoto = $student['profile_photo'] ?? "";
$resumePath = $student['resume_path'] ?? "";
$message = "";
$messageType = "success";

if(isset($_POST['apply_job'])){
    $jobId = $_POST['job_id'] ?? '';

    if($jobId !== ''){
        try{
            $jobObjectId = new MongoDB\BSON\ObjectId($jobId);
            $job = $jobsCollection->findOne(['_id' => $jobObjectId]);

            if($job){
                $existingApplication = $applicationsCollection->findOne([
                    'student_usn' => $usn,
                    'job_id' => $jobObjectId
                ]);

                if($existingApplication){
                    $message = "You have already applied for this job.";
                    $messageType = "warning";
                } else {
                    $applicationsCollection->insertOne([
                        'student_usn' => $usn,
                        'student_name' => $name,
                        'student_email' => $email,
                        'job_id' => $jobObjectId,
                        'alumni_email' => $job['alumni_email'] ?? '',
                        'posted_by' => $job['posted_by'] ?? '',
                        'company' => $job['company'] ?? '',
                        'role' => $job['role'] ?? '',
                        'salary' => $job['salary'] ?? '',
                        'location' => $job['location'] ?? '',
                        'resume_path' => $resumePath,
                        'status' => 'Applied',
                        'applied_at' => new MongoDB\BSON\UTCDateTime()
                    ]);

                    if(!empty($job['alumni_email'])){
                        createNotification(
                            $notificationsCollection,
                            'alumni',
                            (string) $job['alumni_email'],
                            'New job application',
                            $name . ' applied for ' . ($job['role'] ?? 'your job') . '.',
                            appUrl('alumini_panel.php?section=applications')
                        );
                    }

                    createNotification(
                        $notificationsCollection,
                        'student',
                        $usn,
                        'Application submitted',
                        'Your application for ' . ($job['role'] ?? 'the job') . ' has been submitted.',
                        appUrl('student_panel.php?section=applied')
                    );

                    $message = "Job application submitted successfully.";
                }
            } else {
                $message = "Selected job was not found.";
                $messageType = "danger";
            }
        } catch(Exception $e){
            $message = "Unable to process the application.";
            $messageType = "danger";
        }
    }

    $activeSection = 'jobs';
}

if(isset($_POST['register_event'])){
    $eventId = $_POST['event_id'] ?? '';

    if($eventId !== ''){
        try{
            $eventObjectId = new MongoDB\BSON\ObjectId($eventId);
            $event = $eventsCollection->findOne(['_id' => $eventObjectId]);

            if($event){
                $existingRegistration = $registrationsCollection->findOne([
                    'student_usn' => $usn,
                    'event_id' => $eventObjectId
                ]);

                if($existingRegistration){
                    $message = "You have already registered for this event.";
                    $messageType = "warning";
                } else {
                    $registrationsCollection->insertOne([
                        'student_usn' => $usn,
                        'student_name' => $name,
                        'student_email' => $email,
                        'event_id' => $eventObjectId,
                        'event_title' => $event['title'] ?? '',
                        'event_date' => $event['date'] ?? '',
                        'location' => $event['location'] ?? '',
                        'alumni_email' => $event['alumni_email'] ?? '',
                        'status' => 'Registered',
                        'registered_at' => new MongoDB\BSON\UTCDateTime()
                    ]);

                    if(!empty($event['alumni_email'])){
                        createNotification(
                            $notificationsCollection,
                            'alumni',
                            (string) $event['alumni_email'],
                            'New event registration',
                            $name . ' registered for ' . ($event['title'] ?? 'your event') . '.',
                            appUrl('alumini_panel.php?section=registrations')
                        );
                    }

                    createNotification(
                        $notificationsCollection,
                        'student',
                        $usn,
                        'Event registration confirmed',
                        'You are registered for ' . ($event['title'] ?? 'the event') . '.',
                        appUrl('student_panel.php?section=registrations')
                    );

                    $message = "Event registration successful.";
                }
            } else {
                $message = "Selected event was not found.";
                $messageType = "danger";
            }
        } catch(Exception $e){
            $message = "Unable to register for the event.";
            $messageType = "danger";
        }
    }

    $activeSection = 'events';
}

if(isset($_POST['mark_notifications_read'])){
    markNotificationsAsRead($notificationsCollection, 'student', $usn);
    $message = "Notifications marked as read.";
    $activeSection = 'notifications';
}

if(isset($_POST['update_profile'])){
    $newProfilePhoto = uploadFile('profile_photo', 'profile_photos', ['jpg', 'jpeg', 'png', 'webp']);
    $newResume = uploadFile('resume', 'resumes', ['pdf', 'doc', 'docx']);

    $updateData = [
        "name"=>$_POST['name'],
        "phone"=>$_POST['phone'],
        "department"=>$_POST['dept'],
        "batch"=>$_POST['batch'],
        "skills"=>$_POST['skills']
    ];

    if($newProfilePhoto !== null){
        $updateData['profile_photo'] = $newProfilePhoto;
    }

    if($newResume !== null){
        $updateData['resume_path'] = $newResume;
    }

    $studentsCollection->updateOne(
        ["usn"=>$usn],
        ['$set'=>$updateData]
    );

    header("Location: student_panel.php?section=profile");
    exit();
}

$jobCompanyFilter = trim($_GET['job_company'] ?? '');
$jobRoleFilter = trim($_GET['job_role'] ?? '');
$jobDepartmentFilter = trim($_GET['job_department'] ?? '');
$jobLocationFilter = trim($_GET['job_location'] ?? '');
$eventTitleFilter = trim($_GET['event_title'] ?? '');
$eventLocationFilter = trim($_GET['event_location'] ?? '');
$eventDateFilter = trim($_GET['event_date'] ?? '');

$jobQuery = [];
if($jobCompanyFilter !== ''){
    $jobQuery['company'] = new MongoDB\BSON\Regex(preg_quote($jobCompanyFilter), 'i');
}
if($jobRoleFilter !== ''){
    $jobQuery['role'] = new MongoDB\BSON\Regex(preg_quote($jobRoleFilter), 'i');
}
if($jobDepartmentFilter !== ''){
    $jobQuery['department'] = new MongoDB\BSON\Regex(preg_quote($jobDepartmentFilter), 'i');
}
if($jobLocationFilter !== ''){
    $jobQuery['location'] = new MongoDB\BSON\Regex(preg_quote($jobLocationFilter), 'i');
}

$eventQuery = [];
if($eventTitleFilter !== ''){
    $eventQuery['title'] = new MongoDB\BSON\Regex(preg_quote($eventTitleFilter), 'i');
}
if($eventLocationFilter !== ''){
    $eventQuery['location'] = new MongoDB\BSON\Regex(preg_quote($eventLocationFilter), 'i');
}

$jobs = $jobsCollection->find($jobQuery, ['sort' => ['created_at' => -1]])->toArray();
$events = $eventsCollection->find($eventQuery, ['sort' => ['date' => 1]])->toArray();

if($eventDateFilter !== ''){
    $events = array_values(array_filter($events, function($event) use ($eventDateFilter){
        return formatMongoDate($event['date'] ?? $event['event_date'] ?? '', 'Y-m-d') === $eventDateFilter;
    }));
}

$appliedJobs = $applicationsCollection->find(
    ['student_usn' => $usn],
    ['sort' => ['applied_at' => -1]]
)->toArray();

$registeredEvents = $registrationsCollection->find(
    ['student_usn' => $usn],
    ['sort' => ['registered_at' => -1]]
)->toArray();

$notifications = getUserNotifications($notificationsCollection, 'student', $usn, 20);
$unreadNotificationsCount = $notificationsCollection->countDocuments([
    'recipient_type' => 'student',
    'recipient_id' => $usn,
    'is_read' => false
]);

$availableJobsCount = $jobsCollection->countDocuments();
$upcomingEventsCount = $eventsCollection->countDocuments();
$appliedJobsCount = count($appliedJobs);
$registeredEventsCount = count($registeredEvents);

$appliedJobIds = [];
foreach($appliedJobs as $application){
    if(isset($application['job_id'])){
        $appliedJobIds[] = (string) $application['job_id'];
    }
}

$registeredEventIds = [];
foreach($registeredEvents as $registration){
    if(isset($registration['event_id'])){
        $registeredEventIds[] = (string) $registration['event_id'];
    }
}

$profilePhotoUrl = assetUrl($profilePhoto ?: null);
?>
<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="UTF-8">
<title>College Alumni System</title>
<meta name="viewport" content="width=device-width, initial-scale=1">

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">

<link rel="stylesheet" href="<?php echo htmlspecialchars(appUrl('assets/css/student-panel.css')); ?>">

</head>

<body data-active-section="<?php echo htmlspecialchars($activeSection, ENT_QUOTES); ?>">

<!-- Sidebar -->

<div class="sidebar">
<h4>Student Panel</h4>

<a data-section-link="dashboard" onclick="show('dashboard')"><i class="fa fa-chart-line"></i> Dashboard</a>
<a data-section-link="jobs" onclick="show('jobs')"><i class="fa fa-briefcase"></i> View Jobs</a>
<a data-section-link="events" onclick="show('events')"><i class="fa fa-calendar"></i> View Events</a>
<a data-section-link="applied" onclick="show('applied')"><i class="fa fa-file"></i> Applied Jobs</a>
<a data-section-link="registrations" onclick="show('registrations')"><i class="fa fa-ticket"></i> Event Registrations</a>
<a data-section-link="notifications" onclick="show('notifications')"><i class="fa fa-bell"></i> Notifications</a>
<a data-section-link="profile" onclick="show('profile')"><i class="fa fa-user"></i> Profile</a>

</div>

<div class="topbar">
<span>COLLEGE ALUMNI SYSTEM</span>
<div class="topbar-actions">
<a href="<?php echo htmlspecialchars(appUrl('student_panel.php?section=dashboard')); ?>" class="topbar-link">Back to Home</a>
<a href="logout.php" class="topbar-link">Logout</a>
</div>
</div>

<div class="content">

<?php if($message !== ""): ?>
<div class="alert alert-<?php echo htmlspecialchars($messageType); ?> alert-dismissible fade show" role="alert">
<?php echo htmlspecialchars($message); ?>
<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
<?php endif; ?>

<!-- Dashboard -->

<div id="dashboard" class="section active">
<h3 class="mb-4">Dashboard</h3>

<div class="row">

<div class="col-md-4">
<div class="card-box">
<i class="fa fa-briefcase fa-3x text-primary"></i>
<h2><?php echo $availableJobsCount; ?></h2>
<p>Available Jobs</p>
</div>
</div>

<div class="col-md-4">
<div class="card-box">
<i class="fa fa-calendar fa-3x text-success"></i>
<h2><?php echo $upcomingEventsCount; ?></h2>
<p>Upcoming Events</p>
</div>
</div>

<div class="col-md-4">
<div class="card-box">
<i class="fa fa-file fa-3x text-danger"></i>
<h2><?php echo $appliedJobsCount; ?></h2>
<p>Applied Jobs</p>
</div>
</div>

<div class="col-md-4 mt-4">
<div class="card-box">
<i class="fa fa-ticket fa-3x text-warning"></i>
<h2><?php echo $registeredEventsCount; ?></h2>
<p>Registered Events</p>
</div>
</div>

<div class="col-md-4 mt-4">
<div class="card-box">
<i class="fa fa-bell fa-3x text-info"></i>
<h2><?php echo $unreadNotificationsCount; ?></h2>
<p>Unread Notifications</p>
</div>
</div>

</div>
</div>

<!-- Jobs -->

<div id="jobs" class="section">
<h3 class="mb-4">Jobs List</h3>

<div class="table-card">
<table class="table table-bordered bg-white mb-0">
<thead class="table-dark">
<tr>
<th>#</th>
<th>Company</th>
<th>Role</th>
<th>Department</th>
<th>Salary</th>
<th>Location</th>
<th>Action</th>
</tr>
</thead>

<tbody>
<?php if(empty($jobs)): ?>
<tr>
<td colspan="7" class="text-center py-4">No jobs are available right now.</td>
</tr>
<?php else: ?>
<?php foreach($jobs as $index => $job): ?>
<tr>
<td><?php echo $index + 1; ?></td>
<td><?php echo htmlspecialchars($job['company'] ?? ''); ?></td>
<td><?php echo htmlspecialchars($job['role'] ?? ''); ?></td>
<td><?php echo htmlspecialchars($job['department'] ?? 'All Departments'); ?></td>
<td><?php echo htmlspecialchars($job['salary'] ?? 'Not specified'); ?></td>
<td><?php echo htmlspecialchars($job['location'] ?? 'Not specified'); ?></td>
<td>
<?php $jobId = (string) $job['_id']; ?>
<div class="d-flex gap-2 flex-wrap">
<a href="job_details.php?type=job&id=<?php echo urlencode($jobId); ?>" class="btn btn-outline-primary btn-sm">View</a>
<?php if(in_array($jobId, $appliedJobIds, true)): ?>
<button class="btn btn-secondary btn-sm" disabled>Applied</button>
<?php else: ?>
<form method="POST" class="mb-0">
<input type="hidden" name="job_id" value="<?php echo htmlspecialchars($jobId); ?>">
<button type="submit" name="apply_job" class="btn btn-primary btn-sm">Apply</button>
</form>
<?php endif; ?>
</div>
</td>
</tr>
<?php endforeach; ?>
<?php endif; ?>
</tbody>
</table>
</div>
</div>

<!-- Events -->

<div id="events" class="section">
<h3 class="mb-4">Events</h3>

<div class="table-card">
<table class="table table-bordered bg-white mb-0">
<thead class="table-dark">
<tr>
<th>#</th>
<th>Event</th>
<th>Date</th>
<th>Location</th>
<th>Action</th>
</tr>
</thead>

<tbody>
<?php if(empty($events)): ?>
<tr>
<td colspan="5" class="text-center py-4">No events have been posted yet.</td>
</tr>
<?php else: ?>
<?php foreach($events as $index => $event): ?>
<tr>
<td><?php echo $index + 1; ?></td>
<td><?php echo htmlspecialchars($event['title'] ?? $event['event_name'] ?? ''); ?></td>
<td>
<?php
$eventDate = $event['date'] ?? $event['event_date'] ?? '';
if($eventDate instanceof MongoDB\BSON\UTCDateTime){
    echo htmlspecialchars($eventDate->toDateTime()->format('d-m-Y'));
} else {
    echo htmlspecialchars((string) $eventDate);
}
?>
</td>
<td><?php echo htmlspecialchars($event['location'] ?? 'Not specified'); ?></td>
<td>
<?php $eventId = (string) $event['_id']; ?>
<div class="d-flex gap-2 flex-wrap">
<a href="job_details.php?type=event&id=<?php echo urlencode($eventId); ?>" class="btn btn-outline-success btn-sm">View</a>
<?php if(in_array($eventId, $registeredEventIds, true)): ?>
<button class="btn btn-secondary btn-sm" disabled>Registered</button>
<?php else: ?>
<form method="POST" class="mb-0">
<input type="hidden" name="event_id" value="<?php echo htmlspecialchars($eventId); ?>">
<button type="submit" name="register_event" class="btn btn-success btn-sm">Register</button>
</form>
<?php endif; ?>
</div>
</td>
</tr>
<?php endforeach; ?>
<?php endif; ?>
</tbody>
</table>
</div>
</div>

<!-- Applied Jobs -->

<div id="applied" class="section">
<h3 class="mb-4">Applied Jobs</h3>

<div class="table-card">
<table class="table table-bordered bg-white mb-0">
<thead class="table-dark">
<tr>
<th>#</th>
<th>Company</th>
<th>Role</th>
<th>Status</th>
<th>Applied On</th>
<th>Resume</th>
</tr>
</thead>
<tbody>
<?php if(empty($appliedJobs)): ?>
<tr>
<td colspan="6" class="text-center py-4">You have not applied for any jobs yet.</td>
</tr>
<?php else: ?>
<?php foreach($appliedJobs as $index => $application): ?>
<tr>
<td><?php echo $index + 1; ?></td>
<td><?php echo htmlspecialchars($application['company'] ?? ''); ?></td>
<td><?php echo htmlspecialchars($application['role'] ?? ''); ?></td>
<td><span class="badge text-bg-info"><?php echo htmlspecialchars($application['status'] ?? 'Applied'); ?></span></td>
<td>
<?php
$appliedAt = $application['applied_at'] ?? null;
if($appliedAt instanceof MongoDB\BSON\UTCDateTime){
    echo htmlspecialchars($appliedAt->toDateTime()->format('d-m-Y h:i A'));
} else {
    echo "N/A";
}
?>
</td>
<td>
<?php if(!empty($application['resume_path'])): ?>
<a href="<?php echo htmlspecialchars(appUrl($application['resume_path'])); ?>" target="_blank" class="btn btn-outline-secondary btn-sm">View</a>
<?php else: ?>
<span class="small-muted">Not uploaded</span>
<?php endif; ?>
</td>
</tr>
<?php endforeach; ?>
<?php endif; ?>
</tbody>
</table>
</div>
</div>

<div id="registrations" class="section">
<h3 class="mb-4">Event Registrations</h3>

<div class="table-card">
<table class="table table-bordered bg-white mb-0">
<thead class="table-dark">
<tr>
<th>#</th>
<th>Event</th>
<th>Date</th>
<th>Location</th>
<th>Status</th>
<th>Registered On</th>
</tr>
</thead>
<tbody>
<?php if(empty($registeredEvents)): ?>
<tr>
<td colspan="6" class="text-center py-4">You have not registered for any events yet.</td>
</tr>
<?php else: ?>
<?php foreach($registeredEvents as $index => $registration): ?>
<tr>
<td><?php echo $index + 1; ?></td>
<td><?php echo htmlspecialchars($registration['event_title'] ?? ''); ?></td>
<td><?php echo htmlspecialchars(formatMongoDate($registration['event_date'] ?? '', 'd-m-Y')); ?></td>
<td><?php echo htmlspecialchars($registration['location'] ?? ''); ?></td>
<td><span class="badge text-bg-success"><?php echo htmlspecialchars($registration['status'] ?? 'Registered'); ?></span></td>
<td><?php echo htmlspecialchars(formatMongoDate($registration['registered_at'] ?? '', 'd-m-Y h:i A')); ?></td>
</tr>
<?php endforeach; ?>
<?php endif; ?>
</tbody>
</table>
</div>
</div>

<div id="notifications" class="section">
<div class="d-flex justify-content-between align-items-center mb-4">
<h3 class="mb-0">Notifications</h3>
<form method="POST" class="mb-0">
<button type="submit" name="mark_notifications_read" class="btn btn-outline-primary btn-sm">Mark All Read</button>
</form>
</div>

<?php if(empty($notifications)): ?>
<div class="notification-card">
<p class="mb-0 small-muted">No notifications yet.</p>
</div>
<?php else: ?>
<?php foreach($notifications as $notification): ?>
<div class="notification-card mb-3">
<div class="d-flex justify-content-between gap-3">
<div>
<h5 class="mb-1"><?php echo htmlspecialchars($notification['title'] ?? 'Notification'); ?></h5>
<p class="mb-2"><?php echo htmlspecialchars($notification['message'] ?? ''); ?></p>
<div class="small-muted"><?php echo htmlspecialchars(formatMongoDate($notification['created_at'] ?? '', 'd-m-Y h:i A')); ?></div>
</div>
<?php if(!empty($notification['link'])): ?>
<a href="<?php echo htmlspecialchars($notification['link']); ?>" class="btn btn-outline-secondary btn-sm align-self-start">Open</a>
<?php endif; ?>
</div>
</div>
<?php endforeach; ?>
<?php endif; ?>
</div>

<!-- Profile -->

<div id="profile" class="section">
<h3 class="mb-4">My Profile</h3>

<div class="profile-card">

<form method="POST" enctype="multipart/form-data" class="w-100">
<div class="profile-layout">
<div class="profile-side">
<img src="<?php echo htmlspecialchars($profilePhotoUrl); ?>" class="profile-img">
<label class="form-label mt-3">Profile Photo</label>
<input type="file" name="profile_photo" class="form-control mb-3">

<label class="form-label">Resume</label>
<input type="file" name="resume" class="form-control">
<?php if($resumePath !== ''): ?>
<a href="<?php echo htmlspecialchars(appUrl($resumePath)); ?>" target="_blank" class="btn btn-outline-secondary btn-sm mt-2">Current Resume</a>
<?php endif; ?>
</div>

<div class="profile-main">
<div class="row">
<div class="col-md-6 mb-3">
<label class="form-label">Name</label>
<input type="text" name="name" class="form-control"
value="<?php echo htmlspecialchars($name); ?>">
</div>

<div class="col-md-6 mb-3">
<label class="form-label">Email</label>
<input type="text" class="form-control"
value="<?php echo htmlspecialchars($email); ?>" readonly>
</div>

<div class="col-md-6 mb-3">
<label class="form-label">Phone</label>
<input type="text" name="phone" class="form-control"
value="<?php echo htmlspecialchars($phone); ?>">
</div>

<div class="col-md-6 mb-3">
<label class="form-label">Department</label>
<input type="text" name="dept" class="form-control"
value="<?php echo htmlspecialchars($dept); ?>">
</div>

<div class="col-md-6 mb-3">
<label class="form-label">Batch</label>
<input type="text" name="batch" class="form-control"
value="<?php echo htmlspecialchars($batch); ?>">
</div>

<div class="col-md-6 mb-3">
<label class="form-label">Skills</label>
<input type="text" name="skills" class="form-control"
value="<?php echo htmlspecialchars($skills); ?>">
</div>
</div>

<button class="btn btn-primary" name="update_profile">
Save Profile
</button>
</div>
</div>

</form>

</div>
</div>

</div>

<script src="<?php echo htmlspecialchars(appUrl('assets/js/student-panel.js')); ?>"></script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
