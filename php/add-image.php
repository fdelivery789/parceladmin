<?php
include 'db.php';
$packageID = intval($_POST["package_id"]);
$imgName = $_POST["img_name"];
$c->query("INSERT INTO images (package_id, img_name) VALUES (" . $packageID . ", '" . $imgName . "')");
