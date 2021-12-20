module.exports = {
  register: function(app, mongoDataProvider) {
    app.get('/api/favorites', async function (req, res) {
      let favorites = await mongoDataProvider.getFavorites(req.session.id)
      return res.send(favorites)
    })

    app.put('/api/favorites', async function (req, res) {
      if(!req.body) return res.status(400).send('no body')

      await mongoDataProvider.setFavorites(req.session.id, req.body)

      let favorites = await mongoDataProvider.getFavorites(req.session.id)
      return res.send(favorites)
    })
  }
}