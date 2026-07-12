# ant

ant is a fast, minimal browser for macOS, Windows, and Linux. It is built on
Electron and based on [Min](https://github.com/minbrowser/min).

ant includes:

- a quiet, dark interface
- built-in ad and tracker blocking
- tasks for organizing tabs
- full-text history search
- reader view
- bookmarks and password-manager integration

## install

Download a build for your system from
[GitHub Releases](https://github.com/jxherc/ant/releases).

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

After changing browser UI code, press `option+command+r` on macOS or
`alt+control+r` on Windows and Linux to reload it.

Run `npm test` to check JavaScript and `npm run build` to create the runtime
bundles.

## license

ant is available under the Apache License 2.0. See [LICENSE](LICENSE.txt).
