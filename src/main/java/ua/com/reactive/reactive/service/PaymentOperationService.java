package ua.com.reactive.reactive.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ua.com.reactive.reactive.entity.OperationStatus;
import ua.com.reactive.reactive.entity.PaymentOperation;
import ua.com.reactive.reactive.repository.PaymentOperationRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentOperationService {

    private final PaymentOperationRepository operationRepository;

    public Flux<PaymentOperation> findAll() {
        return operationRepository.findAll();
    }

    public Flux<PaymentOperation> findByAccountId(Long accountId) {
        return operationRepository.findAllByAccountIdOrderByCreatedAtDesc(accountId);
    }

    public Mono<PaymentOperation> findById(Long id) {
        return operationRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Payment operation " + id + " not found")));
    }

    public Mono<PaymentOperation> create(PaymentOperation operation) {
        operation.setId(null);
        if (operation.getCommission() == null) operation.setCommission(BigDecimal.ZERO);
        if (operation.getStatus() == null) operation.setStatus(OperationStatus.PENDING);
        if (operation.getCreatedAt() == null) operation.setCreatedAt(LocalDateTime.now());
        return operationRepository.save(operation);
    }

    public Mono<PaymentOperation> update(Long id, PaymentOperation operation) {
        return findById(id).flatMap(existing -> {
            operation.setId(id);
            if (operation.getCommission() == null) operation.setCommission(existing.getCommission());
            if (operation.getStatus() == null) operation.setStatus(existing.getStatus());
            if (operation.getCreatedAt() == null) operation.setCreatedAt(existing.getCreatedAt());
            return operationRepository.save(operation);
        });
    }

    public Mono<Void> delete(Long id) {
        return findById(id).flatMap(operationRepository::delete);
    }
}
