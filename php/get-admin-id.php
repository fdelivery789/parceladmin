<?php
session_id("parceladmin");
session_start();
$adminID = $_SESSION["user_id"];
echo $adminID;