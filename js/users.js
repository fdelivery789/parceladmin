const USER = 1;
const SELLER = 2;
const DRIVER = 3;
var currentMaximumConnections = 1;
var currentProfilePicture = "";
var users = [];
var currentUser;
var currentUserName;
var adminID;
var adminName;
var ordersJSON;
var orderLooper = 0;
var nextY = 50;
var foodsJSON;
var foodLooper = 0;
var profilePicture = null;
var profilePictureChanged = false; //boolean

$(document).ready(function () {
    checkSession();
    $.ajax({
        type: 'GET',
        url: PHP_PATH + 'get-admin-id.php',
        dataType: 'text',
        cache: false,
        success: function (response) {
            adminID = response;
            console.log("Admin ID: " + adminID);
            $("#message").keypress(function (e) {
                if (e.which == 13) {
                    sendMessage($("#message").val());
                    return false;
                }
            });
            firebase.database().ref("admins/" + adminID + "/new_message").on("value", function (snapshot) {
                var newMessage = parseInt(snapshot.val());
                console.log("New message: " + newMessage);
                if (newMessage == 1) {
                    // New message received
                    console.log("New message received");
                    var updates = {};
                    updates["admins/" + adminID + "/new_message"] = 0;
                    firebase.database().ref().update(updates);
                    firebase.database().ref("admins/" + adminID + "/new_message_content").once("value").then(function (snapshot) {
                        var message = snapshot.val();
                        console.log("New message content: " + message);
                        firebase.database().ref("admins/" + adminID + "/new_message_sender_id").once("value").then(function (snapshot) {
                            var senderID = snapshot.val();
                            console.log("Sender ID: " + senderID);
                            firebase.database().ref("users/" + senderID + "/name").once("value").then(function (snapshot) {
                                var senderName = snapshot.val();
                                console.log("Sender name: " + senderName);
                                $("#messages").append("" +
                                    "<div style='position: relative; width: 100%; height: 60px;'>" +
                                    "<div style='position: absolute; top: 0; right: 0; margin-left: 10px; margin-right: 10px; display: flex; flex-flow: column nowrap;'>" +
                                    "<div style='color: #888888; font-size: 14px;'>" + senderName + "</div>" +
                                    "<div style='margin-top: -8px; color: black; font-size: 16px;'>" + message + "</div>" +
                                    "</div>" +
                                    "</div>");
                                $("#messages").scrollTop($("#messages").prop("scrollHeight"));
                            });
                        });
                    });
                }
            });
        }
    });
    getUsers();
});

function sendMessage(message) {
    $("#message").val("");
    var updates = {};
    updates["users/" + currentUser["id"] + "/new_message_content"] = message;
    firebase.database().ref().update(updates);

    updates = {};
    updates["users/" + currentUser["id"] + "/new_message_admin_id"] = adminID;
    firebase.database().ref().update(updates);

    updates = {};
    updates["users/" + currentUser["id"] + "/new_message"] = 1;
    firebase.database().ref().update(updates);

    console.log("Admin ID: " + adminID);
    firebase.database().ref("admins/" + adminID + "/name").once("value").then(function (snapshot) {
        var adminName = snapshot.val();
        var fd = new FormData();
        fd.append("message", message);
        fd.append("admin_id", adminID);
        fd.append("user_id", currentUser["id"]);
        fd.append("sender", 1);
        $.ajax({
            type: 'POST',
            url: PHP_PATH + 'send-message.php',
            data: fd,
            contentType: false,
            processData: false,
            cache: false,
            success: function (a) {
                $("#messages").append("" +
                    "<div style='margin-left: 10px; margin-right: 10px; display: flex; flex-flow: column nowrap;'>" +
                    "<div style='color: #888888; font-size: 14px;'>" + adminName + "</div>" +
                    "<div style='margin-top: -8px; color: black; font-size: 16px;'>" + message + "</div>" +
                    "</div>");
                $("#messages").scrollTop($("#messages").prop("scrollHeight"));
            }
        });
    });
}

function getUsers() {
    $("#users").find("*").remove();
    users = [];
    showProgress("Memuat pengguna");

    $.ajax({
        type: 'GET',
        url: PHP_PATH+'get-users.php',
        dataType: 'text',
        cache: false,
        success: function(response) {
            users = JSON.parse(response);
            for (var i=0; i<users.length; i++) {
                var user = users[i];
                var position = "Pengguna";
                if (user["role"] == "admin") {
                    position = "Admin";
                }
                var name = user["name"];
                if (name == null) {
                    name = "";
                }
                $("#users").append("" +
                    "<tr>" +
                    "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>" + (i+1) + "</div></td>" +
                    "<td>" + name + "</td>" +
                    "<td>" + user["username"] + "</td>" +
                    "<td>" + user["password"] + "</td>" +
                    "<td>" + user["admin_code"] + "</td>" +
                    "<td>" + position + "</td>" +
                    "<td><a class='edit-user link'>Ubah</a></td>" +
                    "<td><a class='delete-user link'>Hapus</a></td>" +
                    "</tr>"
                );
            }
            setUserClickListener();
            hideProgress();
        }
    });
}

function getMessages() {
    $("#messages").find("*").remove();
    var fd = new FormData();
    fd.append("admin_id", adminID);
    fd.append("user_id", currentUser["id"]);
    firebase.database().ref("users/" + currentUser["id"] + "/name").once("value").then(function (snapshot) {
        currentUserName = snapshot.val();
        firebase.database().ref("admins/" + adminID + "/name").once("value").then(function (snapshot) {
            adminName = snapshot.val();
            console.log("User name: " + currentUserName + ", admin name: " + adminName);
            $.ajax({
                type: 'POST',
                url: PHP_PATH + 'get-messages.php',
                data: fd,
                contentType: false,
                processData: false,
                cache: false,
                success: function (response) {
                    console.log("Response: " + response);
                    var messagesJSON = JSON.parse(response);
                    for (var i = 0; i < messagesJSON.length; i++) {
                        var messageJSON = messagesJSON[i];
                        var message = messageJSON["message"];
                        var sender = messageJSON["sender"]; //1 = admin, 2 = user
                        if (sender == 1) { //admin
                            $("#messages").append("" +
                                "<div style='margin-left: 10px; margin-right: 10px; display: flex; flex-flow: column nowrap;'>" +
                                "<div style='color: #888888; font-size: 14px;'>" + adminName + "</div>" +
                                "<div style='margin-top: -8px; color: black; font-size: 16px;'>" + message + "</div>" +
                                "</div>");
                            $("#messages").scrollTop($("#messages").prop("scrollHeight"));
                        } else if (sender == 2) { //user
                            $("#messages").append("" +
                                "<div style='position: relative; width: 100%; height: 60px;'>" +
                                "<div style='position: absolute; top: 0; right: 0; margin-left: 10px; margin-right: 10px; display: flex; flex-flow: column nowrap;'>" +
                                "<div style='color: #888888; font-size: 14px;'>" + currentUserName + "</div>" +
                                "<div style='margin-top: -8px; color: black; font-size: 16px;'>" + message + "</div>" +
                                "</div>" +
                                "</div>");
                            $("#messages").scrollTop($("#messages").prop("scrollHeight"));
                        }
                    }
                }
            });
        });
    });
}

function setUserClickListener() {
    $(".send-message").unbind().on("click", function () {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var user = users[index];
        currentUser = user;
        $("#user-name").html(user["name"]);
        $("#user-email").html(user["email"]);
        $("#chat-container").css("display", "flex").hide().fadeIn(100);
        $("#message").val("");
        getMessages();
    });
    $(".edit-user").unbind().on("click", function () {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var user = users[index];
        $("#edit-user-title").html("Ubah Pengguna");
        $("#edit-user-name").val(user["name"]);
        $("#edit-user-phone").val(user["phone"]);
        $("#edit-user-username").val(user["username"]);
        $("#edit-user-password").val(user["password"]);
        $("#edit-user-nik").val(user["nik"]);
        $("#edit-user-address").val(user["address"]);
        $("#edit-user-study").val(user["study"]);
        var role = user["role"];
        if (role == "user") {
            $("#user").prop("checked", true);
            $("#admin").prop("checked", false);
        } else if (role == "admin") {
            $("#user").prop("checked", false);
            $("#admin").prop("checked", true);
        }
        var profilePictureName = user["profile_picture"];
        if (profilePictureName != null && profilePictureName.trim() != "") {
            var profilePictureURL = "http://"+HOST+"/userdata/images/" . profilePictureName;
            $("#edit-user-profile-picture").attr("src", profilePictureURL);
        }
        $("#edit-user-container").css("display", "flex").hide().fadeIn(300);
        $("#edit-user-ok").html("Ubah").unbind().on("click", function () {
            var name = $("#edit-user-name").val().trim();
            var phone = $("#edit-user-phone").val().trim();
            var username = $("#edit-user-username").val().trim();
            var password = $("#edit-user-password").val().trim();
            var role = "user";
            if ($("#user").prop("checked") == true) {
                role = "user";
            } else if ($("#admin").prop("checked") == true) {
                role = "admin";
            }
            var nik = $("#edit-user-nik").val().trim();
            var address = $("#edit-user-address").val().trim();
            var study = $("#edit-user-study").val().trim();
            if (username == "") {
                show("Mohon masukkan nama pengguna");
                return;
            }
            if (password == "") {
                show("Mohon masukkan kata sandi");
                return;
            }
            showProgress("Mengubah informasi pengguna");
            var fd = new FormData();
            fd.append("id", user["id"]);
            fd.append("name", name);
            fd.append("phone", phone);
            fd.append("username", username);
            fd.append("password", password);
            fd.append("role", role);
            fd.append("nik", nik);
            fd.append("address", address);
            fd.append("study", study);
            $.ajax({
                type: 'POST',
                url: PHP_PATH+'edit-user.php',
                data: fd,
                processData: false,
                contentType: false,
                cache: false,
                success: function(response) {
                    if (profilePictureChanged) {
                        var profilePictureName = generateUUID()+".jpg";
                        let fd = new FormData();
                        fd.append("file", profilePicture);
                        fd.append("file_name", profilePictureName);
                        $.ajax({
                            type: 'POST',
                            url: PHP_PATH+'upload-image.php',
                            data: fd,
                            processData: false,
                            contentType: false,
                            cache: false,
                            success: function(response) {
                                let fd = new FormData();
                                fd.append("id", user["id"]);
                                fd.append("profile_picture_name", profilePictureName);
                                $.ajax({
                                    type: 'POST',
                                    url: PHP_PATH + 'edit-user-profile-picture.php',
                                    data: fd,
                                    processData: false,
                                    contentType: false,
                                    cache: false,
                                    success: function (response) {
                                        profilePicture = null;
                                        profilePictureChanged = false;
                                        $("#edit-user-container").fadeOut(300);
                                        getUsers();
                                    }
                                });
                            }
                        });
                    } else {
                        $("#edit-user-container").fadeOut(300);
                        getUsers();
                    }
                }
            });
        });
    });
    $(".delete-user").unbind().on("click", function () {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var user = users[index];
        $("#confirm-title").html("Hapus Pengguna");
        $("#close-confirm").unbind().on("click", function () {
            $("#confirm-container").fadeOut(300);
        });
        $("#confirm-msg").html("Apakah Anda yakin ingin menghapus pengguna ini?");
        $("#confirm-ok").unbind().on("click", function () {
            $("#confirm-container").hide();
            showProgress("Menghapus pengguna");
            $.ajax({
                type: 'GET',
                url: PHP_PATH + 'delete-user.php',
                data: {'id': user["id"]},
                dataType: 'text',
                cache: false,
                success: function (a) {
                    firebase.database().ref("users/" + user["id"]).remove();
                    hideProgress();
                    getUsers();
                }
            });
        });
        $("#confirm-cancel").unbind().on("click", function () {
            $("#confirm-container").fadeOut(300);
        });
        $("#confirm-container").css("display", "flex").hide().fadeIn(300);
    });
    $(".download-history").unbind().on("click", function () {
        var tr = $(this).parent().parent();
        var index = tr.parent().children().index(tr);
        var user = users[index];
        show("Mengunduh riwayat pemesanan, mohon tunggu");
        if (user["position"] == USER) {
            var fd = new FormData();
            fd.append("user_id", user["id"]);
            $.ajax({
                type: 'POST',
                url: PHP_PATH + 'get-user-history.php',
                data: fd,
                processData: false,
                contentType: false,
                cache: false,
                success: function (response) {
                    var doc = new jsPDF();
                    doc.setFontSize(14);
                    doc.text("Berikut ini riwayat pemesanan oleh pengguna bernama " + user["name"], 32, 25);
                    nextY = 40;
                    ordersJSON = JSON.parse(response);
                    orderLooper = 0;
                    writeHistory(doc, user);
                }
            });
        } else if (user["position"] == SELLER) {
            var fd2 = new FormData();
            fd2.append("user_id", user["id"]);
            $.ajax({
                type: 'POST',
                url: PHP_PATH + 'get-seller-history.php',
                data: fd2,
                processData: false,
                contentType: false,
                cache: false,
                success: function (response) {
                    var doc = new jsPDF();
                    doc.setFontSize(14);
                    doc.text("Berikut ini riwayat pembelian dari penjual bernama " + user["name"], 32, 25);
                    nextY = 40;
                    ordersJSON = JSON.parse(response);
                    orderLooper = 0;
                    writeHistory(doc, user);
                }
            });
        } else if (user["position"] == DRIVER) {
            var fd3 = new FormData();
            fd3.append("user_id", user["id"]);
            $.ajax({
                type: 'POST',
                url: PHP_PATH + 'get-driver-history.php',
                data: fd3,
                processData: false,
                contentType: false,
                cache: false,
                success: function (response) {
                    var doc = new jsPDF();
                    doc.setFontSize(14);
                    doc.text("Berikut ini riwayat pengantaran dari pengirim bernama " + user["name"], 32, 25);
                    nextY = 40;
                    ordersJSON = JSON.parse(response);
                    orderLooper = 0;
                    writeHistory(doc, user);
                }
            });
        }
    });
}

function writeHistory(doc, user) {
    if (orderLooper >= ordersJSON.length) {
        doc.save("riwayat_pemesanan.pdf");
        return;
    }
    var orderJSON = ordersJSON[orderLooper];
    orderLooper++;
    console.log("User ID: "+user["id"]);
    firebase.database().ref("users/"+orderJSON["buyer_id"]+"/name").once("value").then(function(snapshot) {
        var buyerName = snapshot.val();
        doc.setFontSize(18);
        doc.text("=============== ORDER "+orderJSON["id"]+" ===============", 32, nextY);
        nextY += 8;
        if (nextY > 247) {
            nextY -= 237;
            doc.addPage();
        }
        doc.setFontType("bold");
        doc.setFontSize(14);
        doc.text("Nama pembeli:", 32, nextY);
        nextY += 7;
        if (nextY > 247) {
            nextY -= 237;
            doc.addPage();
        }
        doc.setFontType("normal");
        doc.text(buyerName, 32, nextY);
        nextY += 7;
        if (nextY > 247) {
            nextY -= 237;
            doc.addPage();
        }
        firebase.database().ref("users/"+orderJSON["seller_id"]+"/name").once("value").then(function(snapshot) {
            var sellerName = snapshot.val();
            doc.setFontType("bold");
            doc.text("Nama penjual:", 32, nextY);
            nextY += 7;
            if (nextY > 247) {
                nextY -= 237;
                doc.addPage();
            }
            doc.setFontType("normal");
            doc.text(sellerName, 32, nextY);
            nextY += 7;
            if (nextY > 247) {
                nextY -= 237;
                doc.addPage();
            }
            firebase.database().ref("users/"+orderJSON["driver_id"]+"/name").once("value").then(function(snapshot) {
                var driverName = snapshot.val();
                doc.setFontType("bold");
                doc.text("Nama pengirim:", 32, nextY);
                nextY += 7;
                if (nextY > 247) {
                    nextY -= 237;
                    doc.addPage();
                }
                doc.setFontType("normal");
                doc.text(driverName, 32, nextY);
                nextY += 7;
                if (nextY > 247) {
                    nextY -= 237;
                    doc.addPage();
                }
                doc.setFontType("bold");
                doc.text("Biaya:", 32, nextY);
                nextY += 7;
                if (nextY > 247) {
                    nextY -= 237;
                    doc.addPage();
                }
                doc.setFontType("normal");
                doc.text("Rp"+""+orderJSON["fee"]+",-", 32, nextY);
                nextY += 7;
                if (nextY > 247) {
                    nextY -= 237;
                    doc.addPage();
                }
                firebase.database().ref("restaurants/"+orderJSON["restaurant_id"]+"/name").once("value").then(function(snapshot) {
                    var restaurantName = snapshot.val();
                    doc.setFontType("bold");
                    doc.text("Nama restoran:", 32, nextY);
                    nextY += 7;
                    if (nextY > 247) {
                        nextY -= 237;
                        doc.addPage();
                    }
                    doc.setFontType("normal");
                    doc.text(restaurantName, 32, nextY);
                    nextY += 7;
                    if (nextY > 247) {
                        nextY -= 237;
                        doc.addPage();
                    }
                    doc.setFontType("bold");
                    doc.text("Total item:", 32, nextY);
                    nextY += 7;
                    if (nextY > 247) {
                        nextY -= 237;
                        doc.addPage();
                    }
                    doc.setFontType("normal");
                    doc.text(orderJSON["total_items"]+" item", 32, nextY);
                    nextY += 7;
                    if (nextY > 247) {
                        nextY -= 237;
                        doc.addPage();
                    }
                    doc.setFontType("bold");
                    doc.text("Total harga:", 32, nextY);
                    nextY += 7;
                    if (nextY > 247) {
                        nextY -= 237;
                        doc.addPage();
                    }
                    doc.setFontType("normal");
                    doc.text("Rp"+""+orderJSON["total_price"]+",-", 32, nextY);
                    nextY += 7;
                    if (nextY > 247) {
                        nextY -= 237;
                        doc.addPage();
                    }
                    doc.setFontType("bold");
                    doc.text("Daftar makanan:", 32, nextY);
                    nextY += 7;
                    if (nextY > 247) {
                        nextY -= 237;
                        doc.addPage();
                    }
                    var fd2 = new FormData();
                    fd2.append("order_id", ""+orderJSON["id"]);
                    $.ajax({
                        type: 'POST',
                        url: PHP_PATH+'get-order-items.php',
                        data: fd2,
                        processData: false,
                        contentType: false,
                        cache: false,
                        success: function(response) {
                            foodsJSON = JSON.parse(response);
                            foodLooper = 0;
                            drawFood(doc, user);
                        }
                    });
                });
            });
        });
    });
}

function base64ImageCallback(user, doc, dataURL) {
    var foodJSON = foodsJSON[foodLooper];
    foodLooper++;
    var x = 32;
    if ((foodLooper%2) == 0) {
        x = 132;
    }
    doc.addImage(dataURL, 'JPEG', x, nextY + 7, 70, 70);
    doc.text("Harga: Rp" + foodJSON["price"] + ",-", x, nextY + 84);
    if ((foodsJSON.length%2) == 0) {
        if ((foodLooper%2) == 0) {
            nextY += 94;
        }
    } else {
        nextY += 94;
    }
    drawFood(doc, user);
}

function drawFood(doc, user) {
    if (foodLooper >= foodsJSON.length) {
        writeHistory(doc, user);
    }
    var foodJSON = foodsJSON[foodLooper];
    foodLooper++;
    var x = 32;
    if ((foodLooper%2) == 0) {
        x = 132;
    }
    foodLooper--;
    if (foodJSON != null) {
        doc.setFontType("normal");
        doc.text(foodJSON["name"], x, nextY);
        getBase64Image(foodJSON["img_url"].replace("http://", "https://"), user, doc, base64ImageCallback);
    }
}

function addUser() {
    currentMaximumConnections = 1;
    currentProfilePicture = "img/profile-picture.jpg";
    $("#edit-user-title").html("Tambah Pengguna");
    $("#edit-user-name").val("");
    $("#edit-user-phone").val("");
    $("#edit-user-email").val("");
    $("#edit-user-password").val("");
    $("#edit-user-container").css("display", "flex").hide().fadeIn(300);
    $("#edit-user-ok").html("Tambah").unbind().on("click", function () {
        var name = $("#edit-user-name").val().trim();
        var phone = $("#edit-user-phone").val().trim();
        var email = $("#edit-user-email").val().trim();
        var password = $("#edit-user-password").val().trim();
        if (email == "") {
            show("Mohon masukkan email");
            return;
        }
        if (password == "") {
            show("Mohon masukkan kata sandi");
            return;
        }
        showProgress("Menambah pengguna");
        var userID = generateUUID();
        firebase.database().ref("users/" + userID).set({
            name: name,
            email: email,
            password: password,
            phone: phone
        }, function (error) {
            $("#edit-user-container").fadeOut(300);
            hideProgress();
            getUsers();
        });
    });
}

function closeEditUserDialog() {
    $("#edit-user-container").fadeOut(300);
}

function generateRandomUsername() {
    var userName = generateRandomID(14);
    $("#edit-user-username").val(userName);
}

function increaseMaxConn() {
    currentMaximumConnections++;
    $("#maximum-connections").val(currentMaximumConnections);
}

function decreaseMaxConn() {
    if (currentMaximumConnections > 1) {
        currentMaximumConnections--;
    }
    $("#maximum-connections").val(currentMaximumConnections);
}

function selectProfilePicture() {
    $("#edit-user-select-profile-picture").on("change", function () {
        var fr = new FileReader();
        fr.onload = function () {
            $("#edit-user-profile-picture").attr("src", fr.result);
        };
        profilePicture = $(this).prop("files")[0];
        profilePictureChanged = true;
        fr.readAsDataURL(profilePicture);
    }).click();
}

function closeSendMessageDialog() {
    $("#chat-container").hide();
}