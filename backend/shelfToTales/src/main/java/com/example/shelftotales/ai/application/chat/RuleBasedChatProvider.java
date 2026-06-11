package com.example.shelftotales.ai.application.chat;
import com.example.shelftotales.ai.domain.*;

import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.ai.application.EmbeddingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class RuleBasedChatProvider implements ChatProvider {

    private final EmbeddingService embeddingService;

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public String chat(List<ChatMessage> history, String systemPrompt) {
        String lastMessage = history.stream()
                .filter(m -> "user".equals(m.role()))
                .reduce((a, b) -> b)
                .map(ChatMessage::content)
                .orElse("");

        String lowerMsg = lastMessage.toLowerCase().trim();

        // Parse context sections from the system prompt
        String userName = extractSection(systemPrompt, "## User", "- Name:");
        String orderContext = extractSection(systemPrompt, "## Recent Order History", "##");
        String statsContext = extractSection(systemPrompt, "## Reading Stats", "##");
        String catalogContext = extractSection(systemPrompt, "## Available Books in our Catalog", "##");

        // Intent detection
        if (isGreeting(lowerMsg)) {
            return buildGreetingResponse(userName);
        }
        if (isOrderQuery(lowerMsg)) {
            return buildOrderResponse(orderContext);
        }
        if (isStatsQuery(lowerMsg)) {
            return buildStatsResponse(statsContext);
        }
        if (isFeatureQuery(lowerMsg)) {
            return buildFeatureResponse(lowerMsg);
        }
        if (isExchangeQuery(lowerMsg)) {
            return buildExchangeResponse();
        }
        if (isBookQuery(lowerMsg)) {
            return buildBookResponse(lastMessage, catalogContext);
        }

        // General fallback: try book search, then generic help
        List<Map.Entry<Book, Double>> results = embeddingService.searchSimilar(lastMessage, 5, null);
        if (!results.isEmpty()) {
            return buildBookListResponse(results);
        }

        return buildGeneralFallback(userName);
    }

    private boolean isGreeting(String msg) {
        return msg.matches("^(hi|hello|hey|howdy|good (morning|afternoon|evening)|sup|yo|greetings|what'?s up).*");
    }

    private boolean isOrderQuery(String msg) {
        return msg.contains("order") || msg.contains("purchase") || msg.contains("shipping")
                || msg.contains("delivery") || msg.contains("track") || msg.contains("bought")
                || msg.contains("checkout") || msg.contains("payment");
    }

    private boolean isStatsQuery(String msg) {
        return (msg.contains("reading") && (msg.contains("stat") || msg.contains("progress") || msg.contains("goal")))
                || (msg.contains("how many") && (msg.contains("read") || msg.contains("book")))
                || msg.contains("completed") || msg.contains("currently reading")
                || msg.contains("bookshelf") || msg.contains("my books");
    }

    private boolean isFeatureQuery(String msg) {
        return msg.contains("how do i") || msg.contains("how does") || msg.contains("what is")
                || msg.contains("what are") || msg.contains("can i") || msg.contains("feature")
                || msg.contains("help me") || msg.contains("explain") || msg.contains("tell me about");
    }

    private boolean isExchangeQuery(String msg) {
        return msg.contains("exchange") || msg.contains("swap") || msg.contains("donate")
                || msg.contains("give away") || msg.contains("trade");
    }

    private boolean isBookQuery(String msg) {
        return msg.contains("book") || msg.contains("recommend") || msg.contains("suggest")
                || msg.contains("genre") || msg.contains("author") || msg.contains("fiction")
                || msg.contains("novel") || msg.contains("story") || msg.contains("mystery")
                || msg.contains("fantasy") || msg.contains("romance") || msg.contains("sci-fi")
                || msg.contains("horror") || msg.contains("thriller") || msg.contains("mood")
                || msg.contains("looking for");
    }

    private String buildGreetingResponse(String userName) {
        String name = (userName != null && !userName.isBlank()) ? userName.trim() : "there";
        return "Hello, " + name + "! Welcome to ShelfToTales. I'm here to help with book recommendations, "
                + "order questions, reading stats, or anything else about the store. What can I do for you today?";
    }

    private String buildOrderResponse(String orderContext) {
        if (orderContext == null || orderContext.isBlank() || orderContext.contains("(No orders yet)")) {
            return "You don't have any orders yet. Browse our catalog to find your next great read! "
                    + "You can visit the shop to explore available books.";
        }
        return "Here's your recent order information:\n\n" + orderContext.trim()
                + "\n\nNeed help with a specific order? Let me know the order number and I'll do my best to assist!";
    }

    private String buildStatsResponse(String statsContext) {
        if (statsContext == null || statsContext.isBlank()) {
            return "I couldn't retrieve your reading stats right now. "
                    + "Check your reading dashboard for detailed progress on your books and goals.";
        }
        return "Here are your reading stats:\n\n" + statsContext.trim()
                + "\n\nKeep up the great reading! Let me know if you need book recommendations to add to your list.";
    }

    private String buildFeatureResponse(String msg) {
        if (msg.contains("reading room") || msg.contains("room")) {
            return "Reading Rooms are virtual spaces where you can read alongside friends! "
                    + "You can create or join a room, see what others are reading, and share the experience. "
                    + "Check the Reading Rooms section in the navigation to get started.";
        }
        if (msg.contains("wishlist")) {
            return "Your wishlist lets you save books you're interested in for later. "
                    + "You can add books from any book detail page and access your list anytime from the navigation menu.";
        }
        if (msg.contains("blog") || msg.contains("review") || msg.contains("community")) {
            return "Our community features let you share book reviews, write blog posts, and connect with other readers. "
                    + "You can follow other readers, share quotes, and see what everyone is reading in the activity feed.";
        }
        if (msg.contains("virtual bookshelf")) {
            return "Your virtual bookshelf is a visual representation of your reading collection! "
                    + "You can organize books into custom shelves, track your progress, and customize the appearance. "
                    + "Find it in the navigation under 'Bookshelf'.";
        }
        return "ShelfToTales offers many features to enhance your reading experience:\n\n"
                + "- **Book Shop** — Browse, purchase, and download books\n"
                + "- **Reading Rooms** — Read socially with friends\n"
                + "- **Virtual Bookshelf** — Organize and track your reading\n"
                + "- **Community** — Reviews, blogs, quotes, and reader networking\n"
                + "- **Wishlist** — Save books for later\n"
                + "- **Exchanges & Donations** — Share books with others\n\n"
                + "Which feature would you like to know more about?";
    }

    private String buildExchangeResponse() {
        return "Our exchange and donation features let you share books with the community!\n\n"
                + "- **Donate Books** — List a book you've finished for others to request\n"
                + "- **Request Donated Books** — Browse available donations and request books you'd like to read\n"
                + "- **Book Exchanges** — Swap books with other readers\n\n"
                + "Visit the Donations section in the navigation to get started. You can donate books from your shelf or browse available donations from others.";
    }

    private String buildBookResponse(String query, String catalogContext) {
        List<Map.Entry<Book, Double>> results = embeddingService.searchSimilar(query, 5, null);
        if (!results.isEmpty()) {
            return buildBookListResponse(results);
        }
        if (catalogContext != null && !catalogContext.contains("(No matching books")) {
            return "Based on our catalog, here are some options you might enjoy:\n\n" + catalogContext.trim()
                    + "\n\nWould you like more details on any of these, or should I search for something more specific?";
        }
        return "I'd love to help you find a book! Could you tell me more about what you're looking for? "
                + "For example:\n- A genre (mystery, fantasy, romance, sci-fi)\n- A mood (uplifting, suspenseful, cozy)\n- An author you enjoy\n- Or a book similar to one you've read before";
    }

    private String buildBookListResponse(List<Map.Entry<Book, Double>> results) {
        StringBuilder reply = new StringBuilder("Based on what you described, here are some books you might enjoy:\n\n");
        for (int i = 0; i < results.size(); i++) {
            Book book = results.get(i).getKey();
            reply.append(i + 1).append(". **").append(book.getTitle()).append("**");
            if (book.getAuthor() != null) reply.append(" by ").append(book.getAuthor());
            if (book.getCategory() != null) reply.append(" [").append(book.getCategory().getName()).append("]");
            reply.append("\n");
        }
        reply.append("\nWould you like to know more about any of these books?");
        return reply.toString();
    }

    private String buildGeneralFallback(String userName) {
        String greeting = (userName != null && !userName.isBlank()) ? userName.trim() : "there";
        return "Hi " + greeting + "! I'm here to help. You can ask me about:\n\n"
                + "- **Book recommendations** — Tell me a genre, mood, or what you're in the mood for\n"
                + "- **Order status** — Ask about your recent purchases\n"
                + "- **Reading stats** — Check your progress and bookshelf\n"
                + "- **Store features** — Learn about exchanges, reading rooms, and more\n\n"
                + "What would you like help with?";
    }

    private String extractSection(String prompt, String sectionHeader, String endMarker) {
        int start = prompt.indexOf(sectionHeader);
        if (start == -1) return null;

        int headerEnd = prompt.indexOf("\n", start);
        if (headerEnd == -1) return null;
        start = headerEnd + 1;

        int end;
        if (endMarker != null) {
            end = prompt.indexOf(endMarker, start);
            if (end == -1) end = prompt.length();
        } else {
            end = prompt.length();
        }

        return prompt.substring(start, end).trim();
    }
}
