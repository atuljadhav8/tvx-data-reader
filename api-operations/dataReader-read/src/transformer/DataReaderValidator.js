'use strict';

let GenericException = require('generic-exception').GenericException;
const ExceptionCategory = require('../model/ExceptionCategory');
const ExceptionType = require('../model/ExceptionType');

class DataReaderValidator {

    async validate(dataReaderDto) {
        if (!(dataReaderDto.name && dataReaderDto.name.trim())) {
            throw this.generateValidationException(ExceptionType.MISSING_CUSTOMER_FIRSTNAME);
        }
        if (!(dataReaderDto.email && dataReaderDto.email.trim())) {
            throw this.generateValidationException(ExceptionType.MISSING_CUSTOMER_EMAIL);
        }
        if (!dataReaderDto.email.toString().match('.com')) {
            throw this.generateValidationException(ExceptionType.INVALID_EMAIL, {
                'emailId': dataReaderDto.email.toString()
            });
        }
        return dataReaderDto;
    }

    generateValidationException(exceptionType, inspectionFields) {
        return new GenericException.Builder(exceptionType, global.messageBundle)
            .withMessage(`Validation error : ${exceptionType}`)
            .withExceptionCategory(ExceptionCategory.VALIDATION_ERROR)
            .withInspectionFields(inspectionFields)
            .build();
    }
}

module.exports = new CustomerValidator();