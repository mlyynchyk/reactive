package ua.com.reactive.reactive.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import ua.com.reactive.reactive.entity.PaymentOperation;

public interface PaymentOperationRepository extends ReactiveCrudRepository<PaymentOperation, Long> {

    Flux<PaymentOperation> findAllByAccountIdOrderByCreatedAtDesc(Long accountId);
}
