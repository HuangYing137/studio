import { ipcRenderer } from "electron";

import { isRenderer } from "eez-studio-shared/util-electron";

export const LOCALES = {
    af: "Afrikaans",
    am: "Amharic",
    ar: "Arabic",
    az: "Azerbaijani",
    be: "Belarusian",
    bg: "Bulgarian",
    bh: "Bihari",
    bn: "Bengali",
    br: "Breton",
    bs: "Bosnian",
    ca: "Catalan",
    co: "Corsican",
    cs: "Czech",
    cy: "Welsh",
    da: "Danish",
    de: "German",
    "de-AT": "German (Austria)",
    "de-CH": "German (Switzerland)",
    "de-DE": "German (Germany)",
    el: "Greek",
    en: "English",
    "en-AU": "English (Australia)",
    "en-CA": "English (Canada)",
    "en-GB": "English (UK)",
    "en-NZ": "English (New Zealand)",
    "en-US": "English (US)",
    "en-ZA": "English (South Africa)",
    eo: "Esperanto",
    es: "Spanish",
    "es-419": "Spanish (Latin America)",
    et: "Estonian",
    eu: "Basque",
    fa: "Persian",
    fi: "Finnish",
    fil: "Filipino",
    fo: "Faroese",
    fr: "French",
    "fr-CA": "French (Canada)",
    "fr-CH": "French (Switzerland)",
    "fr-FR": "French (France)",
    fy: "Frisian",
    ga: "Irish",
    gd: "Scots Gaelic",
    gl: "Galician",
    gn: "Guarani",
    gu: "Gujarati",
    ha: "Hausa",
    haw: "Hawaiian",
    he: "Hebrew",
    hi: "Hindi",
    hr: "Croatian",
    hu: "Hungarian",
    hy: "Armenian",
    ia: "Interlingua",
    id: "Indonesian",
    is: "Icelandic",
    it: "Italian",
    "it-CH": "Italian (Switzerland)",
    "it-IT": "Italian (Italy)",
    ja: "Japanese",
    jw: "Javanese",
    ka: "Georgian",
    kk: "Kazakh",
    km: "Cambodian",
    kn: "Kannada",
    ko: "Korean",
    ku: "Kurdish",
    ky: "Kyrgyz",
    la: "Latin",
    ln: "Lingala",
    lo: "Laothian",
    lt: "Lithuanian",
    lv: "Latvian",
    mk: "Macedonian",
    ml: "Malayalam",
    mn: "Mongolian",
    mo: "Moldavian",
    mr: "Marathi",
    ms: "Malay",
    mt: "Maltese",
    nb: "Norwegian (Bokmal)",
    ne: "Nepali",
    nl: "Dutch",
    nn: "Norwegian (Nynorsk)",
    no: "Norwegian",
    oc: "Occitan",
    om: "Oromo",
    or: "Oriya",
    pa: "Punjabi",
    pl: "Polish",
    ps: "Pashto",
    pt: "Portuguese",
    "pt-BR": "Portuguese (Brazil)",
    "pt-PT": "Portuguese (Portugal)",
    qu: "Quechua",
    rm: "Romansh",
    ro: "Romanian",
    ru: "Russian",
    sd: "Sindhi",
    sh: "Serbo-Croatian",
    si: "Sinhalese",
    sk: "Slovak",
    sl: "Slovenian",
    sn: "Shona",
    so: "Somali",
    sq: "Albanian",
    sr: "Serbian",
    st: "Sesotho",
    su: "Sundanese",
    sv: "Swedish",
    sw: "Swahili",
    ta: "Tamil",
    te: "Telugu",
    tg: "Tajik",
    th: "Thai",
    ti: "Tigrinya",
    tk: "Turkmen",
    to: "Tonga",
    tr: "Turkish",
    tt: "Tatar",
    tw: "Twi",
    ug: "Uighur",
    uk: "Ukrainian",
    ur: "Urdu",
    uz: "Uzbek",
    vi: "Vietnamese",
    xh: "Xhosa",
    yi: "Yiddish",
    yo: "Yoruba",
    zh: "中文",
    "zh-CN": "简体中文",
    "zh-TW": "繁體中文",
    zu: "Zulu"
};

export let getLocale: () => string;
export let setLocale: (value: string) => void;

if (isRenderer()) {
    getLocale = function () {
        return ipcRenderer.sendSync("getLocale");
    };

    setLocale = function (value: string) {
        ipcRenderer.send("setLocale", value);
    };
} else {
    ({ getLocale, setLocale } = require("main/settings") as any);
}

////////////////////////////////////////////////////////////////////////////////

export const DATE_FORMATS = [
    { format: "MM/dd/yyyy", description: "Locale default" },
    { format: "M/d/yyyy", description: "Locale default #2" },
    { format: "MMMM d, yyyy", description: "Locale default #3" },
    { format: "MMM d, yyyy", description: "Locale default #4" }
];

export let getDateFormat: () => string;
export let setDateFormat: (value: string) => void;

if (isRenderer()) {
    getDateFormat = function () {
        return ipcRenderer.sendSync("getDateFormat");
    };

    setDateFormat = function (value: string) {
        ipcRenderer.send("setDateFormat", value);
    };
} else {
    ({ getDateFormat, setDateFormat } = require("main/settings") as any);
}

////////////////////////////////////////////////////////////////////////////////

export const TIME_FORMATS = [{ format: "h:mm:ss a", description: "Locale default" }, { format: "HH:mm:ss", description: "Locale default" }];

export let getTimeFormat: () => string;
export let setTimeFormat: (value: string) => void;

if (isRenderer()) {
    getTimeFormat = function () {
        return ipcRenderer.sendSync("getTimeFormat");
    };

    setTimeFormat = function (value: string) {
        ipcRenderer.send("setTimeFormat", value);
    };
} else {
    ({ getTimeFormat, setTimeFormat } = require("main/settings") as any);
}

////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////

const zhCNLabels: { [key: string]: string } = {
    General: "常规", Specific: "专用", Layout: "布局", Flow: "流程",
    "Position and size": "位置和尺寸", Style: "样式", Indentation: "缩进",
    "Timeline keyframe": "时间轴关键帧", Name: "名称", Width: "宽度",
    Height: "高度", Type: "类型", "Default value": "默认值",
    Description: "描述", Enabled: "启用", Visible: "可见", Locked: "锁定",
    Color: "颜色", "Background color": "背景颜色", Font: "字体",
    "Font size": "字体大小", Alignment: "对齐方式", Text: "文本",
    Value: "值", Minimum: "最小值", Maximum: "最大值", Step: "步进",
    Format: "格式", Unit: "单位", Source: "源", Target: "目标",
    Event: "事件", Action: "动作", Expression: "表达式",
    "Array size": "数组大小", "String length": "字符串长度",
    "Read only": "只读", "Read-only": "只读", Optional: "可选",
    Required: "必填", Default: "默认", Properties: "属性",
    "Copy to Clipboard": "复制到剪贴板", "Clear Search": "清除搜索", "Generate GUID": "生成 GUID",
    "Open in system explorer": "在系统文件管理器中打开",
    "Select file": "选择文件", "Select folder": "选择文件夹",
    "No help page defined!": "未定义帮助页面！",
    "Align left edges": "左边缘对齐", "Center on vertical axis": "垂直居中对齐",
    "Align right edges": "右边缘对齐", "Align top edges": "上边缘对齐",
    "Center on horizontal axis": "水平居中对齐", "Align bottom edges": "下边缘对齐",
    "Distribute left edges equidistantly": "左边缘水平等距分布",
    "Distribute centers equidistantly horizontally": "中心点水平等距分布",
    "Distribute right edges equidistantly": "右边缘水平等距分布",
    "Make horizontal gaps equal": "水平间距相等",
    "Distribute top edges equidistantly": "上边缘垂直等距分布",
    "Distribute centers equidistantly vertically": "中心点垂直等距分布",
    "Distribute bottom edges equidistantly": "下边缘垂直等距分布",
    "Make vertical gaps equal": "垂直间距相等",
    "Center horizontally relative to parent": "相对于父级水平居中",
    "Center vertically relative to parent": "相对于父级垂直居中",
    "Absolute position (X, Y) on the page": "页面上的绝对位置（X、Y）",
    "Sequence input": "顺序输入", "Sequence output": "顺序输出",
    "Clear logs": "清空日志", "Add Watch Expression": "添加监视表达式",
    "Edit Watch Expression": "编辑监视表达式",
    "Delete Watch Expression": "删除监视表达式",
    "Remove selected breakpoint": "移除选中的断点",
    "Remove all breakpoints": "移除所有断点",
    "Resume (F5)": "继续运行 (F5)", "Pause (F6)": "暂停 (F6)",
    "Step over (F10)": "单步跳过 (F10)", "Step into (F11)": "单步进入 (F11)",
    "Step out (Shift + F11)": "单步跳出 (Shift + F11)",
    "Laid out at": "布局位置", "Absolute pos.": "绝对位置",
    "Center widget": "控件居中", Inputs: "输入", Outputs: "输出",
    Grow: "增长", "Align self": "自身对齐", Variant: "变体",
    "Variant rules": "变体规则", "Keyframe editor": "关键帧编辑器",
    "Icon (SVG)": "图标 (SVG)", "Label position": "标签位置",
    "Static text": "静态文本", "Fit to content": "适应内容",
    "Unit and fraction font": "单位和小数字体", "Display unit": "显示单位",
    "Trailing icon": "尾随图标", "First line": "首行",
    Hanging: "悬挂", "Line width": "线宽", "X value": "X 值",
    "Show X axis": "显示 X 轴", "Show Y axis": "显示 Y 轴",
    "Group variable": "组变量", Threshold1: "阈值1",
    "Threshold1 marker": "阈值1标记", "Threshold1 label": "阈值1标签",
    "Zone to threshold1": "阈值1区域", "BB3 module field": "BB3 模块字段",
    "Second BB3 module field": "第二个 BB3 模块字段",
    "On/Off text": "开/关文本", "Box width": "框宽度",
    "changed": "已更改",
    "Set variable entries": "设置变量条目",
    "When": "当", "Then output": "然后输出", "With value": "使用值",
    "Cases": "分支", "Yes": "是", "No": "否",
    "Threshold2": "阈值2", "Mode (0 - scroll, 1 - scan)": "模式（0 - 滚动，1 - 扫描）",
    "Bit (0 - scroll, 1 - scan)": "位（0 - 滚动，1 - 扫描）",
    "Input": "输入", "Output": "输出", "Add": "添加", "Delete": "删除",
    Presets: "预设", Basic: "基础", "Common Widgets": "常用控件",
    Pages: "页面", "User Widgets": "用户控件", "User Actions": "用户动作",
    "Global Variables": "全局变量", "Local Variables": "局部变量",
    Structures: "结构体", Enums: "枚举", "Named Expressions": "命名表达式",
    Styles: "样式", Fonts: "字体", Bitmaps: "位图", Themes: "主题", Colors: "颜色",
    Texts: "文本", "Text Resources": "文本资源", Languages: "语言", Groups: "分组",
    "LVGL Groups": "LVGL 分组", SCPI: "SCPI", "SCPI Subsystems": "SCPI 子系统",
    "SCPI Commands": "SCPI 命令", "SCPI Enums": "SCPI 枚举",
    "Instrument Commands": "仪器命令", IEXT: "IEXT", Changes: "更改记录",
    Breakpoints: "断点", "Components Palette": "组件面板", All: "全部", Order: "排序",
    "LVGL Actions": "LVGL 动作", "Common Actions": "常用动作",
    "Other components": "其他组件", "User Widgets": "用户控件",
    "User Actions": "用户动作", Button: "按钮", Label: "标签",
    "All Templates": "全部模板", "Builtin Templates": "内置模板",
    "BB3 Script Templates": "BB3 脚本模板", "From envox.eu/gitea": "来自 envox.eu/gitea",
    "Project Git Repository": "项目 Git 仓库", "Creating project ...": "正在创建项目…",
    "Project Settings": "项目设置", "Edit Project": "编辑项目", "Run Project": "运行项目",
    "Start your new EEZ-GUI project development here.": "从这里开始创建新的 EEZ-GUI 项目。",
    "Start your new LVGL project development here.": "从这里开始创建新的 LVGL 项目。",
    "Start your new IEXT project development here.": "从这里开始创建新的 IEXT 项目。",
    "Start your new EEZ-GUI Lite project development here.": "从这里开始创建新的 EEZ-GUI Lite 项目。",
    "Compacting Database": "正在压缩数据库", "Size before": "压缩前大小",
    "Size after": "压缩后大小", "Size reduced by ": "减少了 ",
    "Create a new database": "创建新数据库", "Open an existing database": "打开现有数据库",
    "Delete a database": "删除数据库", "Default path": "默认路径",
    "Set custom path": "设置自定义路径", "Custom Python path": "自定义 Python 路径",
    "Project Templates": "项目模板", "Use local templates folder": "使用本地模板文件夹",
    "Local templates path": "本地模板路径", Repository: "仓库", "Path:": "路径：",
    OK: "确定", Cancel: "取消", Apply: "应用", Close: "关闭", Abort: "中止",
    "Open Project": "打开项目", "Copy Project Path": "复制项目路径",
    "Remove From List": "从列表中移除", "Sort alphabetically": "按名称排序",
    "Show most recent first": "最近使用的排在前面",
    "New Project": "新建项目",
    Switch: "开关", Checkbox: "复选框", "Radio Button": "单选按钮",
    "Drop Down List": "下拉列表", Slider: "滑块", "Text Input": "文本输入框",
    "Multiline Text": "多行文本", "Progress Bar": "进度条", "Bar Graph": "条形图",
    "Up/Down": "增减控件", "List": "列表", "Tab": "选项卡",
    "Group": "分组", "Container": "容器", "Line": "线条", "Rectangle": "矩形",
    "Arc": "弧形", "Image": "图像", "QR Code": "二维码", "Chart": "图表",
    "LED": "LED 指示灯", "Numeric": "数值显示", "Text": "文本",
    "Instrument": "仪器", "Terminal": "终端", "Plot": "曲线图",
    "Copy": "复制", "Paste": "粘贴", "Cut": "剪切", "Select": "选择"
};

export function translateProjectEditorLabel(label: string) {
    if (!getLocale().toLowerCase().startsWith("zh")) return label;
    return zhCNLabels[label] || label;
}
