#!/bin/sh
CURRDIR=$(dirname $0);
sudo ${CURRDIR}/../src/main.js;
CONNECTED=0;
ATTEMPTS=0;
MAX_ATTEMPTS=30;
while [ $CONNECTED -eq 0 ]; do
  _=$(ifconfig | grep 'tun');
  if [ "$?" = "0" ]; then
    CONNECTED=1;
    printf -- "\033[32m\033[1mCONNECTED\033[0m. Exiting...\n";
    exit 0;
  else
    ATTEMPTS=$(($ATTEMPTS+1));
    if [ $ATTEMPTS -eq ${MAX_ATTEMPTS} ]; then
      printf -- "\033[31m\033[1mSOMETHING FUCKED UP\033[0m. Try again!\n";
      exit 1;
    fi; 
  fi; 
  printf -- '.';
  sleep 1;
done;