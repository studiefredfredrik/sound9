let db = null
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const { Readable } = require('stream');
let multer = require('multer')

module.exports = {
  register: async function (app, config) {
    const client = new MongoClient(config.mongoConnectionString);
    try {
      await client.connect();
      db = client.db('sound9');
      try{
        await db.createCollection('favorites').catch(_ => _);
        await db.createCollection('library').catch(_ => _);
        await db.createCollection('playlists').catch(_ => _);
        await db.createCollection('users').catch(_ => _);
        await db.collection('users').updateOne({walletAddress: config.adminWalletAddress.toLowerCase()}, {$set: {roles: ['read', 'write', 'admin']}}, {upsert: true})
        await db.createCollection('settings').catch(_ => _);
        let existingSettings = await db.collection('settings').findOne({_id: 1})
        if(!existingSettings){
          await db.collection('settings').insertOne({
            _id: 1,
            newUserDefaultRoles: []
          });
        }

      } catch (ex1){
        console.log(`warn: ${ex1.message}`)
      }

    } catch (ex){
      console.log('Mongo error:')
      console.log(ex)
      process.exit(1);
    }
  },
  getUserByWalletAddress: async function (walletAddress) {
    walletAddress = walletAddress.toLowerCase()
    return await db.collection('users').findOne({walletAddress: walletAddress})
  },
  getAllUsers: async function () {
    let cursor = await db.collection('users').find({})
    return await cursor.toArray()
  },
  createUserByWalletAddress: async function (walletAddress) {
    walletAddress = walletAddress.toLowerCase()
    let settings = await db.collection('settings').findOne({_id: 1})
    await db.collection('users').insertOne({walletAddress: walletAddress, roles: settings.newUserDefaultRoles})
  },
  setUserRightsByWalletAddress: async function (walletAddress, roles) {
    walletAddress = walletAddress.toLowerCase()
    await db.collection('users').updateOne({walletAddress: walletAddress}, {$set: {roles: roles}}, {upsert: false})
  },
  getSettings: async function() {
    return await db.collection('settings').findOne({_id: 1})
  },
  setSettings_newUserDefaultRoles: async function (newUserDefaultRoles) {
    await db.collection('settings').updateOne({_id: 1}, {$set: {newUserDefaultRoles: newUserDefaultRoles}})
  },
  getFavorites: async function(personId) {
    let favoritesObj = await db.collection('favorites').findOne({id: personId})
    if(!favoritesObj?.favorites) return []
    return favoritesObj.favorites
  },
  setFavorites: async function (personId, favorites) {
    await db.collection('favorites').updateOne({id: personId}, {$set: {favorites: favorites}}, {upsert: true})
  },
  getLibraryForPerson: async function (personId) {
    // let library = await db.collection('library').find({id: personId}).toArray()

    let library = await db.collection('tracks.files').find({
      $or: [
        { 'metadata.uploader' : personId },
        { 'metadata.restriction' : 'public' },
      ]
    }).toArray()


    // let library = await db.collection('tracks.files').find({}).toArray()
    return library.map(x => {
      return {
        id3: x?.metadata?.id3,
        url: `files/${x.filename}`,
        restriction: x?.metadata?.restriction
      }
    });
  },
  getPlaylistsAvailableForPerson: async function(personId) {

  },
  getPlaylistsForPerson: async function(personId, playlist) {

  },
  getFile: async function (personId, fileName, req, res) {
    let file = await db.collection('tracks.files').findOne({filename: fileName})
    if(!file?._id) return res.status(404).send('404 - File not found')

    let hasAccess = file?.metadata?.uploader === personId || file?.metadata?.restriction === 'public'
    if(!hasAccess) return res.status(403).send('403 - Access denied')

    let bucket = new mongodb.GridFSBucket(db, {
      bucketName: 'tracks'
    });

    let downloadStream = bucket.openDownloadStream(file._id);

    res.set('content-type', 'audio/mp3');
    res.set('accept-ranges', 'bytes');
    res.set('Content-Length', file.length);
    res.set('Content-Range', `0-${file.length-1}/${file.length}`);

    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });

    downloadStream.on('error', () => {
      res.sendStatus(404);
    });

    downloadStream.on('end', () => {
      res.end();
    });
  },
  setFile: function (personId, req, res){
    const storage = multer.memoryStorage()
    const upload = multer({ storage: storage, limits: { fields: 1, fileSize: 1000000 * 25, files: 1, parts: 2 }});
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: "Upload Request Validation Failed" });
      }
      // else if(!req.body.name) {
      //   return res.status(400).json({ message: "No track name in request body" });
      // }

      // let trackName = req.body.name;
      let id3 = JSON.parse(decodeURI(req.file.originalname))
      let trackName = `sound9/${id3.year || 'unknown'}/${id3.artist || 'unknown'}/${id3.album || 'unknown'}/${id3.title || 'unknown'}.${id3.fileType}`

      // Covert buffer to Readable Stream
      const readableTrackStream = new Readable();
      readableTrackStream.push(req.file.buffer);
      readableTrackStream.push(null);

      let bucket = new mongodb.GridFSBucket(db, {
        bucketName: 'tracks'
      });

      let uploadStream = bucket.openUploadStream(trackName, {
        metadata: {
          id3: id3,
          uploader: personId,
          restriction: 'public'
        }
      });
      let id = uploadStream.id;
      readableTrackStream.pipe(uploadStream);

      uploadStream.on('error', () => {
        return res.status(500).json({ message: "Error uploading file" });
      });

      uploadStream.on('finish', () => {
        return res.status(201).json({ message: "File uploaded successfully, stored under Mongo ObjectID: " + id });
      });
    });
  },
  deleteFile: async function (personId, fileName, isAdmin){
    let prefix = 'files/'
    fileName = fileName.slice(prefix.length)

    let file = await db.collection('tracks.files').findOne({filename: fileName})
    if(!file?._id) return // File not found

    let hasAccess = file?.metadata?.uploader === personId || isAdmin
    if(!hasAccess) return // Access denied

    let bucket = new mongodb.GridFSBucket(db, {
      bucketName: 'tracks'
    });

    await bucket.delete(file._id);
  }

}

