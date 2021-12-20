module.exports = {
  register: function(app, mongoDataProvider) {
    app.get('/files/*', async function (req, res) {
      await mongoDataProvider.getFile(req.session.id, req.params[0], req, res)
    })
  }
}

