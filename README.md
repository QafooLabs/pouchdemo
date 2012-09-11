# README for the Simple pouchapp demo

To run the needed webserver, which serves this application on port 8000 simply
call `scripts/web-server.js`. You need to have node installed for this to work.

To be able to replicate from CouchDBs on other hosts ports. You need to use
Chrome and disable the Same-Origin-Policy.

This is done by the `--disable-web-security` command line flag

Example for linux:
    
    chromium-browser --disable-web-security

Example for Mac OS X:

    open -a Google\ Chrome --args --disable-web-security


