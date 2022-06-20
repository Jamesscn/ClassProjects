from motors import RotateFace, RotateCube, WaitMotors
from vision import GetCubeState
import twophase.solver as sv
import json

# Esta variable se usa para indicar si no se pudo resolver el cubo correctamente
errorDetected = False

"""
|=============================| GenerateSteps() |==============================|
| Corre el algoritmo de Kociemba en base al estado del cubo. El algoritmo      |
| regresa una serie o lista de rotaciones que se tienen que hacer sobre las    |
| seis caras del cubo, y esta función mapea esta lista para que se pueda hacer |
| con solo cuatro motores laterales.                                           |
|                                                                              |
| Parámetros:                                                                  |
| cubeState: Lista de colores de todas las caras del cubo.                     |
|                                                                              |
| Regresa:                                                                     |
| solveSteps: Lista de movimientos que consisten en rotar la cara que esta     |
| enfrente de uno de los cuatro motores, o que consiste en agarrar el cubo y   |
| rotarlo sobre un eje.                                                        |
|==============================================================================|
"""
def GenerateSteps(cubeState):
    global errorDetected
    solveString = sv.solve(cubeState, 0, 2)
    print(solveString)
    if("error" in solveString.lower()):
        errorDetected = True
        return []
    currentCubeAxes = ['X', 'Y']
    solveSteps = []
    axisChanges = []
    for step in solveString.split()[:-1]:
        cubeAxis = '-'
        if step[0] == 'F' or step[0] == 'B':
            cubeAxis = 'X'
        elif step[0] == 'L' or step[0] == 'R':
            cubeAxis = 'Y'
        elif step[0] == 'U' or step[0] == 'D':
            cubeAxis = 'Z'
        if cubeAxis not in currentCubeAxes:
            if currentCubeAxes[1] == '-':
                currentCubeAxes[1] = cubeAxis
            else:
                solveSteps.append("C")
                axisChanges.append(currentCubeAxes)
                currentCubeAxes = [cubeAxis, '-']
        solveSteps.append(step)
    if currentCubeAxes[1] == '-':
        currentCubeAxes[1] = axisChanges[-1][0]
    axisChanges.append(currentCubeAxes)

    for index in range(len(solveSteps)):
        if solveSteps[index] == 'C':
            if 'X' in axisChanges[0] and 'X' in axisChanges[1]:
                solveSteps[index] += 'X'
            elif 'Y' in axisChanges[0] and 'Y' in axisChanges[1]:
                solveSteps[index] += 'Y'
            else:
                solveSteps[index] += 'Z'
            axisChanges.pop(0)
    return solveSteps

# Este diccionario representa que motor del 0 al 3 tiene que cara del cubo enfrente
motorSides = {
    'U': -1,
    'R': 3,
    'F': 0,
    'D': -1,
    'L': 1,
    'B': 2
}

"""
|============================| UpdateMotorSides() |============================|
| Se usa esta función para guardar las caras del cubo que se pueden rotar en   |
| la orientación actual. Esto sirve para ver si se requiere rotar una cara que |
| no esta colocada enfrente de uno de los cuatro motores. En tal caso, es      |
| necesario rotar todo el cubo.                                                |
|                                                                              |
| Parámetros:                                                                  |
| cubeAxis: Un eje X, Y o Z que representa el último eje sobre la cual se rotó |
| el cubo.                                                                     |
|                                                                              |
| Esta función no regresa nada.                                                |
|==============================================================================|
"""
def UpdateMotorSides(cubeAxis):
    global motorSides
    newMotorSides = motorSides.copy()
    if cubeAxis == 'X':
        newMotorSides['U'] = motorSides['R']
        newMotorSides['R'] = motorSides['D']
        newMotorSides['D'] = motorSides['L']
        newMotorSides['L'] = motorSides['U']
    elif cubeAxis == 'Y':
        newMotorSides['U'] = motorSides['B']
        newMotorSides['F'] = motorSides['U']
        newMotorSides['D'] = motorSides['F']
        newMotorSides['B'] = motorSides['D']
    else:
        newMotorSides['R'] = motorSides['F']
        newMotorSides['F'] = motorSides['L']
        newMotorSides['L'] = motorSides['B']
        newMotorSides['B'] = motorSides['R']
    motorSides = newMotorSides

"""
|=================================| DoStep() |=================================|
| Recibe un movimiento de la función GenerateSteps() y llama las funciones de  |
| motors.py correspondientes a ese movimiento.                                 |
|                                                                              |
| Parámetros:                                                                  |
| step: Una arreglo representando un movimiento.                               |
|                                                                              |
| Esta función no regresa nada.                                                |
|==============================================================================|
"""
def DoStep(step):
    if step[0] == 'C': #Rotación de un cubo (cambio de eje)
        cubeAxis = step[1]
        if cubeAxis == 'X':
            RotateCube(motorSides['F'])
        elif cubeAxis == 'Y':
            RotateCube(motorSides['R'])
        else:
            RotateCube(motorSides['U'])
        UpdateMotorSides(cubeAxis)
    else: #Rotación de una cara
        angle = 0
        if step[1] == '3':
            angle = -90
        else:
            angle = int(step[1]) * 90
        face = motorSides[step[0]]
        RotateFace(face, angle)

"""
|=============================| Ciclo principal |==============================|
| Esta parte del código se encarga de correr todas las funciones de los tres   |
| archivos en orden, y es el ciclo principal del programa.                     |
|==============================================================================|
"""
while True:
    WaitMotors(errorDetected)
    errorDetected = False
    cubeState, relativeState = GetCubeState()
    solveSteps = GenerateSteps(cubeState)
    with open('server/public/solve_steps.json', 'w') as outputFile:
        json.dump({
            "state": relativeState,
            "steps": solveSteps
        }, outputFile)
    for step in solveSteps:
        DoStep(step)
    print("Solved!")