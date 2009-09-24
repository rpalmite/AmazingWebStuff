
function _server () {
	this.save = function save(n) {
        return n < 10 ? '0' + n : n;
    }
    this.load  = function load(resource, action, arguments, callback) {
    	//var cbresult = callback();
        var url = "../json/ds/" + resource + "/" + action + "/" + arguments;
        loadXMLDoc(url, callback);
        //alert(url);
    }
}

if (!this.server) {
	var server = new _server();
}

function loadXMLDoc(url, callback) {
    var xmlhttp = false;
    // branch for native XMLHttpRequest object
    if (window.XMLHttpRequest) {// && !(window.ActiveXObject)) {
        try {
            xmlhttp = new XMLHttpRequest();
        } catch(e) {
            xmlhttp = false;
        }
    // branch for IE/Windows ActiveX version
    } else if (window.ActiveXObject) {
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch(e) {
                xmlhttp = false;
            }
        }
    } else {
        alert('Perhaps your browser does not support xmlhttprequests');
    }
    if (xmlhttp) {
        xmlhttp.onreadystatechange = function() { processReqChange(xmlhttp, function() { callback(); }); };
        xmlhttp.open("GET", url, true);
        xmlhttp.send("");
    }
}


function processReqChange(xmlhttp, callback) {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            // do something with the results
            //alert("worked");
            //alert(xmlhttp.responseText);
            var myObj = eval ( "(" + xmlhttp.responseText + ")" );
            callback(myObj);
            //alert("req change");
            //$("#test2").append("hi");
            //$("#test2").append(" dude ");
            //$("#test2").append(myObj["com.wut.model.ArrayEntityList"].entityList[0].data[0][0]);
            //$("#test3").append("    ");
            //$("#test3").append(myObj["com.wut.model.ArrayEntityList"]["entityList"][0]["data"][0][0]);
            //$("#test3").append(" ---- ");
            //$("#test3").append(myObj["com.wut.model.ArrayEntityList"]["entityList"][0]["data"][0][1]);
     } else {
            // wait for the call to complete
            //alert("wait");
            //$("#test3").html("waiting:" + xmlhttp.responseText + "<br>status:" + xmlhttp.statusText + "<br>ready state:" + xmlhttp.readyState + "<br>");
     }
 }

