'use strict';
const jp = require('jsonpath');
//const GenericException = require('generic-exception').GenericException;
///const model = require('../model');
const service = require('../service/DataReaderService');
let interfaceConfig = require('../../src/util/interfaceConfig');
const winston = require('winston-wrapper')
const logger = winston.getLogger('read-api-processor')
class ReadApiProcessor {
    async process(event, context) {
        return new Promise((resolve, reject) => {
            winston.serverlessFunction(event, context, async (event1) => {
                //console.log('@@@@@ Body', event)
                //console.log("typeOf event= " + typeof event.body);
                let request = undefined;
                let correlationid = event.headers.correlationid;
                if (event.body && typeof event.body == 'string') {
                    request = JSON.parse(event.body);
                }
                else
                    request = event;

                //console.log("request =  " + JSON.stringify(request));
                try {
                    let blockSize = jp.value(request.interfaceConfig, '$..blockSize');

                    const fileParams = {
                        Bucket: request.jobDetails.bucketName,
                        Key: 'interfaces/input/' + request.jobDetails.domain + '/' + request.jobDetails.interfaceName + '/' + request.jobDetails.jobName + '/' + request.jobDetails.fileName,
                        ExpressionType: 'SQL',
                        Expression: 'SELECT * FROM s3Object limit ' + blockSize,
                        InputSerialization: { CSV: {} },
                        OutputSerialization: { CSV: {} }
                    };

                    const totalRecordsParams = {
                        Bucket: request.jobDetails.bucketName,
                        Key: 'interfaces/input/' + request.jobDetails.domain + '/' + request.jobDetails.interfaceName + '/' + request.jobDetails.jobName + '/' + request.jobDetails.fileName,
                        ExpressionType: 'SQL',
                        Expression: 'SELECT count(*) FROM s3Object',
                        InputSerialization: { CSV: {} },
                        OutputSerialization: { CSV: {} }
                    };

                    let schemaParams = {
                        Bucket: request.jobDetails.bucketName,
                        Key: 'interfaces/schemas/' + request.jobDetails.domain + '/' + request.jobDetails.interfaceName + '/' + jp.value(request.interfaceConfig, '$..schemaFileName')
                    };
                    resolve(await service.getFile(request, fileParams, totalRecordsParams, schemaParams, correlationid));
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

