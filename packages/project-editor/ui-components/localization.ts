import { getLocale } from "eez-studio-shared/i10n";

// Translate built-in editor labels only. User-entered project content is never passed here.
const zhCNLabels: { [key: string]: string } = {
    General: "常规",
    Specific: "专用",
    Layout: "布局",
    Flow: "流程",
    "Position and size": "位置和尺寸",
    Style: "样式",
    Indentation: "缩进",
    "Timeline keyframe": "时间轴关键帧",
    Name: "名称",
    Width: "宽度",
    Height: "高度",
    X: "X 坐标",
    Y: "Y 坐标",
    Type: "类型",
    "Default value": "默认值",
    Description: "描述",
    Enabled: "启用",
    Visible: "可见",
    Locked: "锁定",
    Color: "颜色",
    "Background color": "背景颜色",
    Font: "字体",
    "Font size": "字体大小",
    Alignment: "对齐方式",
    Text: "文本",
    Value: "值",
    Minimum: "最小值",
    Maximum: "最大值",
    Step: "步进",
    Format: "格式",
    Unit: "单位",
    Source: "源",
    Target: "目标",
    Event: "事件",
    Action: "动作",
    Expression: "表达式",
    "Array size": "数组大小",
    "String length": "字符串长度",
    "Read only": "只读",
    "Read-only": "只读",
    Optional: "可选",
    Required: "必填",
    Default: "默认",
    Properties: "属性",
    "Copy to Clipboard": "复制到剪贴板",
    "Generate GUID": "生成 GUID",
    "Open in system explorer": "在系统文件管理器中打开",
    "Select file": "选择文件",
    "Select folder": "选择文件夹",
    "No help page defined!": "未定义帮助页面！"
};

export function translateProjectEditorLabel(label: string) {
    if (!getLocale().toLowerCase().startsWith("zh")) {
        return label;
    }
    return zhCNLabels[label] || label;
}
