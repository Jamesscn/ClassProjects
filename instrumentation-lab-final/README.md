# Final Project for Mechatronics Instrumentation Lab

This project consists in combining vision with machine learning in order to create an application in LabVIEW which is capable of detecting people and recollecting useful data which is usually hard to measure.

This project uses LabVIEW to interpret the image from a webcam using vision libraries, then this image is sent via TCP to a local server which displays the data on a website.

**Materials:**

* USB Webcam (Logitech C270)
* Servomotor
* 3D printed movable base

**Software and Frameworks**

* LabVIEW
    * Vision libraries
    * OpenCV
    * TCP/IP communication
* NodeJS
    * Express
    * Socket.io
    * Vue.js
    * Tailwind

**Credits:**

[Base64 encoding tool for LabVIEW made by Marco Tedaldi](https://forums.ni.com/t5/Example-Programs/Fast-Base64-Encoder-Decoder-using-LabVIEW/ta-p/3503281?profile.language=en)

[Haar Cascade classifiers from OpenCV's repository](https://github.com/opencv/opencv/tree/master/data/haarcascades)

[Hero Patterns](http://www.heropatterns.com/)