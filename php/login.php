<?php
include 'db.php';
$email = $_POST["email"];
$password = $_POST["password"];
$results = $c->query("SELECT * FROM admins WHERE email='" . $email . "'");
if ($results && $results->num_rows > 0) {
    $row = $results->fetch_assoc();
    if ($row["password"] != $password) {
        echo -2;
        return;
    }
    session_id("parceladmin");
    session_start();
    $_SESSION["user_id"] = $row["id"];
    $_SESSION["logged_in"] = true;
    echo 0;
} else {
    echo -1;
}