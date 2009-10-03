#!/bin/sh
cat test | curl -X PUT -H 'Content-type: text/xml' --data-binary @- http://localhost:8001/resource/html/pages?pagename=steven_test

