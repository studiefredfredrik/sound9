let path = require('path');
module.exports = {
    register: function(app, mongoDataProvider, config) {
        app.get('/api/playlists', async (req, res) => {
            let playlists = await mongoDataProvider.getPlaylistsAvailableForPerson(req.session.id)
            res.send(playlists)
        });
        app.get('/api/playlists/:playlist', async (req, res) => {
            let playlist = await mongoDataProvider.getPlaylistsForPerson(req.session.id, req.params['playlist'])
            res.send(playlist)
        });
    }
}