# Map_Code
This document talks about the class BotaniMap, this class is meant to interract with the html file that contains the map, and will serve two purposes
 
 1. initialize the map whenever it is opened by the user.
 
 2. allow the user to interract with the tree markers and move the map within the playing field boundaries.
 
The most important dependancy this class has in on the component of Geolocation, which has been imported from @ionic-native/geolocation

The following are the main variables that the class BotaniMap uses to manipulate the game's map

   -map.        this is the variable that holds the google map object.
   
   -mapBounds.  this is the variable that defines the boundaries of the playing field,
                  it contains two LatLng objects: one with the northeast corner of the playing field,
                  the other with the southwest corner of the playing field.
                  
   -areaCenter  this variable is the default center of the playing field.
   
   -userMark.   this variable is the marker that shows the user's location.
   
   -locWatcher. this is an observable object that keeps track of the user's position whenever it changes.
   
   -trees.      this variable holds an aray that is dynamically allocated with visible trees from the database.
   
The class constructor initializes an object geolocation of type Geolocation that will be used throughout the class. The constructor also initializes three variables: mapBounds, areaCenter, and trees. trees must be initialized by pulling visible trees from the database.

the function mapSetup() is where map is initialized. 

   -First, the user's geolocation is obtained, this will be used to help determine the initial center of the map;
             if unsuccessful, a small alert message will be shown and the default center will be used.
             
   -Next, the map is initialized, centered and zoomed in to the correct location
     
   -Two functions should then be called to populate the map with markers, these functions are described below.
     
   -locWatcher variable is then initialized.
     
   -Finally, the map gets an event listener that executes the keepInBounds function everytime the map is dragged.

The function updateTreeMarks() takes each item in the tree array and gives it a small marker on the map. each tree marker is a custom image, indicating normal trees and trees tied to events/quests. 

Each tree marker will have a click event attatched to the openWindow() function, which shows an information window about the marker's tree

The function updateUserMark() takes the user's new location and updates the marker on the map. A marker will only be placed if the user is within the boundaries of the playing field

The function keepInBounds() makes sure the center of the map is within mapBounds everytime the user finshes dragging the map

/*
* TO INSTALL THE GEOLOCATION DO npm install @ionic-native/core --save npm install @ionic-native/geolocation --save ionic plugin add corodva-plugin-geolocation
*
*/
   
