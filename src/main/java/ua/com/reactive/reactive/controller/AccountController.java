package ua.com.reactive.reactive.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ua.com.reactive.reactive.entity.Account;
import ua.com.reactive.reactive.entity.PaymentOperation;
import ua.com.reactive.reactive.service.AccountService;
import ua.com.reactive.reactive.service.PaymentOperationService;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final PaymentOperationService operationService;

    @GetMapping
    public Flux<Account> findAll() {
        return accountService.findAll();
    }

    @GetMapping("/{id}")
    public Mono<Account> findById(@PathVariable Long id) {
        return accountService.findById(id);
    }

    @GetMapping("/{id}/operations")
    public Flux<PaymentOperation> findOperations(@PathVariable Long id) {
        return operationService.findByAccountId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Account> create(@RequestBody Account account) {
        return accountService.create(account);
    }

    @PutMapping("/{id}")
    public Mono<Account> update(@PathVariable Long id, @RequestBody Account account) {
        return accountService.update(id, account);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(@PathVariable Long id) {
        return accountService.delete(id);
    }
}
