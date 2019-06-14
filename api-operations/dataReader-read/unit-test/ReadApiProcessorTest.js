var ApiProcessor = require('../src/api/ReadApiProcessor');
const assert = require("chai").assert;
var chai = require('chai');
chai.use(require('chai-string'));
var expect = chai.expect;
describe('Data Reader - Positive Unit test', function() {
    this.timeout(20000);
    it.only('Should return message "Success." when testing the service with a valid json input', (done) => {
        let jsonData = {
            "jobDetails": {
                "domain": "finance",
                "interfaceName": "fx-rates",
                "jobName": "fx-rates", 
                "fileName": "codausd280818.csv",
                "sizeInKb": 32,
                "bucketName": "tvx-middleware-dev",
                "region": "eu-west-1"
            },
        
            "interfaceConfig": {
                "name": "FXRates", 
                "domain": "finance",
                "source": {
                    "resource": "s3",
                    "type": "file",
                    "file": {
                        "format": "delimited",
                        "delimited": {
                            "headerExist": false,
                            "trailerExist": false,
                            "fieldDelimiter": ",",
                            "fieldQuoteEscape": "\\",
                            "recordDelimiter": "\r\n",
                            "schemaFileName": "fx-rates-schema.json"
                        }
                    },
                    "trigger": {
                        "cronExpression": "***1*5"
                    }
                },
                "s3": {
                    "inputObjectKey": "interfaces/input/Finance/FxRates/jo_CODA_0000_controlJobFXRATESFile/",
                    "archiveObjectKey": "interfaces/archive/Finance/FxRates/jo_CODA_0000_controlJobFXRATESFile/",
                    "errorObjectKey": "interfaces/coda/error/finance/coda/coda001/{input-file-name-pattern}",
                    "blockSize": 5
                },
                "preProcessors": {
                    "required": true,
                    "rules": ["preprocessor-recordcount-rule.js", "preprocessor-2.js"]
                },
        
                "processors": {
                    "transformers": {
                        "required": true,
                        "type": "simple",
                        "simple": [
                            "jo_CODA_0000_controlJobFXRATESFile-transformer1.js",
                            "jo_CODA_0000_controlJobFXRATESFile-transformer2.js"
                        ]
                    }
                }
                
            },
            "writer": "ARN"
        };
        ApiProcessor.process(jsonData,null).then((body) => {
            console.log("Body: ", body)
            assert.equal(body, 'All rows has been read successfully!');
            done();
        }).catch(error => {
            console.log("TCL: error", error);
            done();
        })
    });
});