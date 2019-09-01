<?php
include 'db.php';
$userId = intval($_POST["id"]);
$name = $_POST["name"];
$phone = $_POST["phone"];
$username = $_POST["username"];
$password = $_POST["password"];
$role = $_POST["role"];
$nik = $_POST["nik"];
$address = $_POST["address"];
$study = $_POST["study"];
$c->query("UPDATE users SET name='" . $name . "', phone='" . $phone . "', username='" . $username . "', password='" . $password . "', role='" . $role . "', nik='" . $nik . "', address='" . $address . "', study='" . $study . "' WHERE id=" . $userId);