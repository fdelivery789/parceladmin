<?php
include 'db.php';
$results = $c->query("SELECT * FROM packages WHERE status='sent'");
$packages = [];
if ($results && $results->num_rows > 0) {
	while ($row = $results->fetch_assoc()) {
		array_push($packages, $row);
	}
}
echo json_encode($packages);
