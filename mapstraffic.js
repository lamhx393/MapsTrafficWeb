var server = 'http://128.199.139.117:13373';
var dataJsonStreet;
var directionDisplay;
var directionsService = new google.maps.DirectionsService(); //gọi direction service
var map;
var arrLatLng;
var flightPath

function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var mapOptions = {
        center: new google.maps.LatLng(10.87178429, 106.80741102),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions); //hiển thị các thông báo khi chỉ dẫn
    directionsDisplay.setMap(map);
    //directionsDisplay.setPanel(document.getElementById('directions-panel'));//hiển thị các kết quả chỉ dẫn
    var control = document.getElementById('control');
    control.style.display = 'block';
    map.controls[google.maps.ControlPosition.TOP].push(control);
    google.maps.event.addListener(map, 'click', function(event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();

        $('#edLat').val(lat);
        $('#edLng').val(lng);

        console.log(event.toSource());
    });
}

function calcRoute() {
    console.log("Search derection");
    var selectedMode = document.getElementById('mode').value;
    var start = document.getElementById('start').value; //điểm bắt đầu do người dùng chọn
    var end = document.getElementById('end').value; //điểm kết thúc do người dùng chọn
    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode[selectedMode] //phương thức di chuyển
    };
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response); //tìm kiếm các đường di chuyển
            var route = response.routes[0];
            var summaryPanel = document.getElementById('dataJson');
            // var summaryPanel = document.getElementById('directions_panel');
            summaryPanel.innerHTML = '';
            //get location representing to draw street
            arrLatLng = new Array();
            while (arrLatLng.length) {
                arrLatLng.pop();
            }
            dataJsonStreet = '{\"street\":[';
            for (var i = 0; i < route.overview_path.length; i++) {
                dataJsonStreet += "{\"latitude\":\"" + route.overview_path[i].k + "\",\"longitude\":\"" + route.overview_path[i].B + "\"},";
                arrLatLng.push(new google.maps.LatLng(route.overview_path[i].k, route.overview_path[i].B));
            }


             flightPath = new google.maps.Polyline({
              path: arrLatLng,
              geodesic: true,
              strokeColor: '#EE0000',
              strokeOpacity: 1.0,
              strokeWeight: 4
            });

            // Dùng hàm setMap để gắn vào bản đồ
            flightPath.setMap(map);

            var lengthDataJson = dataJsonStreet.length;
            dataJsonStreet = dataJsonStreet.substring(0, lengthDataJson - 1);
            dataJsonStreet += ']}';
            summaryPanel.innerHTML += dataJsonStreet + "<br>Length: " + arrLatLng.length;
            //summaryPanel.innerHTML += arrLatLng.toString();
            // Các tọa độ của đường thẳng sẽ đi qua
            // flightPath.setMap(null);
        }
    });
}

function postDataToServer() {
    console.log('post to server');
    $.post(server, dataJsonStreet, function() {
        console.log("success");
    }).done(function() {
        console.log("second success");
    }).fail(function() {
        console.log("error");
    }).always(function() {
        console.log("finished");
    });
    // $.post(server, {
    //     name: "Donald Duck",
    //     city: "Duckburg"
    // }, function(data, status) {
    //     alert("Data: " + data + "\nStatus: " + status);
    // });
    console.log('finish post');
}

function getDataPostLocation(){
       var loc = $('#edLoc').val();
       var lat = $('#edLat').val();
       var lng = $('#edLng').val();
       var err = $('#edErr').val();
       var strJson = '{\"diadiem\":\"'+loc+'\",\"locationX\":'+lat+',\"locationY\":'+lng+',\"loivipham\":\"'+err+'\"}';
        // var strJson = '{\"diadiem\":\"'+loc+'\",\"locationX\":\"'+lat+'\",\"locationY\":\"'+lng+'\",\"loivipham\":\"'+err+'\"}';
       console.log(strJson);
       return strJson;
}

function postLocationToServer(){
    console.log('Post Location');
    $.post(server,getDataPostLocation(),function() {
        console.log("success");
    }).done(function() {
        console.log("second success");
    }).fail(function() {
        console.log("error");
    }).always(function() {
        console.log("finished");
    });
}

$( document ).on( "pageinit", "#mainPager", function() {
    $( document ).on( "swipeleft swiperight", "#mainPager", function( e ) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
        if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
            // if ( e.type === "swipeleft"  ) {
            //     $( "#right-panel" ).panel( "open" );
            // } else 
            if ( e.type === "swiperight" ) {
                $( "#left-panel" ).panel( "open" );
            }
        }
    });
});

google.maps.event.addDomListener(window, 'load', initialize);