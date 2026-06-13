package com.example.shelftotales.bookshelf.application;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * @param currentPage Zero-based current page index.
 */
public record ReadingProgressRequest(@NotNull @Min(0) Integer currentPage) { }
