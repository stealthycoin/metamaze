dryermaze
=========

Final Project for CMPS20

Getting Started:
----------------

clone the repository.

The game uses getImageData so it needs to be served through a webserver of some kind.

The simplest way to do this is with python because it comes with a built in web server.

Open a console and do the following:

```cd directory/of/game```

```python -m SimpleHTTPServer```

This will launch a webserver in the current directory.

Go to a web browser and nagivate to : ```localhost:8000```

How to Play:
------------

Using WASD, to solve the maze. You are the Dr. Yermaze, high on insane pills that make you see some crazy shit. Escape the maze by going to the stairs.

The arrow keys will also move the player.

```e``` will use whatever you are standing on, provided it is not activated by touch (like the pills).

Items:
Pills - increase your pill count meter (green). When this runs out your health will start droppin g pretty damn fast so grab all of the pills taht you can. It deprecates over time.

Teleporters - you cannot solve the maze and find the exit stairs without taking the teleporter in the first half of the level.

Dollars - makes a pretty noise but does nothing for now.

Music - Pressing `E` on this starts the music ona random awesomely epic song.

Bug - Will damage you or take away one shields worth of shield.

Shield - gives you some armor bro.

Eyeball - Will give you +1 range of vision, this resets on each level, but makes it mremarkably easier to find your way around.

Stairs - your exit to the next level, press `E` to use.
