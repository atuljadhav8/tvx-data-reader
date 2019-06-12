var ApiProcessor = require('../src/api/ReadApiProcessor');
const assert = require("chai").assert;
var chai = require('chai');
chai.use(require('chai-string'));
var expect = chai.expect;
describe('Data Reader - Positive Unit test', function() {
    this.timeout(20000);
    it('Should return message "Success." when testing the service with a valid json input', (done) => {
        let jsonData = {
            "fileName":"codausd280815.csv",
            "interfaceConfig": {
                "name": "FXRates",
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
                            "schemaFileName": "FXRates_schema.json"
                        }
                    },
                    "trigger": {
                        "cronExpression": "***1*5"
                    }
                },
                "s3": {
                    "inputObjectKey": "interfaces/input/Finance/FxRates/jo_CODA_0000_controlJobFXRATESFile/",
                    "archiveObjectKey": "interfaces/archive/Finance/FxRates/jo_CODA_0000_controlJobFXRATESFile/",
                    "blockSize": 5
                },
                "processors": {
                    "businessValidators": {
                        "required": true,
                        "type": "simple",
                        "simple": [
                            "jo_CODA_0000_controlJobFXRATESFile-validator1.js",
                            "jo_CODA_0000_controlJobFXRATESFile-validator2.js"
                        ]
                    },
                    "transformers": {
                        "required": true,
                        "type": "simple",
                        "simple": [
                            "jo_CODA_0000_controlJobFXRATESFile-transformer1.js",
                            "jo_CODA_0000_controlJobFXRATESFile-transformer2.js"
                        ]
                    }
                }
            }
        }
        ;
        ApiProcessor.process(jsonData,null).then((body) => {
            console.log("Body: ", body)
            assert.equal(body, 'Success');
            done();
        }).catch(error => {
            console.log("TCL: error", error);
            done();
        })
    });
});