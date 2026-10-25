package ua.com.reactive.reactive.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import ua.com.reactive.reactive.entity.Recipient;

public interface RecipientRepository extends ReactiveCrudRepository<Recipient, Long> {
}
