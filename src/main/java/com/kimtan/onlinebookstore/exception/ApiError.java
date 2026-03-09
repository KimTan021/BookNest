package com.kimtan.onlinebookstore.exception;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Standard API error payload")
public class ApiError {

    @Schema(description = "Human-readable error message", example = "Authentication required")
    private String message;
    @Schema(description = "HTTP status code", example = "401")
    private int status;
    @Schema(description = "Server timestamp when the error was generated", example = "2026-03-09T10:15:30")
    private LocalDateTime timestamp;
}
