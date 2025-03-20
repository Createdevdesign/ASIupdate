#!/bin/sh

npmrc_template="
; begin auth token
//pkgs.dev.azure.com/AggielandSoftwareINC/SwiftServe/_packaging/swiftservefeed/npm/registry/:username=AggielandSoftwareINC
//pkgs.dev.azure.com/AggielandSoftwareINC/SwiftServe/_packaging/swiftservefeed/npm/registry/:_password=${AZURE_NPM_FEED_TOKEN}
//pkgs.dev.azure.com/AggielandSoftwareINC/SwiftServe/_packaging/swiftservefeed/npm/registry/:email=devteam@aggielandsoftware.com
//pkgs.dev.azure.com/AggielandSoftwareINC/SwiftServe/_packaging/swiftservefeed/npm/:username=AggielandSoftwareINC
//pkgs.dev.azure.com/AggielandSoftwareINC/SwiftServe/_packaging/swiftservefeed/npm/:_password=${AZURE_NPM_FEED_TOKEN}
//pkgs.dev.azure.com/AggielandSoftwareINC/SwiftServe/_packaging/swiftservefeed/npm/:email=devteam@aggielandsoftware.com
; end auth token
"
echo "$AZURE_NPM_FEED_TOKEN"
if [ -n "$AZURE_NPM_FEED_TOKEN" ]
then
    echo "$npmrc_template"
    echo "$npmrc_template" >> ~/.npmrc;
    pwd
else
    echo "AZURE_NPM_FEED_TOKEN is unset";
fi
