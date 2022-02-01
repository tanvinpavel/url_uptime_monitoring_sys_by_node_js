//dependence
const { parseJSON } = require('../helper/utilities');
const data = require('./data');
const url = require('url');
const http = require('http');
const https = require('https');
const notification = require('../helper/notification');

//worker scaffolding
const worker = {};

worker.gatherAllChecks = () => {
    data.list('check', (err, checksList) => {
        if(!err && checksList.length > 0){
            checksList.forEach(checkFile => {
                data.read('check', checkFile, (err, checkData) => {
                    if(!err && checkData){
                        worker.validateChecksData(parseJSON(checkData));
                    }else{
                        console.log('Error: reading one of the checks data');
                    }
                })
            });
        }else{
            console.log('Error: could not read any file to check');
        }
    })
}

worker.validateChecksData = (checkData) => {
    if(checkData && checkData.id){
        checkData.state = typeof checkData.state === 'string' && ['up', 'down'].indexOf(checkData.state) > -1 ? checkData.state : 'down';

        checkData.lastCheck = typeof checkData.lastCheck === 'number' && checkData.lastCheck > 0 ? checkData.lastCheck : false;

        worker.performCheck(checkData);
    }else{
        console.log('Error: check data is invalid or not properly formatted')
    }
}

worker.performCheck = (checkData) => {

    let checkOutcome = {
        error: false,
        responseCode: false
    }

    let outcomeSend = false;

    const parseUrl = url.parse(`${checkData.protocol}://${checkData.url},`, true);

    const { hostname } = parseUrl;
    const { path } = parseUrl;

    const requestDetails = {
        protocol: `${checkData.protocol}:`,
        hostname,
        method: checkData.method.toUpperCase(),
        timeout: checkData.timeoutSession * 1000
    }

    const requestProtocol = checkData.protocol === http ? checkData.protocol : https;

    const req = requestProtocol.request(requestDetails, (res) => {
        const responseCode = res.statusCode;

        checkOutcome.responseCode = responseCode

        if(!outcomeSend){
            worker.processCheckOutcome(checkData, checkOutcome);
            outcomeSend = true;
        }
    })

    req.on('error', (e) => {
        checkOutcome = {
            'error': true,
            'value': e
        }

        if(!outcomeSend){
            worker.processCheckOutcome(checkData, checkOutcome);
            outcomeSend = true;
        }
    })

    req.on('timeout', (e) => {
        checkOutcome = {
            'error': true,
            'value': 'timeout'
        }

        if(!outcomeSend){
            worker.processCheckOutcome(checkData, checkOutcome);
            outcomeSend = true;
        }
    })

    req.end();
}

worker.processCheckOutcome = (checkData, checkOutcome) => {
    const state = !checkOutcome.error && checkOutcome.responseCode && checkData.successCode.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    const alertWanted = checkData.lastCheck && checkData.state !== state ? true : false;

    let newCheckData = checkData;

    newCheckData.state = state;
    newCheckData.lastCheck = Date.now();

    data.update('check', checkData.id, newCheckData, (err) => {
        if(!err){
            if(alertWanted){
                // console.log(`Alert: your check for ${checkData.method.toUpperCase()} ${checkData.protocol}://${checkData.url} is currently ${state}`);
                notification.sendTwilioSms(checkData.phoneNum, `Alert: your check for ${checkData.method.toUpperCase()} ${checkData.protocol}://${checkData.url} is currently ${state}`, (err) => {
                    if(!err){
                        console.log('success:' )
                    }else{
                        console.log(`failed to send sms: ${err}`);
                    }
                })
            }else{
                console.log('Alert not wanted');
            }
        }else{
            console.log('Error: trying to save check data of one of the checks!');
        }
    })
}

worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 5);
}

worker.init = () => {
    worker.gatherAllChecks();

    worker.loop();
}

//export
module.exports = worker;