package com.example.shelftotales.social.application;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SharedQuoteRequest {
    private String quoteText;
    private String explanation;
    private String themeStyle;
}
