// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer, remote } = require('electron');
var fs = require('fs')

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
    $("#configTable").empty();
    for (var i = 0; i < event.dataTransfer.files.length; i++) {
        ipcRenderer.send("ondrag", event.dataTransfer.files[i].path);
    }
    //console.log("renderer.js drag");
}

var mapList = [{ index: 0, filename: "" }]

ipcRenderer.on("dragend", (event, arg) => {
    if (arg.isScene) {
        var watchInfo = {
            index: mapList.length,
            mapFile: arg.path + "\\minimap.png",
        }

        mapList.push(watchInfo);
        addWatch(watchInfo.mapFile)

        var h = '<td class="text-center '
        if (arg.class == "竞赛" || arg.class == "竞赛 Python") {
            h += ' text-primary">' + arg.class + '</td>';
        }
        else if (arg.class == "模拟") {
            h += ' text-success">' + arg.class + '</td>';
        }
        else {
            h += '">' + arg.class + '</td>';
        }
        //console.log(h);

        var t = '<tr>';
        t += '<td>' + arg.sceneName + '</td>';
        t += '<td class="text-right">' + arg["总时间"] + '</td>';
        t += '<td class="text-right">' + arg["任务限时"] + '</td>';
        t += '<td class="text-right">' + arg["比赛机会次数"] + '</td>';
        t += '<td class="text-right">' + arg["任务小结束提交次数"] + '</td>';
        t += '<td class="text-center">' + (arg.IsUseDefaultRobot == "true" ? arg.DefaultRobotName : "否") + '</td>';
        t += '<td class="text-center">' + (arg.IsUseDefaultCtl == "true" ? arg.DefaultVplName : "否") + '</td>';
        t += '<td class="text-right">' + arg.RobotMaxSize + '</td>';
        t += '<td class="text-right">' + arg.RobotMaxWeight + '</td>';
        t += '<td class="text-right">' + arg.RobotMaxModelNum + '</td>';
        //t += '<td class="text-center">' + arg.class + '</td>';
        t += h;
        t += '<td class="text-center">' + (arg.deletePng ? "已删" : "--") + '</td>';
        t += '<td class="text-center mapMsg' + watchInfo.index + '">' + (arg.compressMap ? "正在压缩" : "--") + '</td>';
        t += "</tr>"
        $("#configTable").append(t);
    }
    else {
        // 不是场景目录处理
    }
})

addWatch = function (mapFile) {
    fs.watch(mapFile, function (eventType, filename) {
        var index = 0;
        for (var i = 0; i < mapList.length; i++) {
            if (mapList[i].mapFile == mapFile) {
                index = i;
            }
        }
        //console.log("监视压缩：", index, mapFile)
        $(".mapMsg" + index).html("压缩完成")
        $(".mapMsg" + index).addClass("text-primary")
    })
}

//////////////////// EXCEL 处理
document.getElementById("excelDrag").ondragover = (event) => {
    event.preventDefault();
}
document.getElementById("excelDrag").ondrop = (event) => {
    event.preventDefault();
    var file = event.dataTransfer.files[0];
    var path = file.path;
    if(file.type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
        console.log(file);
        console.log(path);
        ipcRenderer.send("excelOndrag", path);
    }
    // $("#configTable").empty();
    // for (var i = 0; i < event.dataTransfer.files.length; i++) {
    //     ipcRenderer.send("ondrag", event.dataTransfer.files[i].path);
    // }
    //console.log("renderer.js drag");
}