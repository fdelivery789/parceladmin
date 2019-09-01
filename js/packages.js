var packages = [];

$(document).ready(function() {
    getPackages();
});

function getPackages() {
    packages = [];
    $("#packages").find("*").remove();
    showProgress("Memuat daftar paket");
    $.ajax({
        type: 'GET',
        url: PHP_PATH+'get-packages.php',
        dataType: 'text',
        cache: false,
        success: function(response) {
            packages = JSON.parse(response);
            for (var i=0; i<packages.length; i++) {
                var packageJSON = packages[i];
                var status = "";
                if (packageJSON["status"] == "received") {
                    status = "Diterima";
                } else if (packageJSON["status"] == "sent") {
                    status = "Dikirim";
                }
                $("#packages").append("" +
                    "<tr>" +
                    "<td><div style='background-color: #2f2e4d; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white;'>" + (i+1) + "</div></td>" +
                    "<td>" + packageJSON["sender_name"] + "</td>" +
                    "<td>" + packageJSON["receiver_name"] + "</td>" +
                    "<td>" + packageJSON["courier_name"] + "</td>" +
                    "<td>" + packageJSON["date_received"] + "</td>" +
                    "<td>" + status + "</td>" +
                    "<td><a class='view-package link'>Lihat</a></td>" +
                    "<td><a class='delete-package link'>Hapus</a></td>" +
                    "</tr>"
                );
            }
            setPackageClickListener();
            hideProgress();
        }
    });
}

function setPackageClickListener() {
    $(".view-package").unbind().on("click", function() {
        var td = $(this).parent();
        var tr = td.parent();
        var index = $("#packages").children().index(tr);
        var packageJSON = packages[index];
        $("#sender-name").val(packageJSON["sender_name"]);
        $("#receiver-name").val(packageJSON["receiver_name"]);
        $("#courier-name").val(packageJSON["courier_name"]);
        $("#total-items").val(packageJSON["total_items"]);
        $("#date-received").val(packageJSON["date_received"]+" "+packageJSON["time_received"]);
        var dateSent = packageJSON["date_sent"];
        if (dateSent == null || dateSent == "null") {
            dateSent = "";
        } else {
            dateSent = packageJSON["date_sent"]+" "+packageJSON["time_sent"];
        }
        $("#date-sent").val(dateSent);
        var status = packageJSON["status"];
        if (status == "received") {
            $("#status").val("Diterima");
        } else if (status == "sent") {
            $("#status").val("Dikirim");
        }
        $("#container").css("display", "flex").hide().fadeIn(300);
        $("#ok").unbind().on("click", function() {
            $("#container").fadeOut(300);
        });
    });
    $(".delete-package").unbind().on("click", function() {
        var td = $(this).parent();
        var tr = td.parent();
        var index = $("#packages").children().index(tr);
        var packageJSON = packages[index];
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