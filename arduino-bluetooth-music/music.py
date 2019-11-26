from bluetooth import *
import time
import sys
import os

mac = ""
path = ""

if os.path.isfile("./music.ini") == False:
    print("Configuration file not found... creating one now.")
    conf = open("music.ini", "w")
    mac = input("Please enter the MAC address of the desired bluetooth module: ")
    conf.write("[Options]\n")
    conf.write("MAC=" + mac)
    print("Configuration updated. If you have made a mistake, just delete music.ini and rerun this program.")
    conf.close()
else:
    conf = open("music.ini", "r")
    lines = conf.readlines()
    mac = lines[1][4:]
    conf.close()

if(len(sys.argv) < 2):
    path = input("Please enter the path to the file you would like to play: ")
else:
    path = sys.argv[1]

if os.path.isfile(path) == False:
    print("The file " + path + " was not found.")
    exit(1)

songfile = open(path, "r")
speed = float(songfile.readline())
notes = eval(songfile.readline())
durations = eval(songfile.readline())
valid = False
songfile.close()

if isinstance(notes, list) and isinstance(durations, list):
    if len(notes) == len(durations):
        valid = True

if valid == False:
    print("Invalid file")
    exit(1)

socket = BluetoothSocket(RFCOMM) 
socket.connect((mac, 1))

for i in range(0, len(notes)):
    socket.send(notes[i] + str(durations[i]) + "R")
    print(notes[i] + "\t" + str(durations[i]))
    time.sleep(durations[i] * speed)

socket.close()
