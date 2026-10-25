package ua.com.reactive.reactive.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Client {

    private Long id;
    private String firstName;
    private String lastName;
    private int age;
}
