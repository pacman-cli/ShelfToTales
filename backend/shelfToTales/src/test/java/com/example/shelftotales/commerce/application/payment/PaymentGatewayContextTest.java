package com.example.shelftotales.commerce.application.payment;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PaymentGatewayContextTest {

    @Mock
    private PaymentGateway bkashGateway;

    @Mock
    private PaymentGateway codGateway;

    private PaymentGatewayContext context;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        when(bkashGateway.getGatewayName()).thenReturn("BKASH");
        when(codGateway.getGatewayName()).thenReturn("COD");
        context = new PaymentGatewayContext(List.of(bkashGateway, codGateway));
    }

    @Test
    public void getGateway_ShouldReturnGatewayCaseInsensitive() {
        assertEquals(bkashGateway, context.getGateway("bkash"));
        assertEquals(codGateway, context.getGateway("COD"));
    }

    @Test
    public void getGateway_ShouldThrowExceptionForUnsupportedMethod() {
        assertThrows(IllegalArgumentException.class, () -> {
            context.getGateway("STRIPE");
        });
    }
}
