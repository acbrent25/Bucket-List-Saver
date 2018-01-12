

/**********************
 * Initialize Firebase
 **********************/
  var config = {
    apiKey: "AIzaSyAMK5NWVtPyY4uMaXtJPqPtRhqybiAZrP4",
    authDomain: "rumination-bfcaf.firebaseapp.com",
    databaseURL: "https://rumination-bfcaf.firebaseio.com",
    projectId: "rumination-bfcaf",
    storageBucket: "rumination-bfcaf.appspot.com",
    messagingSenderId: "644327680107"
  };
  firebase.initializeApp(config);
  var database = firebase.database();
  var ref = firebase.database().ref();
  var bucketsRef = ref.child('buckets/');
  var statesRef = firebase.database().ref("states");;

  var infoWindow;
  var statesAddress = '';


/*****************************
 * SET UP STATES
 *****************************/
  var states =[
        {
        state: "AZ",
        dish: "Red chile chimichanga",
        restaurant: [
          { name: "El Norteno", address: "1002 7th Ave, Phoenix, AZ 85007" },
          { name: "Mixteca Mexican Food",address: "6731 W Bell Rd, Glendale, AZ 85308" },
          { name: "Oaxaca Restaurant",address: "321 N State Rte 89A, Sedona, AZ 86336"}
        ],
        value: 50,
        description: "Whether Arizona’s claim of inventing the chimichanga is irrelevant: the act of dunking a burrito in a deep-fryer is an act of American ingenuity akin to putting hot dogs on a stick, and Arizona makes them better than anyone.",
        },

        
  ]

// this works somewhat
  // for (var prop in states) {
  //   console.log(states[prop]);
  //   console.log(states.state);

  //   for (keys of states) {
  //     console.log(keys.state);
  //     console.log(keys.restaurant);
    
  //   }
  // }

  for (var i = 0; i < states.length; i++)
  {
    var state = String(states[i].state);
    console.log("state: " + state);
  
      var dish = states[i].dish;
      console.log("dish: " + dish);
      var restaurant = states[i].restaurant;
      console.log("restaurant: " + restaurant);

      for (var j = 0; j < restaurant.length; j++)
      {
          var name = restaurant[j].name;
          console.log("name: " + restaurant[j].name);
          console.log("address: " + restaurant[j].address);
      }
  }


/*****************************
 * SET STATES IN DATABASE
 *****************************/


  statesRef.set ({
    state: state,
    dish: dish,
    restaurant: restaurant,
  })

/*****************************
 * ADD BUCKETS FROM FORM INPUT
 *****************************/

  $('body').on('click', '#submit', function(){
    event.preventDefault();
    var bucketTitle = $('#bucket-title').val().trim();
    var address = $('#address').val().trim();
    var bucketNotes = $('#bucket-notes').val().trim();
    
    bucketsRef.push ({
      bucketTitle: bucketTitle,
      address: address,
      bucketNotes: bucketNotes,
    })
    
    // clear out for values
    $('#bucket-title').val('');
    $('#address').val('');
    $('#bucket-notes').val('');

  });


codeAddress();
codeAddressStates();
  

/*****************************
 * INITIALIZE MAP
 *****************************/
    var geocoder;
    var map;
    function initMap() {
      geocoder = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng(-34.397, 150.644);
      var mapOptions = {
        zoom: 8,
        center: latlng
      }
      map = new google.maps.Map(document.getElementById('map'), mapOptions);

/*****************************
 *  GEO LOCATE USER
 *****************************/
      infoWindow = new google.maps.InfoWindow;
      // if (navigator.geolocation) {
      //   navigator.geolocation.getCurrentPosition(function(position) {
      //     var pos = {
      //       lat: position.coords.latitude,
      //       lng: position.coords.longitude
      //     };

      //     infoWindow.setPosition(pos);
      //     infoWindow.setContent('You Are Here!');
      //     infoWindow.open(map);
      //     map.setCenter(pos);
      //   }, function() {
      //     handleLocationError(true, infoWindow, map.getCenter());
      //   });
      // } else {
      //   // Browser doesn't support Geolocation
      //   handleLocationError(false, infoWindow, map.getCenter());
      // }

    }// initialize map


    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
      infoWindow.open(map);
    

    }



 /**********************************
 * GEO CODE ADDRESSES FROM FIREBASE
 ***********************************/   
    
    function codeAddress() {
      // GET FIREBASE DATA
      bucketsRef.on("child_added", function(snapshot) {
        var newBucket = snapshot.val();
        var key = snapshot.key;
        
        

        console.log(key);
        console.log("title: " + newBucket.bucketTitle);
        console.log("address: " + newBucket.address);
        console.log("notes: " + newBucket.bucketNotes);
        // PRINT TO DOM
        var cardDiv = $('<div class="card border-info bucketCard">');
        var cardBodyDiv = $('<div class="card-body">');
        // Title
        var h3 = $('<h3>');
        var titleHolder = newBucket.bucketTitle;
        h3.append(titleHolder);
        // Address
        var addressP = $('<p>');
        var addressHolder = newBucket.address;
        addressP.append(addressHolder);
        // Notes
        var notesP = $('<p>');
        var notesHolder = newBucket.bucketNotes;
        notesP.append(notesHolder);
        //Delete Button
        var deleteButton = $('<button type="button" class="btn btn-warning">');
        deleteButton.text("Delete");
        deleteButton.attr('data-key', key);
        deleteButton.addClass('delete-btn');

        console.log("data-key: " + deleteButton.attr('data-key'))
        

        cardBodyDiv.append(h3).append(addressP).append(notesP).append(deleteButton);

        cardDiv.append(cardBodyDiv);

        $('#bucket-well').append(cardDiv);

    
      // ACTUAL GEOCODING FOR THE MAP
      var address = newBucket.address;
      geocoder.geocode( { 'address': newBucket.address}, function(results, status) {
        if (status == 'OK') {
          map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location,
              // marker animation
              animation: google.maps.Animation.DROP
          });
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
              // ADD INFO TO MAP MARKERS
              var contentString = '<h4>' + newBucket.bucketTitle + '</h4>' + '<p>' + newBucket.address + '</p>' + '<p>' + newBucket.bucketNotes + '</p>';
              
              var infowindow = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 350
              });
              
              
              marker.addListener('click', function() {
                infowindow.open(map, marker);
              });
      });
    }, function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
    });
    }

 /**********************************
 * GEO CODE ADDRESSES FROM STATES
 ***********************************/ 
    
    function codeAddressStates() {
      // GET FIREBASE DATA
      statesRef.on("child_added", function(snapshot) {
        // var key = snapshot.key;
        console.log('snapshot: ' + snapshot.val());
        var stateData = snapshot.val();

        console.log(stateData.description);
        
        for (var k =0; k<stateData.length; k++){
          var restAddress = stateData[k].address;
          console.log("Firebase Restaurant Address: " + restAddress );
          console.log("Firebase Restaurant Name: " + stateData[k].name);
        }
        
        
        

      


    
        // console.log("address: " + newBucket.address);
        // console.log("notes: " + newBucket.bucketNotes);
        // PRINT TO DOM
        // var cardDiv = $('<div class="card border-info bucketCard">');
        // var cardBodyDiv = $('<div class="card-body">');
        // // Title
        // var h3 = $('<h3>');
        // var titleHolder = newBucket.bucketTitle;
        // h3.append(titleHolder);
        // // Address
        // var addressP = $('<p>');
        // var addressHolder = newBucket.address;
        // addressP.append(addressHolder);
        // // Notes
        // var notesP = $('<p>');
        // var notesHolder = newBucket.bucketNotes;
        // notesP.append(notesHolder);
        // //Delete Button
        // var deleteButton = $('<button type="button" class="btn btn-warning">');
        // deleteButton.text("Delete");
        // deleteButton.attr('data-key', key);
        // deleteButton.addClass('delete-btn');

        // console.log("data-key: " + deleteButton.attr('data-key'))
        

        // cardBodyDiv.append(h3).append(addressP).append(notesP).append(deleteButton);

        // cardDiv.append(cardBodyDiv);

        // $('#bucket-well').append(cardDiv);

    
      // ACTUAL GEOCODING FOR THE MAP
      var stateAddress = stateData[k].address;
      console.log("state Address: " + stateData[k].address);
      geocoder.geocode( { 'address': stateData[k].address}, function(results, status) {
        if (status == 'OK') {
          map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location,
              // marker animation
              animation: google.maps.Animation.DROP
          });
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
              // ADD INFO TO MAP MARKERS
              var contentString = '<h4>' + "" + '</h4>' + '<p>' + stateData[k].address + '</p>' + '<p>' + "newBucket.bucketNotes" + '</p>';
              
              var infowindow = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 350
              });
              
              
              marker.addListener('click', function() {
                infowindow.open(map, marker);
              });
      });
    }, function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
    });
    }




        /**********************************
         * DELETE BUTTON
         ***********************************/  
        $('body').on('click', '.delete-btn', function(){
          var dataKey = $(this).attr('data-key');
          console.log('dataKey: ' + dataKey);
          database.ref("buckets/" + dataKey).remove();
          $(this).parent().parent().remove();
          // codeAddress();
        });




   

    
        