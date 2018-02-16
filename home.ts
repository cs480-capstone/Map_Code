import { Component, ViewChild, ElementRef } from '@angular/core';
//You may have to import some stuff
import { NavController, ToastController} from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Http } from '@angular/http';
import { TreeFactory } from '../../providers/treefactory';
import { CollectFlowers } from '../collect-flowers/collect-flowers';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

declare var google;

@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})

export class BotaniMap {

    @ViewChild('map') mapContainer: ElementRef;  //reference the html component names #map
    
    map: any;             //the map object
    mapBounds: any;       //the boundaries of the playing field
    areaCenter: any;      //the center of the playng field
    userLoc: any;
    userMark: any;        //the marker that shows the users location
    locWatcher: any;      //variable that holds the promise that resolves the users location
    tree_list : Tree[];
    
    /*
        the constructor initializes the center and boundaries of the playing field
    */
    constructor(public navCtrl: NavController, public geolocation: Geolocation, 
                public http: Http, private TreeFactory : TreeFactory, 
                private alertCtrl: AlertController, private toastCtrl: ToastController){
        this.areaCenter = new google.maps.LatLng(47.002927, -120.537427);

        this.mapBounds = new google.maps.LatLngBounds(
                                new google.maps.LatLng(46.999761, -120.543179),
                                new google.maps.LatLng(47.010421, -120.531785)
                             );
        this.tree_list = [];
        this.getTrees();

        
    }

    getTrees(){
        let saplings = this.TreeFactory.getTrees()
        this.plantTrees(saplings);
    }

    //planTrees loops through a list of saplings and turns them into trees
    plantTrees(saplings : sapling[]){
        //Loops through list
        for(let i = 0; i < saplings.length; i++)
        {
            //and pushes instanciated objects onto the tree_list
            this.tree_list.push(new Tree(saplings[i].lat,saplings[i].long, this.wrapTrees(saplings[i]), saplings[i].special, saplings[i].hidden));
        }
    }

    //This recursive method wraps the tree object in its decorator classes
    //The decorator list of each sapling is treated like a stack
    //The top element is popped off and used to create the 
    wrapTrees(target : sapling) : DecoratorTree  {   
        //Base case
        //Sets innermost decorator class's child to null
        if(target.decs.length === 0){
               return null;
        }
        //Recursive case 
        //Wrapping still reqruied 
        /*------NEW DECORATORS MUST BE ADDED TO THIS SWITCH------*/
        switch(target.decs.pop()){
                   case 'fl':
                       return new FallingTree(this.wrapTrees(target));
                   case 'fw':
                       return new FloweringTree(this.wrapTrees(target))
                   case 'fr':
                       return new FrutingTree(this.wrapTrees(target));
                   case 'pn':
                       return new PineConeTree(this.wrapTrees(target));
        }  
    }

    /*
        the map itself won't be initialized until the view is ready
    */  
    ionViewDidLoad(){
        this.mapSetUp();
        this.updateTreeMarks(this.tree_list);
        this.updateUserMark(this.userLoc);
        this.createLocWatcher();
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
        //var userLoc = undefined;
        this.geolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: true}).then((position) => {
      
            this.userLoc = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            
        }).catch((error) =>{
  
                  console.log('problem getting location', error);
                  alert('code: ' + error.code +'\n'
                     + 'message: ' + error.message + '\n');
                  this.userLoc = undefined;
        });
  
        //here is where the map is initialized, if the user's geolocation is defined and within mapBounds, 
        //then it is the map's center, otherwise the default center is used
        let options = {
           center: (this.userLoc !== undefined && this.mapBounds.contains(this.userLoc)) ? this.userLoc : this.areaCenter,
           zoom: 17,
           mapTypeId: google.maps.MapTypeId.ROADMAP
        }
  
        this.map = new google.maps.Map(document.getElementById("map"), options);
      
    }

    updateTreeMarks(trees){
        var image = {
            url: '../assets/icon/treemark',
            size: { width: 20, height: 20}
        };

        /*var questImage = {
            url: '../assets/imgs/questMarker',
            size: new google.maps.Size(20, 30),
            origin: new google.maps.Point(0,0),
            anchor: new google.maps.Point(10, 15)
        }*/

        for(let tree of trees){
            if(!tree.hidden){
                var loc = new google.maps.LatLng(tree.lat, tree.long);
                var treeMark = new google.maps.Marker({
                    position: loc,
                    //title: trees.name,
                    map: this.map
                    //icon: image
                });
        
                var cont = '<div id="treeInfo">'+
                '<h2> ' + tree.name +'</h2>'+
                '<p> species </p>'+
                '<button (click) = "goToPage()"> click to collect info </button>'+
                '</div>';

                var clickme = '<button (click) = "goToPage()"> click to collect info </button>';

                var window  = new google.maps.InfoWindow();
                
                //each marker has an event listener for when they are clicked on
                google.maps.event.addListener( treeMark, 'click', (function(treeMark, clickme, window){
                    return function(){
                        window.setContent(clickme);
                        window.open(this.map, treeMark);
                    };
                })(treeMark, clickme, window));
            }
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
                 position: userLoc.coord 
            });
            this.userMark.setMap(this.map);

        }

    }

    /*
        here is where we set up a "position watcher" that should listen to a change in the user's location and update the user's
        marker accordingly
    */
    createLocWatcher(){
        this.locWatcher = this.geolocation.watchPosition()
            .filter((p) => p.coords !== undefined)  
            .subscribe(position => {
                let newUserLoc = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                this.updateUserMark(newUserLoc);
                //this.revealHidden();
        });
    }

    /*
        here is where the the app checks if it needs to reveal a 
        nearby hidden tree
    */
    revealHidden(){
    
        let farProxim = 60;
    
        let nearProxim = 20;
    
        let closest = this.findTree(true);
    
        if(closest.tree !== undefined){
            let proxim = this.inProximity(closest);
            if(proxim <= nearProxim){
                this.alertMessage(1);
                var loc = new google.maps.LatLng(closest.tree.lat, closest.tree.long);
                var treeMark = new google.maps.Marker({
                    position: loc,
                    //title: trees.name,
                    map: this.map
                    //icon: image
                });
                //make the hidden value in the database false
                //notify everyone else that a tree has been found
            }else if(proxim <= farProxim){
                let toast = this.toastCtrl.create({
                    message:  'a hidden tree is ' + proxim + 'feet away',
                    duration: 4000,
                    position: 'middle',
                    dismissOnPageChange: true
                });
    
                toast.present();
            }
        }

    }

    /*
        this function, attached with an on click listener to
        a button in the HTML page, allows the user to observe the
        nearest tree, if possible
    */
    observeNearest(){
    
        let proxim = 20;
        
        let closest = this.findTree(false);
    
        if(closest.tree !== undefined && this.inProximity(closest) <= proxim){
            //this should be the part where we take the user to the data collection screen 
            //which is showing collection options based on the specific tree
            this.goToPage();
        }else{
            //this message is generic
            this.alertMessage(2);
        }
        
    }

    /*
        this function returns the tree closest to the user 
        if any, the flag parameter (true or false) tells us
        whether to look for a hidden tree or visible tree
    */
    findTree(hiddenFlag){
        let minLatDist = 100000;
        let minLngDist = 100000;
        let yDist;
        let xDist; 
        let targetTree;

        //find the closest visible tree from the list of trees
        for(let tree of this.tree_list){
            //the distance between the two latitudes
            yDist = (this.userLoc.lat() > tree.lat) 
                ? this.userLoc.lat() - tree.lat 
                : tree.lat - this.userLoc.lat();

            //the distance between the two longitudes
            xDist = (this.userLoc.lng() > tree.long)
                ? this.userLoc.lng() - tree.long
                : tree.long - this.userLoc.lng();
            
            //make this tree the closest if it appears closer
            if(yDist < minLatDist && 
               xDist < minLngDist && 
               tree.hidden === hiddenFlag){
                   targetTree = tree; 
                   minLatDist = yDist;
                   minLngDist = xDist; 
            }
                    
        }

        if(targetTree !== undefined){
            return {tree: targetTree, 
                    latDist: yDist,
                    lngDist: xDist};
        }else{
            return undefined;
        }


    }

    /*
        this function returns the distance a user is from a tree
    */
    inProximity(closest){
        let a = closest.latDist * closest.latDist;
        let b = closest.lngDist * closest.lngDist;
        let squaredDist = a+b;
    
        return Math.sqrt(squaredDist);
    }

    goToPage()
    {
        console.log("go");
        this.navCtrl.push(CollectFlowers);
    }

    alertMessage(num){

        let titleStr = (num === 1) ? 'New Tree Available' : 'Can\'t Collect Data';
        let subStr   = (num === 1) 
            ? 'A new Tree has been discovered, hurry and make some observations on it!'
            : 'You aren\'t within the range of any of the trees on the map';

        let alert = this.alertCtrl.create({
            title: titleStr,
            subTitle: subStr,
            buttons: ['OK']
        });

        alert.present();
    }

} 

//interface serves as a buffer between raw JSON and Tree objects
interface sapling
{
    lat : number,
    long : number,
    decs : string[],
    special : string[],
    hidden : boolean
}

export class Tree
{
    lat : number;
    long : number;
    child_tree : DecoratorTree  ;
    _special_events : string[];
    _number_of_events : number;
    hidden : boolean;

    constructor(lat : number, long : number, child_tree : DecoratorTree  , special_events : string[], hidden : boolean)
    {
        this.lat = lat;
        this.long = long;
        this.child_tree = child_tree; 
        this._special_events = special_events;
        this._number_of_events = special_events.length;
        this.hidden = hidden;
    }

    // Checks to see if collection is leagal
    public canCollect(curLat : number, curLong : number) : boolean 
    {
        // TODO get user location and test to see if in bounds
        return true;
    }

    // Reports any special events occuring on the tree
    public get special_events() : string[]
    {
        return this._special_events;
    }

    // Reports the number of events on a tree
    public get number_of_events() : number
    {
        return this._number_of_events;
    }
    
    // Calls the collect data method of the child tree
    // These calls will be repated all the way down until the lowest tree is found
    // Currently the methods just return strings reporting the kind of tree
    // Which the call was completed in
    public collectData() : string
    {
        return this.child_tree.collectData();
    }
}

// DecoratorTree objects are the child_trees of the concrete tree class
// There function is to call the specific collectData methods for each data point
export abstract class DecoratorTree  
{

    child_tree : DecoratorTree  ;

    constructor(child_tree : DecoratorTree)
    {
        this.child_tree = child_tree; 
    }

    public abstract collectData() : string;
    
}

/*------NEW DECORATORS MUST BE IMPLEMENTED TO EXTEND DECORATOR TREE------*/

export class FallingTree extends DecoratorTree  
{
    public collectData() : string
    {
        let data = 'I am  Falling tree\n';
        if(this.child_tree !== null)
        {
            data = data + ' ' + this.child_tree.collectData()
        }
        return data;
    }
}

export class FrutingTree extends DecoratorTree  
{

    public collectData() : string
    {
        let data = 'I am  Fruting tree\n';
        if(this.child_tree !== null)
        {
            data = data + ' ' + this.child_tree.collectData()
        }
        return data;
    }
}

export class FloweringTree extends DecoratorTree  
{

    public collectData() : string
    {
        let data = 'I am  Flowering tree\n';
        if(this.child_tree !== null)
        {
            data = data + ' ' + this.child_tree.collectData()
        }
        return data;
    }
    
}

export class PineConeTree extends DecoratorTree  
{

    public collectData() : string
    {
        let data = 'I am  Pine Cone tree\n';
        if(this.child_tree !== null)
        {
            data = data + ' ' + this.child_tree.collectData()
        }
        return data;
    }
}
