#define samples 50 //Smoothing samples for the sensors

enum Mode {BOTH, LEVEL, TEMP};
enum Mode mode;
enum Colour {RED, GREEN, BLUE, CYAN, PURPLE, ALTGREEN, WHITE, NONE};
byte buttonPin = A0;
byte temperaturePin = A1;
byte dataPin = 13;
byte clockPin = 12;
byte latchPin = 11;
byte trigPin = 10;
byte echoPin = 9;
long lastDistances[samples];
float lastTemperatures[samples];
byte lastIndex;
byte lastIndexB;

void light(int row, int column, Colour colour) {
  int red = 0;
  int green = 0;
  int blue = 0;
  int shift[] = {1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1}; //2, 1, R, G, B, R, G, B, 10, 9, 8, 7, 6, 5, 4, 3
  switch(colour) {
    case RED:
      red = 1;
      break;
    case GREEN:
      green = 1;
      break;
    case BLUE:
      blue = 1;
      break;
    case CYAN:
      green = 1;
      blue = 1;
      break;
    case PURPLE:
      red = 1;
      blue = 1;
      break;
    case ALTGREEN:
      red = 1;
      green = 1;
      break;
    case WHITE:
      red = 1;
      green = 1;
      blue = 1;
      break;
    case NONE:
      break;
  }
  shift[(17 - column) % 16] = 0;
  if(row == 0) {
    shift[5] = red;
    shift[6] = green;
    shift[7] = blue;
  } else {
    shift[2] = red;
    shift[3] = green;
    shift[4] = blue;
  }
  int lowValue = shift[15] + 2 * shift[14] + 4 * shift[13] + 8 * shift[12] + 16 * shift[11] + 32 * shift[10] + 64 * shift[9] + 128 * shift[8];
  int highValue = shift[7] + 2 * shift[6] + 4 * shift[5] + 8 * shift[4] + 16 * shift[3] + 32 * shift[2] + 64 * shift[1] + 128 * shift[0];
  shiftOut(dataPin, clockPin, MSBFIRST, lowValue);
  shiftOut(dataPin, clockPin, MSBFIRST, highValue);
  digitalWrite(latchPin, LOW);
  digitalWrite(latchPin, HIGH);
}

Colour getColourFromTemp(float temperature) {
  if(temperature < 25) {
    return BLUE;
  } else if (temperature < 30) {
    return CYAN;
  } else if (temperature < 35) {
    return ALTGREEN;
  } else if (temperature < 40) {
    return PURPLE;
  } else {
    return RED;
  }
}

Colour getColourFromLevel(int level) {
  if(level < 7) {
    return RED;
  } else if (level < 13) {
    return ALTGREEN;
  } else {
    return GREEN;
  }
}

int getValueFromLevel(float distance) {
  distance /= 10; //Convert to cm
  float val = (distance - 12.0F) * -20.0F / 8.0F;
  if(val < 0) {
    val = 0;
  }
  if(val > 20) {
    val = 20;
  }
  return val;
}

void setup() {
  Serial.begin(38400);
  pinMode(dataPin, OUTPUT);
  pinMode(clockPin, OUTPUT);
  pinMode(latchPin, OUTPUT);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buttonPin, INPUT);
  pinMode(temperaturePin, INPUT);
  mode = BOTH;
  for(int i = 0; i < samples; i++) {
    lastDistances[i] = 0;
  }
  lastIndex = 0;
  lastIndexB = 0;
}

void loop() {
  //Read ultrasonic
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH, 5000);
  duration *= 0.1715;
  //Remove noise from the distance curve
  if(duration < 800) {
    lastDistances[lastIndex] = duration;
    lastIndex = (lastIndex + 1) % samples;
  }
  float averageDistance = 0;
  for(int i = 0; i < samples; i++) {
    averageDistance += (float)lastDistances[i] / samples;
  }
  //Read the button that sets the mode
  int button = analogRead(buttonPin);
  if(button > 750) {
    mode = TEMP;
  } else if (button > 410) {
    mode = LEVEL;
  } else if (button > 100) {
    mode = BOTH;
  }
  //Reads the temperature
  float temperature = analogRead(temperaturePin);
  lastTemperatures[lastIndexB] = temperature * 500 / 1024.0F;
  lastIndexB = (lastIndexB + 1) % samples;
  float averageTemperature = 0;
  for(int i = 0; i < samples; i++) {
    averageTemperature += (float)lastTemperatures[i] / samples;
  }
  //Changes the lights depending on the mode
  int level = getValueFromLevel(averageDistance);
  int tempHeight = averageTemperature - 20;
  if(tempHeight < 1) {
    tempHeight = 1;
  }
  if(tempHeight > 20) {
    tempHeight = 20;
  }
  if(level < 1) {
    level = 1;
  }
  switch(mode) {
    case BOTH:
      for(int i = 0; i < level / 2; i++) {
        light(0, i, getColourFromTemp(averageTemperature));
      }
      for(int i = 0; i < (level - level / 2); i++) {
        light(1, i, getColourFromTemp(averageTemperature));
      }
      break;
    case LEVEL:
      for(int i = 0; i < level / 2; i++) {
        light(0, i, getColourFromLevel(level));
      }
      for(int i = 0; i < (level - level / 2); i++) {
        light(1, i, getColourFromLevel(level));
      }
      break;
    case TEMP:
      for(int i = 0; i < tempHeight / 2; i++) {
        light(0, i, getColourFromTemp(averageTemperature));
      }
      for(int i = 0; i < (tempHeight - tempHeight / 2); i++) {
        light(1, i, getColourFromTemp(averageTemperature));
      }
      break;
  }
  //Bluetooth communication
  if(Serial.available() > 0) {
    byte data = Serial.read();
    if(data == '0') {
      mode = BOTH;
    } else if (data == '1') {
      mode = LEVEL;
    } else if (data == '2') {
      mode = TEMP;
    }
  }
  Serial.write("B");
  Serial.write((int)averageDistance);
  Serial.write((int)(averageTemperature * 5.0F));
}
