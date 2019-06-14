'use strict';

//const GenericException = require('generic-exception').GenericException;

const service = require('../service/DataReaderService');
const winston = require('winston-wrapper')
const logger = winston.getLogger('read-api-processor')

const transformer = require('../transformer/DataReaderTransformer');

let RequestDto = require('../model/RequestDto');

class ReadApiProcessor {
    process(event, context) {
        return new Promise((resolve, reject) => {
            winston.serverlessFunction(event, context, async () => {
                try {
                    let requestDto = new RequestDto(event);
                    let requestBo = await transformer.transformDtoToBo(requestDto.correlationId, requestDto.jobDetails, requestDto.interfaceConfig, requestDto.writer);
                    let response = await service.getFile(requestBo);
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

