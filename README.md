# Children's night clock
A night clock for children (and for parents) that shows in an easy way, when the night begins, and even more important, when the night is over. 

## Installation

### Prerequisites
Install [esp32-javascript](https://github.com/pepe79/esp32-javascript/) on your ESP32 module.

### Setup
* Enter setup mode, by pressing the 'BOOT'-button on your ESP32 during startup.
* Connect to the 'esp32' wifi and open the url http://192.168.4.1/setup in your browser 
* In the setup form fill in your Wifi SSID and password.
* Also fill in the download link of the night clock stable version: http://cdn.rawgit.com/pepe79/childrens-night-clock/0.17/main.js 
* Reboot the ESP32 module. The ESP32 connects to the configured wifi.
* Upon successful connection, the start- and endtime of the night can be configured here: http://[IP-OF-DEVICE]/status
