'use strict';

const jp = require('jsonpath');

let _correlationId, _jobDetails, _interfaceConfig, _writer;

class RequestBo {
    constructor(correlationId, jobDetails, interfaceConfig, writer) {
        _correlationId = correlationId;
        _jobDetails = jobDetails;
        _interfaceConfig = interfaceConfig;
        _writer = writer;

        this.data = undefined;
        this.rowNumber = undefined;
        this.dataExpression = undefined;
        this.totalRecordCount = undefined;
    }

    get jobDetails() {
        return _jobDetails;
    }

    get interfaceConfig() {
        return _interfaceConfig;
    }

    get writer() {
        return _writer;
    }

    get correlationId() {
        return _correlationId;
    }

    get bucketName() {
        return this.jobDetails.bucketName;
    }

    get schemaKey() {
        return 'interfaces/schemas/' + this.jobDetails.domain + '/' + this.jobDetails.interfaceName + '/' + jp.value(this.interfaceConfig, '$..schemaFileName')
    }

    get fileKey() {
        return 'interfaces/input/' + this.jobDetails.domain + '/' + this.jobDetails.interfaceName + '/' + this.jobDetails.jobName + '/' + this.jobDetails.fileName;
    }

    get blockSize() {
        return jp.value(this.interfaceConfig, '$..blockSize');
    }

    get recordDelimiter() {
        return jp.value(this.interfaceConfig, '$..recordDelimiter');
    }

    get fieldDelimiter() {
        return jp.value(this.interfaceConfig, '$..fieldDelimiter');
    }

    get headerExist() {
        return jp.value(this.interfaceConfig, '$..headerExist');
    }

    get trailerExist() {
        return jp.value(this.interfaceConfig, '$..trailerExist');
    }

    get selectParams() {
        return {
            Bucket: this.bucketName,
            Key: this.fileKey,
            ExpressionType: 'SQL',
            Expression: this.dataExpression,
            InputSerialization: { CSV: {} },
            OutputSerialization: { CSV: {} }
        }
    }

    get lambdaPayload() {
        return {
            body: {
                dataProcessor: {
                    name: this.interfaceConfig.name,
                    domain: this.interfaceConfig.domain,
                    processors: this.interfaceConfig.processors,
                    writer: this.writer
                },
                data: this.data
            },
            headers: {
                correlationId: this.correlationId,
                traceFields: [
                    { name: 'totalRecords', value: parseInt(this.totalRecordCount) },
                    { name: 'recordNumber', value: parseInt(this.rowNumber) }
                ],
                jobDetails: {
                    domain: this.jobDetails.domain,
                    interfaceName: this.jobDetails.interfaceName,
                    jobName: this.jobDetails.jobName,
                    fileName: this.jobDetails.fileName,
                    bucketName: this.jobDetails.bucketName,
                    region: this.jobDetails.region,
                    country: ''
                }
            }
        }
    }

    toJson() {
        return {
            jobDetails: this.jobDetails,
            interfaceConfig: this.interfaceConfig,
            writer: this.writer,
            correlationId: this.correlationId,
            bucket: this.bucketName,
            schemaKey: this.schemaKey,
            fileKey: this.fileKey,
            blockSize: this.blockSize,
            selectParams: this.selectParams,
            recordDelimiter: this.recordDelimiter,
            fieldDelimiter: this.fieldDelimiter,
            headerExist: this.headerExist,
            trailerExist: this.trailerExist,
            data: this.data,
            rowNumber: this.rowNumber,
            totalRecordCount: this.totalRecordCount
        }
    }

    toString() {
        return JSON.stringify(this.toJson());
    }
}

module.exports = RequestBo;