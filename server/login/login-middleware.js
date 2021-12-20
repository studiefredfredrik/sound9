let jwt = require('jsonwebtoken');

module.exports = function(config) {
  return function(req, res, next) {
    if(req.path === '/api/login') return next()
    if(req.path === '/favicon.ico') return next()

    if(!req.cookies?.authcookie) {
      return res.status(401).send('401 - unauthorized')
    }

    jwt.verify(req.cookies.authcookie, config.secretJwtKey, function(err, decoded) {

      // Check for funky auth
      if(err
        || !decoded?.id
        || !decoded?.address
        || !decoded.roles
        || !decoded.exp
        || decoded?.exp < Date.now()
      ){
        res.clearCookie("authcookie");
        res.clearCookie("authcookie_client");
        return res.status(401).send('401 - unauthorized')
      }

      // Check for read access
      if(!decoded.roles.includes('read')) {
        return res.status(403).send('403 - access denied')
      }

      // Continue with session
      req.session = {
        id: decoded.id,
        address: decoded.address,
        roles: decoded.roles
      }
      next()
    });
  }
}