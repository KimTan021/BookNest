package com.kimtan.onlinebookstore.exception;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiError {

    private String message;
    private int status;
    private LocalDateTime timestamp;
}
