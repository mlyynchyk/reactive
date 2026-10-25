package ua.com.reactive.reactive.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Платіжна операція клієнта.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("payment_operations")
public class PaymentOperation {

    @Id
    private Long id;
    private Long accountId;      // рахунок-відправник
    private Long cardId;         // картка, якою виконано операцію (може бути null)
    private Long recipientId;    // отримувач (для PAYMENT / TRANSFER)
    private OperationType type;
    private BigDecimal amount;
    private BigDecimal commission;
    private Currency currency;
    private OperationStatus status;
    private String description;
    private LocalDateTime createdAt;
}
