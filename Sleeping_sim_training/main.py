from ultralytics import YOLO
import cv2 as cv
import time
import cvzone
import requests

BACKEND_URL = "http://localhost:8080/api/tracking/status"
user_id = 1

capture = cv.VideoCapture(0)
model1 = YOLO("best.pt")

prev_time = 0
last_status = False
status_send_interval = 5
last_send_time = time.time()

while True:
    isTrue, frame = capture.read()
    frame = cv.resize(frame, (1280, 720))
    results = model1(frame,stream=True, verbose=False)
    names = model1.names

    is_lying_down_in_frame = False

    for r in results:
        boxes = r.boxes
        for box in boxes:
            x1,y1,x2,y2 = box.xyxy[0]
            x1,y1,x2,y2 = int(x1), int(y1), int(x2), int(y2)

            cv.rectangle(frame,(x1,y1),(x2,y2),(255,0,255),1)
            conf = round(float(box.conf[0]),2)
            className = names[int(box.cls)]

            cvzone.putTextRect(frame,f'{className} {conf}',
                         (max(0,x1), max(35,y1)), scale=0.5, thickness=1, offset=4)


            if className == 'Lying':
                is_lying_down_in_frame = True

    current_time = time.time()

    if current_time - last_send_time >= status_send_interval or is_lying_down_in_frame != last_status:
        try:
            payload = {
                "userId": user_id,
                "lyingDown": is_lying_down_in_frame
            }

            response = requests.post(BACKEND_URL, json=payload)
            response.raise_for_status()

            print(f"Durum başarıyla gönderildi: userId={user_id}, isLyingDown={is_lying_down_in_frame}")

            last_status = is_lying_down_in_frame
            last_send_time = current_time

        except requests.exceptions.RequestException as e:
            print(f"Hata oluştu, durum gönderilemedi: {e}")


    curr_time = time.time()
    fps = 1 / (curr_time - prev_time) if prev_time else 0
    prev_time = curr_time
    cv.putText(frame, f'FPS: {int(fps)}', (20, 40),
               cv.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    if cv.waitKey(1) & 0xFF == ord("q"):
        break

    cv.imshow("Video", frame)

capture.release()
cv.destroyAllWindows()