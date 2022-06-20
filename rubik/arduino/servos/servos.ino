#include <Servo.h>

Servo servos[4];
int outputs[] = {3, 5, 6, 9}; //Pines de salida
int inputs[] = {2, 4, 7, 8}; //Pines de entrada
int offs[] = {0, 0, 0, 0}; //Posiciones de retiro de los servos
int ons[] = {105, 120, 100, 60}; //Posiciones de avance de los servos

void setup() {
  Serial.begin(9600);
  for(int i = 0; i < 4; i++) {
    servos[i].attach(outputs[i]);
  }
}

//Mueve los servos hacia enfrente o hacia atras dependiendo de las señales recibidas
void loop() {
  for(int i = 0; i < 4; i++) {
    if(digitalRead(inputs[i])) {
      servos[i].write(ons[i]);
    } else {
      servos[i].write(offs[i]);
    }
  }
  delay(100);
}
