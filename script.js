/**
 * Created by aashil on 8/4/16.
 */

function submit(){
    var q = document.getElementById("search_field").value;
    search(q);
}

function search(q){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            var response = JSON.parse(xmlHttp.responseText);
            if(response.success == true) window.location = response.payload.redirect;
        }
    }
    xmlHttp.open("GET", "/api/q?q="+encodeURI(q), true); // true for asynchronous
    xmlHttp.send(null);
}

function searchengine(){
    var url = window.location.href;
    if(url.split("?q=")[1] != null) search(url.split("?q=")[1]);
}