// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer, remote } = require('electron');

// console.log("index.js");
document.getElementById("drag").onclick = (event) => {
    console.log("index drag click")
}
// document.getElementById('drag').ondragstart = (event) => {
//     event.preventDefault()
//     ipcRenderer.send('ondragstart', '/path/to/item')
//     console.log("index drag")
// }
document.getElementById("drag").ondragover = (event) => {
    event.preventDefault();
}
document.getElementById("drag").ondrop = (event) => {
    event.preventDefault();
    ipcRenderer.send("ondrag", event.dataTransfer.files[0].path);
    console.log("renderer.js drag");
    return;
    var first = event.dataTransfer.files[0];
    //$("#debug").html("<p>"+type+"</p>");
    $("#debug").text("名称:"+first.name+"\r\n类型:"+first.type+" 更改日期"+first.lastModified)
    var files = event.dataTransfer.files;
    $("#fileList").empty();
    for(var i=0;i<files.length;i++){
        var path = files[i].path;
        $("#fileList").append("<li>" + path + "</li>");
    }
    // for (let file in files) {
    //     $("#fileList").append("<li>" + file.path + "</li>");
    // }
    //var path = event.dataTransfer.files[0].path;
    //$("#path").text(path);

}

document.getElementById("drag").ondrag = (event) =>{
}