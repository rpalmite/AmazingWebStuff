#! /usr/local/bin/python

import os
import sys
import getopt

args = sys.argv

def usage():
	print "that a'int right"

try:
	opts, args = getopt.getopt(sys.argv, "", [])
except getopt.GetoptError:
	usage()
	sys.exit(2)

#refresh local depot
os.chdir('/Users/seberlin/Dev/AmazingWebStuff')
os.system('git pull')

ticketDemoHTML = ['viewTicket.html', 'ticketHistory.html', 'newTicket.html']

def putText(srcDir, destDir, htmlFiles):
	wutURL = 'http://api.webutilitykit.com:8000'
	for file in htmlFiles:
		os.system('cat ' + srcDir +  file + '| curl -X PUT -H \'Content-type: text/xml\' --data-binary @- ' + wutURL + destDir + '?pagename=' + file)	
	return

putText('/Users/seberlin/Sites/wut/', '/resource/html/pages', ticketDemoHTML)
