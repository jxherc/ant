# ant

ant is basically [Min](https://github.com/minbrowser/min), but i changed it to
fit how i use a browser.

## what i changed

- rebranded the browser as ant with a lowercase, near-black interface
- redesigned tasks and settings around the colorless kokuen style
- added a liquid-glass macOS app icon
- kept favicons clean and made them load earlier
- made the tab bar pick up the current website's background color
- added stronger built-in ad and tracker blocking, including YouTube ads and
  sponsored posts on X
- added custom filters, tracking-parameter cleanup, and per-site adblock controls
- added middle-click autoscroll
- kept trackpad back and forward gestures without the extra swipe animation
- made background tabs load in the order they were opened
- added macOS passkey and Touch ID support for signed builds
- added a clear-all-tasks action that always leaves one fresh task
- removed the bookmarks bar and trimmed unused runtime assets

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
