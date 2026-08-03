import { createHighlighter } from "shiki";
import { FusionSyntax } from "./FusionSyntax.js";

const FusionLanguage = {
    embeddedLangs: ["html-derivative"],
    ...FusionSyntax,
};

let highlighter = null;
let calledHighlighter = false;

export async function highlight({ code, lang, theme, themeDark, cssClass }) {
    code = code.trim();
    await setHighlighter({ theme, themeDark });

    if (lang === "neosfusion") {
        lang = FusionLanguage;
        await highlighter.loadLanguage("html-derivative");
    }
    await highlighter.loadLanguage(lang);

    const html = await highlighter.codeToHtml(
        code,
        getThemeOptions({ lang, theme, themeDark, cssClass }),
    );
    const colors = {
        default: getColors(theme),
        dark: getColors(themeDark),
    };

    return { html, colors, code };
}

async function setHighlighter({ theme, themeDark }) {
    if (highlighter) {
        return highlighter;
    }
    if (calledHighlighter) {
        await wait(100);
        return await setHighlighter({ theme, themeDark });
    }
    calledHighlighter = true;
    const options = {
        langs: [],
        themes: [theme],
    };
    if (themeDark) {
        options.themes.push(themeDark);
    }

    highlighter = await createHighlighter(options);
    return highlighter;
}

function getThemeOptions({ lang, theme, themeDark, cssClass }) {
    const options = {
        lang,
    };

    if (cssClass && typeof cssClass === "string") {
        options.transformers = [
            {
                pre(node) {
                    this.addClassToHast(node, cssClass);
                },
            },
        ];
    }

    if (themeDark) {
        return {
            ...options,
            themes: {
                light: theme,
                dark: themeDark,
            },
        };
    }
    return {
        ...options,
        theme,
    };
}

function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getColors(theme) {
    if (!theme) {
        return null;
    }
    const colors = highlighter.getTheme(theme);
    return {
        fg: colors.fg,
        bg: colors.bg,
    };
}
