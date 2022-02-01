//dependance
const {simpleHandler} = require('./handlers/handlerRouters/simpleHandler');
const {userHandler} = require('./handlers/handlerRouters/userHandler');
const {tokenHandler} = require('./handlers/handlerRouters/tokenHandler');
const { checkHandler } = require('./handlers/handlerRouters/checkHandler');


//Router obj
const router = {
    simple: simpleHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler
}

module.exports = router;