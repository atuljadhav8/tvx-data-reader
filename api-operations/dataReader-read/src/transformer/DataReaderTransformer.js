'use strict';

//let DataReaderDto = require('../model/DataReaderDto');
let DataReaderBo = require('../model/DataReaderBo');
//let dataReaderValidator = require('./DataReaderValidator');

class DataReaderTransformer {

    static async transformToBo(dataReaderDto) {
        try {
            let body = {
                "dataProcessor": {
                    "name": dataReaderDto.request.interfaceConfig.name,
                    "domain": dataReaderDto.request.interfaceConfig.domain,
                    "processors": dataReaderDto.request.interfaceConfig.processors,
                    "writer": dataReaderDto.request.writer
                },
                "data": JSON.parse(dataReaderDto.data)
            };
            let header = {
                "correlationId": dataReaderDto.correlationid,
                "traceFields": [{
                    "name": "totalRecords",
                    "value": parseInt(dataReaderDto.totalRecordCount)
                },
                {
                    "name": "recordNumber",
                    "value": parseInt(dataReaderDto.index)
                }],
                "jobDetails": {
                    "domain": dataReaderDto.request.jobDetails.domain,
                    "interfaceName": dataReaderDto.request.jobDetails.interfaceName,
                    "jobName": dataReaderDto.request.jobDetails.jobName,
                    "fileName": dataReaderDto.request.jobDetails.fileName,
                    "bucketName": dataReaderDto.request.jobDetails.bucketName,
                    "region": dataReaderDto.request.jobDetails.region,
                    "country": ""
                }
            };
            let dataReaderBo = new DataReaderBo(body, header);
            return dataReaderBo.toJson();
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = DataReaderTransformer;