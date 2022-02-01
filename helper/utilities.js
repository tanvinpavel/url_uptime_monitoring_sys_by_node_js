//dependency
const crypto = require('crypto');

//utilities scaffolding
const utilities = {};

utilities.parseJSON = (jsonString) => {
    let output;

    try{
        output = JSON.parse(jsonString);
    }catch{
        output = {};
    }

    return output
}

utilities.hash = (str) => {
    if(typeof(str) === 'string' && str.length > 0){
        const hash = crypto
            .createHmac('sha256', '12321')
            .update(str)
            .digest('hex');
        
        return hash;
    }else{
        return false;
    }
}

utilities.randomString = (strLen) => {
    const strLength = typeof(strLen) === 'number' && strLen > 0 ? strLen : 20;
    const possibleChar = "aAbBcCdDfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ123456789";
    let str = '';

    for(let i = 1; i <= strLength; i++){
        str += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
    }

    return str;
}

//export utilities
module.exports = utilities;