#!/bin/bash

echo "Remove old react webview"
if [ -e ./node_modules/react-native/React/Views/RCTWebView.h ] ; then
  rm -rf ./node_modules/react-native/React/Views/RCTWebView.h
  rm -rf ./node_modules/react-native/React/Views/RCTWebView.m
  rm -rf ./node_modules/react-native/React/Views/RCTWebViewManager.h
  rm -rf ./node_modules/react-native/React/Views/RCTWebViewManager.m
fi
