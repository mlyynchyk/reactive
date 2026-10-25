package ua.com.reactive.reactive.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Отримувач платежу (компанія, постачальник послуг або інша особа).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recipient {

    private Long id;
    private String name;
    private String iban;
    private String edrpou;    // код ЄДРПОУ / ІПН
    private String category;  // напр. "Комунальні послуги", "Мобільний зв'язок"
}
