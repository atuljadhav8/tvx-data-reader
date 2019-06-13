'use strict';

const jp = require('jsonpath');
const csv = require('csvtojson');
//const GenericException = require('generic-exception').GenericException;
const dataReaderDto = require('../model/DataReaderDto');
const dataReaderDao = require('../dal/DataReaderDao');
let schemaValidator = require('schema-validator');
let transformerBo = require('../transformer/DataReaderTransformer');

class DataReaderService {

    async getFile(request, fileParams, totalRecordsParams, schemaParams, correlationid) {
        return new Promise(async (resolve, reject) => {
            try {
                let mySchema = await dataReaderDao.getschema(schemaParams);
                let eventStream = await dataReaderDao.getSelectedContent(fileParams);
                let totalRecordCountStream = await dataReaderDao.getTotalRecordCountStream(totalRecordsParams);
                let totalRecordCount = await this.totalRecordCountValue(totalRecordCountStream);
                let response = await this.readStream(eventStream, request, mySchema, totalRecordCount, correlationid)
                resolve(response);
            }
            catch (err) {
                reject(err);
            }
        })
    }

    async totalRecordCountValue(totalRecordCount) {
        return new Promise(async (resolve, reject) => {
            try {
                totalRecordCount.on('data', (event) => {
                    if (event.Records)
                        resolve(event.Records.Payload.toString());
                    else
                        resolve(0);
                });
                totalRecordCount.on('error', (err) => {
                    reject(err);
                });
                totalRecordCount.on('end', () => {
                });
            }
            catch (err) {
                reject(err);
            }
        })
    }

    async readStream(eventStream, request, mySchema, totalRecordCount, correlationid) {
        return new Promise(async (resolve, reject) => {
            try {
                eventStream.on('data', (event) => {
                    if (event.Records) {
                        // event.Records.Payload is a buffer containing
                        // a single record, partial records, or multiple records
                        let csvfile = event.Records.Payload.toString();
                        let csvarr = csvfile.split(jp.value(request.interfaceConfig, '$..recordDelimiter'));
                        if (csvarr.length > jp.value(request.interfaceConfig, '$..blockSize'))
                            csvarr.pop();

                        console.log("Delimited Data:\n", csvfile);
                        let response = this.csvToJson(csvarr, request, mySchema, totalRecordCount, correlationid);
                        resolve(response);
                    }
                    else {
                        resolve("No records found!!");
                    }
                });
                // Handle errors encountered during the API call
                eventStream.on('error', (err) => {
                    // Check against specific error codes that need custom handling
                    reject(err);
                });
                eventStream.on('end', () => {
                    // Finished receiving events from S3
                    //console.log("Done with data reading!!");
                });
            }
            catch (err) {
                reject(err);
            }
        })
    }

    async csvToJson(csvarr, request, mySchema, totalRecordCount, correlationid) {
        return new Promise(async (resolve, reject) => {
            try {
                var vl = new schemaValidator(mySchema);
                if (jp.value(request.interfaceConfig, '$..headerExist')) {
                    totalRecordCount = totalRecordCount - 1;
                    csvarr.shift();
                }
                if (jp.value(request.interfaceConfig, '$..trailerExist')) {
                    totalRecordCount = totalRecordCount - 1;
                }
                let invalidRowArr = [];
                csvarr.forEach(async (row, rowNumber) => {
                    let result = vl.validate(row.split(jp.value(request.interfaceConfig, '$..fieldDelimiter')));
                    if (result.isValid) {
                        //if (true) {
                        csv({
                            noheader: true,
                            headers: jp.query(mySchema.body, '$..name'),
                            delimiter: jp.value(request.interfaceConfig, '$..fieldDelimiter'),
                            checkType: true
                        })
                            .fromString(row)
                            .then((jsonObj) => {
                                jsonObj.forEach(async (element, index) => {
                                    let jsonRow = JSON.stringify(element)
                                    let readerDto = new dataReaderDto(request, jsonRow, totalRecordCount, (rowNumber + 1), correlationid);
                                    let response = await transformerBo.transformToBo(readerDto.toJson());
                                    console.log("Response to next lambda: ", JSON.stringify(response));
                                    let lambdaParams = {
                                        FunctionName: process.env.EVENT_GENERATOR || 'arn:aws:lambda:eu-west-1:820643439592:function:event-generator-dev',
                                        InvocationType: process.env.INVOCATION_TYPE || 'Event',
                                        LogType: "Tail",
                                        Payload: JSON.stringify(response)
                                    };
                                    //Invoking event-generator lambda
                                    const lamdaResult = await dataReaderDao.invokeLambda(lambdaParams);
                                    console.log("lamdaResult: ", lamdaResult);
                                })
                            })
                    }
                    else {
                        let invalidRowWithReason = row + " ==> " + JSON.stringify(result.reasons);
                        invalidRowArr.push(invalidRowWithReason);
                    }
                })
                if (invalidRowArr.length === 0)
                    resolve("All rows has been read successfully!");
                else
                    resolve(invalidRowArr);
            }
            catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new DataReaderService();