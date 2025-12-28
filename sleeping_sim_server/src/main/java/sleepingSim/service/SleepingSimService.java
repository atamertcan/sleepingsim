package sleepingSim.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sleepingSim.model.SleepingSimModel;
import sleepingSim.repo.SleepingSimRepo;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SleepingSimService {

    @Autowired
    private SleepingSimRepo repo;

    public List<Map<String, Object>> getTopTenScoresAsMap() {
        List<SleepingSimModel> allUsers = repo.findAll();

        Collections.sort(allUsers, (u1, u2)->
                Integer.compare(u2.getScore(), u1.getScore()));

        return allUsers.stream()
                .limit(10) // Sadece ilk 10 kullanıcıyı al
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("username", user.getUsername());
                    userMap.put("score", user.getScore());
                    return userMap;
                })
                .collect(Collectors.toList()); // Listeye topla
    }

    public List<SleepingSimModel> getAllAccounts() {
        return repo.findAll();
    }

    public SleepingSimModel getAccountInfo(SleepingSimModel user) {
        if (user.getUsername() == null || user.getUsername().isEmpty() ||
                user.getPassword() == null || user.getPassword().isEmpty()) {
            return null;
        }
        return repo.findByUsernameAndPassword(user.getUsername(), user.getPassword()).orElse(null);
    }

    // Yeni kullanıcı kaydederken başlangıç değerlerini ayarlayın
    public SleepingSimModel saveAccount(SleepingSimModel user){
        user.setScore(0);
        user.setCurrentlyLyingDown(false); // Başlangıç durumu
        user.setLastStatusUpdateTime(LocalDateTime.now()); // Başlangıç zamanı
        return repo.save(user);
    }

    public int getScoreForUser(int id) {
        return repo.findById(id)
                .map(SleepingSimModel::getScore)
                .orElse(0);
    }

    public void updateUserStatus(int id, boolean isLyingDown) {
        Optional<SleepingSimModel> userOptional = repo.findById(id);

        if (userOptional.isPresent()) {
            SleepingSimModel user = userOptional.get();
            LocalDateTime now = LocalDateTime.now();

            if (user.isCurrentlyLyingDown() && isLyingDown) {
                // Son güncellemeden bu yana geçen süreyi hesapla
                long secondsPassed = Duration.between(user.getLastStatusUpdateTime(), now).toSeconds();

                // Her 5 saniyede bir 1 puan ekle
                if (secondsPassed >= 5) {
                    int pointsToAdd = (int) (secondsPassed / 5);
                    user.setScore(user.getScore() + pointsToAdd);
                    System.out.println("Kullanıcı " + id + ", " + secondsPassed + " saniye yattığı için " + pointsToAdd + " puan kazandı. Yeni skor: " + user.getScore());
                    user.setLastStatusUpdateTime(now); // Puan eklendikten sonra zamanı sıfırla
                }
            }

            // Durum değişikliğini kaydet (yatıyor -> yatmıyor veya tersi)
            user.setCurrentlyLyingDown(isLyingDown);

            // Eğer durum değiştiyse (örn: ayağa kalktı), zamanı yine de güncelle
            // ki bir sonraki yatma durumu için hesaplama doğru yapılsın.
            if (!isLyingDown) {
                user.setLastStatusUpdateTime(now);
            }

            repo.save(user);
        }
    }
}