//dependency
const https = require('https');
const querystring = require('querystring');
const { twilio } = require('./environment');
const { parseJSON } = require('./utilities');

//module scaffolding
const notification = {};

notification.sendTwilioSms = (phone, sms, callback) => {
    const Vphone = typeof(phone) === 'string' && phone.trim().length === 11 ? phone : false;
    const Vsms = typeof(sms) === 'string' && sms.trim().length > 0 && sms.trim().length <= 1600 ? sms : false;

    if(Vphone && Vsms){

        // console.log(twilio.fromPhone, twilio.accountSid, twilio.authToken)
        // configure the request payload
        const payload = {
            from: twilio.fromPhone,
            to: +8801608289039,
            body: Vsms
        };

        //stringify the payload
        const payloadString = JSON.stringify(payload);
        

        // console.log(payloadString);

        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            MessagingServiceSid: 'MG7c5188994c401654c8a78e50fde4ceed',
            path: `/2010-04-01/Accounts/AC05c33d67f9dca2fa01ff24a4e13ed8b7/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        const req = https.request(requestDetails, (res) => {
            const status = res.statusCode;

            console.log(status);

            if(status == 200 || status == 201){
                callback(false)
            }else{
                callback(`status: ${status} error: ${res.message} body: ${res.body}`);
            }
        });

        req.on('error', (e) => {
            callback(e);
        });
        
        req.write(payloadString);
        req.end();

    }else{
        callback('you have a problem in your request')
    }
}

//export
module.exports = notification;