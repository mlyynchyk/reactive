package ua.com.reactive.reactive.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

/**
 * Отримувач платежу (компанія, постачальник послуг або інша особа).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("recipients")
public class Recipient {

    @Id
    private Long id;
    private String name;
    private String iban;
    private String edrpou;    // код ЄДРПОУ / ІПН
    private String category;  // напр. "Комунальні послуги", "Мобільний зв'язок"
}
