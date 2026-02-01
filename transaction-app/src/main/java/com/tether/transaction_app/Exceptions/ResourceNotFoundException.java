package com.tether.transaction_app.Exceptions;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResourceNotFoundException extends RuntimeException {

    private String fieldName;
    private long fieldValue ;
    private String fieldValue2;

    public ResourceNotFoundException(String fieldName ,long fieldValue) {

        super(String.format("%s not found with Id : %s", fieldName, fieldValue));
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }

    public ResourceNotFoundException(String fieldName ,String fieldValue2) {

        super(String.format("%s not found with Id : %s", fieldName, fieldValue2));
        this.fieldName = fieldName;
        this.fieldValue2 = fieldValue2;
    }

    public ResourceNotFoundException(String fieldName) {

        super(String.format("%s not found ", fieldName));
        this.fieldName = fieldName;
    }
}
