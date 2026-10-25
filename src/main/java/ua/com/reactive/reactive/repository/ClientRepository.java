package ua.com.reactive.reactive.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import ua.com.reactive.reactive.entity.Client;

public interface ClientRepository extends ReactiveCrudRepository<Client, Long> {
}
