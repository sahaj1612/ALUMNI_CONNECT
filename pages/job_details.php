<?php
session_start();
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../config/helpers.php';

$isStudent = isset($_SESSION['student_usn']);
$isAlumni = isset($_SESSION['alumni_email']);

if (!$isStudent && !$isAlumni) {
    redirectToApp('index.php');
}

$type = $_GET['type'] ?? 'job';
$id = $_GET['id'] ?? '';

if (($type !== 'job' && $type !== 'event') || $id === '') {
    http_response_code(404);
    $record = null;
} else {
    try {
        $objectId = new MongoDB\BSON\ObjectId($id);
        $collection = $type === 'event' ? $db->events : $db->jobs;
        $record = $collection->findOne(['_id' => $objectId]);
    } catch (Exception $e) {
        $record = null;
    }
}

$backUrl = $isStudent
    ? appUrl('student_panel.php?section=' . ($type === 'event' ? 'events' : 'jobs'))
    : appUrl('alumini_panel.php?section=' . ($type === 'event' ? 'events' : 'jobs'));

$pageTitle = $type === 'event' ? 'Event Details' : 'Job Details';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?php echo htmlspecialchars($pageTitle); ?> | Alumni Connect</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="<?php echo htmlspecialchars(appUrl('assets/css/job-details.css')); ?>">
</head>
<body>
<div class="page-shell">
    <div class="details-card">
        <div class="details-header">
            <div class="badge-soft"><?php echo $type === 'event' ? 'Event Preview' : 'Job Preview'; ?></div>
            <h1 class="mt-3 mb-0"><?php echo htmlspecialchars($pageTitle); ?></h1>
        </div>
        <div class="details-body">
            <?php if (!$record): ?>
                <div class="alert alert-danger mb-0">The requested <?php echo htmlspecialchars($type); ?> could not be found.</div>
                <div class="actions">
                    <a href="<?php echo htmlspecialchars($backUrl); ?>" class="btn btn-primary">Back</a>
                </div>
            <?php else: ?>
                <h2 class="summary-title">
                    <?php
                    echo htmlspecialchars($type === 'event'
                        ? ($record['title'] ?? 'Untitled Event')
                        : ($record['role'] ?? 'Untitled Job'));
                    ?>
                </h2>
                <p class="summary-text">
                    <?php
                    echo htmlspecialchars($type === 'event'
                        ? ('Hosted by ' . ($record['posted_by'] ?? 'Alumni'))
                        : (($record['company'] ?? 'Company not specified') . ' posted by ' . ($record['posted_by'] ?? 'Alumni')));
                    ?>
                </p>

                <div class="info-grid">
                    <?php if ($type === 'job'): ?>
                        <div class="info-block">
                            <div class="info-label">Company</div>
                            <div class="info-value"><?php echo htmlspecialchars($record['company'] ?? 'Not specified'); ?></div>
                        </div>
                        <div class="info-block">
                            <div class="info-label">Department</div>
                            <div class="info-value"><?php echo htmlspecialchars($record['department'] ?? 'All Departments'); ?></div>
                        </div>
                        <div class="info-block">
                            <div class="info-label">Salary</div>
                            <div class="info-value"><?php echo htmlspecialchars($record['salary'] ?? 'Not specified'); ?></div>
                        </div>
                        <div class="info-block">
                            <div class="info-label">Location</div>
                            <div class="info-value"><?php echo htmlspecialchars($record['location'] ?? 'Not specified'); ?></div>
                        </div>
                        <div class="info-block">
                            <div class="info-label">Eligibility</div>
                            <div class="info-value"><?php echo htmlspecialchars($record['eligibility'] ?? 'Not specified'); ?></div>
                        </div>
                        <div class="info-block">
                            <div class="info-label">Posted On</div>
                            <div class="info-value"><?php echo htmlspecialchars(formatMongoDate($record['created_at'] ?? '', 'd M Y')); ?></div>
                        </div>
                    <?php else: ?>
                        <div class="info-block">
                            <div class="info-label">Date</div>
                            <div class="info-value"><?php echo htmlspecialchars(formatMongoDate($record['date'] ?? $record['event_date'] ?? '', 'd M Y')); ?></div>
                        </div>
                        <div class="info-block">
                            <div class="info-label">Location</div>
                            <div class="info-value"><?php echo htmlspecialchars($record['location'] ?? 'Not specified'); ?></div>
                        </div>
                        <div class="info-block">
                            <div class="info-label">Hosted By</div>
                            <div class="info-value"><?php echo htmlspecialchars($record['posted_by'] ?? 'Alumni'); ?></div>
                        </div>
                    <?php endif; ?>
                </div>

                <div class="description-card">
                    <h2><?php echo $type === 'event' ? 'About This Event' : 'Job Description'; ?></h2>
                    <p><?php echo htmlspecialchars($record['description'] ?? 'No description provided yet.'); ?></p>
                </div>

                <div class="actions">
                    <a href="<?php echo htmlspecialchars($backUrl); ?>" class="btn btn-primary">Back to <?php echo $type === 'event' ? 'Events' : 'Jobs'; ?></a>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>
</body>
</html>
