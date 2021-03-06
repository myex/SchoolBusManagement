(function(){
    angular
        .module("myApp")
        .controller("geofenceRegistrationController",geofenceRegistrationController);

    geofenceRegistrationController.$inject=[
        '$scope',
        '$window',
        'geofenceRegistrationService',
        'leafletDrawEvents'
    ];
    function geofenceRegistrationController($scope,$window,geofenceRegistrationService,leafletDrawEvents){

        var map,shape;
       var circle={
            radius:'',
            lat:'',
            log:''

        };
        var layer=null;
        var geoType;
        var polygon=[];
        $scope.geofence={
            id:'',
            name:'',
            description:'',
            area:''
        };
        $scope.geofences=[];
        $scope.isEdit=false;

        $scope.showSelectable = function (value) {

            if(value == 'geofence'){
                return 'selected';
            }

        };

        $scope.showSettings = function (value) {

            return true;

        };
        
        $scope.postGeofencData=function(){


            if(geoType=='CIRCLE')
            {
                $scope.geofence={
                    name:$scope.geofence.name,
                    desc:$scope.geofence.description,
                    userId:'',
                    area:geoType+' ('+circle.lat+' '+circle.log+', '+circle.radius+')'
                };
            }
            else if(geoType=='POLYGON'){

                var arryLatLng="";
                for(i=0;i<polygon.latlng[0].length;i++){
                    arryLatLng+=polygon.latlng[0][i].lat+' '+polygon.latlng[0][i].lng+', ';
                }
                console.log(arryLatLng);
                arryLatLng=arryLatLng.substring(0, arryLatLng.length - 2);
                $scope.geofence={
                    name:$scope.geofence.name,
                    desc:$scope.geofence.description,
                    userId:'',
                    area:geoType+'(('+arryLatLng+'))'
                };
            }

            console.log( $scope.geofence);

            if($scope.geofence.area==''){
                alert('please select valid geofence');
                return;
            }


            geofenceRegistrationService.postGeofenceData($scope.geofence).then(function(result){
                alert("success fully saved");
                getGeofences();
            },function(err){
                alert("error");
            });

            $scope.newGeofence();

        };

       var getGeofences=function(){
            geofenceRegistrationService.getGeofences().then(function(result){
                console.log(result.data);
                $scope.geofences=result.data;
            },function(err){
                console.log('error');
            });

        };

        $scope.delete=function(data){

            geofenceRegistrationService.deleteGeofence(data.id).then(function(result){
                getGeofences();
            },function(err){
                console.log('error');
            });

        };

        $scope.edit=function(id){


            if(layer!=null || layer=='data' ){

                if(layer=='data'){
                    map.removeLayer(shape);
                }
                else {
                    drawnItems.removeLayer(layer);
                    map.removeLayer(layer)
                }

            }

            $scope.isEdit=true;
            $scope.geofence=$scope.geofences[id];
            parseArea($scope.geofence.area);
            layer='data';

        };


        parseArea=function(area){

            var areaCircle=null,areaPolygon=null,areaType;
            areaCircle=area.indexOf("CIRCLE");
            areaPolygon=area.indexOf("POLYGON");

            if(areaCircle > -1){
                areaType='CIRCLE';
                var openBr=area.indexOf("(");

                var latlong=area.substring(openBr+1,area.length-1).split(' ');
                var lat=latlong[0];
                var lng=latlong[1].substring(0, latlong[1].length - 1);
                var rad=latlong[2];

                shape=L.circle([lat,lng], Number(rad)).addTo(map);
                map.panTo(new L.LatLng(lat,lng));

            }

            else if(areaPolygon > -1 ){
                areaType='POLYGON';
                var arrayLatLong=[];

                var openBr=area.indexOf("((");

                var latlongs=area.substring(openBr+2,area.length-2).split(', ');

                console.log(latlongs);
                for(i=0;i<latlongs.length;i++){
                    var latlong=latlongs[i].substring(0,area.length).split(' ');
                    console.log(i+" "+latlong[0]);
                    arrayLatLong.push(new L.LatLng(latlong[0],latlong[1]));
                }

                var polygonPoints = [arrayLatLong];


                shape = new L.Polygon(polygonPoints).addTo(map);
                map.panTo(new L.LatLng(latlong[0],latlong[1]));

            }

        };

        $scope.newGeofence=function(){
            $scope.geofence={};
            if(layer=='data'){
                map.removeLayer(shape);
            }
            else {
                drawnItems.removeLayer(layer);
                map.removeLayer(layer)
            }

            $scope.isEdit=false;
        };
        $scope.update=function(){



            if(geoType=='CIRCLE')
            {

                $scope.geofence.area=geoType+' ('+circle.lat+' '+circle.log+', '+circle.radius+')';
                console.log($scope.geofence);
            }
            else if(geoType=='POLYGON'){
                var arryLatLng="";
                for(i=0;i<polygon.latlng[0].length;i++){
                    arryLatLng+=polygon.latlng[0][i].lat+' '+polygon.latlng[0][i].lng+', ';
                }
                console.log(arryLatLng);
                arryLatLng=arryLatLng.substring(0, arryLatLng.length - 2);

                $scope.geofence.area=geoType+'(('+arryLatLng+'))';

            }

            if($scope.geofence.area==''){
                alert('please select valid geofence');
                return;
            }

            geofenceRegistrationService.updateGofence($scope.geofence).then(function(result){

                alert("Updated Succesfully..");
                getGeofences();
            },function(err){
                console.log('error');
            });

            $scope.newGeofence();
        };

        map = L.map('map', {
            center: [11.0168, 76.9558],
            zoom: 13
        });

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap2525</a> contributors'
            }).addTo(map);

        var drawnItems = new L.FeatureGroup();
        var drawControl = new L.Control.Draw({

            position: 'topright',
            draw: {
                                polyline:false,
                                polygon:{
                                    shapeOptions: {
                                        color: '#f357a1',
                                        weight: 1
                                    }
                                },
                                circle: {
                                    showArea: true,
                                    metric: false,
                                    shapeOptions: {
                                        color: '#662d91'
                                    }
                                },
                                rectangle:false,
                                marker: false
                            }


        });


        map.addControl(drawControl);
        map.addLayer(drawnItems);

        map.on('draw:created', function (e) {

            if(layer!=null || layer=='data' ){

                if(layer=='data'){
                    map.removeLayer(shape);
                }
                else {
                    drawnItems.removeLayer(layer);
                    map.removeLayer(layer)
                }

            }



            var type = e.layerType;
                layer = e.layer;
            layer.addTo(map);
            geoType='';

            if(type=="circle") {
                circle.radius=layer.getRadius();
                circle.lat=layer.getLatLng().lat;
                circle.log=layer.getLatLng().lng;

                geoType='CIRCLE';
            }

            else if(type=='polygon'){



                polygon.latlng=layer.getLatLngs();
                geoType='POLYGON';


            }


        });


        getGeofences();

    }
})();

