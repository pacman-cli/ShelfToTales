package com.example.shelftotales.controller;

import com.example.shelftotales.model.Book;
import com.example.shelftotales.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public List<Book> getWishlist() {
        return wishlistService.getUserWishlist();
    }

    @PostMapping("/{bookId}")
    public ResponseEntity<Void> addToWishlist(@PathVariable Long bookId) {
        wishlistService.addToWishlist(bookId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long bookId) {
        wishlistService.removeFromWishlist(bookId);
        return ResponseEntity.ok().build();
    }
}
