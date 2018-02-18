# Map_Code
This document Describes class BotaniMap, this class is the half of the TreeComponent page that interracts with the HTML file that contains the map element. This class has two purposes:
 
 1. Initialize the map whenever the map page is opened by the user.
 
 2. Allow the user to view and observe available trees.
 
 3. Give the user hints as to where hidden trees may be located.
 
The most important dependancy this class has is the component of Geolocation, which has been imported from @ionic-native/geolocation
Other needed dependancies include AlertController, imported from ionic-angular/components/alert/alert-controller; and ToastController, imported from ionic-angular.

**The following are the main variables that the class BotaniMap uses to manipulate the game's map**

   -map.        this is the variable that holds the google map object.
   
   -mapBounds.  this is the variable that defines the boundaries of the playing field,
                  it contains two LatLng objects: one with the northeast corner of the playing field,
                  the other with the southwest corner of the playing field.
                  
   -areaCenter  this variable is the default center of the playing field.
   
   -userMark.   this variable is the marker that shows the user's location. 
   
   -locWatcher. this is an observable object that keeps track of the user's position whenever it changes.
   
   -tree_list.  this variable holds an aray that is dynamically allocated with all trees from the database.
   
**These functions do initial setup**
   
The class constructor initializes six objects of various types that will be used throughout the class. The constructor also initializes three variables: mapBounds, areaCenter, and tree_list (described above). The three functions below are used here to fill the tree_list array with Tree objects.

the function getTrees() uses a TreeFactory object (from the constructor) to obtain tree information from the database.

the function plantTrees() uses the raw data to create new objects of type Tree and put them into the tree_list array

the function wrapTrees() is called each time a new Tree object is put into the tree_list array. this function makes sure each tree in the list has the correct Decorator types assigned to it. Each decorator dictates the kinds of data that can be collected for the tree.

**These functions are called when the view containing the map element is ready**

the function mapSetup() is where map is initialized. 

   -First, the user's geolocation is obtained, this will be used to help determine the initial center of the map;
             if unsuccessful, a small alert message will be shown and the default center will be used.
             
   -Next, the map is initialized, centered and zoomed in to the correct location.

The function updateTreeMarks() takes each item in the tree array and gives it a small marker on the map. each tree marker is a custom image. Each tree also has a click event listener that triggers the openWindow() function. This function makes a bubble appear, showing the user information about the specific tree.

The function updateUserMark() takes the user's new location and updates the marker on the map. A marker will only be placed if the user is within the boundaries of the playing field.

the function createLocWatcher() initializes the locWatcher variable that polls for the user's geolocation.

**These functions help the user search for hidden trees and observe visible trees**

The function revealHidden() is called based on the change in the user's geolocation. It uses findTree() (described below) to obtain the hidden tree closest to the user (if any). 

   - If the user is within a small range from the tree (say 10 feet), they have found the tree and will get awarded points. 
             other users will be notified and the tree's hidden flag will change in the database. 
   - If the user is within a wide range of the tree (say, 60 feet), the user will get a toast message as a hint.

The function observeNearest() is also called based on the user's geolocation. It uses findTree() (described below) to obtain the visible tree closest to the user (if any).

   - If the user is within a small range from the tree (say, 10 feet), they are sent to the data collection page, where only info
                pertaining to that specific tree should be visible. 
   - If the user is not within range if the tree, they will be informed with a message.

The function findTree() takes a boolean flag which dictates what kind of tree to find (hidden or visible). This function searches for the tree of the correct visibility that is closest to userLoc. A successful search returns the index of the correct tree, an unsiccessful search returns undefined.

The function inProximity() takes an index pointing to a tree in tree_list and finds the distance the cooresponding tree is away from the user.

The function goToPage() sends the user to the data collection page. The data available for the user to colect will vary depending on the specific tree the user is near.

alertMessage() takes a number argument and displays a message to the user. If this function accepts 1, it will inform the user that they have located a hidden tree. If this function accepts 2, it will inform the user that they are not close enough to obsrve a tree.



/*
* TO INSTALL THE GEOLOCATION DO npm install @ionic-native/core --save npm install @ionic-native/geolocation --save ionic plugin add corodva-plugin-geolocation
*
*/
   
