#!/bin/bash

echo "Remove old react webview"
if [ -e ./node_modules/react-native/React/RCTWebView.h ] ; then
  rm -rf ./node_modules/react-native/React/RCTWebView.h
  rm -rf ./node_modules/react-native/React/RCTWebView.m
  rm -rf ./node_modules/react-native/React/RCTWebViewManager.h
  rm -rf ./node_modules/react-native/React/RCTWebViewManager.m
fi
