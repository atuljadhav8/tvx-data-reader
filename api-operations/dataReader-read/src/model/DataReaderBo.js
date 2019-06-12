'use strict';

let _body,
    _headers;

class DataReaderBo {

    constructor(body, headers) {
        _body = body;
        _headers = headers;

    }
    get body() {
        return _body;
    }

    get headers() {
        return _headers;
    }
    toJson() {
        return {
            "body": this.body,
            "headers": this.headers
        }
    }

    toString() {
        return JSON.stringify(this.toJson());
    }
}

module.exports = DataReaderBo;