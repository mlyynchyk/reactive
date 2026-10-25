package ua.com.reactive.reactive.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ua.com.reactive.reactive.entity.Client;
import ua.com.reactive.reactive.repository.ClientRepository;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

    public Flux<Client> findAll() {
        return clientRepository.findAll();
    }

    public Mono<Client> findById(Long id) {
        return clientRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Client " + id + " not found")));
    }

    public Mono<Client> create(Client client) {
        client.setId(null);
        return clientRepository.save(client);
    }

    public Mono<Client> update(Long id, Client client) {
        return findById(id).flatMap(existing -> {
            client.setId(id);
            return clientRepository.save(client);
        });
    }

    public Mono<Void> delete(Long id) {
        return findById(id).flatMap(clientRepository::delete);
    }
}
