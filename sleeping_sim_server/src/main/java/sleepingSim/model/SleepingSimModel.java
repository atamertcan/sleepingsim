package sleepingSim.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SleepingSimModel{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private int score;

    @Column(unique = true, nullable = false)
    private String username;

    private String password;
    private boolean isCurrentlyLyingDown;
    private LocalDateTime lastStatusUpdateTime;

}
