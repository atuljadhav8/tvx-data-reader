'use strict';

const AWS = require('aws-sdk');

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

    async getSelectedContent(params) {
        return new Promise((resolve, reject) => {
            try {
                s3.selectObjectContent(params, (err, data) => {
                    if (err) { reject(err); }
                    resolve(data.Payload);
                });
            } catch (err) {
                reject(err);
            }
        })
    }

    async invokeLambda(params) {
        return new Promise((resolve, reject) => {
            try {
                lambda.invoke(params, function (err, data) {
                    if (err) reject(err);
                    else resolve("event-generator lambda invoked ");
                });
            }
            catch (ex) {
                reject(ex);
            }
        });
    }
}

module.exports = new DataReaderDao();