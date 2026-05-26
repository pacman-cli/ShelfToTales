package com.example.shelftotales.shared.config;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final StorageService storageService;

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File too large (max 5MB)"));
        }
        String url = storageService.upload(file, "images");
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/cover")
    public ResponseEntity<Map<String, String>> uploadCover(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }
        String url = storageService.upload(file, "covers");
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/pdf")
    public ResponseEntity<Map<String, String>> uploadPdf(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }
        if (file.getSize() > 50 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File too large (max 50MB)"));
        }
        String url = storageService.upload(file, "pdfs");
        return ResponseEntity.ok(Map.of("url", url));
    }
}
