<?php
include 'db.php';
$results = $c->query("SELECT * FROM packages WHERE status='received'");
echo $results->num_rows;
