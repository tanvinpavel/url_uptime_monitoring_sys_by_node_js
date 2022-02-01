//dependence
const server = require('./lib/server');
const worker = require('./lib/worker');

// const {sendTwilioSms} = require('./helper/notification')

//App Object - scaffolding
const app = {};

//to-do
// sendTwilioSms('01878346054', 'hello world', (err) => {
//     console.log('this is error a: ', err);
// })

app.init = () => {
    //rise the server
    server.init();

    //rise the worker
    worker.init();
};

app.init();
