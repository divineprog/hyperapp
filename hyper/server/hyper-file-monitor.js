/*
File: hyper-file-monitor.js
Description: Filemonitoring functionality
Author: Mikael Kindborg

License:

Copyright (c) 2013-2015 Mikael Kindborg

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/*** Modules used ***/

var FS = require('fs')

/*** File traversal variables ***/

var mLastReloadTime = Date.now()
var mTraverseNumDirecoryLevels = 0
var mFileCounter = 0
var mNumberOfMonitoredFiles = 0

/*** File traversal functions ***/

/**
 * External.
 */
function setTraverseNumDirectoryLevels(levels)
{
	mTraverseNumDirecoryLevels = levels
}

/**
 * External.
 */
function getNumberOfMonitoredFiles()
{
	return mNumberOfMonitoredFiles
}

/**
 * External.
 */
function fileSystemMonitor(fileSystemChangedCallback)
{
	mFileCounter = 0
	var filesUpdated = fileSystemMonitorWorker(
		mBasePath,
		mTraverseNumDirecoryLevels)
	if (filesUpdated)
	{
		fileSystemChangedCallback()
		setTimeout(fileSystemMonitor, 1000)
	}
	else
	{
		mNumberOfMonitoredFiles = mFileCounter
		setTimeout(fileSystemMonitor, 500)
	}
}

/**
 * Internal.
 * Return true if a file ahs been updated, otherwise false.
 */
function fileSystemMonitorWorker(path, level)
{
	if (!path) { return false }
	try
	{
		/*var files = FS.readdirSync(path)
		for (var i in files)
		{
			console.log(path + files[i])
		}
		return false*/

		var files = FS.readdirSync(path)
		for (var i in files)
		{
			try
			{
				var stat = FS.statSync(path + files[i])
				var t = stat.mtime.getTime()

				if (stat.isFile())
				{
					++mFileCounter
				}

				//console.log('Checking file: ' + files[i] + ': ' + stat.mtime)
				if (stat.isFile() && t > mLastReloadTime)
				{
					//console.log('***** File has changed ***** ' + files[i])
					mLastReloadTime = Date.now()
					return true
				}
				else if (stat.isDirectory() && level > 0)
				{
					//console.log('Decending into: ' + path + files[i])
					var changed = fileSystemMonitorWorker(
						path + files[i] + '/',
						level - 1)
					if (changed) { return true }
				}
			}
			catch (err2)
			{
				console.log('ERROR in fileSystemMonitorWorker inner loop: ' + err2)
			}
		}
	}
	catch(err1)
	{
		console.log('ERROR in fileSystemMonitorWorker: ' + err1)
	}
	return false
}

/*** Module exports ***/

exports.setTraverseNumDirectoryLevels = setTraverseNumDirectoryLevels
exports.getNumberOfMonitoredFiles = getNumberOfMonitoredFiles
exports.fileSystemMonitor = fileSystemMonitor
