from gpiozero import DigitalInputDevice as Input
from gpiozero import DigitalOutputDevice as Output
from motors import *
from vision import *
import random
import signal

def handler(signum, frame):
    for i in range(4):
        SERVO_PINS[i].off()
    input("Press the any key to exit safety mode")
    exit()
 
signal.signal(signal.SIGINT, handler)

def MotorTest():
    for i in range(4):
        input("Motor " + str(i) + " forwards? ")
        MoveMotorsForwards([i])
        input("Motor " + str(i) + " backwards? ")
        MoveMotorsBackwards([i])
        input("Motor " + str(i) + " 90°? ")
        RotateMotors([i], [90])
        input("Motor " + str(i) + " -90°? ")
        RotateMotors([i], [-90])
    input("Diagnostic complete! ")

#RotateMotors([2], [-90])

"""
for i in range(4):
    SERVO_PINS[i].on()
while True:
    input()
    RotateMotors([3], [180])
"""

"""
for i in range(4):
    SERVO_PINS[i].on()
input()
cubeState = GetCubeState()
print(cubeState)
input()
"""

MotorTest()