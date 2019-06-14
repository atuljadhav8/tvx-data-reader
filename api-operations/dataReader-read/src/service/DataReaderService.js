'use strict';

//const GenericException = require('generic-exception').GenericException;
const SchemaValidator = require('schema-validator');
const jp = require('jsonpath');
const csv = require('csvtojson');
const dataReaderDao = require('../dal/DataReaderDao');

class DataReaderService {

    getFile(requestBo) {
        return new Promise(async (resolve, reject) => {
            try {
                let fileSchema = await this.getFileSchema(requestBo);
                let eventStream = await this.getSelectedContent(requestBo);
                let totalRecordCountStream = await this.getTotalRecordCountStream(requestBo);
                let totalRecordCount = await this.totalRecordCountValue(totalRecordCountStream);
                let fileContentArray = await this.readStream(eventStream, requestBo);
                let validatedSchema = await this.validateRowSchema(fileContentArray, requestBo, fileSchema, totalRecordCount);
                let response = await this.csvToJson(validatedSchema, requestBo, fileSchema, totalRecordCount);
                resolve(response);
            }
            catch (err) {
                reject(err);
            }
        })
    }


    /**
     * 
     * @param {*} requestBo 
     * @description 
     */
    async getSelectedContent(requestBo) {
        try {
            requestBo.dataExpression = `SELECT * FROM s3Object limit ${requestBo.blockSize}`;
            return await dataReaderDao.getSelectedContent(requestBo.selectParams);
        } catch (ex) {
            console.log(ex)
            throw ex;
        }
    }

    /**
     * 
     * @param {*} requestBo 
     */
    async getTotalRecordCountStream(requestBo) {
        try {
            requestBo.dataExpression = 'SELECT count(*) FROM s3Object';
            return await dataReaderDao.getSelectedContent(requestBo.selectParams);
        } catch (ex) {
            console.log(ex)
            throw ex;
        }
    }

    async getFileSchema(requestBo) {
        try {
            return await dataReaderDao.getschema({ Bucket: requestBo.bucketName, Key: requestBo.schemaKey });
        } catch (ex) {
            console.log('Error while reading file', ex)
            throw ex;
        }
    }

    totalRecordCountValue(totalRecordCount) {
        return new Promise(async (resolve, reject) => {
            try {
                totalRecordCount.on('data', event => {
                    if (event.Records)
                        resolve(event.Records.Payload.toString());
                    else
                        resolve(0);
                });
                totalRecordCount.on('error', err => {
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

    readStream(eventStream, requestBo) {
        return new Promise(async (resolve, reject) => {
            try {
                eventStream.on('data', (event) => {
                    if (event.Records) {
                        // event.Records.Payload is a buffer containing
                        // a single record, partial records, or multiple records
                        let fileContent = event.Records.Payload.toString().trim();
                        let fileContentArray = fileContent.split(requestBo.recordDelimiter);
                        console.log("Delimited Data:\n", fileContent);
                        resolve(fileContentArray);
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

    validateRowSchema(fileContentArray, requestBo, fileSchema) {
        return new Promise(async (resolve, reject) => {
            try {
                var schemaValidator = new SchemaValidator(fileSchema);

                if (requestBo.headerExist) fileContentArray.shift();

                let response = { validRows: [], inValidRows: [] };

                fileContentArray.forEach((row, rowNumber) => {
                    let validationResult = schemaValidator.validate(row.split(requestBo.fieldDelimiter));
                    rowNumber++;
                    if (validationResult.isValid) {
                        response.validRows.push({ data: row, rowNumber: rowNumber });
                    }
                    else {
                        response.inValidRows.push({ data: row, rowNumber: rowNumber, reason: validationResult.reasons });
                    }
                })
                resolve(response);
            }
            catch (err) {
                reject(err);
            }
        })
    }

    async invokeEventGenerator(payload) {
        try {
            let params = {
                FunctionName: process.env.EVENT_GENERATOR || 'arn:aws:lambda:eu-west-1:820643439592:function:event-generator-dev',
                InvocationType: process.env.INVOCATION_TYPE || 'Event',
                LogType: "Tail",
                Payload: JSON.stringify(payload)
            };
            return await dataReaderDao.invokeLambda(params);
        } catch (ex) {
            console.log(ex);
            throw ex;
        }
    }

    csvToJson(validatedSchema, requestBo, fileSchema, totalRecordCount) {
        return new Promise(async (resolve, reject) => {
            try {
                requestBo.totalRecordCount = requestBo.headerExist ? totalRecordCount - 1 : totalRecordCount;
                requestBo.totalRecordCount = requestBo.trailerExist ? requestBo.totalRecordCount - 1 : requestBo.totalRecordCount;

                for (let i = 0; i < validatedSchema.validRows.length; i++) {
                    csv({
                        noheader: true,
                        headers: jp.query(fileSchema.body, '$..name'),
                        delimiter: requestBo.fieldDelimiter,
                        checkType: true
                    }).fromString(validatedSchema.validRows[i].data)
                        .then(async jsonData => {

                            requestBo.data = JSON.stringify(jsonData[0]);
                            requestBo.rowNumber = validatedSchema.validRows[i].rowNumber;

                            let lamdaResult = await this.invokeEventGenerator(requestBo.lambdaPayload);
                            console.log("lamdaResult: ", lamdaResult);
                        })
                }
                if (validatedSchema.inValidRows.length > 0) {
                    resolve(`${validatedSchema.inValidRows.length} rows rejected out of ${requestBo.totalRecordCount}, details: ${JSON.stringify(validatedSchema.inValidRows)}`)
                } else
                    resolve("All rows has been read successfully!");
            }
            catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = new DataReaderService();