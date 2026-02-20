/* * CSV Output Version (3 Sensors, 3 Pin Sets)
 * Logic: 
 * - MPU1 uses I2C Bus 0 (Exclusive)
 * - MPU2 & MPU3 share I2C Bus 1 (We switch pins dynamically)
 */

#include "Wire.h"
#include <MPU6050_light.h>

// --- Configuration ---
//25,26/14,27
// Bus 0
#define SDA_1 32
#define SCL_1 33

// Bus 1 (Shared)
#define SDA_2 25
#define SCL_2 26
#define SDA_3 14
#define SCL_3 27

//Bus 0
TwoWire I2C_0 = TwoWire(0);
//Bus 1
TwoWire I2C_1 = TwoWire(1);

// MPU1 is on its own bus
MPU6050 mpu1(I2C_0);

// MPU2 and MPU3 share the SAME bus object (I2C_1)
// We will switch the pins under the loop
MPU6050 mpu2(I2C_1);
MPU6050 mpu3(I2C_1);

long timer = 0;

void setup() {
  Serial.begin(9600);
  while(!Serial);
  delay(10);

  // 1. Initialize MPU 1 (Standard)
  I2C_0.begin(SDA_1, SCL_1, 400000);
  byte status1 = mpu1.begin();

  // 2. Initialize MPU 2
  // We attach Bus 1 to MPU2's pins first
  I2C_1.begin(SDA_2, SCL_2, 400000); 
  byte status2 = mpu2.begin();

  // 3. Initialize MPU 3
  // We detach Bus 1 and move it to MPU3's pins
  I2C_1.begin(SDA_3, SCL_3, 400000);
  byte status3 = mpu3.begin();

  Serial.print(F("MPU 1 Status: ")); Serial.println(status1);
  Serial.print(F("MPU 2 Status: ")); Serial.println(status2);
  Serial.print(F("MPU 3 Status: ")); Serial.println(status3);

  if(status1 != 0 || status2 != 0 || status3 != 0){ 
    Serial.println("Error: Connection failed. Check wiring.");
    delay(1000); 
  }
  
  Serial.println(F("Calibrating... Keep sensors still."));
  
  // Calibrate MPU1
  mpu1.calcOffsets(false,false); 
  
  // Calibrate MPU2 (Switch pins first)
  I2C_1.begin(SDA_2, SCL_2, 400000);
  mpu2.calcOffsets(false,false);
  
  // Calibrate MPU3 (Switch pins first)
  I2C_1.begin(SDA_3, SCL_3, 400000);
  mpu3.calcOffsets(false,false);
  
  // Header
  Serial.print("Timestamp_ms");
  Serial.print(",Temp1,AccX1,AccY1,AccZ1,GyroX1,GyroY1,GyroZ1");
  Serial.print(",Temp2,AccX2,AccY2,AccZ2,GyroX2,GyroY2,GyroZ2");
  Serial.println(",Temp3,AccX3,AccY3,AccZ3,GyroX3,GyroY3,GyroZ3");
}

void loop() {
  // --- UPDATE SEQUENCE ---
  
  // 1. Update MPU 1 (Always connected)
  mpu1.update();

  // 2. Update MPU 2 (Switch Bus 1 to MPU2 pins)
  I2C_1.begin(SDA_2, SCL_2, 400000);
  mpu2.update();

  // 3. Update MPU 3 (Switch Bus 1 to MPU3 pins)
  I2C_1.begin(SDA_3, SCL_3, 400000);
  mpu3.update();

  // --- PRINT SEQUENCE ---
  if(millis() - timer > 100){ 
    
    Serial.print(millis());
    Serial.print(",");
    
    // MPU 1
    Serial.print(mpu1.getTemp());  Serial.print(",");
    Serial.print(mpu1.getAccX());  Serial.print(",");
    Serial.print(mpu1.getAccY());  Serial.print(",");
    Serial.print(mpu1.getAccZ());  Serial.print(",");
    Serial.print(mpu1.getGyroX()); Serial.print(",");
    Serial.print(mpu1.getGyroY()); Serial.print(",");
    Serial.print(mpu1.getGyroZ()); Serial.print(",");

    // MPU 2
    Serial.print(mpu2.getTemp());  Serial.print(",");
    Serial.print(mpu2.getAccX());  Serial.print(",");
    Serial.print(mpu2.getAccY());  Serial.print(",");
    Serial.print(mpu2.getAccZ());  Serial.print(",");
    Serial.print(mpu2.getGyroX()); Serial.print(",");
    Serial.print(mpu2.getGyroY()); Serial.print(",");
    Serial.print(mpu2.getGyroZ()); Serial.print(",");

    // MPU 3
    Serial.print(mpu3.getTemp());  Serial.print(",");
    Serial.print(mpu3.getAccX());  Serial.print(",");
    Serial.print(mpu3.getAccY());  Serial.print(",");
    Serial.print(mpu3.getAccZ());  Serial.print(",");
    Serial.print(mpu3.getGyroX()); Serial.print(",");
    Serial.print(mpu3.getGyroY()); Serial.print(",");
    Serial.println(mpu3.getGyroZ());

    timer = millis();
  }
}