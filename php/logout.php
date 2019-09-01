<?php
session_id("parceladmin");
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
$_SESSION["logged_in"] = false;
unset($_SESSION["logged_in"]);
session_destroy();