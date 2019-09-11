//const HOST = "localhost/parceladmin";
const HOST = "fdelivery.xyz/parceladmin";
const PHP_PATH = "http://"+HOST+"/php/";
const API_KEY = "AIzaSyCNA8fwTJhMu8ju9pdg08M5zBmninVPm5k";
const HERE_APP_ID = "BqM8uW7Z8qDUrv8ZxlSX";
const HERE_APP_CODE = "Oey0WMUEYBpTe5qq3mrq5w";

$(document).ready(function() {
});

function checkSession() {
    $.ajax({
        type: 'GET',
        url: PHP_PATH+'check-session.php',
        dataType: 'text',
        cache: false,
        success: function(a) {
            var responseCode = parseInt(a);
            if (responseCode == -1) {
                window.location.href = "login.html";
            }
        }
    });
}

function show(msg) {
    $("#toast-msg").html(msg);
    $("#toast-container").css("display", "flex").hide().fadeIn(500);
    setTimeout(function() {
        $("#toast-container").fadeOut(500);
    }, 3000);
}

function showProgress(msg) {
    $("#loading-blocker").fadeIn(200);
    $("#loading-msg").html(msg+" . . .");
    $("#loading-container").css("margin-bottom", "0");
    var currentDotCount = 3;
    var progressMsgUpdater = function() {
        if (currentDotCount < 6) {
            currentDotCount++;
        } else {
            currentDotCount = 3;
        }
        var dotMsg = "";
        for (var i=0; i<currentDotCount; i++) {
            dotMsg += " ";
            dotMsg += ".";
        }
        $("#loading-msg").html(msg + dotMsg);
        setTimeout(progressMsgUpdater, 500);
    };
    setTimeout(progressMsgUpdater, 500);
}

function hideProgress() {
    $("#loading-blocker").fadeOut(200);
    $("#loading-container").css("margin-bottom", "-45px");
}

function showAlert(title, msg) {
    $("#alert-title").html(title);
    $("#alert-msg").html(msg);
    $("#alert-container").css("display", "flex").hide().fadeIn(300);
    $("#close-alert").unbind().on("click", function() {
        $("#alert-container").fadeOut(300);
    });
    $("#alert-ok").unbind().on("click", function() {
        $("#alert-container").fadeOut(300);
    });
}

function logout() {
    $("#confirm-title").html("Keluar");
    $("#confirm-msg").html("Apakah Anda yakin ingin keluar?");
    $("#confirm-ok").unbind().on("click", function() {
        $("#confirm-container").hide();
        $("#loading-blocker").show();
        showProgress("Sedang keluar");
        $.ajax({
            type: 'GET',
            url: PHP_PATH+'logout.php',
            dataType: 'text',
            cache: false,
            success: function(a) {
                window.location.href = "login.html";
            }
        });
    });
    $("#confirm-cancel").unbind().on("click", function() {
        $("#confirm-container").hide();
    });
    $("#confirm-container").css("display", "flex");
}

function openAdmins() {
    window.location.href = "admins.html";
}

function openUsers() {
    window.location.href = "users.html";
}

function openPackages() {
    window.location.href = "packages.html";
}

function openRestaurants() {
    window.location.href = "restaurants.html";
}

function openOrders() {
    window.location.href = "orders.html";
}

function generateRandomID(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function formatMoney(money) {
    return (money).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function getBase64Image(url, user, doc, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(user, doc, reader.result);
        };
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
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