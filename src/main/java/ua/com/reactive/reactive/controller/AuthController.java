package ua.com.reactive.reactive.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import ua.com.reactive.reactive.entity.User;
import ua.com.reactive.reactive.service.UserService;

import java.util.List;

/**
 * JSON-ендпоінти автентифікації для клієнтської частини (React).
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    public record UserInfo(Long id, String username, List<String> roles) {}

    public record RegisterRequest(String username, String password) {}

    /** Поточний користувач та його ролі. */
    @GetMapping("/me")
    public UserInfo me(Authentication authentication) {
        Long id = authentication.getPrincipal() instanceof User user ? user.getId() : null;
        return new UserInfo(id, authentication.getName(), roles(authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList()));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<UserInfo> register(@RequestBody RegisterRequest request) {
        if (request.username() == null || request.username().isBlank()
                || request.password() == null || request.password().isBlank()) {
            return Mono.error(new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Логін і пароль не можуть бути порожніми"));
        }
        return userService.register(request.username().trim(), request.password())
                .map(user -> new UserInfo(user.getId(), user.getUsername(), List.of("User")))
                .switchIfEmpty(Mono.error(new ResponseStatusException(
                        HttpStatus.CONFLICT, "Користувач з таким логіном уже існує")));
    }

    /** Усі користувачі системи з ролями (лише для ROLE_Admin). */
    @GetMapping("/admin/users")
    public Flux<UserInfo> users() {
        return userService.findAllWithRoles()
                .map(user -> new UserInfo(user.getId(), user.getUsername(), roles(user.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority).toList())));
    }

    /** ROLE_Admin -> Admin */
    private static List<String> roles(List<String> authorities) {
        return authorities.stream()
                .map(a -> a.startsWith("ROLE_") ? a.substring(5) : a)
                .sorted()
                .toList();
    }
}
