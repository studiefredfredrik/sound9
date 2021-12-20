module.exports = {
    register: function(app, mongoDataProvider) {
        app.get('/api/library', async function (req, res) {
            let library = await mongoDataProvider.getLibraryForPerson(req.session.id)
            return res.send(library)
        })

        app.post('/api/library/new', function(req, res) {
            if(!req.session.roles.includes('write')) return res.status(403).send('403 - access denied')
            mongoDataProvider.setFile(req.session.id, req, res)
        })

        app.delete('/api/library', async function (req, res) {
            if(!req.session.roles.includes('write')) return res.status(403).send('403 - access denied')
            let isAdmin = req.session.roles.includes('admin')
            await mongoDataProvider.deleteFile(req.session.id, req.body.filename, isAdmin)
            res.status(200).send()
        });
    }
}

