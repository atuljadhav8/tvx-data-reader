'user strict';

let _correlationId, _jobDetails, _interfaceConfig, _writer, _body;

class RequestDto {
    constructor(event) {
        if (event.body) {
            _body = JSON.parse(event.body);
        } else {
            _body = event;
        }
        _correlationId = event.headers.correlationid;
        _jobDetails = _body.jobDetails;
        _interfaceConfig = _body.interfaceConfig;
        _writer = _body.writer;
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

    toJson() {
        return {
            jobDetails: this.jobDetails,
            interfaceConfig: this.interfaceConfig,
            writer: this.writer,
            correlationId: this.correlationId
        }
    }

    toString() {
        return JSON.stringify(this.toJson());
    }
}

module.exports = RequestDto;