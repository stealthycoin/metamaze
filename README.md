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

Using WASD, to solve the maze. You always start in the top left corner of the screen, and your goal is to go to the bottom right corner. You are the Dr. Yermaze, high on insane pills that make you see some crazy shit. Escape the maze by going to the stairs.

The arrow keys will also move the player.

```e``` will use whatever you are standing on, provided it is not activated by touch (like the stairs).

Teleporters are currently the only interactable object, stand on one and press e to go to the like-colored one.
