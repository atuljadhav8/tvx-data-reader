'use strict';
const jp = require('jsonpath');
//const GenericException = require('generic-exception').GenericException;
const paramBo = require('../model/ParamBo');
const service = require('../service/DataReaderService');
const winston = require('winston-wrapper')
const logger = winston.getLogger('read-api-processor')
class ReadApiProcessor {
    async process(event, context) {
        return new Promise((resolve, reject) => {
            winston.serverlessFunction(event, context, async (event1) => {
                try {
                    let request = undefined;
                    let correlationid = event.headers.correlationid;
                    if (event.body && typeof event.body == 'string') {
                        request = JSON.parse(event.body);
                    }
                    else
                        request = event;
                    //console.log("request =  " + JSON.stringify(request));                
                    let blockSize = jp.value(request.interfaceConfig, '$..blockSize');
                    let dataExpression = 'SELECT * FROM s3Object limit ' + blockSize;
                    const fileParams = new paramBo(request, dataExpression);
                    let countExpression = 'SELECT count(*) FROM s3Object';
                    const totalRecordsParams = new paramBo(request, countExpression);
                    const schemaParams = {
                        Bucket: request.jobDetails.bucketName,
                        Key: 'interfaces/schemas/' + request.jobDetails.domain + '/' + request.jobDetails.interfaceName + '/' + jp.value(request.interfaceConfig, '$..schemaFileName')
                    };

                    let response = await service.getFile(request, fileParams, totalRecordsParams, schemaParams, correlationid);
                    resolve(response);

                } catch (exception) {
                    console.log(`Error occurred:  ${exception.message}`);
                    reject(exception)
                    // if (!(exception instanceof GenericException)) {
                    //     throw new GenericException.Builder(model.ExceptionType.UNKNOWN_ERROR)
                    //         .withWrappedException(exception)
                    //         .build();
                    // } else {
                    //     throw exception;
                    // }
                }
            })
        })

    }
}
module.exports = new ReadApiProcessor();

