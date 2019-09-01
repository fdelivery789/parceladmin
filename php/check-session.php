<?php
session_id("parceladmin");
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
if (isset($_SESSION["logged_in"]) && $_SESSION["logged_in"] == true) {
	echo 0;
} else {
	echo -1;
}