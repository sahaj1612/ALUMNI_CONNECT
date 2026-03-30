<?php

function appBasePath(): string
{
    static $basePath = null;

    if ($basePath === null) {
        $basePath = '/' . basename(dirname(__DIR__));
    }

    return $basePath;
}

function appUrl(string $path = ''): string
{
    $path = ltrim($path, '/');
    return $path === '' ? appBasePath() : appBasePath() . '/' . $path;
}

function redirectToApp(string $path = ''): void
{
    header('Location: ' . appUrl($path));
    exit();
}

function formatMongoDate($value, string $format = 'd-m-Y'): string
{
    if ($value instanceof MongoDB\BSON\UTCDateTime) {
        return $value->toDateTime()->format($format);
    }

    return trim((string) $value);
}

function mongoDateFromInput(string $value)
{
    $timestamp = strtotime($value);
    if ($timestamp === false) {
        return $value;
    }

    return new MongoDB\BSON\UTCDateTime($timestamp * 1000);
}

function ensureAdminSeed($db): void
{
    if ($db->admins->countDocuments() === 0) {
        $db->admins->insertOne([
            'name' => 'Administrator',
            'email' => 'admin@sdmcet.com',
            'password' => 'admin123',
            'role' => 'admin',
            'created_at' => new MongoDB\BSON\UTCDateTime(),
        ]);
    }
}

function createNotification($notificationsCollection, string $recipientType, string $recipientId, string $title, string $message, string $link = ''): void
{
    $notificationsCollection->insertOne([
        'recipient_type' => $recipientType,
        'recipient_id' => $recipientId,
        'title' => $title,
        'message' => $message,
        'link' => $link,
        'is_read' => false,
        'created_at' => new MongoDB\BSON\UTCDateTime(),
    ]);
}

function createBulkNotifications($notificationsCollection, string $recipientType, array $recipientIds, string $title, string $message, string $link = ''): void
{
    if (empty($recipientIds)) {
        return;
    }

    $documents = [];
    foreach ($recipientIds as $recipientId) {
        $documents[] = [
            'recipient_type' => $recipientType,
            'recipient_id' => (string) $recipientId,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'is_read' => false,
            'created_at' => new MongoDB\BSON\UTCDateTime(),
        ];
    }

    if (!empty($documents)) {
        $notificationsCollection->insertMany($documents);
    }
}

function getUserNotifications($notificationsCollection, string $recipientType, string $recipientId, int $limit = 20): array
{
    return $notificationsCollection->find(
        [
            'recipient_type' => $recipientType,
            'recipient_id' => $recipientId,
        ],
        [
            'sort' => ['created_at' => -1],
            'limit' => $limit,
        ]
    )->toArray();
}

function markNotificationsAsRead($notificationsCollection, string $recipientType, string $recipientId): void
{
    $notificationsCollection->updateMany(
        [
            'recipient_type' => $recipientType,
            'recipient_id' => $recipientId,
            'is_read' => false,
        ],
        ['$set' => ['is_read' => true]]
    );
}

function uploadFile(string $fieldName, string $targetFolder, array $allowedExtensions): ?string
{
    if (!isset($_FILES[$fieldName]) || ($_FILES[$fieldName]['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ($_FILES[$fieldName]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    $originalName = $_FILES[$fieldName]['name'] ?? '';
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions, true)) {
        return null;
    }

    $absoluteFolder = dirname(__DIR__) . '/uploads/' . $targetFolder;
    if (!is_dir($absoluteFolder)) {
        mkdir($absoluteFolder, 0777, true);
    }

    $fileName = uniqid($targetFolder . '_', true) . '.' . $extension;
    $absolutePath = $absoluteFolder . '/' . $fileName;

    if (!move_uploaded_file($_FILES[$fieldName]['tmp_name'], $absolutePath)) {
        return null;
    }

    return 'uploads/' . $targetFolder . '/' . $fileName;
}

function assetUrl(?string $relativePath, string $fallback = 'https://via.placeholder.com/150'): string
{
    if (!$relativePath) {
        return $fallback;
    }

    return appUrl($relativePath);
}

