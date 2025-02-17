import { createHighlighter } from "shiki";
import { FusionSyntax } from "./FusionSyntax.js";

const FusionLanguage = {
    embeddedLangs: ["html-derivative"],
    ...FusionSyntax,
};

let highlighter = null;
let calledHighlighter = false;

async function getHighlighter(theme, themeDark) {
    if (highlighter) {
        return highlighter;
    }
    if (calledHighlighter) {
        await wait(100);
        return await getHighlighter();
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

function getThemeOptions(theme, themeDark) {
    if (themeDark) {
        return {
            themes: {
                light: theme,
                dark: themeDark,
            },
        };
    }
    return {
        theme,
    };
}

export async function highlight({ code, lang, theme, themeDark }) {
    code = code.trim();
    await getHighlighter(theme, themeDark);

    if (lang === "neosfusion") {
        lang = FusionLanguage;
        await highlighter.loadLanguage("html-derivative");
    }
    await highlighter.loadLanguage(lang);

    const options = { lang, ...getThemeOptions(theme, themeDark) };
    const html = await highlighter.codeToHtml(code, options);
    const colors = {
        default: getColors(theme),
        dark: getColors(themeDark),
    };

    return { html, colors, code };
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
