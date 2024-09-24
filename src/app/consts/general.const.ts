export class ImgConsts {
    public static readonly spoilerImg = 'assets/images/common/spoiler-1000w.webp';
    public static readonly imgSizes = [330, 600, 800, 1000];
}

export class TextConsts {
    public static readonly spoilerPrompt = "Spoiler. Click to show";
}

export const defaultRepo = "https://raw.githubusercontent.com/Gunoshozo/jp-scripts-resources/refs/heads/main";

export class LocalStorageVariables {
    public static readonly sakuraAnim = "sakuraAnim";
    public static readonly hideSpoilers = "hideSpoilers";
    public static readonly easterEggs = "easterEggs";
    public static readonly fontSizeMul = "fontSizeMul";
    public static readonly sourceRepo = "sourceRepo";
    public static readonly bookmarkTemplateKey = "bookmark:{gameName}";
    public static readonly bookmarkTemplateValue = { true: "{routeName}:{chapterIndex}:{lineIndex}", false: "{chapterIndex}:{lineIndex}" }; // routed/not-routed
}

export class GameNameMapping{
    public static mapping: any;
}
