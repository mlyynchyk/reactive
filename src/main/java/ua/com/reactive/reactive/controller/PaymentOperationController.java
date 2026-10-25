package ua.com.reactive.reactive.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ua.com.reactive.reactive.entity.PaymentOperation;
import ua.com.reactive.reactive.service.PaymentOperationService;

@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
public class PaymentOperationController {

    private final PaymentOperationService operationService;

    @GetMapping
    public Flux<PaymentOperation> findAll() {
        return operationService.findAll();
    }

    @GetMapping("/{id}")
    public Mono<PaymentOperation> findById(@PathVariable Long id) {
        return operationService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<PaymentOperation> create(@RequestBody PaymentOperation operation) {
        return operationService.create(operation);
    }

    @PutMapping("/{id}")
    public Mono<PaymentOperation> update(@PathVariable Long id, @RequestBody PaymentOperation operation) {
        return operationService.update(id, operation);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(@PathVariable Long id) {
        return operationService.delete(id);
    }
}
