'use strict';

function paramBo(request,expression) {
    return {
        Bucket : request.jobDetails.bucketName,
        Key :'interfaces/input/' + request.jobDetails.domain + '/' + request.jobDetails.interfaceName + '/' + request.jobDetails.jobName + '/' + request.jobDetails.fileName,
        ExpressionType : 'SQL',
        Expression : expression,
        InputSerialization : { CSV: {} },
        OutputSerialization : { CSV: {} }
    }
}

module.exports = paramBo;