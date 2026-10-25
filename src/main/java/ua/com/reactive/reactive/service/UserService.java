package ua.com.reactive.reactive.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ua.com.reactive.reactive.entity.RolesHasUsers;
import ua.com.reactive.reactive.entity.User;
import ua.com.reactive.reactive.repository.RoleRepository;
import ua.com.reactive.reactive.repository.RolesHasUsersRepository;
import ua.com.reactive.reactive.repository.UserRepository;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class UserService implements ReactiveUserDetailsService {

    private static final String DEFAULT_ROLE = "ROLE_User";

    private final UserRepository userRepository;

    private final RolesHasUsersRepository rolesHasUsersRepository;
    private final RoleRepository roleRepository;

    public Flux<GrantedAuthority> getAuthorities(Long userId) {
        return rolesHasUsersRepository.findRoleIdsByUserId(userId)
                .flatMap(roleId -> roleRepository.findById(roleId))
                .map(role -> role).cast(GrantedAuthority.class);
    }

    @Override
    public Mono<UserDetails> findByUsername(String username) {

        return userRepository.findByUsername(username)
                .flatMap(user ->
                        getAuthorities(user.getId())
                        .collectList()
                        .map(authorities -> {
                            user.setAuthorities(new HashSet<>(authorities));
                            return user;
                        })
                );
    }

    public Flux<User> findAllWithRoles() {
        return userRepository.findAll()
                .concatMap(user -> getAuthorities(user.getId())
                        .collectList()
                        .map(authorities -> {
                            user.setAuthorities(new HashSet<>(authorities));
                            return user;
                        }));
    }

    /**
     * Реєстрація нового користувача з роллю ROLE_User.
     * Повертає порожній Mono, якщо логін уже зайнятий.
     */
    public Mono<User> register(String username, String password) {
        return userRepository.findByUsername(username)
                .hasElement()
                .flatMap(exists -> exists
                        ? Mono.<User>empty()
                        : userRepository.save(new User(null, username, password))
                                .flatMap(user -> roleRepository.findByName(DEFAULT_ROLE)
                                        .flatMap(role -> rolesHasUsersRepository
                                                .save(new RolesHasUsers(null, role.getId(), user.getId())))
                                        .thenReturn(user)));
    }
}
