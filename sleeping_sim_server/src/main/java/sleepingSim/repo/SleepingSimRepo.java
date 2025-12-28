package sleepingSim.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sleepingSim.model.SleepingSimModel;

import java.util.Optional;

@Repository
public interface SleepingSimRepo extends JpaRepository<SleepingSimModel, Integer> {

    Optional<SleepingSimModel> findByUsernameAndPassword(String username, String password);
}
