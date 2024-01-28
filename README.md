This is a part of the I Am Bored series of repositories where I do some simple rudamentory projects for fun or distraction.
They usually consist of me exploring some system/algorithm that I am interested in learning

All of the code is free to use in accord to the GNU license

# What does this project do?
This project is related to a simple Record-Replay system that I call "Fate" which is a reference to "Jojo's Bizzare Adventure", which allows me to record and then replay actions of all "destined objects", like movement, locations and other properties
There are 2 modes - first one is record mode where every object follows normal physics and collisions and records TPS times the frame/snapshot. When the list of snapshots is too long (records more than 30 seconds of snapshots) it deletes the oldest snapshots
The second mode is where all physics and pre-determined functions are turned off for all "destined objects" and they load their location from the snapshot that is currently loaded. You can control in what direction and how fast to replay those snapshots via timeDelta
Since the TPS value usually is quite low I lerp between the recorded frame's positions to make a less laggy and more seamless result
When encountering an undefined or invalid frame the program automatically stops the replay mode and returns back to record

# What can I do with this system
You can:
- Stop time
- Reverse time
- Time-travel
- Reverse or stop time for individual objects (needs additional implementation)
- Multiplayer time manipulation (requires additional implementation via a global and local fate so that it has Area of Effect instead of a global effect)
- Save-load systems (though it won't save data for very long)
