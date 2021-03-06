#!/usr/bin/python

import os
from shutil import copyfile
import sys
import getopt

# Configuration
#

localRepo = '.'
localServ = '/Library/WebServer/Documents'
localHTMLDir = '/html/pages'
remoteServ = 'http://api.webutilitykit.com:8000'
remoteHTMLDir = '/resource/html/pages'
ticketFiles = ['test.json','test.html','editor.html','login.html','wut.js']

def doInDir(dir, fn):
	def function(*args):
		cwd = os.getcwd()
		os.chdir(dir)
		fn(*args); # Call fn with unpacked tuple
		os.chdir(cwd)
	return function

def executeCommands(cmdList):
	for cmd in cmdList:
		os.system(cmd)

# Command Line Parameters
#

args = sys.argv#
def usage():
	print "ERROR: invalid parameters"

try:
	opts, args = getopt.getopt(sys.argv[1:], "c:xls", ["--commit=","--export","--export-local","--selenium-start"])
except getopt.GetoptError:
	usage()
	sys.exit(2)

# Refresh local Git repository & commit any changes
#

def commitLocal(m):
	executeCommands(['git pull', 'git commit --interactive -m ' + m])

for o, a in opts:
	if o == '-m' or o == '--message=':
		(doInDir(localRepo, commitLocal))(a)

# Copy Repo Files to Local Server
#

for o, a in opts:
	if o == '-l' or o == '--export-local':
		for file in ticketFiles:
			(doInDir(localRepo, copyfile))(file, localServ + localHTMLDir + '/' + file)		
# Export Repo files to Remote Server
#

def putText(htmlFiles, srcDir, destDir):
	for file in htmlFiles:
		os.system('cat ' + srcDir + "/" + file + '| curl -X PUT -H \'Content-type: text/xml\' --data-binary @- ' + remoteServ + destDir + '?pagename=' + file)	
	return
for o, a in opts:
	if o == '-x' or o == '--export':
		putText(ticketFiles, localRepo, remoteHTMLDir)
# Start Selenium server on port 4444
#
def startSelenium():
	executeCommands(['java -jar selenium-server-1.0.1/selenium-server.jar -Dhttp.proxyHost=proxy.com -Dhttp.proxyPort=4444'])

for o, a in opts:
	if o == '-s' or o == '--selenium-start':
		(doInDir(localRepo, startSelenium))()
