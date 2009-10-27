#!/bin/sh

URL=`echo $2 | sed -e "s/'//g"`
URL=`perl -MURI::Escape -e "print uri_escape('$URL');"`
URL=`echo $URL | sed -e "s|http%3A%2F%2F|http://|"`
URL=`echo $URL | sed -e "s|%3A|:|g"`
URL=`echo $URL | sed -e "s|%2F|/|g"`
URL=`echo $URL | sed -e "s|%3F|?|g"`
echo $URL
METHOD=$1
#echo $METHOD

curl -X $METHOD $URL 
echo ""

