package ua.com.reactive.reactive.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.YearMonth;

/**
 * Платіжна картка, прив'язана до рахунку.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCard {

    private Long id;
    private Long accountId;
    private String maskedNumber;   // напр. 4149 **** **** 1234
    private String cardHolder;
    private YearMonth expiryDate;
    private CardType cardType;
    private boolean blocked;
}
