
//app uses git://github.com/arunisrael/angularjs-geolocation.git mudule as a dependancy
var appMap = angular.module('botaniMap', ['geolocation']);

    /*
        coordFinder factory provides the service with a means of finding 
        the phone's geolocation, the q service is used because it should be an
        asynchronous function
    */
    appMap.factory('coordFinder', ['$q', function($q, geolocation){
        var def = $q.defer();

        var coords = geolocation.getLocation().then(function(data){
                                                        return {
                                                            lat: data.coords.latitude,
                                                            lng: data.coords.longitude
                                                        }
                                                    });

        def.resolve(coords);

        return def.promise;
    }]);




    /*
        mapSrv service contains the information the controller 
        needs to set up the state of the map
    */
    appMap.service('mapSrv', function(){
        /*
        ///these should be added dynamically from the trees in Luke's Database
        */
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        val trees = [
        	["tree one", 47.002799, -120.540351, true],
        	["tree two", 47.005572, -120.540168, true],
        	["tree three", 47.003758, -120.542840, true],
        	["tree four", 47.005016, -120.539600, true],
        	["tree five", 47.001153, -120.542925, true],
        	["tree six", 47.003370, -120.539825, true],
        	["tree seven", 47.003684, -120.535512, true],
        	["tree eight", 47.005755, -120.542958, true],
        	["tree nine", 47.010071, -120.540812, true],
        ];

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //here is where the tree markers are dynamically populating the map
        this.setMarkers = function(map){

        	//define an image for the markers 
        	var image {
        		url: 'http://moziru.com/images/drawn-grass-transparent-17.png',
        		size: new google.maps.Size(20, 30),
        		origin: new google.maps.Point(0,0),
        		anchor: new google.maps.Point(10, 15), 
        	}

        	for(var i=0; i < trees.length; i++){
        		var nextTree = trees[i];

        		var treeMark = new google.maps.Marker({
        			position: {lat: nextTree[1], lng: nextTree[2]},
        			map: map,
        			icon: image,
        			title: nextTree[0]
        		});

        		treeMark.setVisible(nextTree[3]);
        	}
        }

        //here is where the map object is created
        //it is centered and zoomed in to an appropriate level and
        //contained in the appropriate bounds
        //and populated with tree markers
        this.initialize = function(){
            var options = {
                center: new google.maps.LatLng(47.002927, -120.537427);
                zoom: 14;
            }
            
            this.map = new google.maps.Map(
                document.getElementById('map'), options
            );

            //this.bounds = new google.maps.latl

            setMarkers(map);
        }

    });




    /*
        mapCtrl controller initializes the map and
        incorporates a listener that makes sure the player doesn't 
        go out of the playing field

     */
    appMap.controller('mapCtrl', ['$scope', 'mapSrv', 'coordFinder', function($scope, mapSrv, coordFinder){

        mapSrv.initialize();

        ///an event listener makes sure the map isn't dragged out of bounds



        ///////////////////////////////////////////////////////////////////
        

        


        
    }]);