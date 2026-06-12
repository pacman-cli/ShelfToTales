package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.BookSpoilerModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Periodically checks if any books have enough reviews to trigger training.
 * Runs every hour to scan for books ready for model training.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TrainingTriggerService {

    private final BookSpoilerModelService modelService;
    private final ColabTrainingService colabTrainingService;
    private final SpoilerModelRegistry modelRegistry;

    /**
     * Check all books for training readiness.
     * Called automatically when reviews are submitted, and periodically by scheduler.
     */
    public void checkAndTriggerTraining(Long bookId) {
        modelService.checkTrainingReadiness(bookId).ifPresent(model -> {
            if (model.getStatus() == BookSpoilerModel.ModelStatus.READY_TO_TRAIN) {
                log.info("Book {} is ready for training. Attempting to trigger...", bookId);
                triggerTraining(model);
            }
        });
    }

    /**
     * Scheduled task: scan for books that need training every hour.
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void scheduledTrainingCheck() {
        log.debug("Running scheduled training readiness check...");
        List<BookSpoilerModel> needingTraining = modelService.getBooksNeedingTraining();

        for (BookSpoilerModel model : needingTraining) {
            if (model.getStatus() == BookSpoilerModel.ModelStatus.READY_TO_TRAIN) {
                triggerTraining(model);
            }
        }
    }

    /**
     * Trigger training for a specific book model.
     */
    private void triggerTraining(BookSpoilerModel model) {
        try {
            boolean triggered = colabTrainingService.triggerTraining(
                    model.getBookId(),
                    model.getOllamaModelName(),
                    model.getTrainingJsonlPath()
            );

            if (triggered) {
                log.info("Training triggered for book {}: model={}",
                        model.getBookId(), model.getOllamaModelName());
            } else {
                log.info("Manual training required for book {}: model={}. " +
                        "Run the Colab notebook with training data: {}",
                        model.getBookId(), model.getOllamaModelName(),
                        model.getTrainingJsonlPath());
            }

        } catch (Exception e) {
            log.error("Failed to trigger training for book {}: {}",
                    model.getBookId(), e.getMessage());
        }
    }
}
