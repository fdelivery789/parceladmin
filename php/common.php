<?php
$c = new mysqli("localhost", "u117143075_user", "HaloDunia123");
$c->select_db("u117143075_db");

function startSession() {
	session_id("parceladmin");
	if (session_status() == PHP_SESSION_NONE) {
		session_start();
	}
}
