module.exports = {
  packagerConfig: {
    asar: true,
    executableName: 'latent-learning'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'latent_learning'
      },
      platforms: ['win32']
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'darwin', 'linux']
    }
  ]
};
