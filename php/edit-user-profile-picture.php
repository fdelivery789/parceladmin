<?php
include 'db.php';
$id = intval($_POST["id"]);
$profilePictureName = $_POST["profile_picture_name"];
$c->query("UPDATE users SET profile_picture='" . $profilePictureName . "' WHERE id=" . $id);