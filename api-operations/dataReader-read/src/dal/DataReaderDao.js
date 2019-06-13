'use strict';

//const fs = require("fs");
const AWS = require('aws-sdk');
const csv = require('csvtojson');

let s3 = new AWS.S3();
let lambda = new AWS.Lambda({ apiVersion: '2015-03-31', region: "eu-west-1" });

class DataReaderDao {
    async getschema(config) {
        return new Promise((resolve, reject) => {
            try {
                s3.getObject(config, (err, fileContents) => {
                    if (err) { reject(err) }
                    let fileContent = JSON.parse(fileContents.Body);
                    resolve(fileContent);
                })
            } catch (err) {
                reject(err);
            }
        })
    }
    async getSelectedContent(fileParams) {
        return new Promise((resolve, reject) => {
            try {
                s3.selectObjectContent(fileParams, (err, data) => {
                    if (err) { reject(err); }
                    resolve(data.Payload);
                });
            } catch (err) {
                reject(err);
            }
        })
    }
    async getTotalRecordCountStream(totalRecordsParams) {
        return new Promise((resolve, reject) => {
            try {
                s3.selectObjectContent(totalRecordsParams, (err, data) => {
                    if (err) { reject(err); }
                    resolve(data.Payload);
                });
            } catch (err) {
                reject(err);
            }
        })

    }

    async invokeLambda(params) {
        try {
            return new Promise((resolve, reject) => {
                lambda.invoke(params, function (err, data) {
                    if (err) { reject(err); }
                    else { resolve(data); }
                });
            });
        }
        catch (ex) {
            console.log('exception occured while calling event-generator lambda from DAO layer');
        }
    }
}

module.exports = new DataReaderDao();