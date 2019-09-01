<?php
include 'db.php';
$adminID = intval($_POST["admin_id"]);
$senderName = $_POST["sender_name"];
$receiverName = $_POST["receiver_name"];
$shippingService = $_POST["shipping_service"];
$totalItems = intval($_POST["total_items"]);
$dateReceived = $_POST["date_received"];
$timeReceived = $_POST["time_received"];
$sql = "INSERT INTO packages (admin_id, sender_name, receiver_name, courier_name, total_items, date_received, time_received, date_sent, status) VALUES (" . $adminID . ", '" . $senderName . "', '" . $receiverName . "', '" . $shippingService . "', " . $totalItems . ", '" . $dateReceived . "', '" . $timeReceived . "', NULL, 'received')";
$c->query($sql);
$id = mysqli_insert_id($c);
echo $id;
