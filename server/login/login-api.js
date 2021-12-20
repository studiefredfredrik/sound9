let jsonwebtoken = require('jsonwebtoken');
let ethSigUtil = require('@metamask/eth-sig-util');

let spentNonces = []

module.exports = {
  register: function(app, config, mongoDataProvider) {
    app.post('/api/login', async function (req, res) {
      if(!req.body?.signedMessage || !req.body?.nonce) return res.status(400).send('400 - Invalid payload')

      // Getting signers address from signature + nonce
      let recoveredAddress = ethSigUtil.recoverPersonalSignature({
        data: req.body.nonce,
        signature: req.body.signedMessage
      });

      recoveredAddress = recoveredAddress.toLowerCase() // Eth addresses are case insensitive, but casing sometimes added later as checksum data

      // We can check the integrity of the signed message for possible nefarious behaviour
      if(!req.body.nonce.includes(recoveredAddress)) return res.status(400).send('403 - Address in nonce does not match signing address')
      if(spentNonces.includes(req.body.nonce)) return res.status(400).send('403 - This is obviously a replay attack')
      spentNonces.push(req.body.nonce)

      // The user is now verified, we can now fetch the user's data from a database etc.
      let userData = await mongoDataProvider.getUserByWalletAddress(recoveredAddress)
      if(!userData){
        await mongoDataProvider.createUserByWalletAddress(recoveredAddress)
        userData = await mongoDataProvider.getUserByWalletAddress(recoveredAddress)
      }

      // Creating JTW token
      let userObject = {
        address: recoveredAddress,
        id: userData._id.toString(),
        roles: userData.roles,
        exp: config.cookieTimeout + Date.now()
      }

      let jwt = jsonwebtoken.sign(userObject, config.secretJwtKey, { algorithm: 'HS256'});

      // Adding JWT token to cookie and sending result
      res.cookie('authcookie', jwt, { maxAge: config.cookieTimeout, httpOnly: true });
      res.cookie('authcookie_client', jwt, { maxAge: config.cookieTimeout, httpOnly: false });
      res.send({
        recoveredAddress: recoveredAddress,
        jwt: jwt
      })
    })

    app.delete('/api/login', async function (req, res) {
      res.clearCookie("authcookie");
      res.clearCookie("authcookie_client");
      res.status(201).send()
    })


  }

}