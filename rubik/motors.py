from gpiozero import DigitalInputDevice as Input
from gpiozero import DigitalOutputDevice as Output
from time import sleep
from os import system

MOTOR_VERTICAL = 0
MOTOR_HORIZONTAL = 1
MOTOR_FORWARDS = 0
MOTOR_BACKWARDS = 1

motorRotations = [MOTOR_VERTICAL, MOTOR_VERTICAL, MOTOR_VERTICAL, MOTOR_VERTICAL]
motorPositions = [MOTOR_FORWARDS, MOTOR_FORWARDS, MOTOR_FORWARDS, MOTOR_FORWARDS]

STEP_PINS = [Output("GPIO15"), Output("GPIO24"), Output("GPIO07"), Output("GPIO16")]
DIR_PINS = [Output("GPIO18"), Output("GPIO25"), Output("GPIO01"), Output("GPIO20")]
SERVO_PINS = [Output("GPIO17"), Output("GPIO27"), Output("GPIO22"), Output("GPIO10")]
START_PIN = Input("GPIO09")
OFF_PIN = Input("GPIO11")
ERROR_LED = Output("GPIO00")

slowMode = False

#Funciones de bajo nivel:

stepsPerMotor = [430, 450, 430, 430]
overstepsPerMotor = [30, 50, 30, 30]

"""
|==============================| RotateMotors() |==============================|
| Esta función se usa para rotar una serie de motores a pasos 90°, 180° o -90° |
| a favor de las manecillas del reloj. Se puede mover más de un motor          |
| simultaneamente, y esta función se encarga de generar las señales PWM que se |
| envian a los drivers A4988. Estos drivers requieren dos señales, uno DIR que |
| indica la dirección en la que girará el motor, y uno STEP que es una señal   |
| que hace girar el motor un paso por cada pulso. Se contempla que los motores |
| deben estar funcionando a una resolución x4.                                 |
|                                                                              |
| Parámetros:                                                                  |
| motors: Un arreglo de valores del 0 a 3 representando las manos a girar.     |
| angles: Un arreglo de valores que pueden ser -90, 90 o 180, representando    |
| los angulos a girar los motores representados en el arreglo motors.          |
|                                                                              |
| Esta función no regresa nada.                                                |
|==============================================================================|
"""
def RotateMotors(motors, angles):
    stepsRemaining = [0, 0, 0, 0]
    for index in range(len(motors)):
        if angles[index] == 180:
            stepsRemaining[motors[index]] = stepsPerMotor[motors[index]] * 2
        else:
            stepsRemaining[motors[index]] = stepsPerMotor[motors[index]]
    for index in range(len(motors)):
        if angles[index] == 90:
            DIR_PINS[motors[index]].off()
        else:
            DIR_PINS[motors[index]].on()
    while stepsRemaining != [0, 0, 0, 0]:
        for index in range(4):
            if stepsRemaining[index] > 0:
                if stepsRemaining[index] % 2 == 0:
                    STEP_PINS[index].on()
                else:
                    STEP_PINS[index].off()
                stepsRemaining[index] -= 1
        if slowMode:
            sleep(0.002)
        else:
            sleep(0.0005)

    stepsRemaining = [0, 0, 0, 0]
    for index in range(len(motors)):
        if angles[index] == 180:
            stepsRemaining[motors[index]] = overstepsPerMotor[motors[index]] * 2
        else:
            stepsRemaining[motors[index]] = overstepsPerMotor[motors[index]]
    for index in range(len(motors)):
        if angles[index] == 90:
            DIR_PINS[motors[index]].on()
        else:
            DIR_PINS[motors[index]].off()
    while stepsRemaining != [0, 0, 0, 0]:
        for index in range(4):
            if stepsRemaining[index] > 0:
                if stepsRemaining[index] % 2 == 0:
                    STEP_PINS[index].on()
                else:
                    STEP_PINS[index].off()
                stepsRemaining[index] -= 1
        if slowMode:
            sleep(0.002)
        else:
            sleep(0.0005)

    for index in range(len(motors)):
        if angles[index] == 90 or angles[index] == -90:
            motorRotations[motors[index]] = 1 - motorRotations[motors[index]]
    sleep(0.5)
    if slowMode:
        sleep(2)

"""
|==========================| MoveMotorsBackwards() |===========================|
| Esta función mueve uno o varios servomotores conectados a las manos del      |
| robot hacia atrás al mismo tiempo.                                           |
|                                                                              |
| Parámetros:                                                                  |
| motors: Un arreglo de valores del 0 al 3 representando las manos a mover     |
| hacia atrás.                                                                 |
|                                                                              |
| Esta función no regresa nada.                                                |
|==============================================================================|
"""
def MoveMotorsBackwards(motors):
    for index in range(len(motors)):
        SERVO_PINS[motors[index]].off()
    sleep(0.6)
    if slowMode:
        sleep(2)

"""
|==========================| MoveMotorsForwards() |============================|
| Esta función mueve uno o varios servomotores conectados a las manos del      |
| robot hacia adelante al mismo tiempo.                                        |
|                                                                              |
| Parámetros:                                                                  |
| motors: Un arreglo de valores del 0 al 3 representando las manos a mover     |
| hacia adelante.                                                              |
|                                                                              |
| Esta función no regresa nada.                                                |
|==============================================================================|
"""
def MoveMotorsForwards(motors):
    for index in range(len(motors)):
        SERVO_PINS[motors[index]].on()
    sleep(0.6)
    if slowMode:
        sleep(2)

"""
|============================| GetMotorRotation() |============================|
| Esta función regresa si uno de las manos del robot esta orientado de manera  |
| horizontal o vertical. El programa sabe esto porque actualiza la rotación de |
| cada mano después de cada rotación, y asume que cuando el programa inicia    |
| siempre estan orientados de manera vertical.                                 |
|                                                                              |
| Parámetros:                                                                  |
| motor: Un valor del 0 al 3 representando uno de las manos del robot.         |
|                                                                              |
| Regresa:                                                                     |
| motorRotation: La rotación u orientación de la mano del robot.               |
|==============================================================================|
"""
def GetMotorRotation(motor):
    return motorRotations[motor]

#Funciones de alto nivel:

"""
|===============================| RotateFace() |===============================|
| Esta función realiza la acción de girar una de las caras del cubo 90°, 180°  |
| o -90° a favor de las manecillas del reloj, dado el número de la mano que se |
| encuentra frente a esa cara.                                                 |
|                                                                              |
| Parámetros:                                                                  |
| face: Un valor del 0 al 3 representando uno de las manos del robot.          |
| angle: Un ángulo que puede ser -90, 90 o 180, que representa el ángulo a     |
| girar esa mano o cara.                                                       |
|                                                                              |
| Esta función no regresa nada.                                                |
|==============================================================================|
"""
def RotateFace(face, angle):
    RotateMotors([face], [angle])
    if GetMotorRotation(face) == MOTOR_HORIZONTAL:
        MoveMotorsBackwards([face])
        RotateMotors([face], [90])
        MoveMotorsForwards([face])

"""
|===============================| RotateCube() |===============================|
| Esta función realiza la acción de girar todo el cubo 90° a favor de las      |
| manecillas del reloj alrededor de una cara o mano.                           |
|                                                                              |
| Parámetros:                                                                  |
| face: Un valor del 0 al 3 representando uno de las manos del robot.          |
|                                                                              |
| Esta función no regresa nada.                                                |
|==============================================================================|
"""
def RotateCube(face):
    oppFace = (face + 2) % 4
    altFace1 = (face + 1) % 4
    altFace2 = (face + 3) % 4
    MoveMotorsBackwards([face])
    RotateMotors([face], [90])
    MoveMotorsForwards([face])
    MoveMotorsBackwards([altFace1, altFace2])
    RotateMotors([face, oppFace], [90, -90])
    MoveMotorsForwards([altFace1, altFace2])
    MoveMotorsBackwards([oppFace])
    RotateMotors([oppFace], [90])
    MoveMotorsForwards([oppFace])

"""
|===============================| WaitMotors() |===============================|
| Esta función utiliza una máquina de estados para esperar a que el usuario    |
| presione uno de los dos botones de inicio o apagado. Si el usuario pica el   |
| boton de apagar, se manda un comando que apaga la tarjeta. Si el usuario     |
| pica el boton de iniciar, primero se cierran las manos. El usuario luego     |
| necesita presionar el boton de inicio otra vez para que comience el proceso  |
| de resolución. Si se detecta un error con el cubo, se activa la variable     |
| errorDetected y una luz parpadea para indicar el error.                      |
|                                                                              |
| Parámetros:                                                                  |
| errorDetected: True si se detectó un error con el cubo, o False si no        |
|                                                                              |
| Esta función no regresa nada.                                                |
|==============================================================================|
"""
def WaitMotors(errorDetected):
    state = 0
    pushed = False
    blinkState = True
    while True:
        if errorDetected:
            if blinkState:
                ERROR_LED.on()
            else:
                ERROR_LED.off()
            blinkState = not blinkState
        else:
            ERROR_LED.off()
        if OFF_PIN.value == 0:
            print("SHUTDOWN!!!")
            ERROR_LED.on()
            system("sudo poweroff")
            continue
        if state == 0:
            for i in range(4):
                SERVO_PINS[i].off()
            if START_PIN.value == 0 and not pushed:
                print("GET READY!!!")
                pushed = True
            if START_PIN.value == 1 and pushed:
                state = 1
                errorDetected = False
                pushed = False
        if state == 1:
            for i in range(4):
                SERVO_PINS[i].on()
            if START_PIN.value == 0 and not pushed:
                print("STARTING!!!")
                pushed = True
            if START_PIN.value == 1 and pushed:
                state = 2
                pushed = False
        if state == 2:
            pushed = False
            return
        sleep(0.1)