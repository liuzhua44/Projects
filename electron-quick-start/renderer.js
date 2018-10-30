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
    $("#configTable").empty();
    for (var i = 0; i < event.dataTransfer.files.length; i++) {
        ipcRenderer.send("ondrag", event.dataTransfer.files[i].path);
    }
    console.log("renderer.js drag");
}

ipcRenderer.on("dragend", (event, arg) => {
    if (arg.isScene) {
        var t = '<tr'
        if (arg.class == "竞赛" || arg.class == "竞赛 Python") {
            t += " class='table-primary'>";
        }
        else if (arg.class == "模拟") {
            t += " class='table-warning'>";
        }
        else {
            t += ">";
        }
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
        t += '<td class="text-center">' + arg.class + '</td>';
        t += "</tr>"
        $("#configTable").append(t);
    }
    else {
        // 不是场景目录处理
    }
})