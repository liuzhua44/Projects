// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
var fs = require('fs')
var tinify = require("tinify");
tinify.key = "wVQivOIO4uqxC8iACvEZMAYiug6H5fkx";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 1600, height: 1000 })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//--------------------------- 以上为自动生成的代码 ---------------------------

ipcMain.on('ondragstart', (event, filePath) => {
    console.log("ipcMain drag")
    event.sender.startDrag({
        file: filePath,
        icon: '/path/to/icon.png'
    })
})

ipcMain.on("ondrag", (event, filePath) => {
    fs.stat(filePath, function (err, stat) {
        if (stat.isDirectory()) {
            var aryFiles = fs.readdirSync(filePath);
            var info;
            // 是否场景目录
            if (aryFiles.indexOf('config.lua') != -1
                && aryFiles.indexOf('world.xml') != -1) {
                info = getInfo(filePath);
                info.isScene = true;
                // 删除多余图片
                info.deletePng = delete18Png(filePath);
                // 压缩 map
                info.compressMap = compressMinimap(filePath);
            }
            else {
                info.isScene = false;
            }
            event.sender.send("dragend", info);
        }
    })

})
// 删除场景中多余的 1.png 2.png ...
function delete18Png(dirPath) {
    var item = ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png", "8.png"];
    try {
        fs.accessSync(dirPath + "//1.png", fs.constants.R_OK | fs.constants.W_OK);
        //console.log('1.png can read/write');
        for (var i = 0; i < item.length; i++) {
            fs.unlinkSync(dirPath + "//" + item[i]);
        }
        return true;
    } catch (err) {
        //console.error('no access!');
    }
    return false;
}
// 压缩场景 minimap.png
function compressMinimap(dirPath) {
    // 体积大于 200kB 才去压缩
    var mapPath = dirPath + "//minimap.png"
    var stat = fs.statSync(mapPath);
    console.log("compressMinimap stat")
    console.log(stat);
    if (stat.size > 1024 * 200) {
        //console.log((stat.size/1024)+"kB")
        var source = tinify.fromFile(mapPath);
        var result = source.toFile(mapPath);
        // 结果与过程如何及时显示？？？
        console.log("compress result" + result);
        return true;
    }
    return false;
}
// 获取场景的所有信息
function getInfo(dirPath) {
    var info = {};
    // 场景名称
    info.sceneName = dirPath.slice(dirPath.lastIndexOf("\\") + 1);
    // 场景配置
    var item = ["总时间", "任务限时", "比赛机会次数", "任务小结束提交次数",
        "IsUseDefaultRobot", "IsUseDefaultCtl",
        "RobotMaxSize", "RobotMaxWeight", "RobotMaxModelNum"];
    var configFile = fs.readFileSync(dirPath + "/config.lua", 'utf8');
    for (var i = 0; i < item.length; i++) {
        info[item[i]] = getKeyValue(configFile, item[i]);
    }
    // 默认机器人和控制程序名称
    if (info.IsUseDefaultRobot != "false") {
        info.DefaultRobotName = fs.readdirSync(dirPath + "\\robot")[0];
    }
    if (info.IsUseDefaultCtl != "false") {
        info.DefaultVplName = fs.readdirSync(dirPath + "\\vpl")[0];
    }
    // 分析用途，练习、模拟、竞赛、竞赛Python
    if (info.IsUseDefaultRobot == "true") {
        if (info["比赛机会次数"] > 5) {
            info.class = "模拟";
        }
        else {
            if (info.DefaultVplName.indexOf("py") == -1) {
                info.class = "竞赛";
            }
            else {
                info.class = "竞赛 Python";
            }
        }
    }
    else {
        info.class = "练习";
    }

    return info;
}
function getKeyValue(strFile, strKey) {
    var d1 = strFile.lastIndexOf(strKey)
    var d2 = strFile.indexOf("=", d1);
    var d3 = strFile.indexOf(",", d2);
    var v = strFile.slice(d2 + 1, d3);
    return v;
}