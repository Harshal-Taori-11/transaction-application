package com.tether.transaction_app.Exceptions;

import com.tether.transaction_app.DTOs.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle ResourceNotFoundException
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ApiResponse response = new ApiResponse(ex.getMessage(), false);
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND); // 404
    }

    // Handle other RuntimeExceptions
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse> handleRuntimeException(RuntimeException ex) {
        ApiResponse response = new ApiResponse(ex.getMessage(), false);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST); // 400
    }
}

