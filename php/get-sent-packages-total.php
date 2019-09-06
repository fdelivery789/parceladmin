<?php
include 'db.php';
$results = $c->query("SELECT * FROM packages WHERE status='sent'");
echo $results->num_rows;
