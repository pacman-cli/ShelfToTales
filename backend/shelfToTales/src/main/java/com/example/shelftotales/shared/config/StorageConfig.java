package com.example.shelftotales.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

@Configuration
public class StorageConfig {

    @Value("${storage.r2.endpoint:}")
    private String endpoint;

    @Value("${storage.r2.access-key:}")
    private String accessKey;

    @Value("${storage.r2.secret-key:}")
    private String secretKey;

    @Bean
    public S3Client s3Client() {
        if (endpoint.isBlank() || accessKey.isBlank()) {
            return null; // Storage disabled
        }
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .region(Region.of("auto"))
                .forcePathStyle(true)
                .build();
    }
}
