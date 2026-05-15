package com.example.shelftotales.controller;

import com.example.shelftotales.dto.CategoryResponse;
import com.example.shelftotales.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Public category browsing")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "List all categories")
    public List<CategoryResponse> getCategories() {
        return categoryService.getAllCategories();
    }
}
