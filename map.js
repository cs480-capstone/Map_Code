
//app uses cordova plugin geolocation as a dependancy: https://github.com/apache/cordova-plugin-geolocation.git
var appMap = angular.module('botaniMap', ['geolocation']);

    /*
        mapSrv service contains the information the controller 
        needs to set up the state of the map
    */
    appMap.service('mapSrv', function(){
        /*
        ///dummy array should be replaced; added dynamically from the trees in Luke's Database
        */
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        var trees = [
        	["tree one", 47.002799, -120.540351, true],
        	["tree two", 47.005572, -120.540168, true],
        	["tree three", 47.003758, -120.542840, true],
        	["tree four", 47.005016, -120.539600, true],
        	["tree five", 47.001153, -120.542925, true],
        	["tree six", 47.003370, -120.539825, true],
        	["tree seven", 47.003684, -120.535512, true],
        	["tree eight", 47.005755, -120.542958, true],
        	["tree nine", 47.010071, -120.540812, true]
        ];

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //here is where the phone's geolocation is set on the map/////////////////////////////////////////////
        //there is also an error function just incase the update was unsuccessful
        this.updateUsrLoc = function(position){
              if(this.userLoc) this.userLoc.setMap(null);

              this.userLoc = new google.maps.Marker({
                 map: this.map,
                 position: position.coord
              });
    
        };

        this.posNotFound = function(error){
            alert('code: ' + error.code +'\n'
                   + 'message: ' + error.message + '\n');
        };
        //////////////////////////////////////////////////////////////////////////////////////////////////////////


        //here is where the tree markers are dynamically populating the map
        this.setTreeMarkers = function(){

        	//define an image for the markers 
        	var image = {
        		url: 'http://moziru.com/images/drawn-grass-transparent-17.png',
        		size: new google.maps.Size(20, 30),
        		origin: new google.maps.Point(0,0),
        		anchor: new google.maps.Point(10, 15)
        	};

        	for(var i=0; i < trees.length; i++){
        		var nextTree = trees[i];

        		var treeMark = new google.maps.Marker({
        			position: {lat: nextTree[1], lng: nextTree[2]},
        			map: this.map,
        			icon: image,
        			title: nextTree[0]
        		});

        		treeMark.setVisible(nextTree[3]);
        	}
        };

        //here is where the map object is created
        //it is centered and zoomed in to an appropriate level and
        //contained in the appropriate bounds
        //and populated with all the markers
        this.initialize = function(){
            var options = {
                center: new google.maps.LatLng(47.002927, -120.537427);
                zoom: 14;
            }
            
            this.map = new google.maps.Map(
                document.getElementById('map'), options
            );

            this.bounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(46.999761, -120.543179),
                new google.maps.LatLng(47.010421, -120.531785)
            );

            setTreeMarkers();

            //set up phones initial geolocation
            navigator.geolocation.getCurrentPosition(updateUsrLoc, locNotFond, {enableHighAccuracy: true});

            return map;
        };

    });




    /*
        mapCtrl controller initializes the map and
        incorporates a listener that updates phone's geolocation
        incorporates a listener that makes sure the player doesn't 
        drag the map of the playing field

     */
    appMap.controller('mapCtrl', ['$scope', 'mapSrv', function($scope, mapSrv){

        $scope.thisMap = mapSrv.initialize();


        //this object listens for a change in phone's location and updates everytime change happens
        $scope.watchID = navigator.geolocation.watchPosition(mapSrv.updateUsrLoc, mapSrv.locNotFound, {timeout: 30000, enableHighAccuracy: true});
        

        ///an event listener makes sure the map isn't dragged out of bounds//////////////////////////////////////////////////////////////
        thisMap.addListener('dragend', function(){

            //map is inside bounds, don't do anything
            if(mapSrv.bounds.contains(thisMap.getCenter())){
                return;
            }

            //map is leaving the given bounds, put it back inside the bounds
            var cent  = thisMap.getCenter();
            var xCent = cent.lng();
            var yCent = cent.lat();
            var xEast  = mapSrv.bounds.getNorthEast().lng();
            var yNorth = mapSrv.bounds.getNorthEast().lat();
            var xWest  = mapSrv.bounds.getSouthWest().lng();
            var ySouth = mapSrv.bounds.getSouthWest().lat();

            if(xCent > xEast) xCent = xEast;
            if(xCent < xWest) xCent = xWest;
            if(yCent > yNorth) yCent = yNorth;
            if(yCent < ySouth) yCent = ySouth;

            thisMap.setCenter(new google.maps.LatLng(yCent, xCent));
            
        });
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
        
    }]);