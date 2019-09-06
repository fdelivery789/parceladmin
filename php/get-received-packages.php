<?php
include 'db.php';
$start = intval($_POST["start"]);
$total = intval($_POST["total"]);
$results = $c->query("SELECT * FROM packages WHERE status='received' LIMIT " . $start . "," . $total);
$packages = [];
if ($results && $results->num_rows > 0) {
	while ($row = $results->fetch_assoc()) {
		array_push($packages, $row);
	}
}
echo json_encode($packages);
