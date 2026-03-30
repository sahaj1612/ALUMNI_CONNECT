<?php
session_start();
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/helpers.php';

if(!isset($_SESSION['alumni_email'])){
    redirectToApp('index.php');
}

$alumniEmail = $_SESSION['alumni_email'];
$alumni = $db->alumni->findOne([
    "email" => $alumniEmail
]);

if(!$alumni){
    session_destroy();
    redirectToApp('index.php');
}

$alumniCollection = $db->alumni;
$jobsCollection = $db->jobs;
$eventsCollection = $db->events;
$applicationsCollection = $db->job_applications;
$registrationsCollection = $db->event_registrations;
$notificationsCollection = $db->notifications;

$activeSection = $_GET['section'] ?? 'dashboard';
$allowedSections = ['dashboard', 'post-job', 'jobs', 'post-event', 'events', 'applications', 'registrations', 'notifications', 'profile'];
if(!in_array($activeSection, $allowedSections, true)){
    $activeSection = 'dashboard';
}

$name = $alumni['name'] ?? '';
$email = $alumni['email'] ?? '';
$company = $alumni['company'] ?? '';
$year = $alumni['year'] ?? '';
$profilePhoto = $alumni['profile_photo'] ?? '';
$message = '';
$messageType = 'success';

$editJob = null;
$editEvent = null;

if(isset($_GET['edit_job'])){
    try{
        $editJob = $jobsCollection->findOne([
            '_id' => new MongoDB\BSON\ObjectId($_GET['edit_job']),
            'alumni_email' => $email
        ]);
    } catch(Exception $e){
        $editJob = null;
    }
}

if(isset($_GET['edit_event'])){
    try{
        $editEvent = $eventsCollection->findOne([
            '_id' => new MongoDB\BSON\ObjectId($_GET['edit_event']),
            'alumni_email' => $email
        ]);
    } catch(Exception $e){
        $editEvent = null;
    }
}

if(isset($_POST['add_job'])){
    $jobsCollection->insertOne([
        'company' => trim($_POST['company'] ?? $company),
        'role' => trim($_POST['role'] ?? ''),
        'salary' => trim($_POST['salary'] ?? ''),
        'location' => trim($_POST['location'] ?? ''),
        'department' => trim($_POST['department'] ?? ''),
        'eligibility' => trim($_POST['eligibility'] ?? ''),
        'description' => trim($_POST['description'] ?? ''),
        'posted_by' => $name,
        'alumni_email' => $email,
        'created_at' => new MongoDB\BSON\UTCDateTime()
    ]);

    $studentIds = $db->students->distinct('usn');
    createBulkNotifications(
        $notificationsCollection,
        'student',
        $studentIds,
        'New job posted',
        ($company ?: $name) . ' posted a new job: ' . trim($_POST['role'] ?? ''),
        appUrl('student_panel.php?section=jobs')
    );

    $message = 'Job posted successfully.';
    $activeSection = 'jobs';
}

if(isset($_POST['update_job'])){
    try{
        $jobsCollection->updateOne(
            [
                '_id' => new MongoDB\BSON\ObjectId($_POST['job_id'] ?? ''),
                'alumni_email' => $email
            ],
            ['$set' => [
                'company' => trim($_POST['company'] ?? $company),
                'role' => trim($_POST['role'] ?? ''),
                'salary' => trim($_POST['salary'] ?? ''),
                'location' => trim($_POST['location'] ?? ''),
                'department' => trim($_POST['department'] ?? ''),
                'eligibility' => trim($_POST['eligibility'] ?? ''),
                'description' => trim($_POST['description'] ?? ''),
            ]]
        );
        $message = 'Job updated successfully.';
    } catch(Exception $e){
        $message = 'Unable to update job.';
        $messageType = 'danger';
    }
    $activeSection = 'jobs';
}

if(isset($_POST['delete_job'])){
    try{
        $jobObjectId = new MongoDB\BSON\ObjectId($_POST['job_id'] ?? '');
        $jobsCollection->deleteOne([
            '_id' => $jobObjectId,
            'alumni_email' => $email
        ]);
        $applicationsCollection->deleteMany(['job_id' => $jobObjectId]);
        $message = 'Job deleted successfully.';
    } catch(Exception $e){
        $message = 'Unable to delete job.';
        $messageType = 'danger';
    }
    $activeSection = 'jobs';
}

if(isset($_POST['add_event'])){
    $eventDateInput = trim($_POST['event_date'] ?? '');
    $eventDateValue = $eventDateInput;

    if($eventDateInput !== ''){
        $timestamp = strtotime($eventDateInput);
        if($timestamp !== false){
            $eventDateValue = new MongoDB\BSON\UTCDateTime($timestamp * 1000);
        }
    }

    $eventsCollection->insertOne([
        'title' => trim($_POST['title'] ?? ''),
        'date' => $eventDateValue,
        'location' => trim($_POST['location'] ?? ''),
        'description' => trim($_POST['description'] ?? ''),
        'posted_by' => $name,
        'alumni_email' => $email,
        'created_at' => new MongoDB\BSON\UTCDateTime()
    ]);

    $studentIds = $db->students->distinct('usn');
    createBulkNotifications(
        $notificationsCollection,
        'student',
        $studentIds,
        'New event posted',
        $name . ' posted a new event: ' . trim($_POST['title'] ?? ''),
        appUrl('student_panel.php?section=events')
    );

    $message = 'Event posted successfully.';
    $activeSection = 'events';
}

if(isset($_POST['update_event'])){
    $eventDateInput = trim($_POST['event_date'] ?? '');
    $eventDateValue = $eventDateInput;
    if($eventDateInput !== ''){
        $eventDateValue = mongoDateFromInput($eventDateInput);
    }

    try{
        $eventsCollection->updateOne(
            [
                '_id' => new MongoDB\BSON\ObjectId($_POST['event_id'] ?? ''),
                'alumni_email' => $email
            ],
            ['$set' => [
                'title' => trim($_POST['title'] ?? ''),
                'date' => $eventDateValue,
                'location' => trim($_POST['location'] ?? ''),
                'description' => trim($_POST['description'] ?? ''),
            ]]
        );
        $message = 'Event updated successfully.';
    } catch(Exception $e){
        $message = 'Unable to update event.';
        $messageType = 'danger';
    }
    $activeSection = 'events';
}

if(isset($_POST['delete_event'])){
    try{
        $eventObjectId = new MongoDB\BSON\ObjectId($_POST['event_id'] ?? '');
        $eventsCollection->deleteOne([
            '_id' => $eventObjectId,
            'alumni_email' => $email
        ]);
        $registrationsCollection->deleteMany(['event_id' => $eventObjectId]);
        $message = 'Event deleted successfully.';
    } catch(Exception $e){
        $message = 'Unable to delete event.';
        $messageType = 'danger';
    }
    $activeSection = 'events';
}

if(isset($_POST['update_application_status'])){
    $applicationId = $_POST['application_id'] ?? '';
    $status = $_POST['status'] ?? 'Applied';
    $allowedStatuses = ['Applied', 'Reviewed', 'Shortlisted', 'Rejected', 'Selected'];

    if($applicationId !== '' && in_array($status, $allowedStatuses, true)){
        try{
            $applicationsCollection->updateOne(
                ['_id' => new MongoDB\BSON\ObjectId($applicationId)],
                ['$set' => ['status' => $status]]
            );
            $updatedApplication = $applicationsCollection->findOne(['_id' => new MongoDB\BSON\ObjectId($applicationId)]);
            if($updatedApplication && !empty($updatedApplication['student_usn'])){
                createNotification(
                    $notificationsCollection,
                    'student',
                    (string) $updatedApplication['student_usn'],
                    'Application status updated',
                    'Your application for ' . ($updatedApplication['role'] ?? 'the job') . ' is now ' . $status . '.',
                    appUrl('student_panel.php?section=applied')
                );
            }
            $message = 'Application status updated.';
        } catch(Exception $e){
            $message = 'Unable to update application status.';
            $messageType = 'danger';
        }
    }

    $activeSection = 'applications';
}

if(isset($_POST['update_profile'])){
    $newProfilePhoto = uploadFile('profile_photo', 'profile_photos', ['jpg', 'jpeg', 'png', 'webp']);
    $updateData = [
        'name' => trim($_POST['name'] ?? ''),
        'company' => trim($_POST['company'] ?? ''),
        'year' => trim($_POST['year'] ?? '')
    ];

    if($newProfilePhoto !== null){
        $updateData['profile_photo'] = $newProfilePhoto;
    }

    $alumniCollection->updateOne(
        ['email' => $email],
        ['$set' => $updateData]
    );

    header("Location: alumini_panel.php?section=profile");
    exit();
}

if(isset($_POST['mark_notifications_read'])){
    markNotificationsAsRead($notificationsCollection, 'alumni', $email);
    $message = 'Notifications marked as read.';
    $activeSection = 'notifications';
}

$postedJobs = $jobsCollection->find(
    ['alumni_email' => $email],
    ['sort' => ['created_at' => -1]]
)->toArray();

$postedEvents = $eventsCollection->find(
    ['alumni_email' => $email],
    ['sort' => ['created_at' => -1]]
)->toArray();

$postedJobIds = [];
foreach($postedJobs as $job){
    $postedJobIds[] = $job['_id'];
}

$applications = [];
if(!empty($postedJobIds)){
    $applications = $applicationsCollection->find(
        ['job_id' => ['$in' => $postedJobIds]],
        ['sort' => ['applied_at' => -1]]
    )->toArray();
}

$postedEventIds = [];
foreach($postedEvents as $event){
    $postedEventIds[] = $event['_id'];
}

$registrations = [];
if(!empty($postedEventIds)){
    $registrations = $registrationsCollection->find(
        ['event_id' => ['$in' => $postedEventIds]],
        ['sort' => ['registered_at' => -1]]
    )->toArray();
}

$notifications = getUserNotifications($notificationsCollection, 'alumni', $email, 20);
$unreadNotificationsCount = $notificationsCollection->countDocuments([
    'recipient_type' => 'alumni',
    'recipient_id' => $email,
    'is_read' => false
]);

$jobsCount = count($postedJobs);
$eventsCount = count($postedEvents);
$applicationsCount = count($applications);
$registrationsCount = count($registrations);
$profilePhotoUrl = assetUrl($profilePhoto ?: null);
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Alumni Panel</title>
<meta name="viewport" content="width=device-width, initial-scale=1">

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">

<link rel="stylesheet" href="<?php echo htmlspecialchars(appUrl('assets/css/alumni-panel.css')); ?>">
</head>
<body data-active-section="<?php echo htmlspecialchars($activeSection, ENT_QUOTES); ?>">

<div class="sidebar">
<h4>Alumni Panel</h4>
<a data-section-link="dashboard" onclick="show('dashboard')"><i class="fa fa-chart-line"></i> Dashboard</a>
<a data-section-link="post-job" onclick="show('post-job')"><i class="fa fa-plus-circle"></i> Post Job</a>
<a data-section-link="jobs" onclick="show('jobs')"><i class="fa fa-briefcase"></i> My Jobs</a>
<a data-section-link="post-event" onclick="show('post-event')"><i class="fa fa-calendar-plus"></i> Post Event</a>
<a data-section-link="events" onclick="show('events')"><i class="fa fa-calendar"></i> My Events</a>
<a data-section-link="applications" onclick="show('applications')"><i class="fa fa-file-lines"></i> Job Applications</a>
<a data-section-link="registrations" onclick="show('registrations')"><i class="fa fa-ticket"></i> Event Registrations</a>
<a data-section-link="notifications" onclick="show('notifications')"><i class="fa fa-bell"></i> Notifications</a>
<a data-section-link="profile" onclick="show('profile')"><i class="fa fa-user"></i> Profile</a>
</div>

<div class="topbar">
<span>COLLEGE ALUMNI SYSTEM</span>
<div class="topbar-actions">
<a href="<?php echo htmlspecialchars(appUrl('alumini_panel.php?section=dashboard')); ?>" class="logout-link">Back to Home</a>
<a href="logout.php" class="logout-link">Logout</a>
</div>
</div>

<div class="content">
<?php if($message !== ''): ?>
<div class="alert alert-<?php echo htmlspecialchars($messageType); ?> alert-dismissible fade show" role="alert">
<?php echo htmlspecialchars($message); ?>
<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
<?php endif; ?>

<div id="dashboard" class="section active">
<h3 class="mb-4">Dashboard</h3>
<div class="row g-4">
<div class="col-md-4">
<div class="card-box">
<i class="fa fa-briefcase fa-3x text-primary"></i>
<h2 class="mt-3"><?php echo $jobsCount; ?></h2>
<p>Jobs Posted</p>
</div>
</div>
<div class="col-md-4">
<div class="card-box">
<i class="fa fa-calendar fa-3x text-success"></i>
<h2 class="mt-3"><?php echo $eventsCount; ?></h2>
<p>Events Posted</p>
</div>
</div>
<div class="col-md-4">
<div class="card-box">
<i class="fa fa-file-lines fa-3x text-danger"></i>
<h2 class="mt-3"><?php echo $applicationsCount; ?></h2>
<p>Applications Received</p>
</div>
</div>
<div class="col-md-4">
<div class="card-box">
<i class="fa fa-ticket fa-3x text-warning"></i>
<h2 class="mt-3"><?php echo $registrationsCount; ?></h2>
<p>Event Registrations</p>
</div>
</div>
<div class="col-md-4">
<div class="card-box">
<i class="fa fa-bell fa-3x text-info"></i>
<h2 class="mt-3"><?php echo $unreadNotificationsCount; ?></h2>
<p>Unread Notifications</p>
</div>
</div>
</div>
</div>

<div id="post-job" class="section">
<h3 class="mb-4"><?php echo $editJob ? 'Edit Job' : 'Post Job'; ?></h3>
<div class="form-card">
<form method="POST">
<?php if($editJob): ?>
<input type="hidden" name="job_id" value="<?php echo htmlspecialchars((string) $editJob['_id']); ?>">
<?php endif; ?>
<div class="row">
<div class="col-md-6 mb-3">
<label class="form-label">Company</label>
<input type="text" name="company" class="form-control" value="<?php echo htmlspecialchars($editJob['company'] ?? $company); ?>" required>
</div>
<div class="col-md-6 mb-3">
<label class="form-label">Role</label>
<input type="text" name="role" class="form-control" value="<?php echo htmlspecialchars($editJob['role'] ?? ''); ?>" required>
</div>
<div class="col-md-6 mb-3">
<label class="form-label">Salary</label>
<input type="text" name="salary" class="form-control" placeholder="Eg: 6 LPA" value="<?php echo htmlspecialchars($editJob['salary'] ?? ''); ?>">
</div>
<div class="col-md-6 mb-3">
<label class="form-label">Location</label>
<input type="text" name="location" class="form-control" value="<?php echo htmlspecialchars($editJob['location'] ?? ''); ?>">
</div>
<div class="col-md-6 mb-3">
<label class="form-label">Department</label>
<input type="text" name="department" class="form-control" value="<?php echo htmlspecialchars($editJob['department'] ?? ''); ?>" placeholder="Eg: CSE">
</div>
<div class="col-md-6 mb-3">
<label class="form-label">Eligibility</label>
<input type="text" name="eligibility" class="form-control" value="<?php echo htmlspecialchars($editJob['eligibility'] ?? ''); ?>" placeholder="Eg: 7 CGPA and above">
</div>
<div class="col-12 mb-3">
<label class="form-label">Description</label>
<textarea name="description" class="form-control" placeholder="Add job details, requirements, and instructions"><?php echo htmlspecialchars($editJob['description'] ?? ''); ?></textarea>
</div>
</div>
<button type="submit" name="<?php echo $editJob ? 'update_job' : 'add_job'; ?>" class="btn btn-primary"><?php echo $editJob ? 'Update Job' : 'Post Job'; ?></button>
<?php if($editJob): ?>
<a href="alumini_panel.php?section=post-job" class="btn btn-outline-secondary">Cancel</a>
<?php endif; ?>
</form>
</div>
</div>

<div id="jobs" class="section">
<h3 class="mb-4">My Jobs</h3>
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
<th>Actions</th>
</tr>
</thead>
<tbody>
<?php if(empty($postedJobs)): ?>
<tr><td colspan="7" class="text-center py-4">No jobs posted yet.</td></tr>
<?php else: ?>
<?php foreach($postedJobs as $index => $job): ?>
<tr>
<td><?php echo $index + 1; ?></td>
<td><?php echo htmlspecialchars($job['company'] ?? ''); ?></td>
<td><?php echo htmlspecialchars($job['role'] ?? ''); ?></td>
<td><?php echo htmlspecialchars($job['department'] ?? 'All Departments'); ?></td>
<td><?php echo htmlspecialchars($job['salary'] ?? 'Not specified'); ?></td>
<td><?php echo htmlspecialchars($job['location'] ?? 'Not specified'); ?></td>
<td>
<div class="d-flex gap-2 flex-wrap">
<a href="job_details.php?type=job&id=<?php echo urlencode((string) $job['_id']); ?>" class="btn btn-outline-primary btn-sm">View</a>
<a href="alumini_panel.php?section=post-job&edit_job=<?php echo urlencode((string) $job['_id']); ?>" class="btn btn-outline-secondary btn-sm">Edit</a>
<form method="POST" class="mb-0">
<input type="hidden" name="job_id" value="<?php echo htmlspecialchars((string) $job['_id']); ?>">
<button type="submit" name="delete_job" class="btn btn-outline-danger btn-sm">Delete</button>
</form>
</div>
</td>
</tr>
<?php endforeach; ?>
<?php endif; ?>
</tbody>
</table>
</div>
</div>

<div id="post-event" class="section">
<h3 class="mb-4"><?php echo $editEvent ? 'Edit Event' : 'Post Event'; ?></h3>
<div class="form-card">
<form method="POST">
<?php if($editEvent): ?>
<input type="hidden" name="event_id" value="<?php echo htmlspecialchars((string) $editEvent['_id']); ?>">
<?php endif; ?>
<div class="row">
<div class="col-md-6 mb-3">
<label class="form-label">Event Title</label>
<input type="text" name="title" class="form-control" value="<?php echo htmlspecialchars($editEvent['title'] ?? ''); ?>" required>
</div>
<div class="col-md-6 mb-3">
<label class="form-label">Event Date</label>
<input type="date" name="event_date" class="form-control" value="<?php echo htmlspecialchars(formatMongoDate($editEvent['date'] ?? '', 'Y-m-d')); ?>" required>
</div>
<div class="col-md-6 mb-3">
<label class="form-label">Location</label>
<input type="text" name="location" class="form-control" value="<?php echo htmlspecialchars($editEvent['location'] ?? ''); ?>" required>
</div>
<div class="col-12 mb-3">
<label class="form-label">Description</label>
<textarea name="description" class="form-control" placeholder="Describe the event details"><?php echo htmlspecialchars($editEvent['description'] ?? ''); ?></textarea>
</div>
</div>
<button type="submit" name="<?php echo $editEvent ? 'update_event' : 'add_event'; ?>" class="btn btn-success"><?php echo $editEvent ? 'Update Event' : 'Post Event'; ?></button>
<?php if($editEvent): ?>
<a href="alumini_panel.php?section=post-event" class="btn btn-outline-secondary">Cancel</a>
<?php endif; ?>
</form>
</div>
</div>

<div id="events" class="section">
<h3 class="mb-4">My Events</h3>
<div class="table-card">
<table class="table table-bordered bg-white mb-0">
<thead class="table-dark">
<tr>
<th>#</th>
<th>Event</th>
<th>Date</th>
<th>Location</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
<?php if(empty($postedEvents)): ?>
<tr><td colspan="5" class="text-center py-4">No events posted yet.</td></tr>
<?php else: ?>
<?php foreach($postedEvents as $index => $event): ?>
<tr>
<td><?php echo $index + 1; ?></td>
<td><?php echo htmlspecialchars($event['title'] ?? ''); ?></td>
<td>
<?php
$eventDate = $event['date'] ?? '';
if($eventDate instanceof MongoDB\BSON\UTCDateTime){
    echo htmlspecialchars($eventDate->toDateTime()->format('d-m-Y'));
} else {
    echo htmlspecialchars((string) $eventDate);
}
?>
</td>
<td><?php echo htmlspecialchars($event['location'] ?? ''); ?></td>
<td>
<div class="d-flex gap-2 flex-wrap">
<a href="job_details.php?type=event&id=<?php echo urlencode((string) $event['_id']); ?>" class="btn btn-outline-success btn-sm">View</a>
<a href="alumini_panel.php?section=post-event&edit_event=<?php echo urlencode((string) $event['_id']); ?>" class="btn btn-outline-secondary btn-sm">Edit</a>
<form method="POST" class="mb-0">
<input type="hidden" name="event_id" value="<?php echo htmlspecialchars((string) $event['_id']); ?>">
<button type="submit" name="delete_event" class="btn btn-outline-danger btn-sm">Delete</button>
</form>
</div>
</td>
</tr>
<?php endforeach; ?>
<?php endif; ?>
</tbody>
</table>
</div>
</div>

<div id="applications" class="section">
<h3 class="mb-4">Job Applications</h3>
<div class="table-card">
<table class="table table-bordered bg-white mb-0">
<thead class="table-dark">
<tr>
<th>#</th>
<th>Student</th>
<th>Email</th>
<th>Role</th>
<th>Status</th>
<th>Update</th>
</tr>
</thead>
<tbody>
<?php if(empty($applications)): ?>
<tr><td colspan="6" class="text-center py-4">No student applications yet.</td></tr>
<?php else: ?>
<?php foreach($applications as $index => $application): ?>
<tr>
<td><?php echo $index + 1; ?></td>
<td><?php echo htmlspecialchars($application['student_name'] ?? $application['student_usn'] ?? ''); ?></td>
<td><?php echo htmlspecialchars($application['student_email'] ?? ''); ?></td>
<td><?php echo htmlspecialchars($application['role'] ?? ''); ?></td>
<td><?php echo htmlspecialchars($application['status'] ?? 'Applied'); ?></td>
<td>
<form method="POST" class="d-flex gap-2">
<input type="hidden" name="application_id" value="<?php echo htmlspecialchars((string) $application['_id']); ?>">
<select name="status" class="form-select form-select-sm">
<option value="Applied">Applied</option>
<option value="Reviewed">Reviewed</option>
<option value="Shortlisted">Shortlisted</option>
<option value="Rejected">Rejected</option>
<option value="Selected">Selected</option>
</select>
<button type="submit" name="update_application_status" class="btn btn-sm btn-primary">Save</button>
</form>
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
<th>Student</th>
<th>Email</th>
<th>Event</th>
<th>Date</th>
<th>Registered On</th>
</tr>
</thead>
<tbody>
<?php if(empty($registrations)): ?>
<tr><td colspan="6" class="text-center py-4">No student registrations yet.</td></tr>
<?php else: ?>
<?php foreach($registrations as $index => $registration): ?>
<tr>
<td><?php echo $index + 1; ?></td>
<td><?php echo htmlspecialchars($registration['student_name'] ?? $registration['student_usn'] ?? ''); ?></td>
<td><?php echo htmlspecialchars($registration['student_email'] ?? ''); ?></td>
<td><?php echo htmlspecialchars($registration['event_title'] ?? ''); ?></td>
<td><?php echo htmlspecialchars(formatMongoDate($registration['event_date'] ?? '', 'd-m-Y')); ?></td>
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

<div id="profile" class="section">
<h3 class="mb-4">My Profile</h3>
<div class="profile-card">
<form method="POST" enctype="multipart/form-data" class="w-100">
<div class="profile-layout">
<div class="profile-side">
<img src="<?php echo htmlspecialchars($profilePhotoUrl); ?>" alt="Profile photo">
<label class="form-label mt-3">Profile Photo</label>
<input type="file" name="profile_photo" class="form-control">
</div>
<div class="profile-main">
<div class="mb-3">
<label class="form-label">Name</label>
<input type="text" name="name" class="form-control" value="<?php echo htmlspecialchars($name); ?>" required>
</div>
<div class="mb-3">
<label class="form-label">Email</label>
<input type="email" class="form-control" value="<?php echo htmlspecialchars($email); ?>" readonly>
</div>
<div class="mb-3">
<label class="form-label">Company</label>
<input type="text" name="company" class="form-control" value="<?php echo htmlspecialchars($company); ?>">
</div>
<div class="mb-3">
<label class="form-label">Graduation Year</label>
<input type="text" name="year" class="form-control" value="<?php echo htmlspecialchars((string) $year); ?>">
</div>
<button type="submit" name="update_profile" class="btn btn-primary">Save Profile</button>
</div>
</div>
</form>
</div>
</div>

</div>

<script src="<?php echo htmlspecialchars(appUrl('assets/js/alumni-panel.js')); ?>"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
