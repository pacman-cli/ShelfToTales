package com.example.shelftotales.service;

import com.example.shelftotales.shared.config.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StorageServiceTest {

    @Mock
    private S3Client s3Client;

    @InjectMocks
    private StorageService storageService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(storageService, "bucket", "test-bucket");
        ReflectionTestUtils.setField(storageService, "publicUrl", "http://cdn.com");
    }

    @Test
    void testUploadSafeImageSucceeds() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.png",
                "image/png",
                "fake image content".getBytes()
        );

        // Mock S3 putObject
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class))).thenReturn(null);

        String url = storageService.upload(file, "images");
        assertTrue(url.contains("http://cdn.com/images/"));
        assertTrue(url.endsWith(".png"));
    }

    @Test
    void testUploadUnsafeImageThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "exploit.sh",
                "text/x-shellscript",
                "rm -rf /".getBytes()
        );

        assertThrows(IllegalArgumentException.class, () -> {
            storageService.upload(file, "images");
        });
    }

    @Test
    void testUploadMismatchedExtensionAndContentTypeThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "text/html",
                "<html></html>".getBytes()
        );

        assertThrows(IllegalArgumentException.class, () -> {
            storageService.upload(file, "images");
        });
    }

    @Test
    void testUploadSafePdfSucceeds() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "book.pdf",
                "application/pdf",
                "pdf content".getBytes()
        );

        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class))).thenReturn(null);

        String url = storageService.upload(file, "pdfs");
        assertTrue(url.contains("http://cdn.com/pdfs/"));
        assertTrue(url.endsWith(".pdf"));
    }

    @Test
    void testUploadUnsafePdfThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "book.pdf.exe",
                "application/octet-stream",
                "exe content".getBytes()
        );

        assertThrows(IllegalArgumentException.class, () -> {
            storageService.upload(file, "pdfs");
        });
    }

    @Test
    void testUploadSafeAudioSucceeds() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "song.mp3",
                "audio/mpeg",
                "mp3 content".getBytes()
        );

        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class))).thenReturn(null);

        String url = storageService.upload(file, "playlist");
        assertTrue(url.contains("http://cdn.com/playlist/"));
        assertTrue(url.endsWith(".mp3"));
    }
}
