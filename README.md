# Car Garage Project

## Overview

This project is a 3D interactive car garage built using Three.js, which allows users to explore and interact with a car garage environment. The controls enable the user to move around the scene, and the 3D models are stored in the `scene.gltf` file.

You can view the live demo here: [Car Garage Project on Vercel](https://sds-auto-works-sujithravichandran27gmailcoms-projects.vercel.app/)

## Features

- 3D visualization of a car garage
- Interactive controls to navigate the garage
- Supports multiple cars and garage elements

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine
- A package manager such as npm or yarn
- Basic knowledge of JavaScript and Three.js
  
## Working 

 - When the switch is OFF and the car is tried to turn on, a warning is raised telling that there is an issue with car, and the mechanic is called.In the meantime, the car is raised on the ramp.Once the mechanic has arrived , he startes 
  working on the issue by standing under the car, for a timing of 5 seconds.After rectification of the issue, the mechanic goes back and the car is lowered automatically.
 - Then we give a notification tellinng that the issue with the car is rectified and the switch is automatically turned ON.
 - Now, the car can be started with the press of the button and correct PIN is entered.
 - Have included the working audio for car starting, car not starting and lift operation.
 - The car can also be lifted when the key 'R' is clicked and can be lowered when the key 'L' is clickeds

## Lighting

 - Ambient Lights
 - Directional Sunlight
 - Corner lights
 - Front area and fill lights
 - Ground fill light
 - Spot light
 


## Constraints

- The car can be lifted only when it is centered
- The car can be moved using WASD keys only after it is started
- The car can be started only when the password '0000' is entered
- The car can't be moved when it is raised
- When the car has issues, the mechanic moves under the car, fixes it and lowers the car

## Furure Improvemnets

- Initialize a 3d model for the parts
- Using mediapipe for motion detection to raise and lower the car
  

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sujith27pes/SDS_Auto_Works.git
   cd SDS_Auto_Works




  ## Project Structure

```bash
├── app.js            # Main JavaScript file to initialize the 3D scene
├── OrbitControls.js  # Controls for navigating the 3D environment
├── scene.gltf        # 3D model of the car garage
└── README.md         # Project documentation







