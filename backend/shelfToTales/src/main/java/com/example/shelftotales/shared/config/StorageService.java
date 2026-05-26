package com.example.shelftotales.shared.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.UUID;

@Service
@Slf4j
public class StorageService {

    @Autowired(required = false)
    private S3Client s3Client;

    @Value("${storage.r2.bucket:shelftotales}")
    private String bucket;

    @Value("${storage.r2.public-url:}")
    private String publicUrl;

    public boolean isAvailable() {
        return s3Client != null;
    }

    public String upload(MultipartFile file, String folder) {
        if (!isAvailable()) {
            throw new IllegalStateException("Storage not configured. Set R2 credentials.");
        }
        String ext = getExtension(file.getOriginalFilename());
        String key = folder + "/" + UUID.randomUUID() + ext;

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(file.getBytes()));

            String url = publicUrl.isBlank() ? key : publicUrl + "/" + key;
            log.info("Uploaded file: {}", url);
            return url;
        } catch (Exception e) {
            log.error("Upload failed: {}", e.getMessage());
            throw new RuntimeException("File upload failed", e);
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }
}
