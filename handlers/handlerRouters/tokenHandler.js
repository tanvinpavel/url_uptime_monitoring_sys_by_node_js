//dependency
const lib = require('../../lib/data');
const {parseJSON, randomString, hash} = require('../../helper/utilities');

//scaffolding object
const handler = {};

handler.tokenHandler = (requestProperties, callBack) => {

    const exceptedMethod = ['post', 'get', 'put', 'delete'];

    if(exceptedMethod.indexOf(requestProperties.method) > -1){
        handler._token[requestProperties.method](requestProperties, callBack);
    }else{
        callBack(405);
    }
}

handler._token = {};

handler._token.post = (requestProperties, callBack) => {

    const phoneNum = typeof(requestProperties.body.phoneNum) === 'string' && requestProperties.body.phoneNum.trim().length === 11 ? requestProperties.body.phoneNum : false;

    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if(phoneNum && password){
        lib.read('users', phoneNum, (error, data) => {
            if(!error){
                const userData = parseJSON(data);

                if(userData.password === hash(password)){
                    const tokenId = randomString(20);
                    const expire = Date.now() + (60 * 60 * 1000) * 2;

                    const tokenObj = {
                        phoneNum,
                        id: tokenId,
                        expire
                    }

                    //store token
                    lib.create('token', tokenId, tokenObj, (error) => {
                        if(!error){
                            callBack(200, tokenObj);
                        }else{
                            callBack(500, {
                                error: error
                            });
                        }
                    })
                }else{
                    callBack(500, {
                        error: 'Wrong Password'
                    })
                }
            }else{
                callBack(500, {
                    error: 'User not exists'
                })
            }
        })
    }else{
        callBack(500, {
            error: 'User not exists'
        })
    }
}

handler._token.get = (requestProperties, callBack) => {
    const token = typeof(requestProperties.queryStringObj.id) === 'string' && requestProperties.queryStringObj.id.trim().length === 20 ? requestProperties.queryStringObj.id : false;
    
    if(token){
        //look up the token
        lib.read('token', token, (error, tokenData) => {
            if(!error){
                const userData = parseJSON(tokenData);
                callBack(200, userData)
            }else{
                callBack(404, {
                    error: 'token not found'
                })
            }
        })
    }else{
        callBack(404, {
            error: 'Invalid token'
        })
    }
}

handler._token.put = (requestProperties, callBack) => {
    const tokenId = typeof requestProperties.body.id === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;
    const extendPermission = typeof requestProperties.body.extend === 'boolean' ? requestProperties.body.extend : false;

    if(tokenId && extendPermission){
        lib.read('token', tokenId, (error, tokenData) => {
            if(!error){
                let tokenObj = {...parseJSON(tokenData)};
                if(tokenObj.expire > Date.now()){
                    tokenObj.expire = Date.now() + 60 * 60 * 1000;
                    lib.update('token', tokenId, tokenObj, (error) => {
                        if(!error){
                            callBack(200, {
                                message: 'token extended successfully'
                            })
                        }else{
                            callBack(500, {
                                error: 'token update failed'
                            })
                        }
                    })
                }else{
                    callBack(500, {
                        error: 'Token already expire'
                    });
                }
            }else{
                callBack(400, {
                    error: 'Invalid token'
                });
            }
        })
    }else{
        callBack(400, {
            error: 'there is a problem in your request'
        });
    }
}
 
handler._token.delete = (requestProperties, callBack) => {
    const tokenId = typeof requestProperties.queryStringObj.id === 'string' && requestProperties.queryStringObj.id.trim().length === 20 ? requestProperties.queryStringObj.id : false;

    if(tokenId){
        lib.delete('token', tokenId, (error) => {
            if(!error){
                callBack(200, {
                    message: 'Token delete successfully'
                })
            }else{
                callBack(404, {
                    error: 'Token does not exists'
                });
            }
        })
    }else{
        callBack(404, {
            error: 'Invalid Token Id'
        });
    }
}

handler._token.tokenVerify = (phoneNum, token, callBack) => {
    if(phoneNum && token){
        lib.read('token', token, (error, uData) => {
            if(!error && uData){
                const userData = parseJSON(uData);
                if(userData.phoneNum === phoneNum && userData.expire > Date.now()){
                    callBack(true)
                }else{
                    console.log('token expire')
                    callBack(false)
                }
            }else{
                callBack(false)
            }
        })
    }else{
        callBack(false)
    }
}

module.exports = handler;