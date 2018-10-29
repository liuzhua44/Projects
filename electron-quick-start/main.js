// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
var fs = require('fs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 1600, height: 600 })

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
    console.log("ipcMain drag " + filePath);
    fs.stat(filePath, function (err, stat) {
        if (stat.isDirectory()) {
            var n1 = filePath.lastIndexOf("/")
            var sceneName = filePath.slice(n1+1);
            console.log(sceneName);
            var aryFiles = fs.readdirSync(filePath);
            console.log(aryFiles);

            for (var i = 0; i < aryFiles.length; i++) {
                if (aryFiles[i] == "config.lua") {
                    var sceneConfig = fs.readFileSync(filePath + "/config.lua", 'utf8');
                    var config = getConfig(sceneConfig);
                    console.log(config);
                    event.sender.send(config)

                    // console.log("find config.lua")
                    // var sceneConfig = fs.readFileSync(filePath + "/config.lua", 'utf8');
                    // var d1 = sceneConfig.lastIndexOf("比赛机会次数")
                    // var d2 = sceneConfig.indexOf("=", d1);
                    // var d3 = sceneConfig.indexOf(",", d2);
                    // var v = sceneConfig.slice(d2 + 1, d3);
                    // console.log(d1, d2, d3, v);
                }
            }
        }
        // console.log(err);
        // console.log("is file:" + stat.isFile());
        // console.log("is directory:" + stat.isDirectory());
    })
})
function getConfig(strFile) {
    var list = [
        "总时间", "任务限时", "比赛机会次数", "任务小结束提交次数", "IsUseDefaultRobot", "IsUseDefaultCtl", "RobotMaxSize", "RobotMaxWeight", "RobotMaxModelNum"
    ];
    var config = {};
    for (var i = 0; i < list.length; i++) {
        config[list[i]] = getKeyValue(strFile, list[i]);
    }
    return config;
}
function getKeyValue(strFile, strKey) {
    var d1 = strFile.lastIndexOf(strKey)
    var d2 = strFile.indexOf("=", d1);
    var d3 = strFile.indexOf(",", d2);
    var v = strFile.slice(d2 + 1, d3);
    return v;
}