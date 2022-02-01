const handler = {};

handler.notFoundHandler = (requestProperties, callBack) => {
    callBack(404, {
        message: 'page not found'
    })
}

module.exports = handler;