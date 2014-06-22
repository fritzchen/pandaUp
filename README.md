pandaUp - a small File-Upload-System
==============

I am really to lazy to write a README :D


Just install the dependencies and run with node

    npm install

    node app.js

The config.json should look somewhat like this

    {
    //The URL of the Mobile-App-Icon (IOS ONLY)
    "icon_url": "url/for/ios-icon",
    //The Sufix for the uploaded files (All files will be stored in "files/")
    "file_sufix": "file",
    //The length of the random string that is added to the filename
    "random_length": "14",
    //The Title of the Pages
    "title": "pandaUp!",
    //A URL to an optional Theme (CSS File)
    "theme_url": "",
    //The uploadable MIME-Types 
    "types": ["image/jpeg", "image/png", "image/gif"],
    //Whether or not you can access the files from outside the server
    "download_enabled": "true",
    //Enables the gallery-page ("download_enabled" needs to be true)
    "gallery_enabled": "true"
    }