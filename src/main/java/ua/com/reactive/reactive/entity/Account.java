package ua.com.reactive.reactive.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Платіжний рахунок клієнта.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    private Long id;
    private Long clientId;
    private String iban;
    private Currency currency;
    private BigDecimal balance;
    private LocalDateTime openedAt;
    private boolean active;
}
