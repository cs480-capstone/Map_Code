/*
        mapCtrl controller initializes the map and
        incorporates a listener that updates phone's geolocation
        incorporates a listener that makes sure the player doesn't 
        drag the map of the playing field
*/
function($scope, $stateParams, mapSrv){

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
    
        
};