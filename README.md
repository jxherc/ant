# ant

ant is basically [Min 1.35.6](https://github.com/minbrowser/min/tree/v1.35.6),
but i changed it to fit how i use a browser.

## what i changed

Compared with Min 1.35.6, ant:

- rebrands the browser with a lowercase, near-black interface
- redesigns tasks and settings around the colorless kokuen style
- uses a liquid-glass macOS app icon
- adds favicons to the tab strip and displays them before color analysis finishes
- colors the tab bar from the current page background before falling back to
  theme metadata or favicon colors
- strengthens blocking with first-party network filters and cosmetic cleanup
  for YouTube ads and sponsored posts on X and other social sites
- adds middle-click autoscroll
- keeps background links next to their opener and loads them in click order
- discards older inactive background tabs while keeping recent tabs warm
- starts the history service only when history or bookmarks are first used
- adds optional macOS WebAuthn and Touch ID support for provisioned builds
- adds a clear-all-tasks action that always leaves one fresh task
- fixes opening preferences while the task view is visible

## install

Download the build for your system from
[GitHub Releases](https://github.com/jxherc/ant/releases/latest).

On macOS, unzip the download and move `ant.app` into Applications.

To build ant yourself:

```sh
git clone https://github.com/jxherc/ant.git
cd ant
npm install
```

Then run one build command:

```sh
npm run buildMacArm    # apple silicon mac
npm run buildMacIntel  # intel mac
npm run buildWindows
npm run buildDebian
```

The finished package will be in `dist/app`.

## develop

```sh
npm install
npm run start
```

ant is available under the Apache License 2.0. See [LICENSE](LICENSE.txt).
