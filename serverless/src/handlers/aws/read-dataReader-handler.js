const apiProcessor = require('data-reader').ApiProcessor;
const winston = require('winston-wrapper');
const logger = winston.getLogger('read-data-reader-handler')
//const logger = winston_wrapper.getLogger('read-dataReader-handler')

module.exports.handle = (event, context, callback) => {
    winston.serverlessFunction(event, context, () => {
        //console.log("Entered handler with request " + JSON.stringify(event))
        logger.debug("Event recieved ");
        apiProcessor.process(event, null).then((body) => {
            console.log("Exiting with response ", body);
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(body)
            })
        }).catch(error => {
            console.log("Exception caught ", error)
            callback(null, {
                statusCode: error.httpStatusCode,
                body: JSON.stringify({
                    errorCode: error.code,
                    errorMessage: error.description
                })
            })
        })
    })

    // try {
    //     let response = await apiProcessor.process(event, null);
    //     console.log("Exiting with response ", response);
    //     return ({
    //         statusCode: 200,
    //         body: JSON.stringify(response)
    //     })
    // }
    // catch (err) {
    //     console.log("Exception caught ", err)
    //     return ({
    //         statusCode: err.httpStatusCode,
    //         body: JSON.stringify({
    //             errorCode: err.code,
    //             errorMessage: err.description
    //         })
    //     })
    // }
};
