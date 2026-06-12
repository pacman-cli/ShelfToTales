package com.example.shelftotales.ai.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewModerationService {

    private final ChatClient.Builder chatClientBuilder;

    public SpoilerAnalysisResponse analyzeReview(String bookContext, String userReview) {
        BeanOutputConverter<SpoilerAnalysisResponse> outputConverter =
                new BeanOutputConverter<>(SpoilerAnalysisResponse.class);

        String format = outputConverter.getFormat();

        String systemPrompt = String.format("""
                You are a spoiler detection system for the Shelf to Tales book platform. Analyze the USER REVIEW against the BOOK CONTEXT. Respond only with valid JSON matching this schema: %s
                
                Rules:
                - isSpoiler should be true if the review reveals plot details, character arcs, twists, endings, or significant narrative developments
                - isSpoiler should be false for general opinions, hype, or reviews that don't reveal specific plot details
                - reasoning should be one sentence explaining your classification
                - Be strict: even subtle hints about character fates or outcomes count as spoilers
                """, format);

        String userPrompt = String.format("""
                BOOK CONTEXT:
                %s
                
                USER REVIEW:
                %s
                """, bookContext, userReview);

        ChatClient chatClient = chatClientBuilder.build();

        SpoilerAnalysisResponse response = chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .entity(outputConverter);

        log.info("Spoiler analysis completed: isSpoiler={}, reasoning={}",
                response.isSpoiler(), response.reasoning());

        return response;
    }
}
