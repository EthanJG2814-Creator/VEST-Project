# VEST Project
## Packages
Here are all external packages used in this project and why
- Newtonsoft \
    This package is used because it is a strong json handler that can zip and unzip json files very quickly. This will be very useful for api communication between the front and back end.
- ASP.NET \
    This package is used to help build an api service on the back end for the front end.
- Microsoft.Extensions.Logging & Microsoft.Extensions.Logging.Console \
    These packages are for logging issues to the console. This can be used for debugging and helping the programmer follow what is happening in the program.

# VEST App Start Guide
1. cd VEST_expo_app
2. npm install 
3. npx expo start
4. Scan QR code with phone (have Expo Go app installed)

# Running ios dev build:

 https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&buildEnv=local&platform=ios&device=physical#plug-in-your-device-via-usb-and-enable-developer-mode

1. npx expo prebuild --clean # if any major changes were made to Installing or updating a library containing native code Changing app config(app.json) Upgrading your Expo SDK version
2. npx expo run:ios --device