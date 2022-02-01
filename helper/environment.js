
//scaffolding object
const environment = {};

environment.staging = {
    port: 2000,
    envName: "staging",
    maxLimit: 5,
    twilio: {
        fromPhone:'+13617860297',
        accountSid:'AC05c33d67f9dca2fa01ff24a4e13ed8b7',
        authToken:'008cac9c3642c83e0a2cf1c026101859'
    }
}

environment.production = {
    port: 3000,
    envName: 'production',
    maxLimit: 5,
    twilio: {
        fromPhone:'+13617860297',
        accountSid:'AC05c33d67f9dca2fa01ff24a4e13ed8b7',
        authToken:'008cac9c3642c83e0a2cf1c026101859'
    }
}

const workingEnv = typeof process.env.a === 'string' ? process.env.a : 'staging';

const exportWorkingEnv = typeof environment[workingEnv] === 'object' ? environment[workingEnv] : environment.staging;

module.exports = exportWorkingEnv;