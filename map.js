import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import 'rxjs/add/operator/filter';

declare var google;

@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})

export class BotaniMap {

    @ViewChild('map') mapElement: ElementRef;  //reference the html component names #map
    
    map: any;             //the map object
    mapBounds: any;       //the boundaries of the playing field
    areaCenter: any;      //the center of the playng field
    userMark: any;        //the marker that shows the users location
    locWatcher: any;      //variable that holds the promise that resolves the users location
    trees: any;
    
    /*
        the constructor initializes the center and boundaries of the playing field
    */
    constructor(public navCtrl: NavController, public geolocation: Geolocation){
        this.areaCenter = new google.maps.LatLng(47.002927, -120.537427);

        this.mapBounds = new google.maps.LatLngBounds(
                                new google.maps.LatLng(46.999761, -120.543179),
                                new google.maps.LatLng(47.010421, -120.531785)
                             );

        /*
        ///dummy array should be replaced; added dynamically from the trees in Luke's Database
        */
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        this.trees = [
           {
              name: "tree one",
              lat:  47.002799,
              lng:  -120.540351,
              visible: true,
              quest: true
           },
           {
              name: "tree two",
              lat:  47.005572,
              lng:  -120.540168, 
              visible: true,
              quest: false
           },
           {
              name: "tree three",
              lat:  47.003758,
              lng:  -120.542840,
              visible: true,
              quest: false
           },
           {
              name: "tree four",
              lat:  47.005016,
              lng:  -120.539600, 
              visible: true,
              quest: false
           },
           {
              name: "tree five",
              lat:  47.001153,
              lng:  -120.542925,
              visible: true,
              quest: false
           },
           {
              name: "tree six",
              lat:  47.003370,
              lng:  -120.539825,
              visible: true,
              quest: false
           },
           {
              name: "tree seven",
              lat:  47.003684,
              lng:  -120.535512,
              visible: true,
              quest: true
           },
           {
              name: "tree eight",
              lat:  47.005755, 
              lng:  -120.542958,
              visible: true,
              quest: false
           },
           {
              name: "tree nine",
              lat:  47.010071,
              lng:  -120.540812, 
              visible: true,
              quest: false
           }
        ];
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }

    /*
        the map itself won't be initialized until the view is ready
    */  
    ionViewDidLoad(){
        this.mapSetUp();
    }

    /*
        here is where the map object is initialized
        it is centered and zoomed in to an appropriate level and
        contained in the appropriate bounds
        and populated with all the markers
    */
    mapSetUp() {

      //here is where the phone's geolocation is first defined
      //there is also an error function just incase the setup was unsuccessful
      var userLoc = undefined;
      this.geolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: true}).then((position) => {
    
          userLoc = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          
      }).catch((error) =>{

                console.log('problem getting location', error);
                alert('code: ' + error.code +'\n'
                   + 'message: ' + error.message + '\n');
      });

      //here is where the map is initialized, if the user's geolocation is defined and within mapBounds, 
      //then it is the map's center, otherwise the default center is used
      let options = {
         center: (userLoc !== undefined && this.mapBounds.contains(userLoc)) ? userLoc : this.areaCenter,
         zoom: 17,
         mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.map = new google.maps.Map(document.getElementById("map"), options);

      //here is where the map is populated with all the markers
      this.updateUserMark(userLoc);
      this.updateTreeMarks();

      //give the map element a listener that performs keepInBounds whenever the user stops dragging the map
      this.map.addListener('dragend', function(){
          this.keepInBounds();
      });


      //here is where we set up a "position watcher" that should listen to a change in the user's location and update the user's
      //marker accordingly
      this.locWatcher = this.geolocation.watchPosition()
                        .filter((p) => p.coords !== undefined)  
                        .subscribe(position => {
                            let newUserLoc = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                            this.updateUserMark(newUserLoc);
                        });

    
    }

    /*
       this function defines images based on the icons in the assets/imgs folder
       then it populates the map with a series of tree markers, using the appropriate image
       tempMarker if it's a normal tree, questMarker if it's a quest based tree
    */
    updateTreeMarks(){
      console.log("updating tree markers");
        var image = {
            url: '../assets/imgs/tempMarker',
            size: new google.maps.Size(20, 20),
            origin: new google.maps.Point(0,0),
            anchor: new google.maps.Point(10, 10)
        };

        var questImage = {
            url: '../assets/imgs/questMarker',
            size: new google.maps.Size(20, 30),
            origin: new google.maps.Point(0,0),
            anchor: new google.maps.Point(10, 15)
        }

        for(let i=0; i < this.trees.length; i++){
            var nextTree = this.trees[i];

            var treeMark = new google.maps.Marker({
              position: {lat: nextTree.lat, lng: nextTree.lng},
              map: this.map,
              icon: (nextTree.quest = true) ? questImage : image,
            });
            
            //each marker has an event listener for when they are clicked on
            treeMark.addListener('click', function(){
                   this.openWindow(nextTree, treeMark);
            });
        }
    }

    /*
       this function  should be called whenever a tree marker is clicked,
       it opens a closeable window which should display info about the tree and the 
       option to submit data if the user is within range
    */
    openWindow(tree, treeMark){
         var cont = '<div id="treeInfo">'+
                            '<h2> ' + tree.name + '</h2>'+
                            '<p> species </p>'+
                            '<p> collect info </p>'+
                       '</div>';
         var wind = new google.maps.InfoWindow({
               content: cont
         }); 

         wind.open(this.map, treeMark);


    }

    /*
       this funtion updates the user's location marker
       but only if the user is within the bounds of the playing field
    */
    updateUserMark(userLoc){
        //get rid of preveous marker
        if(this.userMark) this.userMark.setMap(null);

        //test if the user's position is within the bounds and update with a new marker 
        //if it is
        if(userLoc !== undefined && this.mapBounds.contains(userLoc)){
            this.userMark = new google.maps.Marker({
                 position: userLoc.coord,
                 map: this.map,
            });

        }

    }

    /*
        this function is attached to the map's action listener
        it makes sure the map is within the bounds of the playing 
        field when the user quits dragging the map
    */
    keepInBounds(){
        //map is inside bounds, don't do anything
        if(this.mapBounds.contains(this.map.getCenter())){
            return;
        }

        //map is leaving the given bounds, put it back inside the bounds
        let cent   = this.map.getCenter();
        let xCent  = cent.lng();
        let yCent  = cent.lat();
        let xEast  = this.mapBounds.getNorthEast().lng();
        let yNorth = this.mapBounds.getNorthEast().lat();
        let xWest  = this.mapBounds.getSouthWest().lng();
        let ySouth = this.mapBounds.getSouthWest().lat();

        if(xCent > xEast) xCent = xEast;
        if(xCent < xWest) xCent = xWest;
        if(yCent > yNorth) yCent = yNorth;
        if(yCent < ySouth) yCent = ySouth;

        this.map.panTo(new google.maps.LatLng(yCent, xCent));
    }

   



} 