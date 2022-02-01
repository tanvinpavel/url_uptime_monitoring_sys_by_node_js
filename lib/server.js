//dependence
const http = require('http');
const {reqResHandler} = require('../helper/handleReqRes');
const environment = require('../helper/environment');
// const {sendTwilioSms} = require('./helper/notification')

//server Object - scaffolding
const server = {};

//to-do
// sendTwilioSms('01878346054', 'hello world', (err) => {
//     console.log('this is error a: ', err);
// })

//create server
server.createServer = () => {
    const serverVariable = http.createServer(server.reqResHandler);


    serverVariable.listen(environment.port, () => {
        console.log(`listening to port ${environment.port}...`);
    })
}


//add reqResHandler in server object
server.reqResHandler = reqResHandler;


server.init = () => {
    server.createServer();
}

module.exports = server;