#!/usr/bin/env bash

BUILD="$1"
cordova compile ios android --device
cp "platforms/ios/build/device/PhoneGap Demo.ipa" "$HOME/Google Drive/NextSteps Ad Hoc distribution/PhonegapDemo-build-$BUILD.ipa"
cp "platforms/android/build/outputs/apk/android-debug.apk" "$HOME/Google Drive/NextSteps Ad Hoc distribution/PhonegapDemo-build-$BUILD.apk"
