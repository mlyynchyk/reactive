package ua.com.reactive.reactive.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Платіжний рахунок клієнта.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("accounts")
public class Account {

    @Id
    private Long id;
    private Long clientId;
    private String iban;
    private Currency currency;
    private BigDecimal balance;
    private LocalDateTime openedAt;
    private Boolean active;
}
