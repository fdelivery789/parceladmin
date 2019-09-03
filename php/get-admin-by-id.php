<?php
include 'db.php';
$id = intval($_POST["id"]);
$results = $c->query("SELECT * FROM admins WHERE id=" . $id);
if ($results && $results->num_rows > 0) {
	$row = $results->fetch_assoc();
	echo json_encode($row);
}
