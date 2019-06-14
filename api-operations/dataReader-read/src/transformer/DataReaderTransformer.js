'use strict';

//let requestBo = require('../model/requestBo')
let RequestBo = require('../model/RequestBo');
//let dataReaderValidator = require('./DataReaderValidator');

class DataReaderTransformer {

    static async transformDtoToBo(correlationId, jobDetails, interfaceConfig, writer) {
        return new RequestBo(correlationId, jobDetails, interfaceConfig, writer)
    }
}

module.exports = DataReaderTransformer;