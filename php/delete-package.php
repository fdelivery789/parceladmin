<?php
include 'db.php';
$id = intval($_POST["id"]);
$c->query("DELETE FROM packages WHERE id=" . $id);
