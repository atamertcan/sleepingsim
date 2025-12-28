package sleepingSim.dto;

public class StatusUpdateRequest {
    private int userId;
    private boolean lyingDown;

    // Getters and Setters
    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public boolean isLyingDown() {
        return lyingDown;
    }

    public void setLyingDown(boolean lyingDown) {
        this.lyingDown = lyingDown;
    }
}