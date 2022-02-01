const handler = {};

handler.simpleHandler = (requestProperties, callBack) => {
    callBack(200, {
        message: 'this is simple page'
    })
}

module.exports = handler;