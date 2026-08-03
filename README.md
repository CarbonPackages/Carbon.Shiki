# Carbon.Shiki

Neos package that connects Fusion/Eel code blocks to a Shiki API endpoint.

The package provides a simple Eel helper (`Carbon.Shiki.compile(...)`) that forwards source code and highlighting
options to an HTTP endpoint and returns the parsed JSON response.

## Features

- Eel helper for syntax highlighting requests from Fusion
- Configurable API endpoint via Neos settings
- Configurable default and dark themes
- Optional CSS class and debug URL forwarding
- Dedicated package logger (`Shiki.log`)
- Includes Shiki build assets for endpoint implementations

## Requirements

- Neos: `^8.3 || ^9.0`
- PHP version supported by your Neos version
- Node.js + pnpm (only needed for local asset development/build)

## Installation

Install the package in your Neos distribution:

```bash
composer require carbon/shiki
```

## Configuration

Add project-specific settings in your site package (for example in `Configuration/Settings.yaml`):

```yaml
Neos:
  Carbon:
    Shiki:
      apiEndpoint: "https://your-shiki-endpoint.example/api/highlight"
      theme:
        default: github-dark-dimmed
        # Optional
        dark: github-dark
```

Notes:

- `apiEndpoint` must point to an endpoint that accepts JSON `POST` requests.
- If no theme values are passed at call time, the helper falls back to these settings.
- A matching Shiki compiler is available as Docker image: https://hub.docker.com/r/jonnitto/shiki-server

## Usage in Fusion

The helper is registered in Fusion default context as `Carbon.Shiki`.

Example:

```fusion
prototype(Vendor.Site:CodeBlock) < prototype(Neos.Fusion:Component) {
  code = ${props.code}
  lang = ${props.lang}

  @private.highlighted = ${Carbon.Shiki.compile(
    props.code,
    props.lang,
    'github-light',
    'github-dark',
    'shiki-block'
  )}

  renderer = afx`
    {private.highlighted.html}
  `
}
```

Method signature:

```text
compile(
  code,
  lang,
  defaultTheme = null,
  themeDark = null,
  cssClass = null,
  url = null
): array
```

Behavior:

- Returns an empty array if `code` or `lang` is missing.
- Throws a Flow exception on API `4xx` responses.
- Logs request success/failure to package logger.

## JavaScript Highlighting

In addition to the Fusion/Eel helper, this package also ships a JavaScript highlighter function.

Use the compiled module from:

- `Resources/Public/Modules/Main.js`

The uncompiled source file is:

- `Resources/Private/Main.js`

and is compiled to the public module during the build step.

Example usage:

```js
import { highlight } from "./Resources/Public/Modules/Main.js";

const result = await highlight({
  code: "const msg = 'Hello';",
  lang: "javascript",
  theme: "github-light",
  themeDark: "github-dark",
  cssClass: "shiki-block",
});

console.log(result.html);
console.log(result.colors);
```

The function returns an object with:

- `html`: highlighted HTML output
- `colors`: detected foreground/background colors for default and dark theme
- `code`: normalized source code string

## API Contract

The package sends a `POST` request with JSON body:

```json
{
  "code": "<source code>",
  "lang": "typescript",
  "theme": "github-light",
  "themeDark": "github-dark",
  "cssClass": "shiki-block"
}
```

The response is decoded with `json_decode(..., true)` and returned as-is to Fusion.

## Logging

- Logger channel: `Carbon.Shiki:ShikiLogger`
- Default log file: `Data/Logs/Shiki.log`
- Dev/default threshold: `DEBUG`
- Production threshold: `INFO`

## Development

Install JS dependencies:

```bash
pnpm install
```

Build assets once:

```bash
pnpm build
```

Watch mode:

```bash
pnpm watch
```

Make targets:

```bash
make production   # install + prettier + build
make watch        # clean + watch
make build        # clean + build
make prettier     # format supported files
make clean        # remove generated public assets
```

Build output is written to `Resources/Public/Modules`.

## License

GPL-3.0-or-later
