// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {
    ipcRenderer,
    remote
} = require('electron');
var fs = require('fs')

// 菜单处理
menu = function () {
    console.log("menumenumenumenu")
    $("#menu li a").bind("click", function (e) {
        $("#menu li a").removeClass("active")
        $(e.currentTarget).addClass("active")
        var alink = $("#menu li a")
        for (var i = 0; i < $("#menu li a").length; i++) {
            $("#" + $(alink[i]).attr("data-page")).hide()
        }
        $("#" + $(e.currentTarget).attr("data-page")).show()
    })
}

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
    // 将文件信息放入到数组中，便于排序
    var files = new Array();
    for (var i = 0; i < event.dataTransfer.files.length; i++) {
        files.push(event.dataTransfer.files[i])
    }
    // 开始自定义排序
    // 添加排序索引
    var sortItem = ["小学", "小学py", "初中", "初中py", "高中", "高中py"]
    for (var i = 0; i < files.length; i++) {
        for (var j = 0; j < sortItem.length; j++) {
            if (files[i].name.indexOf(sortItem[j]) != -1) {
                files[i].sortIndex = j;
            }
        }
    }
    // 按小/初/高排序
    files.sort(function (a, b) {
        if (typeof (a.sortIndex) != "undefined") {
            if (a.sortIndex > b.sortIndex)
                return 1;
            else
                return -1;
        } else {
            if (a.name > b.name)
                return 1
            else
                return -1;
        }
    })
    // 提交处理并显示
    $("#configTable").empty();
    for (var i = 0; i < files.length; i++) {
        ipcRenderer.send("ondrag", files[i].path);
    }
    // 不排序直接处理的方法
    // for (var i = 0; i < event.dataTransfer.files.length; i++) {
    //     ipcRenderer.send("ondrag", event.dataTransfer.files[i].path);
    // }
}

var mapList = [{
    index: 0,
    filename: ""
}]

ipcRenderer.on("dragend", (event, arg) => {
    if (arg.isScene) {
        var watchInfo = {
            index: mapList.length,
            mapFile: arg.path + "\\minimap.png",
        }

        mapList.push(watchInfo);
        addWatch(watchInfo.mapFile)

        var h = '<td class="text-left '
        if (arg.class == "竞赛" || arg.class == "竞赛 Python") {
            h += ' text-primary">' + arg.class + '</td>';
        } else if (arg.class == "模拟") {
            h += ' text-success">' + arg.class + '</td>';
        } else {
            h += '">' + arg.class + '</td>';
        }
        //console.log(h);

        var t = '<tr>';
        t += '<td>' + arg.sceneName + '</td>';
        t += '<td class="text-right">' + arg["总时间"] + '</td>';
        t += '<td class="text-right">' + arg["任务限时"] + '</td>';
        t += '<td class="text-right">' + arg["比赛机会次数"] + '</td>';
        t += '<td class="text-right">' + arg["任务小结束提交次数"] + '</td>';
        t += '<td class="text-left">' + (arg.IsUseDefaultRobot == "true" ? arg.DefaultRobotName : "否") + '</td>';
        t += '<td class="text-left">' + (arg.IsUseDefaultCtl == "true" ? arg.DefaultVplName : "否") + '</td>';
        t += '<td class="text-right">' + arg.RobotMaxSize + '</td>';
        t += '<td class="text-right">' + arg.RobotMaxWeight + '</td>';
        t += '<td class="text-right">' + arg.RobotMaxModelNum + '</td>';
        //t += '<td class="text-center">' + arg.class + '</td>';
        t += h;
        t += '<td class="text-center">' + (arg.deletePng ? "已删" : "--") + '</td>';
        t += '<td class="text-center mapMsg' + watchInfo.index + '">' + (arg.compressMap ? "正在压缩" : "--") + '</td>';
        t += "</tr>"
        $("#configTable").append(t);
    } else {
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

// --------------------------------------------------------------------------------
//                                  压缩图片 
// --------------------------------------------------------------------------------
document.getElementById("compressDrag").ondragover = (event) => {
    event.preventDefault();
}
// 拖放事件
document.getElementById("compressDrag").ondrop = (event) => {
    event.preventDefault();
    // 收到的文件发给后台处理
    for (var i = 0; i < event.dataTransfer.files.length; i++) {
        ipcRenderer.send("onCompressDrag", event.dataTransfer.files[i].path);
    }
}
// 收到后台处理结果
var compressIndex = 0;
ipcRenderer.on("compressDragEnd", (event, info) => {
    info.compressIndex = compressIndex;
    // 准备显示在表格中
    var h = '<tr class="compressIndex' + compressIndex + '">'
    h += '<td>' + info.base + '</td>';
    h += '<td class="text-right">' + Math.ceil(info.size / 1024) + " KB</td>"
    h += '<td style="width:30%">\
            <div class="progress">\
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"\
                aria-valuenow="1" aria-valuemin="0" aria-valuemax="100" style="width: 1%"></div>\
            </div>\
           </td>';
    h += '<td class="compressNewSize text-right"></td>';
    h += '<td class="compressInfo">压缩中 ...</td>'
    $("#compressTable").append(h);
    // 绑定监听事件
    compressImgWatch(info)
    compressIndex++;
})
// 监听文件更改
compressImgWatch = function (info) {
    var progress = $(".compressIndex" + info.compressIndex).find(".progress-bar")
    // 显示假进度
    var tag = window.setInterval(function () {
        var value = parseInt(progress.attr("aria-valuenow"));
        // 按压缩 500KB 的文件约需 10 秒种，每 200ms 改变一次进度，计算每次增量
        var t = info.size / 1024 / 500 * 10; // 按 500KB 需 10 秒，计算此文件需约 N 秒，最少为 2 秒
        if (t < 2) {
            t = 2;
        }
        value += 100 / (t / 0.2); // 计算每 200ms 更新一次，每次更新多少进度
        if (value > 100) {
            value = 100;
        }
        progress.attr("aria-valuenow", value)
        progress.width(value + "%");
    }, 200 * 1)
    // 监听到压缩完成后处理
    fs.watch(info.filePath, function (eventType, fileName) {
        // 改变进度条样式
        progress.removeClass("progress-bar-striped")
            .removeClass("progress-bar-animated")
            .addClass("bg-success")
            .width("100%");
        // 取消定时器
        window.clearInterval(tag);
        // 计算新尺寸，及压缩率，和显示压缩完成消息
        var newSize = fs.statSync(info.filePath).size;
        $(".compressIndex" + info.compressIndex).find(".compressNewSize").html(Math.ceil(newSize / 1024) + " KB");
        var ratio = Math.floor((info.size - newSize) / info.size * 100);
        $(".compressIndex" + info.compressIndex).find(".compressInfo").html('<span class="text-primary">压缩完成  -' + ratio + '%</span>')
    })
}
// 页面按钮清空列表
compressClearList = function () {
    $("#compressTable").empty();
}

// --------------------------------------------------------------------------------
//                                  竞赛账号处理 
// --------------------------------------------------------------------------------
document.getElementById("gameAccountDrag").ondragover = (event) => {
    event.preventDefault();
}
document.getElementById("gameAccountDrag").ondrop = (event) => {
    event.preventDefault();
    var file = event.dataTransfer.files[0];
    //var path = file.path;
    if (file.type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        console.log(file);
        //console.log(path);
        ipcRenderer.send("gameAccountOndrag", file.path);
    }
    // $("#configTable").empty();
    // for (var i = 0; i < event.dataTransfer.files.length; i++) {
    //     ipcRenderer.send("ondrag", event.dataTransfer.files[i].path);
    // }
    //console.log("renderer.js drag");
}
// ipcRenderer.on("gameAccountOndragEnd",(event, data)=>{
//     console.log(data)
//     var htmlOut = document.getElementById("gameAccountSrcTable");
//     htmlOut.innerHTML += data
//     $("#gameAccountSrcTable").find("table").addClass("table")
//         .addClass("table")
//         .addClass("table-hover")
//         .addClass("table-sm");
// })

ipcRenderer.on("gameAccountOndragEnd", (event, info) => {
    var area = document.getElementById("gameAccountSrcTable");
    area.innerHTML += info.tableHtml;
    $("#gameAccountSrcTable").find("table")
        .addClass("table")
        .addClass("table-hover")
        .addClass("table-sm");

    console.log(info.tableJson);

    // 各列意义
    var option = {
        headerNumber: 2,
        columnInfo: {
            realName: 0,
            sex: 1,
            school: 2,
            grade: 3,
        },
        accountPrefix: "fy18",
        area: ["浙江省", "杭州市", "富阳区"],

    }
    createImportAccount(info.tableJson, option);
})

createImportAccount = function (dataJson, option) {
    // 导入账号数据
    var importJson = new Array();

    // 账号，2位/3位
    var accountIndex = {
        "xx": 0,
        "cz": 0,
        "gz": 0,
        "by": 0,
    }
    var accountBit = (dataJson.length - option.headerNumber) < 100 ? 2 : 3;
    var getNextAccount = function (grade) {
        console.log(typeof (accountIndex[grade]))
        accountIndex[grade]++;
        var strIndex = accountIndex[grade].toString();
        if (accountIndex[grade] == "undefined") {
            strIndex = 0;
        }
        if (strIndex.length < accountBit) {
            for (var i = 0; i < accountBit - strIndex.length; i++) {
                strIndex = "0" + strIndex;
            }
        }
        return option.accountPrefix + grade + strIndex;
    }

    // 添加组别信息
    var getGrade = function (info) {
        var xxGrade = {
            "小": true,
            "一": true,
            "二": true,
            "三": true,
            "四": true,
            "五": true,
            "六": true,
        };
        var czGrade = {
            "初": true,
            "七": true,
            "八": true,
            "九": true,
        };
        var gzGrade = {
            "高": true,
        }
        var str = info[option.columnInfo.grade]; // 此行信息标识组别的字符
        if (xxGrade[str]) {
            return "xx";
        } else if (czGrade[str]) {
            return "cz";
        } else if (gzGrade[str]) {
            return "gz";
        }
        return "未知"
    }

    // 导入账号数据
    // 选手对应账号
    for (var i = option.headerNumber; i < dataJson.length; i++) {
        var info = dataJson[i];
        info.grade = getGrade(info); // 添加组别信息
        var row = new Array();
        row.push(getNextAccount(info.grade));
        row.push(parseInt(Math.random() * (9999 - 1000 + 1) + 1000, 10)); // 4 位随机密码
        row.push(info[option.columnInfo.realName]); // 姓名
        row.push("男");
        row.push(info[option.columnInfo.school]); // 学校
        row.push("五年级"); // 年级
        row.push(option.area[0]); // 省
        row.push(option.area[1]); // 省
        row.push(option.area[2]); // 省

        importJson.push(row);
    }

    // 备用账号
    // n<50=10 / 50<n<100=15 / n>100=20
    var backupAccountNumber = 10;
    if (dataJson.length > 50 && dataJson.length < 100) {
        backupAccountNumber = 15;
    } else if (dataJson.length > 100) {
        backupAccountNumber = 20;
    }
    for (var i = 0; i < backupAccountNumber; i++) {
        var row = new Array();
        row.push(getNextAccount("by"));
        row.push(parseInt(Math.random() * (9999 - 1000 + 1) + 1000, 10)); // 4 位随机密码
        row.push("备用" + (i + 1));
        row.push("男");
        row.push("备用");
        row.push("六年级");
        row.push(option.area[0]);
        row.push(option.area[1]);
        row.push(option.area[2]);
        importJson.push(row);
    }
    console.log(importJson)
    // // 显示数据
    for (var i = 0; i < importJson.length; i++) {
        var html = '<tr>';
        for (var j = 0; j < importJson[i].length; j++) {
            html += '<td>' + importJson[i][j] + '</td>';
        }
        html += '</tr>';
        $("#gaImportTable").append(html);
    }

}

// fenxi = function () {
//     // 行列转换
//     var columnData = new Array();
//     for (var i = 0; i < info.tableJson.length; i++) {
//         for (var j = 0; j < info.tableJson[i].length; j++) {
//             if (typeof (columnData[j]) == "undefined") {
//                 columnData.push(new Array());
//             }
//             columnData[j].push(info.tableJson[i][j].trim())
//         }
//     }
//     console.log(columnData);
//     // 分析各列意义
//     for (var i = 0; i < columnData.length; i++) {
//         // 统计字数及出现次数
//         var wordNumber = new Array();
//         for (var j = 0; j < columnData[i].length; j++) {
//             var wl = columnData[i][j].trim().length;
//             if (typeof (wordNumber["wn_" + wl]) == "undefined") {
//                 wordNumber["wn_" + wl] = 0;
//             }
//             wordNumber["wn_" + wl]++;
//         }
//         console.log("字数", wordNumber)

//         // 统计重复项及出次数
//         var repeatNumber = new Array();
//         for (var j = 0; j < columnData[i].length; j++) {
//             if (typeof (repeatNumber["rn_" + columnData[i][j]]) == "undefined") {
//                 repeatNumber["rn_" + columnData[i][j]] = 0;
//             }
//             repeatNumber["rn_" + columnData[i][j]] += 1;
//         }
//         console.log("重复", repeatNumber)

//         // 统计各列包含内容
//         var item = ["小", "初", "高", "学校", "中", "一", "二", "三", "四", "五", "六", "七", "八", "九", "1", "2", "3", "4", "5", "6", "7", "8", "9", ]
//     }
// }