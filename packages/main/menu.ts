import os from "os";
import fs from "fs";
import {
    app,
    dialog,
    Menu,
    ipcMain,
    BrowserWindow,
    BaseWindow
} from "electron";
import { autorun, runInAction } from "mobx";

import {
    importInstrumentDefinitionFile,
    openHomeWindow
} from "main/home-window";
import {
    IWindow,
    setForceQuit,
    windows,
    findWindowByBrowserWindow,
    isCrashed
} from "main/window";
import { settings } from "main/settings";
import { APP_NAME } from "main/util";
import { undoManager } from "eez-studio-shared/store";
import { isDev } from "eez-studio-shared/util-electron";

////////////////////////////////////////////////////////////////////////////////

function showAboutBox(item: any, focusedWindow: any) {
    if (focusedWindow) {
        focusedWindow.webContents.send("show-about-box");
    }
}

function isMacOs() {
    return os.platform() === "darwin";
}

function enableMenuItem(
    menuItems: Electron.MenuItemConstructorOptions[],
    id: string,
    enabled: boolean
) {
    for (let i = 0; i < menuItems.length; i++) {
        if (menuItems[i].id === id) {
            menuItems[i].enabled = enabled;
            return;
        }
    }
}

async function openProjectWithFileDialog(focusedWindow: BaseWindow) {
    const result = await dialog.showOpenDialog(focusedWindow, {
        properties: ["openFile"],
        filters: [
            { name: "EEZ Project", extensions: ["eez-project"] },
            {
                name: "EEZ Dashboard",
                extensions: ["eez-dashboard"]
            },
            { name: "All Files", extensions: ["*"] }
        ]
    });
    const filePaths = result.filePaths;
    if (filePaths && filePaths[0]) {
        openFile(filePaths[0], focusedWindow, false);
    }
}

export function openFile(
    filePath: string,
    focusedWindow?: any,
    runMode?: boolean
) {
    if (
        filePath.toLowerCase().endsWith(".eez-project") ||
        filePath.toLowerCase().endsWith(".eez-dashboard")
    ) {
        if (!focusedWindow) {
            focusedWindow = BrowserWindow.getFocusedWindow() || undefined;
        }

        if (focusedWindow) {
            focusedWindow.webContents.send("open-project", filePath, runMode);
        }
    }
}

export function loadDebugInfo(debugInfoFilePath: string, focusedWindow?: any) {
    if (!focusedWindow) {
        focusedWindow = BrowserWindow.getFocusedWindow();
    }

    if (focusedWindow) {
        focusedWindow.webContents.send("load-debug-info", debugInfoFilePath);
    }
}

export function saveDebugInfo(focusedWindow?: any) {
    if (!focusedWindow) {
        focusedWindow = BrowserWindow.getFocusedWindow();
    }

    if (focusedWindow) {
        focusedWindow.webContents.send("save-debug-info");
    }
}

function createNewProject() {
    BrowserWindow.getFocusedWindow()!.webContents.send("new-project");
}

function addInstrument() {
    BrowserWindow.getFocusedWindow()!.webContents.send("add-instrument");
}

////////////////////////////////////////////////////////////////////////////////

function buildMacOSAppMenu(
    win: IWindow | undefined
): Electron.MenuItemConstructorOptions {
    return {
        label: APP_NAME,
        submenu: [
            {
                label: "About " + APP_NAME,
                click: showAboutBox
            },
            {
                type: "separator"
            },
            {
                label: "Services",
                role: "services",
                submenu: []
            },
            {
                type: "separator"
            },
            {
                label: "Hide " + APP_NAME,
                accelerator: "Command+H",
                role: "hide"
            },
            {
                label: "Hide Others",
                accelerator: "Command+Alt+H",
                role: "hideOthers"
            },
            {
                label: "Show All",
                role: "unhide"
            },
            {
                type: "separator"
            },
            {
                label: "Quit",
                accelerator: "Command+Q",
                click: function () {
                    setForceQuit();
                    app.quit();
                }
            }
        ]
    };
}

////////////////////////////////////////////////////////////////////////////////

function buildFileMenu(win: IWindow | undefined) {
    const fileMenuSubmenu: Electron.MenuItemConstructorOptions[] = [];

    fileMenuSubmenu.push(
        {
            label: "New Project...",
            accelerator: "CmdOrCtrl+N",
            click: function (item, focusedWindow) {
                createNewProject();
            }
        },
        {
            label: "Add Instrument...",
            accelerator: "CmdOrCtrl+Alt+N",
            click: function (item, focusedWindow) {
                addInstrument();
            }
        },
        {
            label: "New Window",
            accelerator: "CmdOrCtrl+Shift+N",
            click: function (item, focusedWindow) {
                openHomeWindow();
            }
        },
        {
            type: "separator"
        },
        {
            label: "Open...",
            accelerator: "CmdOrCtrl+O",
            click: (item, focusedWindow) => {
                if (!focusedWindow) {
                    focusedWindow =
                        BrowserWindow.getFocusedWindow() || undefined;
                }

                if (focusedWindow) {
                    openProjectWithFileDialog(focusedWindow);
                }
            }
        },
        {
            label: "Open Recent",
            submenu: settings.mru.map(mru => ({
                label: mru.filePath,
                click: function () {
                    if (fs.existsSync(mru.filePath)) {
                        openFile(mru.filePath);
                    } else {
                        // file not found, remove from mru
                        var i = settings.mru.indexOf(mru);
                        if (i != -1) {
                            runInAction(() => {
                                settings.mru.splice(i, 1);
                            });
                        }

                        // notify user
                        dialog.showMessageBox(
                            BrowserWindow.getFocusedWindow()!,
                            {
                                type: "error",
                                title: "EEZ Studio",
                                message: "File does not exist.",
                                detail: `The file '${mru.filePath}' does not seem to exist anymore.`
                            }
                        );
                    }
                }
            }))
        }
    );

    if (
        win?.activeTabType === "project" ||
        win?.activeTabType === "run-project"
    ) {
        fileMenuSubmenu.push(
            {
                type: "separator"
            },
            {
                label: "Reload Project",
                click: function (item: any, focusedWindow: any) {
                    focusedWindow.webContents.send("reload-project");
                }
            }
        );

        fileMenuSubmenu.push(
            {
                type: "separator"
            },
            {
                label: "Load Debug Info...",
                click: async function (item: any, focusedWindow: any) {
                    const result = await dialog.showOpenDialog(focusedWindow, {
                        properties: ["openFile"],
                        filters: [
                            {
                                name: "EEZ Debug Info",
                                extensions: ["eez-debug-info"]
                            },
                            {
                                name: "EEZ Debug Info",
                                extensions: ["eez-debug-info"]
                            },
                            { name: "All Files", extensions: ["*"] }
                        ]
                    });
                    const filePaths = result.filePaths;
                    if (filePaths && filePaths[0]) {
                        loadDebugInfo(filePaths[0], focusedWindow);
                    }
                }
            }
        );

        if (win.state.isDebuggerActive) {
            fileMenuSubmenu.push({
                label: "Save Debug Info...",
                click: function (item: any, focusedWindow: any) {
                    saveDebugInfo(focusedWindow);
                }
            });
        }
    }

    fileMenuSubmenu.push(
        {
            type: "separator"
        },
        {
            label: "Import Instrument Definition...",
            click: async function (item: any, focusedWindow: any) {
                const result = await dialog.showOpenDialog(focusedWindow, {
                    properties: ["openFile"],
                    filters: [
                        {
                            name: "Instrument Definition Files",
                            extensions: ["zip"]
                        },
                        { name: "All Files", extensions: ["*"] }
                    ]
                });
                const filePaths = result.filePaths;
                if (filePaths && filePaths[0]) {
                    importInstrumentDefinitionFile(filePaths[0]);
                }
            }
        }
    );

    if (win?.activeTabType === "project") {
        fileMenuSubmenu.push(
            {
                type: "separator"
            },
            {
                id: "save",
                label: "Save",
                accelerator: "CmdOrCtrl+S",
                click: function (item: any, focusedWindow: any) {
                    if (focusedWindow) {
                        focusedWindow.webContents.send("save");
                    }
                }
            },
            {
                label: "Save As",
                accelerator: "CmdOrCtrl+Shift+S",
                click: function (item: any, focusedWindow: any) {
                    if (focusedWindow) {
                        focusedWindow.webContents.send("saveAs");
                    }
                }
            },

            {
                type: "separator"
            },
            {
                label: "Check",
                accelerator: "CmdOrCtrl+K",
                click: function (item: any, focusedWindow: any) {
                    if (focusedWindow) {
                        focusedWindow.webContents.send("check");
                    }
                }
            },
            {
                label: "Build",
                accelerator: "CmdOrCtrl+B",
                click: function (item: any, focusedWindow: any) {
                    if (focusedWindow) {
                        focusedWindow.webContents.send("build");
                    }
                }
            }
        );

        if (win.state.hasExtensionDefinitions) {
            fileMenuSubmenu.push(
                {
                    label: "Build Extensions",
                    click: function (item: any, focusedWindow: any) {
                        if (focusedWindow) {
                            focusedWindow.webContents.send("build-extensions");
                        }
                    }
                },
                {
                    label: "Build and Install Extensions",
                    click: function (item: any, focusedWindow: any) {
                        if (focusedWindow) {
                            focusedWindow.webContents.send(
                                "build-and-install-extensions"
                            );
                        }
                    }
                }
            );
        }
    } else if (win?.activeTabType === "instrument") {
        fileMenuSubmenu.push(
            {
                type: "separator"
            },
            {
                id: "save",
                label: "Save",
                accelerator: "CmdOrCtrl+S",
                click: function (item: any, focusedWindow: any) {
                    if (focusedWindow) {
                        focusedWindow.webContents.send("save");
                    }
                }
            }
        );
    }

    let count = BrowserWindow.getAllWindows().filter(b => {
        return b.isVisible();
    }).length;
    if (count > 1) {
        fileMenuSubmenu.push(
            {
                type: "separator"
            },
            {
                label: "Close Window",
                accelerator: "CmdOrCtrl+W",
                click: function (item: any, focusedWindow: any) {
                    if (focusedWindow) {
                        if (isCrashed(focusedWindow)) {
                            app.exit();
                        } else {
                            focusedWindow.webContents.send("beforeClose");
                        }
                    }
                }
            }
        );
    }

    if (!isMacOs()) {
        fileMenuSubmenu.push(
            {
                type: "separator"
            },
            {
                label: "Exit",
                click: function (item: any, focusedWindow: any) {
                    if (isCrashed(focusedWindow)) {
                        app.exit();
                    } else {
                        setForceQuit();
                        app.quit();
                    }
                }
            }
        );
    }

    return {
        label: "File",
        submenu: fileMenuSubmenu
    };
}

////////////////////////////////////////////////////////////////////////////////

function buildEditMenu(win: IWindow | undefined) {
    const editSubmenu: Electron.MenuItemConstructorOptions[] = [
        {
            id: "undo",
            label: "Undo",
            accelerator: "CmdOrCtrl+Z",
            role: "undo",
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    const win = findWindowByBrowserWindow(focusedWindow);
                    if (win !== undefined && win.state.undo != null) {
                        win.browserWindow.webContents.send("undo");
                        return;
                    }
                }

                undoManager.undo();
            }
        },
        {
            id: "redo",
            label: "Redo",
            accelerator: "CmdOrCtrl+Y",
            role: "redo",
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    const win = findWindowByBrowserWindow(focusedWindow);
                    if (win !== undefined && win.state.redo != null) {
                        win.browserWindow.webContents.send("redo");
                        return;
                    }
                }

                undoManager.redo();
            }
        },
        {
            type: "separator"
        },
        {
            label: "Cut",
            accelerator: "CmdOrCtrl+X",
            role: "cut",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("cut");
                }
            }
        },
        {
            label: "Copy",
            accelerator: "CmdOrCtrl+C",
            role: "copy",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("copy");
                }
            }
        },
        {
            label: "Paste",
            accelerator: "CmdOrCtrl+V",
            role: "paste",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("paste");
                }
            }
        },
        {
            label: "Delete",
            accelerator: "Delete",
            role: "delete",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("delete");
                }
            }
        },
        {
            type: "separator"
        },
        {
            label: "Select All",
            accelerator: "CmdOrCtrl+A",
            role: "selectAll",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("select-all");
                }
            }
        }
    ];

    if (win?.activeTabType === "project") {
        editSubmenu.push({
            type: "separator"
        });
        editSubmenu.push({
            label: "Find Project Component",
            accelerator: "CmdOrCtrl+Shift+F",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("findProjectComponent");
                }
            }
        });
    }

    const editMenu: Electron.MenuItemConstructorOptions = {
        label: "Edit",
        submenu: editSubmenu
    };

    enableMenuItem(
        <Electron.MenuItemConstructorOptions[]>editMenu.submenu,
        "undo",
        win !== undefined && win.state.undo != null
            ? !!win.state.undo
            : undoManager.canUndo
    );

    enableMenuItem(
        <Electron.MenuItemConstructorOptions[]>editMenu.submenu,
        "redo",
        win !== undefined && win.state.redo != null
            ? !!win.state.redo
            : undoManager.canRedo
    );

    return editMenu;
}

////////////////////////////////////////////////////////////////////////////////

function buildViewMenu(win: IWindow | undefined) {
    let viewSubmenu: Electron.MenuItemConstructorOptions[] = [];

    viewSubmenu.push(
        {
            label: "Home",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("openTab", "home");
                }
            }
        },
        {
            label: "History",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("openTab", "history");
                }
            }
        },
        {
            label: "Shortcuts and Groups",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send(
                        "openTab",
                        "shortcutsAndGroups"
                    );
                }
            }
        },
        {
            label: "Notebooks",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send(
                        "openTab",
                        "homeSection_notebooks"
                    );
                }
            }
        },
        {
            label: "Extensions",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("openTab", "extensions");
                }
            }
        },
        {
            label: "Settings",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("openTab", "settings");
                }
            }
        },
        {
            type: "separator"
        },
        {
            label: "Scrapbook for Project Editor",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("showScrapbookManager");
                }
            }
        },
        {
            type: "separator"
        }
    );

    viewSubmenu.push(
        {
            label: "Toggle Full Screen",
            accelerator: (function () {
                if (isMacOs()) {
                    return "Ctrl+Command+F";
                } else {
                    return "F11";
                }
            })(),
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                }
            }
        },
        {
            label: "Toggle Developer Tools",
            accelerator: (function () {
                if (isMacOs()) {
                    return "Alt+Command+I";
                } else {
                    return "Ctrl+Shift+I";
                }
            })(),
            click: function (item, focusedWindow: any) {
                if (focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            }
        },
        {
            label: settings.isDarkTheme
                ? "Switch to Light Theme"
                : "Switch to Dark Theme",
            accelerator: (function () {
                if (isMacOs()) {
                    return "Alt+Command+T";
                } else {
                    return "Ctrl+Shift+T";
                }
            })(),
            click: function (item, focusedWindow: any) {
                if (focusedWindow) {
                    focusedWindow.webContents.send("switch-theme");
                }
            }
        },
        {
            type: "separator"
        },
        {
            label: "Zoom In",
            role: "zoomIn"
        },
        {
            label: "Zoom Out",
            role: "zoomOut"
        },
        {
            label: "Reset Zoom",
            role: "resetZoom"
        },
        {
            type: "separator"
        }
    );

    if (win?.activeTabType === "project") {
        viewSubmenu.push({
            type: "separator"
        });

        viewSubmenu.push({
            label: "Go to Object...",
            accelerator: "CmdOrCtrl+P",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("goToObject");
                }
            }
        });

        viewSubmenu.push({
            label: "Command Palette...",
            accelerator: "CmdOrCtrl+Shift+P",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("showCommandPalette");
                }
            }
        });

        viewSubmenu.push({
            type: "separator"
        });

        viewSubmenu.push({
            label: settings.showComponentsPaletteInProjectEditor
                ? "Hide Components Palette"
                : "Show Components Palette",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send(
                        "toggleComponentsPalette"
                    );
                }
            }
        });

        viewSubmenu.push({
            label: "Reset Layout",
            click: function (item) {
                if (win) {
                    win.browserWindow.webContents.send("resetLayoutModels");
                }
            }
        });

        viewSubmenu.push({
            type: "separator"
        });
    }

    viewSubmenu.push({
        label: "Next Tab",
        accelerator: "Ctrl+Tab",
        click: function (item) {
            if (win) {
                win.browserWindow.webContents.send("show-next-tab");
            }
        }
    });

    viewSubmenu.push({
        label: "Previous Tab",
        accelerator: "Ctrl+Shift+Tab",
        click: function (item) {
            if (win) {
                win.browserWindow.webContents.send("show-previous-tab");
            }
        }
    });

    viewSubmenu.push({
        type: "separator"
    });

    viewSubmenu.push({
        label: "Reload",
        accelerator: "CmdOrCtrl+R",
        click: function (item) {
            if (win) {
                win.browserWindow.webContents.send("reload");
                //focusedWindow.webContents.reload();
                //focusedWindow.webContents.clearHistory();
            }
        }
    });

    return {
        label: "View",
        submenu: viewSubmenu
    };
}

////////////////////////////////////////////////////////////////////////////////

function buildMacOSWindowMenu(
    win: IWindow | undefined
): Electron.MenuItemConstructorOptions {
    return {
        label: "Window",
        role: "window",
        submenu: [
            {
                label: "Minimize",
                accelerator: "CmdOrCtrl+M",
                role: "minimize"
            },
            {
                label: "Close",
                accelerator: "CmdOrCtrl+W",
                role: "close"
            },
            {
                type: "separator"
            },
            {
                label: "Bring All to Front",
                role: "front"
            }
        ]
    };
}

////////////////////////////////////////////////////////////////////////////////

function buildHelpMenu(
    win: IWindow | undefined
): Electron.MenuItemConstructorOptions {
    const helpMenuSubmenu: Electron.MenuItemConstructorOptions[] = [];

    if (isDev) {
        helpMenuSubmenu.push({
            label: "Documentation",
            accelerator: "F1",
            click: function (item: any, focusedWindow: any) {
                focusedWindow.webContents.send("show-documentation-browser");
            }
        });
        helpMenuSubmenu.push({
            type: "separator"
        });
    }

    helpMenuSubmenu.push({
        label: "About",
        click: showAboutBox
    });

    return {
        label: "Help",
        role: "help",
        submenu: helpMenuSubmenu
    };
}

////////////////////////////////////////////////////////////////////////////////

function buildMenuTemplate(win: IWindow | undefined) {
    var menuTemplate: Electron.MenuItemConstructorOptions[] = [];

    if (isMacOs()) {
        menuTemplate.push(buildMacOSAppMenu(win));
    }

    menuTemplate.push(buildFileMenu(win));

    menuTemplate.push(buildEditMenu(win));

    menuTemplate.push(buildViewMenu(win));

    if (isMacOs()) {
        menuTemplate.push(buildMacOSWindowMenu(win));
    } else {
        menuTemplate.push(buildHelpMenu(win));
    }

    return menuTemplate;
}

////////////////////////////////////////////////////////////////////////////////

// The upstream locale setting formats dates and times, but does not translate
// the application chrome. This catalog changes visible menu labels only.
const zhCNMenuLabels: Record<string, string> = {
    "About": "关于",
    "Add Instrument...": "添加仪器...",
    "All Files": "所有文件",
    "Build": "构建",
    "Bring All to Front": "将所有窗口置于最前",
    "Build and Install Extensions": "构建并安装扩展",
    "Build Extensions": "构建扩展",
    "Check": "检查",
    "Close": "关闭",
    "Close Window": "关闭窗口",
    "Command Palette...": "命令面板...",
    "Copy": "复制",
    "Cut": "剪切",
    "Delete": "删除",
    "Documentation": "文档",
    "Edit": "编辑",
    "Extensions": "扩展",
    "EEZ Dashboard": "EEZ 仪表板项目",
    "EEZ Debug Info": "EEZ 调试信息",
    "EEZ Project": "EEZ 项目",
    "Exit": "退出",
    "File": "文件",
    "Find Project Component": "查找项目组件",
    "Go to Object...": "转到对象...",
    "Help": "帮助",
    "Hide Others": "隐藏其他窗口",
    "Hide Components Palette": "隐藏控件面板",
    "History": "历史记录",
    "Home": "主页",
    "Import Instrument Definition...": "导入仪器定义...",
    "Instrument Definition Files": "仪器定义文件",
    "Load Debug Info...": "加载调试信息...",
    "Minimize": "最小化",
    "New Project...": "新建项目...",
    "New Window": "新建窗口",
    "Next Tab": "下一个标签页",
    "Notebooks": "笔记本",
    "Open...": "打开...",
    "Open Recent": "最近打开",
    "Paste": "粘贴",
    "Previous Tab": "上一个标签页",
    "Quit": "退出",
    "Redo": "重做",
    "Reload": "重新加载",
    "Reload Project": "重新加载项目",
    "Reset Layout": "重置布局",
    "Reset Zoom": "重置缩放",
    "Save": "保存",
    "Save As": "另存为",
    "Save Debug Info...": "保存调试信息...",
    "Scrapbook for Project Editor": "项目编辑器素材库",
    "Select All": "全选",
    "Services": "服务",
    "Settings": "设置",
    "Show All": "显示全部",
    "Show Components Palette": "显示控件面板",
    "Shortcuts and Groups": "快捷方式和分组",
    "Switch to Dark Theme": "切换到深色主题",
    "Switch to Light Theme": "切换到浅色主题",
    "Toggle Developer Tools": "切换开发者工具",
    "Toggle Full Screen": "切换全屏",
    "Undo": "撤销",
    "View": "视图",
    "Window": "窗口",
    "Zoom In": "放大",
    "Zoom Out": "缩小"
};

function translateMenuTemplate(items: Electron.MenuItemConstructorOptions[], locale: string) {
    if (!locale.toLowerCase().startsWith("zh")) return items;
    for (const item of items) {
        if (typeof item.label === "string") {
            const translated = zhCNMenuLabels[item.label];
            if (translated) {
                item.label = translated;
            } else {
                for (const [english, chinese] of Object.entries(zhCNMenuLabels)) {
                    if (item.label.startsWith(english + " ")) {
                        item.label = chinese + item.label.substring(english.length);
                        break;
                    }
                }
            }
        }
        if (item.submenu && "length" in item.submenu) {
            translateMenuTemplate(item.submenu as Electron.MenuItemConstructorOptions[], locale);
        }
    }
    return items;
}

autorun(() => {
    for (let i = 0; i < windows.length; i++) {
        const win = windows[i];
        if (win.focused) {
            let menuTemplate = translateMenuTemplate(buildMenuTemplate(win), settings.locale || app.getLocale());
            let menu = Menu.buildFromTemplate(menuTemplate);
            Menu.setApplicationMenu(menu);
        }
    }
});

////////////////////////////////////////////////////////////////////////////////

ipcMain.on("getReservedKeybindings", function (event: any) {
    const menuTemplate = buildMenuTemplate(undefined);

    let keybindings: string[] = [];

    function addKeybinding(accelerator: Electron.Accelerator) {
        let keybinding = accelerator.toString();

        if (isMacOs()) {
            keybinding = keybinding.replace("CmdOrCtrl", "Meta");
            keybinding = keybinding.replace("CommandOrControl", "Meta");
        } else {
            keybinding = keybinding.replace("CmdOrCtrl", "Ctrl");
            keybinding = keybinding.replace("CommandOrControl", "Ctrl");
        }

        keybindings.push(keybinding);
    }

    function addKeybindings(menu: Electron.MenuItemConstructorOptions[]) {
        for (let i = 0; i < menu.length; i++) {
            const menuItem = menu[i];
            if (menuItem.accelerator) {
                addKeybinding(menuItem.accelerator);
            }
            if (menuItem.submenu && "length" in menuItem.submenu) {
                addKeybindings(
                    menuItem.submenu as Electron.MenuItemConstructorOptions[]
                );
            }
        }
    }

    addKeybindings(menuTemplate);

    event.returnValue = keybindings;
});

ipcMain.on("open-file", function (event, path, runMode) {
    openFile(path, undefined, runMode);
});

ipcMain.on("new-project", function (event) {
    createNewProject();
});

ipcMain.on("open-project", function (event) {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
        openProjectWithFileDialog(focusedWindow);
    }
});
