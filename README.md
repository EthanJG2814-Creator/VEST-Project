# VEST Project
## Packages
Here are all external packages used in this project and why
- Newtonsoft \
    This package is used because it is a strong json handler that can zip and unzip json files very quickly. This will be very useful for api communication between the front and back end.
- ASP.NET \
    This package is used to help build an api service on the back end for the front end.
- Microsoft.Extensions.Logging & Microsoft.Extensions.Logging.Console \
    These packages are for logging issues to the console. This can be used for debugging and helping the programmer follow what is happening in the program.

# VEST App

1. `yarn install`
2. `cd ios && pod install && cd ..`
3. `yarn start`
4. `yarn ios:quick`

Fast rerun (when Metro is already running):

`npx react-native run-ios --no-packager --simulator "iPhone 17 Pro"`