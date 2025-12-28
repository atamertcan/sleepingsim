package sleepingSim.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sleepingSim.model.SleepingSimModel;
import sleepingSim.service.SleepingSimService;
import sleepingSim.dto.StatusUpdateRequest;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class SleepingSimController {

    @Autowired
    private SleepingSimService service;

    @GetMapping("/users")
    public List<SleepingSimModel> getAccounts(){
        return service.getAllAccounts();
    }

    @GetMapping("/leaderboard")
    public List<Map<String, Object>> getScoresForLeaderboard(){
        return service.getTopTenScoresAsMap();
    }


    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody SleepingSimModel user) {
        SleepingSimModel foundUser = service.getAccountInfo(user);
        Map<String, Object> response = new HashMap<>();

        if (foundUser != null) {
            response.put("success", true);
            response.put("user", foundUser);
        } else {
            response.put("success", false);
            response.put("message", "Kullanıcı adı veya şifre hatalı");
        }
        return response;
    }

    @PostMapping("/signup")
    public SleepingSimModel createAccount(@RequestBody SleepingSimModel user){
        return service.saveAccount(user);
    }

    /**
     * Kullanıcının güncel skorunu döndürür.
     */
    @GetMapping("/dashboard/{id}")
    public ResponseEntity<Map<String, Integer>> showDashboard(@PathVariable int id){
        int score = service.getScoreForUser(id);
        return ResponseEntity.ok(Map.of("score", score));
    }

    /**
     * Python'dan gelen pozisyon durumunu işler ve puanı günceller.
     */
    @PostMapping("/tracking/status")
    public ResponseEntity<Void> updateStatus(@RequestBody StatusUpdateRequest request) {
        service.updateUserStatus(request.getUserId(), request.isLyingDown());
        return ResponseEntity.ok().build();
    }
}
