package com.kimtan.onlinebookstore.exception;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        return buildErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ConflictException ex) {
        return buildErrorResponse(ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler({BadRequestException.class, MethodArgumentNotValidException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiError> handleBadRequest(Exception ex) {
        String message = ex.getMessage();
        if (ex instanceof MethodArgumentNotValidException methodArgumentNotValidException &&
                methodArgumentNotValidException.getBindingResult().getFieldError() != null) {
            message = methodArgumentNotValidException.getBindingResult().getFieldError().getDefaultMessage();
        }
        return buildErrorResponse(message, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({UnauthorizedException.class, BadCredentialsException.class})
    public ResponseEntity<ApiError> handleUnauthorized(Exception ex) {
        return buildErrorResponse(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> handleNoResourceFound(NoResourceFoundException ex) {
        return buildErrorResponse("Resource not found", HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleException(Exception ex) {
        log.error("Unhandled exception", ex);
        return buildErrorResponse("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ApiError> buildErrorResponse(String message, HttpStatus status) {
        ApiError error = ApiError.builder()
                .message(message)
                .status(status.value())
                .timestamp(LocalDateTime.now())
                .build();

        return new ResponseEntity<>(error, status);
    }
}
