//dependence
const { hash, parseJSON, randomString } = require("../../helper/utilities");
const lib = require("../../lib/data");
const tokenChecker = require('../handlerRouters/tokenHandler');
const {maxLimit} = require('../../helper/environment');

//scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callBack) => {

    const exceptedMethod = ['post', 'get', 'put', 'delete'];

    if(exceptedMethod.indexOf(requestProperties.method) > -1){
        handler._check[requestProperties.method](requestProperties, callBack);
    } else {
        callBack(404)
    }
}

//_check scaffolding
handler._check = {};

handler._check.post = (requestProperties, callBack) => {
    //protocol, url, method, successCode, timeoutSession

    // const { protocol, url, method, successCode} = requestProperties.body;

    const protocol = typeof requestProperties.body.protocol === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    const url = typeof requestProperties.body.url === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof requestProperties.body.method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    const successCode = typeof requestProperties.body.successCode === 'object' && Array.isArray(requestProperties.body.successCode) ? requestProperties.body.successCode : false;

    const timeoutSession = typeof requestProperties.body.timeoutSession === 'number' && requestProperties.body.timeoutSession >= 1 && requestProperties.body.timeoutSession <= 5 && requestProperties.body.timeoutSession % 1 === 0 ? requestProperties.body.timeoutSession : false;

    if(protocol && url && method && successCode && timeoutSession){
        const tokenId = typeof requestProperties.headersObj.token === 'string' && requestProperties.headersObj.token.trim().length === 20 ? requestProperties.headersObj.token : false;

        lib.read('token', tokenId, (error, uData) => {
            if(!error && uData){
                const phoneNum = parseJSON(uData).phoneNum;

                tokenChecker._token.tokenVerify(phoneNum, tokenId, (inVerified) => {
                    if(inVerified){
                        lib.read('users', phoneNum, (error, uData) => {
                            if(!error && uData){
                                const userData = {...parseJSON(uData)};
                                const userChecks = userData.checks instanceof Array ? userData.checks : [];
                                //checking limit
                                if(userChecks.length < maxLimit){
                                    const checkID = randomString(15);
                                    const checkObj = {
                                        Id: checkID,
                                        phoneNum,
                                        protocol,
                                        url,
                                        method,
                                        successCode,
                                        timeoutSession
                                    }
                                    lib.create('check', checkID, checkObj, (error) => {
                                        if(!error){
                                            //copy checks previous array
                                            userData.checks = userChecks;
                                            //push new item in checks array
                                            userData.checks.push(checkID);

                                            //update user check info
                                            lib.update('users', phoneNum, userData, (error) => {
                                                if(!error){
                                                    callBack(200, checkObj);
                                                }else{
                                                    callBack(500, {
                                                        error: 'server problem'
                                                    });
                                                }
                                            })
                                        }else{
                                            callBack(500, {
                                                error: 'server problem'
                                            })
                                        }
                                    })
                                }else{
                                    callBack(400, {
                                        error: 'user already reached max check limit'
                                    })
                                }
                            }else{
                                callBack(400, {
                                    error: 'server error'
                                })
                            }
                        })
                    }else{
                        callBack(401, {
                            error: 'authentication problem'
                        })
                    }
                })
            }else{
                callBack(403, {
                    error: 'authentication problem'
                })
            }
        })
    }else{
        callBack(400, {
            error: 'there is a problem in your request'
        })
    }
}

handler._check.get = (requestProperties, callBack) => {
    const id = typeof requestProperties.queryStringObj.id === 'string' && requestProperties.queryStringObj.id.trim().length === 15 ? requestProperties.queryStringObj.id : false;

    if(id){
        lib.read('check', id, (error,checkData) => {
            if(!error && checkData){
                const tokenId = typeof requestProperties.headersObj.token === 'string' && requestProperties.headersObj.token.trim().length === 20 ? requestProperties.headersObj.token : false;

                lib.read('token', tokenId, (error, tokenData) => {
                    if(!error && tokenData){

                        tokenChecker._token.tokenVerify(parseJSON(tokenData).phoneNum, tokenId, (isValid) => {
                            if(isValid){
                                callBack(200, parseJSON(checkData))
                            }else{
                                callBack(401, {
                                    error: 'Verification failed'
                                })
                            }
                        })
                    }else{
                        callBack(500, {
                            error: 'Verification failed'
                        })
                    }
                })
            }else{
                callBack(400, {
                    error: 'You have a problem in your request'
                })
            }
        })
    }else{
        callBack(400, {
            error: 'You have a problem in your request'
        })
    }
}

handler._check.put = (requestProperties, callBack) => {
    const id = typeof requestProperties.body.id === 'string' && requestProperties.body.id.trim().length === 15 ? requestProperties.body.id : false;

    const protocol = typeof requestProperties.body.protocol === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    const url = typeof requestProperties.body.url === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof requestProperties.body.method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    const successCode = typeof requestProperties.body.successCode === 'object' && Array.isArray(requestProperties.body.successCode) ? requestProperties.body.successCode : false;

    const timeoutSession = typeof requestProperties.body.timeoutSession === 'number' && requestProperties.body.timeoutSession >= 1 && requestProperties.body.timeoutSession <= 5 && requestProperties.body.timeoutSession % 1 === 0 ? requestProperties.body.timeoutSession : false;

    if(id || protocol || url || method || successCode || timeoutSession){
        lib.read('check', id, (error, checkData) => {
            if(!error && checkData){
                const tokenId = typeof requestProperties.headersObj.token === 'string' && requestProperties.headersObj.token.trim().length === 20 ? requestProperties.headersObj.token : false;

                const checkDataObj = {...parseJSON(checkData)};


                tokenChecker._token.tokenVerify(checkDataObj.phoneNum, tokenId, (isValid) => {
                    if(isValid){
                        if(protocol){
                            checkDataObj.protocol = protocol;
                        }
                        if(url){
                            checkDataObj.url = url;
                        }
                        if(method){
                            checkDataObj.method = method;
                        }
                        if(successCode){
                            checkDataObj.successCode = successCode;
                        }
                        if(timeoutSession){
                            checkDataObj.timeoutSession = timeoutSession;
                        }

                        lib.update('check', id, checkDataObj, (error) => {
                            if(!error){
                                callBack(200, {
                                    message: 'info update successfully'
                                })
                            }else{
                                callBack(500, {
                                    error: 'Update failed'
                                })
                            }
                        })
                    }else{
                        callBack(401, {
                            error: 'authentication problem'
                        })
                    }
                })
            }else{
                callBack(500, {
                    error: 'server problem'
                })
            }
        })
    }else{
        callBack(400, {
            error: 'you have a problem in your request'
        })
    }
}

handler._check.delete = (requestProperties, callBack) => {
    const id = typeof requestProperties.queryStringObj.id === 'string' && requestProperties.queryStringObj.id.trim().length === 15 ? requestProperties.queryStringObj.id : false;

    if(id){
        lib.read('check', id, (error, checkData) => {
            if(!error && checkData){
                const tokenId = typeof requestProperties.headersObj.token === 'string' && requestProperties.headersObj.token.trim().length === 20 ? requestProperties.headersObj.token : false;

                lib.read('token', tokenId, (error, tokenData) => {
                    if(!error && tokenData){

                        tokenChecker._token.tokenVerify(parseJSON(tokenData).phoneNum, tokenId, (isValid) => {
                            if(isValid){
                                lib.delete('check', id, (error) => {
                                    if(!error){
                                        lib.read('users', parseJSON(tokenData).phoneNum, (error, uData) => {
                                            if(!error && uData){
                                                const userDataObj = {...parseJSON(uData)};

                                                // const {checks} = userDataObj;

                                                const checks = userDataObj.checks instanceof Array ? userDataObj.checks : [];

                                                const checksIndex = checks.indexOf(id);

                                                console.log(checks, checksIndex);

                                                if(checksIndex > -1){
                                                    //remove deleted checkId form check array
                                                    checks.splice(checksIndex, 1);
                                                    //reSave checks array
                                                    userDataObj.checks = checks;

                                                    lib.update('users', parseJSON(tokenData).phoneNum, userDataObj, (error) => {
                                                        if(!error){
                                                            callBack(200, {
                                                                message: 'Delete successfully'
                                                            })
                                                        }else{
                                                            callBack(500, {
                                                                error: 'delete unsuccessful'
                                                            })
                                                        }
                                                    })
                                                }else{
                                                    callBack(500, {
                                                        error: 'server problem'
                                                    })
                                                }
                                            }else{
                                                callBack(500, {
                                                    error: 'server problem'
                                                })
                                            }
                                        })
                                    }else{
                                        callBack(500, {
                                            error: 'delete failed'
                                        })
                                    }
                                })
                            }else{
                                callBack(401, {
                                    error: 'Verification failed'
                                })
                            }
                        })
                    }else{
                        callBack(500, {
                            error: 'Verification failed'
                        })
                    }
                })
            }else{
                callBack(400, {
                    error: 'You have a problem in your request'
                })
            }
        })
    }else{
        callBack(400, {
            error: 'You have a problem in your request'
        })
    }
}


module.exports = handler;