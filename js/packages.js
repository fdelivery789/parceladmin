const PAGINATION_STEP = 5; //Ubah ini untuk mengubah jumlah item per halaman
var receivedPackages = [];
var sentPackages = [];
var totalReceivedPackages = 0;
var totalSentPackages = 0;
var admins = [];
var currentTab = 1;
var rStart = 0; //Received start
var sStart = 0; //Sent start
var nextY = 40;
var looper = 0;

$(document).ready(function() {
    checkSession();
    getPackages();
});

function getPackages() {
    receivedPackages = [];
    $("#received-packages").find("*").remove();
    showProgress("Memuat daftar paket");
    $.ajax({
        type: 'GET',
        url: PHP_PATH+'get-received-packages-total.php',
        dataType: 'text',
        cache: false,
        success: function(response) {
            totalReceivedPackages = parseInt(response);
            if ((rStart+PAGINATION_STEP) >= totalReceivedPackages) {
                $("#r-next").css("display", "none");
            } else {
                $("#r-next").css("display", "block");
            }
            if (rStart >= PAGINATION_STEP) {
                $("#r-prev").css("display", "block");
            } else {
                $("#r-prev").css("display", "none");
            }
            $.ajax({
                type: 'GET',
                url: PHP_PATH+'get-sent-packages-total.php',
                dataType: 'text',
                cache: false,
                success: function(response) {
                    totalSentPackages = parseInt(response);
                    if ((sStart+PAGINATION_STEP) >= totalSentPackages) {
                        $("#s-next").css("display", "none");
                    } else {
                        $("#s-next").css("display", "block");
                    }
                    if (sStart >= PAGINATION_STEP) {
                        $("#s-prev").css("display", "block");
                    } else {
                        $("#s-prev").css("display", "none");
                    }
                    let fd = new FormData();
                    fd.append("start", rStart);
                    fd.append("total", PAGINATION_STEP);
                    $.ajax({
                        type: 'POST',
                        url: PHP_PATH+'get-received-packages.php',
                        data: fd,
                        processData: false,
                        contentType: false,
                        cache: false,
                        success: function(response) {
                            receivedPackages = JSON.parse(response);
                            for (var i=0; i<receivedPackages.length; i++) {
                                var packageJSON = receivedPackages[i];
                                var status = "";
                                if (packageJSON["status"] == "received") {
                                    status = "Diterima";
                                } else if (packageJSON["status"] == "sent") {
                                    status = "Dikirim";
                                }
                                $("#received-packages").append("" +
                                    "<tr>" +
                                    "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>" + (rStart+i+1) + "</div></td>" +
                                    "<td>#" + packageJSON["ref_no"] + "</td>" +
                                    "<td>" + packageJSON["sender_name"] + "</td>" +
                                    "<td>" + packageJSON["receiver_name"] + "</td>" +
                                    "<td>" + packageJSON["admin_receiver_name"] + "</td>" +
                                    "<td>" + packageJSON["courier_name"] + "</td>" +
                                    "<td>" + packageJSON["date_received"] + "</td>" +
                                    "<td>" + packageJSON["type"] + "</td>" +
                                    "<td>" + status + "</td>" +
                                    "<td><a class='view-package custom-link'>Lihat</a></td>" +
                                    //"<td><a class='delete-package custom-link'>Hapus</a></td>" +
                                    "</tr>"
                                );
                            }
                            sentPackages = [];
                            $("#sent-packages").find("*").remove();
                            let fd = new FormData();
                            fd.append("start", sStart);
                            fd.append("total", PAGINATION_STEP);
                            $.ajax({
                                type: 'POST',
                                url: PHP_PATH+'get-sent-packages.php',
                                data: fd,
                                processData: false,
                                contentType: false,
                                cache: false,
                                success: function(response) {
                                    sentPackages = JSON.parse(response);
                                    for (var i=0; i<sentPackages.length; i++) {
                                        var packageJSON = sentPackages[i];
                                        var status = "";
                                        if (packageJSON["status"] == "received") {
                                            status = "Diterima";
                                        } else if (packageJSON["status"] == "sent") {
                                            status = "Dikirim";
                                        }
                                        $("#sent-packages").append("" +
                                            "<tr>" +
                                            "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>" + (sStart+i+1) + "</div></td>" +
                                            "<td>" + packageJSON["id"] + "</td>" +
                                            "<td>" + packageJSON["sender_name"] + "</td>" +
                                            "<td>" + packageJSON["receiver_name"] + "</td>" +
                                            "<td>" + packageJSON["admin_receiver_name"] + "</td>" +
                                            "<td>" + packageJSON["courier_name"] + "</td>" +
                                            "<td>" + packageJSON["date_received"] + "</td>" +
                                            "<td>" + packageJSON["type"] + "</td>" +
                                            "<td>" + status + "</td>" +
                                            "<td><a class='view-package custom-link'>Lihat</a></td>" +
                                            //"<td><a class='delete-package custom-link'>Hapus</a></td>" +
                                            "</tr>"
                                        );
                                    }
                                    setPackageClickListener();
                                    hideProgress();
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function setPackageClickListener() {
    $(".view-package").unbind().on("click", function() {
        var td = $(this).parent();
        var tr = td.parent();
        var index = 0;
        var packageJSON;
        if (currentTab == 1) {
            index = $("#received-packages").children().index(tr);
            packageJSON = receivedPackages[index];
        } else if (currentTab == 2) {
            index = $("#sent-packages").children().index(tr);
            packageJSON = sentPackages[index];
        }
        var fd = new FormData();
        fd.append("id", packageJSON["admin_id"]);
        $.ajax({
            type: 'POST',
            url: PHP_PATH+'get-admin-by-id.php',
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function(response) {
                var adminInfo = JSON.parse(response);
                $("#admin-name").find("*").remove();
                $("#admin-name").append("<option>"+adminInfo["name"]+"</option>");
            }
        });
        $("#sender-name").val(packageJSON["sender_name"]);
        $("#receiver-name").val(packageJSON["receiver_name"]);
        $("#courier-name").val(packageJSON["courier_name"]);
        $("#type").val(packageJSON["type"]);
        $("#total-items").val(packageJSON["total_items"]);
        $("#date-received").val(packageJSON["date_received"]);
        $("#time-received").val(packageJSON["time_received"]);
        var status = packageJSON["status"];
        if (status == "received") {
            $("#status").val("Diterima");
        } else if (status == "sent") {
            $("#status").val("Dikirim");
        }
        $("#container").css("display", "flex").hide().fadeIn(300);
        $("#ok").html("OK").unbind().on("click", function() {
            $("#container").fadeOut(300);
        });
    });
    $(".delete-package").unbind().on("click", function() {
        var td = $(this).parent();
        var tr = td.parent();
        var index = 0;
        var packageJSON;
        if (currentTab == 1) {
            index = $("#received-packages").children().index(tr);
            packageJSON = receivedPackages[index];
        } else if (currentTab == 2) {
            index = $("#sent-packages").children().index(tr);
            packageJSON = sentPackages[index];
        }
        $("#confirm-title").html("Hapus Paket");
        $("#confirm-msg").html("Apakah Anda yakin ingin menghapus paket ini?");
        $("#confirm-ok").unbind().on("click", function() {
            var fd = new FormData();
            fd.append("id", packageJSON["id"]);
            showProgress("Menghapus paket");
            $("#confirm-container").fadeOut(300);
            $.ajax({
                type: 'POST',
                url: PHP_PATH+'delete-package.php',
                data: fd,
                processData: false,
                contentType: false,
                cache: false,
                success: function(response) {
                    getPackages();
                }
            });
        });
        $("#confirm-cancel").unbind().on("click", function() {
            $("#confirm-container").fadeOut(300);
        });
        $("#confirm-container").css("display", "flex").hide().fadeIn(300);
    });
}

function addPackage() {
    showProgress("Memuat...");
    $("#admin-name").find("*").remove();
    $.ajax({
        type: 'GET',
        url: PHP_PATH+'get-admins.php',
        dataType: 'text',
        cache: false,
        success: function(response) {
            admins = JSON.parse(response);
            for (var i=0; i<admins.length; i++) {
                var admin = admins[i];
                $("#admin-name").append("<option>"+admin["name"]+"</option>");
            }
            hideProgress();
        }
    });
    $("#sender-name").val("");
    $("#receiver-name").val("");
    $("#courier-name").val("");
    $("#type").val("");
    $("#total-items").val("");
    $("#date-received").val("");
    $("#time-received").val("");
    $("#container").css("display", "flex").hide().fadeIn(300);
    $("#ok").html("Tambah").unbind().on("click", function() {
        $("#container").fadeOut(300);
        var adminID = admins[$("#admin-name").prop("selectedIndex")]["id"];
        var senderName = $("#sender-name").val().trim();
        var receiverName = $("#receiver-name").val().trim();
        var courierName = $("#courier-name").val().trim();
        var type = $("#type").val().trim();
        var totalItems = $("#total-items").val().trim();
        var dateReceived = $("#date-received").val().trim();
        var timeReceived = $("#time-received").val().trim();
        showProgress("Menambah paket");
        let fd = new FormData();
        fd.append("admin_id", adminID);
        fd.append("sender_name", senderName);
        fd.append("receiver_name", receiverName);
        fd.append("shipping_service", courierName);
        fd.append("type", type);
        fd.append("total_items", ""+totalItems);
        fd.append("date_received", dateReceived);
        fd.append("time_received", timeReceived);
        $.ajax({
            type: 'POST',
            url: PHP_PATH+'add-package.php',
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function(response) {
                $("#container").fadeOut(300);
                getPackages();
            }
        });
    });
}

function closeEditPackageDialog() {
    $("#container").fadeOut(300);
}

function selectTab(tab) {
    if (tab == 1) {
        currentTab = 1;
        $("#received-packages-container").fadeIn(300);
        $("#sent-packages-container").fadeOut(300);
        $("#tab1").css({
            backgroundColor: "#2e2f4d",
            color: "white"
        });
        $("#tab2").css({
            backgroundColor: "white",
            color: "black"
        });
    } else if (tab == 2) {
        currentTab = 2;
        $("#received-packages-container").fadeOut(300);
        $("#sent-packages-container").fadeIn(300);
        $("#tab1").css({
            backgroundColor: "white",
            color: "black"
        });
        $("#tab2").css({
            backgroundColor: "#2e2f4d",
            color: "white"
        });
    }
}

function rNext() {
    rStart += PAGINATION_STEP;
    getPackages();
}

function rPrev() {
    rStart -= PAGINATION_STEP;
    getPackages();
}

function sNext() {
    sStart += PAGINATION_STEP;
    getPackages();
}

function sPrev() {
    sStart -= PAGINATION_STEP;
    getPackages();
}

function rDownload() {
    var doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Berikut ini riwayat paket yang belum dikirim', 32, 25);
    nextY = 40;
    looper = 0;
    writeHistory("daftar_diterima.pdf", receivedPackages, doc);
}

function sDownload() {
    var doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Berikut ini riwayat paket yang sudah dikirim', 32, 25);
    nextY = 40;
    looper = 0;
    writeHistory("daftar_dikirim.pdf", sentPackages, doc);
}

function writeHistory(name, packagesJSON, doc) {
    if (looper >= packagesJSON.length) {
        doc.save(name);
        return;
    }
    var packageJSON = packagesJSON[looper];
    looper++;
    doc.setFontSize(18);
    doc.text('=============== PAKET '+packageJSON["id"]+' ===============', 32, nextY);
    nextY += 8;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }

    // Nama pengirim
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.text('Nama pengirim:', 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }
    doc.setFontType("normal");
    doc.text(packageJSON["sender_name"], 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }

    // Nama penerima
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.text('Nama penerima:', 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }
    doc.setFontType("normal");
    doc.text(packageJSON["receiver_name"], 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }

    // Nama satpam penerima
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.text('Nama admin penerima:', 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }
    doc.setFontType("normal");
    doc.text(packageJSON["admin_receiver_name"], 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }

    // Nama kurir
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.text('Nama kurir:', 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }
    doc.setFontType("normal");
    doc.text(packageJSON["courier_name"], 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }

    // Total item
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.text('Total item:', 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }
    doc.setFontType("normal");
    doc.text(packageJSON["total_items"], 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }

    // Tanggal diterima
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.text('Tanggal diterima:', 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }
    doc.setFontType("normal");
    doc.text(packageJSON["date_received"]+' '+packageJSON["time_received"], 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }

    // Tanggal dikirim
    if (packageJSON["date_sent"] != null && packageJSON["date_sent"] != "null") {
        doc.setFontType("bold");
        doc.setFontSize(14);
        doc.text('Tanggal dikirim:', 32, nextY);
        nextY += 7;
        if (nextY > 247) {
            nextY -= 237;
            doc.addPage();
        }
        doc.setFontType("normal");
        doc.text(packageJSON["date_sent"] + ' ' + packageJSON["time_sent"], 32, nextY);
        nextY += 7;
        if (nextY > 247) {
            nextY -= 237;
            doc.addPage();
        }
    }

    var status = "";
    if (packageJSON["status"] == "received") {
        status = "Diterima";
    } else if (packageJSON["status"] == "sent") {
        status = "Dikirim";
    }
    doc.setFontType("bold");
    doc.setFontSize(14);
    doc.text('Nama pengirim:', 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }
    doc.setFontType("normal");
    doc.text(status, 32, nextY);
    nextY += 7;
    if (nextY > 247) {
        nextY -= 237;
        doc.addPage();
    }

    writeHistory(name, packagesJSON, doc);
}

function rFilter() {
    $("#date-picker-container").css("display", "flex").hide().fadeIn(300);
    $("#filter-ok").unbind().on("click", function() {
        $("#date-picker-container").fadeOut(300);
        receivedPackages = [];
        $("#received-packages").find("*").remove();
        showProgress("Memuat daftar paket");
        var date = $("#select-date").val();
        let fd = new FormData();
        fd.append("date", date);
        fd.append("start", rStart);
        fd.append("total", PAGINATION_STEP);
        $.ajax({
            type: 'POST',
            url: PHP_PATH+'get-received-packages-by-date.php',
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function(response) {
                receivedPackages = JSON.parse(response);
                for (var i=0; i<receivedPackages.length; i++) {
                    var packageJSON = receivedPackages[i];
                    var status = "";
                    if (packageJSON["status"] == "received") {
                        status = "Diterima";
                    } else if (packageJSON["status"] == "sent") {
                        status = "Dikirim";
                    }
                    $("#received-packages").append("" +
                        "<tr>" +
                        "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>" + (rStart+i+1) + "</div></td>" +
                        "<td>" + packageJSON["id"] + "</td>" +
                        "<td>" + packageJSON["sender_name"] + "</td>" +
                        "<td>" + packageJSON["receiver_name"] + "</td>" +
                        "<td>" + packageJSON["admin_receiver_name"] + "</td>" +
                        "<td>" + packageJSON["courier_name"] + "</td>" +
                        "<td>" + packageJSON["date_received"] + "</td>" +
                        "<td>" + packageJSON["type"] + "</td>" +
                        "<td>" + status + "</td>" +
                        "<td><a class='view-package custom-link'>Lihat</a></td>" +
                        //"<td><a class='delete-package custom-link'>Hapus</a></td>" +
                        "</tr>"
                    );
                }
                sentPackages = [];
                $("#sent-packages").find("*").remove();
                let fd = new FormData();
                fd.append("start", sStart);
                fd.append("total", PAGINATION_STEP);
                $.ajax({
                    type: 'POST',
                    url: PHP_PATH+'get-sent-packages.php',
                    data: fd,
                    processData: false,
                    contentType: false,
                    cache: false,
                    success: function(response) {
                        sentPackages = JSON.parse(response);
                        for (var i=0; i<sentPackages.length; i++) {
                            var packageJSON = sentPackages[i];
                            var status = "";
                            if (packageJSON["status"] == "received") {
                                status = "Diterima";
                            } else if (packageJSON["status"] == "sent") {
                                status = "Dikirim";
                            }
                            $("#sent-packages").append("" +
                                "<tr>" +
                                "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>" + (sStart+i+1) + "</div></td>" +
                                "<td>" + packageJSON["id"] + "</td>" +
                                "<td>" + packageJSON["sender_name"] + "</td>" +
                                "<td>" + packageJSON["receiver_name"] + "</td>" +
                                "<td>" + packageJSON["admin_receiver_name"] + "</td>" +
                                "<td>" + packageJSON["courier_name"] + "</td>" +
                                "<td>" + packageJSON["date_received"] + "</td>" +
                                "<td>" + packageJSON["type"] + "</td>" +
                                "<td>" + status + "</td>" +
                                "<td><a class='view-package custom-link'>Lihat</a></td>" +
                                //"<td><a class='delete-package custom-link'>Hapus</a></td>" +
                                "</tr>"
                            );
                        }
                        setPackageClickListener();
                        hideProgress();
                    }
                });
            }
        });
    });
}

function rFilter() {
    $("#date-picker-container").css("display", "flex").hide().fadeIn(300);
    $("#filter-ok").unbind().on("click", function() {
        $("#date-picker-container").fadeOut(300);
        receivedPackages = [];
        $("#received-packages").find("*").remove();
        showProgress("Memuat daftar paket");
        var date = $("#select-date").val();
        let fd = new FormData();
        fd.append("date", date);
        fd.append("start", rStart);
        fd.append("total", PAGINATION_STEP);
        $.ajax({
            type: 'POST',
            url: PHP_PATH+'get-received-packages-by-date.php',
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function(response) {
                receivedPackages = JSON.parse(response);
                for (var i=0; i<receivedPackages.length; i++) {
                    var packageJSON = receivedPackages[i];
                    var status = "";
                    if (packageJSON["status"] == "received") {
                        status = "Diterima";
                    } else if (packageJSON["status"] == "sent") {
                        status = "Dikirim";
                    }
                    $("#received-packages").append("" +
                        "<tr>" +
                        "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>" + (rStart+i+1) + "</div></td>" +
                        "<td>" + packageJSON["id"] + "</td>" +
                        "<td>" + packageJSON["sender_name"] + "</td>" +
                        "<td>" + packageJSON["receiver_name"] + "</td>" +
                        "<td>" + packageJSON["admin_receiver_name"] + "</td>" +
                        "<td>" + packageJSON["courier_name"] + "</td>" +
                        "<td>" + packageJSON["date_received"] + "</td>" +
                        "<td>" + packageJSON["type"] + "</td>" +
                        "<td>" + status + "</td>" +
                        "<td><a class='view-package custom-link'>Lihat</a></td>" +
                        //"<td><a class='delete-package custom-link'>Hapus</a></td>" +
                        "</tr>"
                    );
                }
                sentPackages = [];
                $("#sent-packages").find("*").remove();
                let fd = new FormData();
                fd.append("start", sStart);
                fd.append("total", PAGINATION_STEP);
                $.ajax({
                    type: 'POST',
                    url: PHP_PATH+'get-sent-packages.php',
                    data: fd,
                    processData: false,
                    contentType: false,
                    cache: false,
                    success: function(response) {
                        sentPackages = JSON.parse(response);
                        for (var i=0; i<sentPackages.length; i++) {
                            var packageJSON = sentPackages[i];
                            var status = "";
                            if (packageJSON["status"] == "received") {
                                status = "Diterima";
                            } else if (packageJSON["status"] == "sent") {
                                status = "Dikirim";
                            }
                            $("#sent-packages").append("" +
                                "<tr>" +
                                "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>" + (sStart+i+1) + "</div></td>" +
                                "<td>" + packageJSON["id"] + "</td>" +
                                "<td>" + packageJSON["sender_name"] + "</td>" +
                                "<td>" + packageJSON["receiver_name"] + "</td>" +
                                "<td>" + packageJSON["admin_receiver_name"] + "</td>" +
                                "<td>" + packageJSON["courier_name"] + "</td>" +
                                "<td>" + packageJSON["date_received"] + "</td>" +
                                "<td>" + packageJSON["type"] + "</td>" +
                                "<td>" + status + "</td>" +
                                "<td><a class='view-package custom-link'>Lihat</a></td>" +
                                //"<td><a class='delete-package custom-link'>Hapus</a></td>" +
                                "</tr>"
                            );
                        }
                        setPackageClickListener();
                        hideProgress();
                    }
                });
            }
        });
    });
}

function closeFilterByDateDialog() {
    $("#date-picker-container").fadeOut(300);
}