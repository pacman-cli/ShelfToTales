package com.example.shelftotales.controller;

import com.example.shelftotales.model.Category;
import com.example.shelftotales.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public List<Category> getCategories() {
        return categoryService.getAllCategories();
    }
}
