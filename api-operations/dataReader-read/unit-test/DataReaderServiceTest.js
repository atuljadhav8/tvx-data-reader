var service = require('../src/service/DataReaderService');

let interfaceConfig = require('../src/util/interfaceConfig.json');
const jp = require('jsonpath');
const chai = require('chai');
chai.use(require('chai-string'));
var expect = chai.expect;
let blockSize = jp.value(interfaceConfig, '$..blockSize');
const params = {
    Bucket: "tvx-middleware-dev",
    Key: 'interfaces/input/Finance/FXRates/codausd280815.csv',
    ExpressionType: 'SQL',
    Expression: 'SELECT * FROM S3Object limit ' + blockSize,
    InputSerialization: { CSV: {} },
    OutputSerialization: { CSV: {} }
};
const params2 = {
    Bucket: "tvx-middleware-dev",
    Key: 'interfaces/input/Finance/FXRates/codausd280816.csv',
    ExpressionType: 'SQL',
    Expression: 'SELECT * FROM S3Object limit ' + blockSize,
    InputSerialization: { CSV: {} },
    OutputSerialization: { CSV: {} }
};
describe('Data Reader - Unit test', function () {
    this.timeout(20000);
    it('Invoking the data reader service with valid data', (done) => {

        service.getFile(interfaceConfig, params).then((body) => {
            expect(body).to.be.equal('Success');
            done();
        }).catch(error => {
            expect(error).to.be.equal('!');
            done();
        })

    });

    it('Invoking the data reader service with no data in the file', (done) => {
        service.getFile(interfaceConfig, params2).then((body) => {
            console.log("TCL: body", body)
            expect(body).to.be.equal('No records found!!');
            done();
        }).catch(error => {
            console.log("TCL: error", error)
            expect(error).to.be.equal('!');
            done();
        })
    });
});