//dependency
const lib = require('../../lib/data');
const {hash} = require('../../helper/utilities');
const {parseJSON} = require('../../helper/utilities');
const verification = require('../handlerRouters/tokenHandler');

//scaffolding object
const handler = {};

handler.userHandler = (requestProperties, callBack) => {

    const exceptedMethod = ['post', 'get', 'put', 'delete'];

    if(exceptedMethod.indexOf(requestProperties.method) > -1){
        handler._user[requestProperties.method](requestProperties, callBack);
    }else{
        callBack(405);
    }
}

handler._user = {};

handler._user.post = (requestProperties, callBack) => {

    const firstName = typeof(requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof(requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phoneNum = typeof(requestProperties.body.phoneNum) === 'string' && requestProperties.body.phoneNum.trim().length === 11 ? requestProperties.body.phoneNum : false;

    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    const tosAgreement = typeof(requestProperties.body.tosAgreement) === 'boolean' ? requestProperties.body.tosAgreement : false;

    


    //create new user
    if(firstName && lastName && phoneNum && password && tosAgreement){
        //check use is exists or not
        lib.read('users', phoneNum, (error) => {
            if(error){
                const data = {
                    firstName,
                    lastName,
                    phoneNum,
                    password: hash(password),
                    tosAgreement
                }
        
                lib.create('users', phoneNum, data, (error) => {
                    if(!error){
                        callBack(200, {
                            message: 'User create successfully'
                        })
                    }else{
                        callBack(500, {
                            error: 'Could not create user!'
                        })
                    }
                })
            }else{
                callBack(400, {
                    message: 'User already exists'
                })
            }
        })
    }else{
        callBack(400, {
            error: 'You have a problem in your request'
        })
    }
}

handler._user.get = (requestProperties, callBack) => {
    const phoneNum = typeof(requestProperties.queryStringObj.phoneNum) === 'string' && requestProperties.queryStringObj.phoneNum.trim().length === 11 ? requestProperties.queryStringObj.phoneNum : false;

    const tokenId = typeof requestProperties.headersObj.token === 'string' && requestProperties.headersObj.token.trim().length === 20 ? requestProperties.headersObj.token : false;

    if(phoneNum){
        verification._token.tokenVerify(phoneNum, tokenId, (valid) => {
            if(valid){
                lib.read('users', phoneNum, (error, u) => {
                    const userData = {...parseJSON(u)};
                    if(!error && u){
                        //delete user password
                        delete userData.password;
                        
                        callBack(200, userData);
                    }else{
                        callBack(404, {
                            error: 'We have a problem in your query'
                        })
                    }
                })
            }else{
                callBack(500, {
                    error: 'token validation failed'
                })
            }
        })
    }else{
        callBack(404, {
            error: 'We have a problem in your query'
        })
    }
}

handler._user.put = (requestProperties, callBack) => {
    const firstName = typeof(requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof(requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phoneNum = typeof(requestProperties.body.phoneNum) === 'string' && requestProperties.body.phoneNum.trim().length === 11 ? requestProperties.body.phoneNum : false;

    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    const tokenId = typeof requestProperties.headersObj.token === 'string' && requestProperties.headersObj.token.trim().length === 20 ? requestProperties.headersObj.token : false;

    if(phoneNum){
        verification._token.tokenVerify(phoneNum, tokenId, (valid) => {
            if(valid){
                lib.read('users', phoneNum, (error, data) => {
                    if(!error && data){
                        let userData = { ...parseJSON(data) };
        
                        if(firstName){
                            userData.firstName = firstName;
                        }
                        if(lastName){
                            userData.lastName = lastName;
                        }
                        if(password){
                            userData.password = password;
                        }
                        
                        lib.update('users', phoneNum, userData, (error) => {
                            if(!error){
                                callBack(200, {
                                    message: 'User info update successfully'
                                })
                            }else{
                                callBack(400, {
                                    error: 'Can not update user info'
                                })
                            }
                        })
                    }else{
                        callBack(400, {
                            error: 'User can not find'
                        })
                    }
                })
            }else{
                callBack(500, {
                    error: 'token validation failed'
                })
            }
        })
    }else{
        callBack(404, {
            error: 'We have a problem in your query'
        })
    }
}
 
handler._user.delete = (requestProperties, callBack) => {
    const phoneNum = typeof(requestProperties.queryStringObj.phoneNum) === 'string' && requestProperties.queryStringObj.phoneNum.trim().length === 11 ? requestProperties.queryStringObj.phoneNum : false;
    
    const tokenId = typeof requestProperties.headersObj.token === 'string' && requestProperties.headersObj.token.trim().length === 20 ? requestProperties.headersObj.token : false;

    if(phoneNum){
        verification._token.tokenVerify(phoneNum, tokenId, (valid) => {
            if(valid){
                lib.read('users', phoneNum, (error, data) => {
                    if(!error && data){
                        lib.delete('users', phoneNum, (error) => {
                            if(!error){
                                callBack(200, {
                                    message: 'User delete successfully'
                                })
                            }else{
                                callBack(500, {
                                    error: 'User delete failed'
                                })
                            }
                        })
                    }else{
                        callBack(500, {
                            error: 'User not exists'
                        })
                    }
                })
            }else{
                callBack(500, {
                    error: 'token validation failed'
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