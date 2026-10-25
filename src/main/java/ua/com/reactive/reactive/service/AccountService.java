package ua.com.reactive.reactive.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ua.com.reactive.reactive.entity.Account;
import ua.com.reactive.reactive.repository.AccountRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    public Flux<Account> findAll() {
        return accountRepository.findAll();
    }

    public Flux<Account> findByClientId(Long clientId) {
        return accountRepository.findAllByClientId(clientId);
    }

    public Mono<Account> findById(Long id) {
        return accountRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Account " + id + " not found")));
    }

    public Mono<Account> create(Account account) {
        account.setId(null);
        if (account.getBalance() == null) account.setBalance(BigDecimal.ZERO);
        if (account.getOpenedAt() == null) account.setOpenedAt(LocalDateTime.now());
        if (account.getActive() == null) account.setActive(true);
        return accountRepository.save(account);
    }

    public Mono<Account> update(Long id, Account account) {
        return findById(id).flatMap(existing -> {
            account.setId(id);
            if (account.getBalance() == null) account.setBalance(existing.getBalance());
            if (account.getOpenedAt() == null) account.setOpenedAt(existing.getOpenedAt());
            if (account.getActive() == null) account.setActive(existing.getActive());
            return accountRepository.save(account);
        });
    }

    public Mono<Void> delete(Long id) {
        return findById(id).flatMap(accountRepository::delete);
    }
}
