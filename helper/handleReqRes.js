

//dependence
const url = require('url');
const {StringDecoder} = require('string_decoder'); //it's decode buffer
const routers = require('../Router');
const {notFoundHandler} = require('../handlers/handlerRouters/notFoundRoute');
const {parseJSON} = require('./utilities')


//handler obj
const handler = {};

handler.reqResHandler = (req, res) => {
    //parse url
    const parseURL = url.parse(req.url, true);
    const trimmedPath = parseURL.pathname.replace(/^\/+|\/+$/g, '');
    const queryStringObj = parseURL.query;
    const method = req.method.toLowerCase();
    const headersObj = req.headers;

    const requestProperties = {
        parseURL,
        trimmedPath,
        method,
        queryStringObj,
        headersObj
    };

    const decoder = new StringDecoder("utf8");
    let realData = '';

    //cheek route
    const chooseHandler = routers[trimmedPath] ? routers[trimmedPath] : notFoundHandler;

    // console.log(chooseHandler());

    // for post method (read data form post method)
    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    })

    req.on('end', () => {
        realData += decoder.end();

        //add payload in requestProperties object
        requestProperties.body = parseJSON(realData);

        //callback function
        chooseHandler(requestProperties, (statusCode, payload) => {
            //sanitize the parameter
            statusCode = typeof(statusCode) === 'number' ? statusCode : 500;
            payload = typeof(payload) === 'object' ? payload : {};
    
            // console.log(statusCode, payload);
    
            const payloadString = JSON.stringify(payload);
            
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode)
            res.write(payloadString)
            res.end()
        });

        // res.end('hello world');
    })
}

module.exports = handler;