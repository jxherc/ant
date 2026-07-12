const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const archiver = require('archiver')
const builder = require('electron-builder')
const Arch = builder.Arch

const packageFile = require('./../package.json')
const version = packageFile.version
const platform = process.argv.find(arg => arg.match('platform')).split('=')[1]

function buildLiquidGlassIcon () {
  const source = path.resolve('icons/Ant.icon')
  const output = path.resolve('dist/icon-assets')

  if (!fs.existsSync(source)) {
    return
  }

  fs.rmSync(output, { recursive: true, force: true })
  fs.mkdirSync(output, { recursive: true })

  execFileSync('xcrun', [
    'actool',
    source,
    '--compile', output,
    '--platform', 'macosx',
    '--minimum-deployment-target', '15.0',
    '--app-icon', 'Ant',
    '--output-partial-info-plist', path.join(output, 'Info.plist')
  ])

  const compiledIcon = path.join(output, 'Ant.icns')
  const compiledAssets = path.join(output, 'Assets.car')

  // Older Xcode runners understand the .icon source well enough to compile
  // Assets.car, but do not emit the companion .icns file. Keep the committed
  // fallback pair in that case so release builds still use matching assets.
  if (fs.existsSync(compiledIcon) && fs.existsSync(compiledAssets)) {
    fs.copyFileSync(compiledIcon, path.resolve('icons/icon.icns'))
    fs.copyFileSync(compiledAssets, path.resolve('icons/Assets.car'))
  }
}

function toArch (platform) {
  switch (platform) {
    case 'x86':
      return Arch.x64
    case 'arm64':
      return Arch.arm64
  }
}

buildLiquidGlassIcon()

require('./createPackage.js')('mac', { arch: toArch(platform) }).then(function (packagePath) {
  /* create output directory if it doesn't exist */

  if (!fs.existsSync('dist/app')) {
    fs.mkdirSync('dist/app')
  }

  /* create zip file */

  var output = fs.createWriteStream('dist/app/ant-v' + version + '-mac-' + platform + '.zip')
  var archive = archiver('zip', {
    zlib: { level: 9 }
  })

  archive.directory(path.resolve(packagePath, 'ant.app'), 'ant.app')

  archive.pipe(output)
  archive.finalize()
})
