#! /usr/local/bin/python

import os
import sys
import getopt

args = sys.argv

#
# Configuration
#

localRepo = '/Users/seberlin/Dev/AmazingWebStuff'
localServ = '/Users/seberlin/Sites/wut'
remoteServ = 'http://api.webutilitykit.com:8000'
remoteHTMLDir = '/resource/html/pages'

def doInDir(dir, fn):
	def function(x):
		cwd = os.getcwd()
		os.chdir(dir)
		fn(x);
		os.chdir(cwd)

def executeCommands(cmdList):
	for cmd in cmdList:
		os.system(cmd)

#
# Command Line Parameters
#

def usage():
	print "ERROR: invalid parameters"

try:
	opts, args = getopt.getopt(sys.argv[1:], "m:x", ["--message="])
except getopt.GetoptError:
	usage()
	sys.exit(2)

#
# Refresh local Git repository & commit any changes
#

def commitLocal(m):
	executeCommands(['git pull', 'git commit -m 'm])

for o, a in opts:
	if o == '-m' or o == '--message=':
		(doInDir(localRepo, commitLocal))(m)

#
# Export Ticketing System to the Webserver
#

ticketDemoHTML = ['viewTicket.html', 'ticketHistory.html', 'newTicket.html']

def putText(srcDir, destDir, htmlFiles):
	for file in htmlFiles:
		os.system('cat ' + srcDir +  file + '| curl -X PUT -H \'Content-type: text/xml\' --data-binary @- ' + remoteServ + destDir + '?pagename=' + file)	
	return
for o, a in opts:
	if o == '-x' or o == '--export':
		putText(localServ, remoteHTMLDir, ticketDemoHTML)
