package ua.com.reactive.reactive.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ua.com.reactive.reactive.entity.Account;
import ua.com.reactive.reactive.entity.Client;
import ua.com.reactive.reactive.service.AccountService;
import ua.com.reactive.reactive.service.ClientService;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;
    private final AccountService accountService;

    @GetMapping
    public Flux<Client> findAll() {
        return clientService.findAll();
    }

    @GetMapping("/{id}")
    public Mono<Client> findById(@PathVariable Long id) {
        return clientService.findById(id);
    }

    @GetMapping("/{id}/accounts")
    public Flux<Account> findAccounts(@PathVariable Long id) {
        return accountService.findByClientId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Client> create(@RequestBody Client client) {
        return clientService.create(client);
    }

    @PutMapping("/{id}")
    public Mono<Client> update(@PathVariable Long id, @RequestBody Client client) {
        return clientService.update(id, client);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(@PathVariable Long id) {
        return clientService.delete(id);
    }
}
