#include <string.h>

const int tonePin = 13;

double freqs[] = {27.5, 30.8676953125, 16.3516015625, 18.3540234375, 20.60171875, 21.8267578125, 24.4997265625};
double flatFreqs[] = {25.9565625, 29.135234375, 17.32390625, 19.4454296875, 23.1246484375};

double getFreq(char letter, int number, bool flat) {
  double index = 0;
  double octave = pow(2, number);
  if(!flat) {
    index = freqs[letter - 65];
  } else {
    switch(letter) {
      case 'A':
        index = flatFreqs[0];
        break;
      case 'B':
        index = flatFreqs[1];
        break;
      case 'D':
        index = flatFreqs[2];
        break;
      case 'E':
        index = flatFreqs[3];
        break;
      case 'G':
        index = flatFreqs[4];
        break;
    }
  }
  return index * octave;
}

char data = 0;

bool flat = false;
bool hasNum = false;
char letter = 0;
int number = 0;
String duration = "";
double durationDouble = 0.0;

void setup() {
  Serial.begin(38400);
  pinMode(tonePin, OUTPUT);
}

void loop() {
  if(Serial.available() > 0) {
      data = Serial.read();
      switch(data) {
        case 'R':
          durationDouble = duration.toDouble() * 300.0;
          duration = "";
          tone(tonePin, getFreq(letter, number, flat), durationDouble);
          flat = false;
          hasNum = false;
          break;
        case 'A':
        case 'B':
        case 'C':
        case 'D':
        case 'E':
        case 'F':
        case 'G':
          letter = data;
          break;
        case 'b':
          flat = true;
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          if(hasNum) {
            duration += data;
          } else {
            number = data - 48;
            hasNum = true;
          }
          break;
        case '.':
          duration += '.';
          break;
      }
   }
}
