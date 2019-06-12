'user strict';

let _request,
    _data,
    _totalRecordCount,
    _index,
    _correlationid;

class DataReaderDto {
    constructor(request, data, totalRecordCount, index, correlationid) {
        _request = request;
        _data = data;
        _totalRecordCount = totalRecordCount;
        _index = index;
        _correlationid = correlationid;
    }

    get request() {
        return _request;
    }

    get data() {
        return _data;
    }

    get totalRecordCount() {
        return _totalRecordCount;
    }
    get index() {
        return _index;
    }
    get correlationid() {
        return _correlationid;
    }
    toJson() {
        return {
            "request": this.request,
            "data": this.data,
            "totalRecordCount": this.totalRecordCount,
            "index": this.index,
            "correlationid": this.correlationid
        }
    }
    toString() {
        return JSON.stringify(this.toJson());
    }
}

module.exports = DataReaderDto;