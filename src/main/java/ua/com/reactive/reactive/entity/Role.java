package ua.com.reactive.reactive.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.security.core.GrantedAuthority;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString

@Table(name = "roles")
public class Role implements GrantedAuthority {

    @Id
    private Long id;
    private String name;

    @Transient // зв'язок зберігається в окремій таблиці roles_has_users
    private Set<RolesHasUsers> rolesHasUsersList = new HashSet<>();

    @Override
    public String getAuthority() {
        return getName();
    }
}
