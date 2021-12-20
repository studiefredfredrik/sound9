module.exports = {
  register: function(app, mongoDataProvider) {
    app.get('/api/admin/check', async function (req, res) {
      res.status(200).send({isAdmin: req.session.roles.includes('admin')})
    })

    app.get('/api/admin/users', async function (req, res) {
      if(!req.session.roles.includes('admin')) return res.status(403).send('403 - access denied')
      let users = await mongoDataProvider.getAllUsers()
      return res.send(users)
    })

    app.put('/api/admin/users/roles', async function (req, res) {
      if(!req.session.roles.includes('admin')) return res.status(403).send('403 - access denied')
      if(!req.body?.walletAddress || !req.body.roles) return res.status(400).send('no body')

      await mongoDataProvider.setUserRightsByWalletAddress (req.body.walletAddress, req.body.roles)
      let user = await mongoDataProvider.getUserByWalletAddress(req.body.walletAddress)
      return res.status(200).send(user)
    })

    app.get('/api/admin/settings', async function (req, res) {
      if(!req.session.roles.includes('admin')) return res.status(403).send('403 - access denied')
      let settings = await mongoDataProvider.getSettings()
      return res.send(settings)
    })

    app.put('/api/admin/settings/newUserDefaultRoles', async function (req, res) {
      if(!req.session.roles.includes('admin')) return res.status(403).send('403 - access denied')
      if(!req.body?.newUserDefaultRoles) return res.status(400).send('no body')
      if(req.body.newUserDefaultRoles.includes('admin')) return res.status(400).send('admin cannot be a default role')

      await mongoDataProvider.setSettings_newUserDefaultRoles(req.body.newUserDefaultRoles)
      let settings = await mongoDataProvider.getSettings()
      return res.send(settings)
    })
  }
}