var regedit = require('regedit')

var installPath = process.execPath

var keysToCreate = [
  'HKCU\\Software\\Classes\\ant',
  'HKCU\\Software\\Classes\\ant\\Application',
  'HKCU\\Software\\Classes\\ant\\DefaulIcon',
  'HKCU\\Software\\Classes\\ant\\shell\\open\\command',
  'HKCU\\Software\\Clients\\StartMenuInternet\\ant\\Capabilities\\FileAssociations',
  'HKCU\\Software\\Clients\\StartMenuInternet\\ant\\Capabilities\\StartMenu',
  'HKCU\\Software\\Clients\\StartMenuInternet\\ant\\Capabilities\\URLAssociations',
  'HKCU\\Software\\Clients\\StartMenuInternet\\ant\\DefaultIcon',
  'HKCU\\Software\\Clients\\StartMenuInternet\\ant\\InstallInfo',
  'HKCU\\Software\\Clients\\StartMenuInternet\\ant\\shell\\open\\command'
]

var registryConfig = {
  'HKCU\\Software\\RegisteredApplications': {
    ant: {
      value: 'Software\\Clients\\StartMenuInternet\\ant\\Capabilities',
      type: 'REG_SZ'
    }
  },
  'HKCU\\Software\\Classes\\ant': {
    default: {
      value: 'ant Browser Document',
      type: 'REG_DEFAULT'
    }
  },
  'HKCU\\Software\\Classes\\ant\\Application': {
    ApplicationIcon: {
      value: installPath + ',0',
      type: 'REG_SZ'
    },
    ApplicationName: {
      value: 'ant',
      type: 'REG_SZ'
    },
    AppUserModelId: {
      value: 'ant',
      type: 'REG_SZ'
    }
  },
  'HKCU\\Software\\Classes\\ant\\DefaulIcon': {
    ApplicationIcon: {
      value: installPath + ',0',
      type: 'REG_SZ'
    }
  },
  'HKCU\\Software\\Classes\\ant\\shell\\open\\command': {
    default: {
      value: '"' + installPath + '" "%1"',
      type: 'REG_DEFAULT'
    }
  },
  'HKCU\\Software\\Classes\\.htm\\OpenWithProgIds': {
    ant: {
      value: 'Empty',
      type: 'REG_SZ'
    }
  },
  'HKCU\\Software\\Classes\\.html\\OpenWithProgIds': {
    ant: {
      value: 'Empty',
      type: 'REG_SZ'
    }
  },
  'HKCU\\Software\\Clients\\StartMenuInternet\\ant\\Capabilities\\FileAssociations': {
    '.htm': {
      value: 'ant',
      type: 'REG_SZ'
    },
    '.html': {
      value: 'ant',
      type: 'REG_SZ'
    }
  },
  'HKCU\\Software\\Clients\\StartMenuInternet\\ant\\Capabilities\\StartMenu': {
    StartMenuInternet: {
      value: 'ant',
      type: 'REG_SZ'
    }
  },
  'HKCU\\Software\\Clients\\StartMenuInternet\\ant\\Capabilities\\URLAssociations': {
    http: {
      value: 'ant',
      type: 'REG_SZ'
    },
    https: {
      value: 'ant',
      type: 'REG_SZ'
    }
  },
  'HKCU\\Software\\Clients\\StartMenuInternet\\ant\\DefaultIcon': {
    default: {
      value: installPath + ',0',
      type: 'REG_DEFAULT'
    }
  },
  'HKCU\\Software\\Clients\\StartMenuInternet\\ant\\InstallInfo': {
    IconsVisible: {
      value: 1,
      type: 'REG_DWORD'
    }
  },
  'HKCU\\Software\\Clients\\StartMenuInternet\\ant\\shell\\open\\command': {
    default: {
      value: installPath,
      type: 'REG_DEFAULT'
    }
  }
}

var registryInstaller = {
  install: function () {
    return new Promise(function (resolve, reject) {
      regedit.createKey(keysToCreate, function (err) {
        regedit.putValue(registryConfig, function (err) {
          if (err) {
            reject()
          } else {
            resolve()
          }
        })
      })
    })
  },
  uninstall: function () {
    return new Promise(function (resolve, reject) {
      regedit.deleteKey(keysToCreate, function (err) {
        if (err) {
          reject()
        } else {
          resolve()
        }
      })
    })
  }
}
