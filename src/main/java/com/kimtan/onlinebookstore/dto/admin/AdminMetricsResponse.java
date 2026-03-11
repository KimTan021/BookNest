package com.kimtan.onlinebookstore.dto.admin;

public record AdminMetricsResponse(
        long users,
        long books,
        long orders,
        long categories,
        long authors
) {
}
