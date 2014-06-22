var formidable = require('formidable'),
    http = require('http'),
    fs = require('fs'),
    url = require('url'),
    mime = require('mime'),
    util = require('util');

var configFile = fs.readFileSync(__dirname + "/config.json");
var config = JSON.parse(configFile);
var iconURL = config.icon_url;
var fileSufix = config.file_sufix;
var randomLength = config.random_length;
var themeUrl = config.theme_url;
var pageTitle = config.title;
var fileTypes = config.types;
var downloadEnabled = config.download_enabled;
var galleryEnabled = config.gallery_enabled;

var headerContent = fs.readFileSync(__dirname + "/header.html");
var galleryLink = '<a href="/gallery"><i class="fa fa-picture-o"></i></a>';
var galleryTypes = ["image/jpeg", "image/png", "image/gif"];

var stringHeader = String(headerContent);
if(galleryEnabled === 'true'){
    stringHeader = stringHeader.replace('%gallery-link%', galleryLink);
}
else{
    stringHeader = stringHeader.replace('%gallery-link%', '');
}
headerContent = stringHeader;

function prepareTemplate(template){
    var str = String(template);
    str = str.replace('%icon_url%', iconURL);
    str = str.replace('%theme_url%', themeUrl);
    str = str.replace('%title%', pageTitle);
    str = str.replace('%header%', headerContent);
    return str;
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

function legitFileType(type){
    var bol = contains(fileTypes, type);
    return bol;
}

function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < randomLength; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    text = fileSufix + "_" + text;
    return text;
}

http.createServer(function(req, res) {
    var rurl = url.parse(req.url, true,true);
    if (rurl.pathname == '/upload' && req.method.toLowerCase() != 'post') {
      var template_form = fs.readFileSync(__dirname + "/templates /template.html");
      res.writeHead(200, {'content-type': 'text/html'});
      var temp = prepareTemplate(template_form);
      res.end(temp);

    }
    if (rurl.pathname == '/upload' && req.method.toLowerCase() == 'post') {
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
    });

    form.on('file', function(field, file) {
        console.log(file.type);

    	if(legitFileType(file.type)){
        	var nm = makeid();
            var template_info = fs.readFileSync(__dirname + "/templates/template_success.html");
            var fileName = nm + "_" + file.name;
            var str = prepareTemplate(template_info);
            str = str.replace('%filename%', fileName);
            var temp = str;
        	var ur = "/files/" + fileName;
    	    fs.rename(file.path, __dirname + ur,function(){
        	    res.writeHead(200, {'content-type': 'text/html'});
    	      	res.end(temp);
                console.log("File saved!");
        	});    	
    	}
    	else{
            var template_error = fs.readFileSync(__dirname + "/templates/template_error.html");
            var temp = prepareTemplate(template_error);
    	    res.writeHead(200, {'content-type': 'text/html'});
    	    res.end(temp);
    	}

    });

    return;
    }

    if(rurl.pathname == '/style'){
        var t_style = fs.readFileSync(__dirname + "/css/style.css");
        res.writeHead(200, {'content-type': 'text/css'});
        res.end(t_style);
    }

    if(rurl.pathname == '/lawl'){
        res.writeHead(200, {'content-type': 'text/json'});

    }

    if(rurl.pathname == '/gallery'){
        if(galleryEnabled === 'true'){
            var template_gallery = fs.readFileSync(__dirname + "/templates/template_gallery.html");
            var temp = prepareTemplate(template_gallery);
            var files = fs.readdirSync(__dirname + '/files');
            var infos = '<div class="gallery">';
            for( var i=0; i < files.length; i++ ){
                var mtype = mime.lookup(files[i]);
                if(contains(galleryTypes, mtype) === true){
                    infos = infos + '<img src="/file?show=' + files[i] + '"  class="gallery-item">';
                }
            }
            infos = infos + '</div>';
            res.writeHead(200, {'content-type': 'text/html'});
            temp = temp.replace('%gallery%', infos);
            res.end(temp);
        }
        else{
            res.writeHead(404, {'Content-Type': 'text/txt' });
            res.end('ERROR 404: The gallery-feature is disabled!');
        }
    }

    if(rurl.pathname == '/file'){
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
        if(downloadEnabled == 'true' && query.show){
            var exists = fs.existsSync(__dirname + '/files/' + query.show);
            if(exists == true){
                var rfile = fs.readFileSync(__dirname + '/files/' + query.show);
                var mimetype = mime.lookup(query.show);
                res.writeHead(200, {'Content-Type': mimetype });
                res.end(rfile, 'binary');
            }
            else{
                var img = fs.readFileSync(__dirname + '/img/error.gif');
                res.writeHead(200, {'Content-Type': 'image/gif' });
                res.end(img, 'binary');
            }

        }
        else{
            res.writeHead(404, {'Content-Type': 'text/txt' });
            res.end('ERROR 404: The download-feature is disabled or you did not enter a valid filename!');
        }
    }

    res.writeHead(302, {'Location': '/upload'});
    res.end();
}).listen(8080);
