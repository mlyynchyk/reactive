package ua.com.reactive.reactive.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import ua.com.reactive.reactive.entity.Account;

public interface AccountRepository extends ReactiveCrudRepository<Account, Long> {

    Flux<Account> findAllByClientId(Long clientId);
}
