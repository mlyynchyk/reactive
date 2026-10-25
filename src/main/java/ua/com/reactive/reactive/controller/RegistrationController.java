package ua.com.reactive.reactive.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import reactor.core.publisher.Mono;
import ua.com.reactive.reactive.entity.User;
import ua.com.reactive.reactive.service.UserService;

@Controller
@RequiredArgsConstructor
public class RegistrationController {

    private final UserService userService;

    @GetMapping("/registration")
    public String registrationPage() {
        return "registration";
    }

    @PostMapping("/registration")
    public Mono<String> register(@ModelAttribute User form, Model model) {
        if (isBlank(form.getUsername()) || isBlank(form.getPassword())) {
            model.addAttribute("error", "Логін і пароль не можуть бути порожніми");
            return Mono.just("registration");
        }

        return userService.register(form.getUsername().trim(), form.getPassword())
                .map(user -> "redirect:/login?registered")
                .switchIfEmpty(Mono.fromSupplier(() -> {
                    model.addAttribute("error", "Користувач з таким логіном уже існує");
                    return "registration";
                }));
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
