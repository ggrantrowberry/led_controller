from flask import Flask, request, Response
import busio
import board
import digitalio
import adafruit_tlc5947
import copy
import time
import json
from flask_cors import CORS
from waitress import serve

spi = busio.SPI(clock=board.SCK, MOSI=board.MOSI)
latch = digitalio.DigitalInOut(board.D5)
tlc5947 = adafruit_tlc5947.TLC5947(spi,latch)

app = Flask(__name__)
CORS(app)

candle_states = [0] * 24
previous_candle_states = [0] * 24

# Resets all the LEDs to off
for i in range(24):
    tlc5947[i] = 0

def checkForChange():
    global previous_candle_states
    for i in range(24):
        if candle_states[i] != previous_candle_states[i]:
            previous_candle_states = copy.deepcopy(candle_states)
            return True
    return False        


@app.route("/stream")
def stream():
    print(request.remote_addr)
    def eventStream():
        while True:
            if checkForChange():
                yield "data: {}\n\n".format(json.dumps(candle_states))
            
    return Response(eventStream(), mimetype="text/event-stream")

@app.route("/get_states")
def get_states():
    return json.dumps(candle_states)


@app.route("/")
def render_page():
    return "Hello World!"

@app.route("/switch", methods= ["POST"])
def switch_led():
    if request.method == "POST":
        data = request.get_json()
        led_index = int(data['candleID'])
        led_state = int(data['candleState'])
        if led_state:
            tlc5947[led_index] = 4095
            candle_states[led_index] = 1
        else:
            tlc5947[led_index] = 0
            candle_states[led_index] = 0
    return str(led_index) + " is " + "on" if led_state else "off"

if __name__ == "__main__":
    #app.run(host="0.0.0.0", threaded=True)
    serve(app, host='0.0.0.0', port=5000)
    
    


