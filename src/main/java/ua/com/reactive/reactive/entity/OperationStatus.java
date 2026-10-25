package ua.com.reactive.reactive.entity;

public enum OperationStatus {
    PENDING,      // очікує обробки
    COMPLETED,    // виконано
    FAILED,       // помилка під час виконання
    CANCELLED     // скасовано
}
