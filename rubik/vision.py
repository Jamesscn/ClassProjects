from motors import RotateMotors, MoveMotorsForwards, MoveMotorsBackwards
import numpy as np
import cv2, math

DEBUG_VISION = False
TILE_LETTERS = ["U", "R", "F", "D", "L", "B"]
TILE_COLOURS = [(175, 208, 194), (0, 36, 182), (106, 152, 0), (0, 189, 210), (50, 50, 50), (190, 89, 0)]
SQUARE_SIZE = 50
SQUARE_SEP = 50
OFFSET_X = -40
OFFSET_Y = -22

"""
|============================| TakeImageOfSide() |=============================|
| Utiliza la libreria de OpenCV para capturar una imágen de la cámara, y luego |
| procesa esta imágen segmentandolo en los nueve espacios de una cara del      |
| cubo. Luego, toma el promedio del color en cada uno de estos espacios y los  |
| relaciona con uno de los seis colores del cubo, agarrando el color más       |
| cercano. El color más cercano se determina usando una función de distancia   |
| en espacio Lab, que es un espacio de colores donde cada color es             |
| equidistante. Finalmente, regresa una lista de colores para esa cara del     |
| cubo.                                                                        |
|                                                                              |
| Parámetros:                                                                  |
| id: Un valor de 1 a 6 que indica que cara se esta viendo (1 - cara de abajo, |
| 2 - cara de la izquierda, 3 - cara de atras, 4 - cara de la derecha,         |
| 5 - cara de enfrente, 6 - cara de arriba).                                   |
|                                                                              |
| Regresa:                                                                     |
| sideStringArray: Un arreglo de nueve elementos que indican el color de cada  |
| cuadro observado sobre la cara. Puede ser blanco, verde, rojo, naranja, azul |
| o amarillo.                                                                  |
|==============================================================================|
"""
def TakeImageOfSide(id):
    sideColours = []
    camera = cv2.VideoCapture(0)
    trash, image = camera.read()
    camera.release()

    hsvImg = cv2.cvtColor(image,cv2.COLOR_BGR2HSV).astype("float32")
    hsvImg[...,1] = np.clip(hsvImg[...,1] * 2, 0, 255)
    image = cv2.cvtColor(hsvImg.astype("uint8"), cv2.COLOR_HSV2BGR)

    labImage = cv2.cvtColor(image, cv2.COLOR_BGR2Lab)
    displayImage = image.copy()
    height = image.shape[0]
    width = image.shape[1]
    startY = int(height * 0.5 - SQUARE_SIZE * 1.5 - SQUARE_SEP + OFFSET_Y)
    startX = int(width * 0.5 - SQUARE_SIZE * 1.5 - SQUARE_SEP + OFFSET_X)
    for squareY in range(3):
        for squareX in range(3):
            cornerY = startY + squareY * (SQUARE_SIZE + SQUARE_SEP)
            cornerX = startX + squareX * (SQUARE_SIZE + SQUARE_SEP)
            if DEBUG_VISION:
                displayImage = cv2.rectangle(displayImage, (cornerX, cornerY), (cornerX + SQUARE_SIZE, cornerY + SQUARE_SIZE), (255, 0, 0), 3)
            roi = labImage[cornerY:cornerY + SQUARE_SIZE, cornerX:cornerX + SQUARE_SIZE]
            L1, a1, b1, t1 = cv2.mean(roi)
            closestColourIndex = -1
            closestColourDistance = math.inf
            for index in range(6):
                pixelImage = np.reshape(TILE_COLOURS[index], (1, 1, 3)).astype(np.uint8)
                L2, a2, b2 = cv2.cvtColor(pixelImage, cv2.COLOR_BGR2Lab)[0][0]
                distance = (L1 - L2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2
                if distance < closestColourDistance:
                    closestColourIndex = index
                    closestColourDistance = distance
            sideColours.append(closestColourIndex)
    if id == 0:
        sideColours = np.reshape(np.rot90(np.reshape(sideColours, (3, 3)), k = 3), (9)).tolist()
    if DEBUG_VISION:
        cv2.imshow("Image", displayImage)
        tiles = np.zeros((300, 300, 3), np.uint8)
        for squareY in range(3):
            for squareX in range(3):
                index = squareY * 3 + squareX
                tiles[squareY * 100:squareY * 100 + 100, squareX * 100:squareX * 100 + 100] = TILE_COLOURS[sideColours[index]]
        cv2.imshow("Tiles", tiles)
        cv2.waitKey(0)
    sideStringArray = []
    for sideColour in sideColours:
        sideStringArray.append(TILE_LETTERS[sideColour])
    print(sideStringArray)
    return sideStringArray

"""
|==============================| GetCubeState() |==============================|
| Esta función se usa para obtener el estado del cubo, es decir, todos los     |
| colores sobre las seis caras del cubo.                                       |
|                                                                              |
| Esta función no requiere parámetros.                                         |
|                                                                              |
| Regresa:                                                                     |
| cubeState: Una cuerda que representa el estado del cubo, que consiste en los |
| cáracteres U, R, F, D, L, B, que representan tanto los colores como el       |
| estado del cubo.                                                             |
| relativeState: Una cuerda parecida a cubeState, pero que se usa para         |
| representar los colores correctamente en la interfáz gráfica.                |
|==============================================================================|
"""
def GetCubeState():
    MoveMotorsBackwards([1])
    down1 = TakeImageOfSide(0)
    MoveMotorsForwards([1])
    MoveMotorsBackwards([3])
    RotateMotors([3], [90])
    MoveMotorsForwards([3])
    MoveMotorsBackwards([0, 2])
    down2 = TakeImageOfSide(0)
    RotateMotors([1, 3], [90, -90])
    left1 = TakeImageOfSide(1)
    MoveMotorsForwards([0, 2])
    MoveMotorsBackwards([1])
    RotateMotors([1], [-90])
    MoveMotorsForwards([1])
    MoveMotorsBackwards([3])
    left2 = TakeImageOfSide(1)
    MoveMotorsForwards([3])
    MoveMotorsBackwards([0])
    RotateMotors([0], [90])
    MoveMotorsForwards([0])
    MoveMotorsBackwards([1, 3])
    RotateMotors([0, 2], [-90, 90])
    back1 = TakeImageOfSide(2)
    MoveMotorsForwards([1, 3])
    MoveMotorsBackwards([2])
    RotateMotors([2], [90])
    MoveMotorsForwards([2])
    MoveMotorsBackwards([0])
    back2 = TakeImageOfSide(2)
    RotateMotors([0], [90])
    MoveMotorsForwards([0])
    MoveMotorsBackwards([1, 3])
    RotateMotors([0, 2], [-90, 90])
    right1 = TakeImageOfSide(3)
    MoveMotorsForwards([1, 3])
    MoveMotorsBackwards([2])
    RotateMotors([2], [90])
    MoveMotorsForwards([2])
    MoveMotorsBackwards([0])
    right2 = TakeImageOfSide(3)
    RotateMotors([0], [90])
    MoveMotorsForwards([0])
    MoveMotorsBackwards([1, 3])
    RotateMotors([0, 2], [-90, 90])
    front1 = TakeImageOfSide(4)
    MoveMotorsForwards([1, 3])
    MoveMotorsBackwards([2])
    RotateMotors([2], [90])
    MoveMotorsForwards([2])
    MoveMotorsBackwards([0])
    front2 = TakeImageOfSide(4)
    MoveMotorsForwards([0])
    MoveMotorsBackwards([1])
    RotateMotors([1], [90])
    MoveMotorsForwards([1])
    MoveMotorsBackwards([0, 2])
    RotateMotors([1, 3], [90, -90])
    up1 = TakeImageOfSide(5)
    MoveMotorsForwards([0, 2])
    MoveMotorsBackwards([3])
    RotateMotors([3], [90])
    MoveMotorsForwards([3])
    MoveMotorsBackwards([1])
    up2 = TakeImageOfSide(5)
    MoveMotorsForwards([1])

    down2[1] = down1[1]
    left1[5] = left2[5]
    back1[7] = back2[7]
    right1[7] = right2[7]
    front1[7] = front2[7]
    up1[3] = up2[3]

    up1 = ''.join(up1)
    right1 = ''.join(right1)
    front1 = ''.join(front1)
    down2 = ''.join(down2)
    left1 = ''.join(left1)
    back1 = ''.join(back1)
    relativeState = up1 + left1 + front1 + down2 + right1 + back1
    print(relativeState)

    MAP = {
        up1[4]: "U",
        left1[4]: "R",
        front1[4]: "F",
        down2[4]: "D",
        right1[4]: "L",
        back1[4]: "B"
    }

    cubeState = ""
    for char in relativeState:
        if char in MAP:
            cubeState += MAP[char]
        else:
            cubeState += char

    print(cubeState)
    return cubeState, relativeState