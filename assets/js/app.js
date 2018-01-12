/************************
 * Initialize Datepicker
 **********************/

$( function() {
  $( "#datepicker" ).datepicker({
    changeMonth: true,
    changeYear: true
  });
} );

var windSpeed = '';
var humidity = '';
var temp = '';


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
  

  var infoWindow;
  
/*****************************
 * OPEN WEATHER API
 *****************************/
function getWeather(weatherZip, bucketTitle, streetAddress, completionDate, city, state, zip, bucketNotes) {
  
        // Querying the bandsintown api for the selected artist, the ?app_id parameter is required, but can equal anything
        var APIKey = "9235461f642781085893bb3ca24d0f8d";
        // Here we are building the URL we need to query the database
        var queryURL = "http://api.openweathermap.org/data/2.5/weather?" +
            "q=" + weatherZip + "&units=imperial&appid=" + APIKey;
        console.log(queryURL);
        // Here we run our AJAX call to the OpenWeatherMap API
        $.ajax({
                url: queryURL,
                method: "GET"
            })
            // We store all of the retrieved data inside of an object called "response"
            .done(function(response) {
  
                // Log the queryURL
                console.log(queryURL);
  
                // Log the resulting object
                console.log(response);
              
                // Log the data in the console as well
                console.log("weather description: " + response.weather[0].description);
                console.log("Wind Speed: " + response.wind.speed);
                console.log("Humidity: " + response.main.humidity);
                console.log("Temperature (F): " + response.main.temp);

                
                bucketsRef.push ({
                  bucketTitle: bucketTitle,
                  streetAddress: streetAddress,
                  completionDate: completionDate,
                  city: city,
                  state: state,
                  zip: zip,
                  bucketNotes: bucketNotes,
                  generalWeather: response.weather[0].description,
                  windSpeed: response.wind.speed,
                  humidity: response.main.humidity,
                  temp: response.main.temp,
                })
            });
  
}

/*****************************
 * ADD BUCKETS FROM FORM INPUT
 *****************************/

  $('body').on('click', '#submit', function(){
    event.preventDefault();
    var bucketTitle = $('#bucket-title').val().trim();
    var streetAddress = $('#street-address').val().trim();
    var completionDate =  $('#datepicker').datepicker({ dateFormat: 'dd-mm-yy' }).val();
    var city = $('#city').val().trim();
    var state = $('#state').val().trim();
    var zip = $('#zip').val().trim();
    var bucketNotes = $('#bucket-notes').val().trim();
    var weather = $("#zip").val().trim();
    var weatherZip = weather;

    // getWeather(weatherZip);

    getWeather(weatherZip, bucketTitle, streetAddress, completionDate, city, state, zip, bucketNotes);

    // clear out for values
    $('#bucket-title').val('');
    $('#datepicker').val('');
    $('#street-address').val('');
    $('#city').val('');
    $('#state').val('');
    $('#zip').val('');
    $('#bucket-notes').val('');
    
  });


codeAddress();


  

/*****************************
 * INITIALIZE MAP
 *****************************/
    var geocoder;
    var map;
    window.initMap = function() {
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
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          infoWindow.setPosition(pos);
          infoWindow.setContent('You Are Here!');
          infoWindow.open(map);
          map.setCenter(pos);
        }, function() {
          handleLocationError(true, infoWindow, map.getCenter());
        });
      } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
      }

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
        
        var totalAddress = newBucket.streetAddress + " " + newBucket.city + " " + newBucket.state + " " + newBucket.zip;
        console.log("totalAddress" + totalAddress);

        console.log(key);
        console.log("title: " + newBucket.bucketTitle);
        console.log("street address: " + newBucket.streetAddress);
        console.log("notes: " + newBucket.bucketNotes);
        // PRINT TO DOM
        var cardDiv = $('<div class="card border-info bucketCard">');
        var cardBodyDiv = $('<div class="card-body">');
        // Title
        var h3 = $('<h3>');
        var titleHolder = newBucket.bucketTitle;
        h3.append(titleHolder);
        // Completion Date
        var dateP = $('<p>');
        var dateHolder = "<strong>I will do this by</strong>: " + newBucket.completionDate;
        dateP.append(dateHolder);
        // Address
        var addressP = $('<p>');
        var addressHolder = "<strong>Address</strong>: " + totalAddress;
        addressP.append(addressHolder);
        // Notes
        var notesP = $('<p>');
        var notesHolder = "<strong>Notes</strong>: " + newBucket.bucketNotes;
        notesP.append(notesHolder);

        var weatherP = $('<p class="weather">');
        var weatherHolder = "<strong>Weather</strong>: " + newBucket.generalWeather + " / " + "Humidity: " + newBucket.humidity + " / " + "Temperature: " + newBucket.temp;
        weatherP.append(weatherHolder);
        //Delete Button
        var deleteButton = $('<button type="button" class="btn btn-warning">');
        deleteButton.text("Completed");
        deleteButton.attr('data-key', key);
        deleteButton.addClass('delete-btn');

        // //Edit Button
        // var editButton = $('<button type="button" class="btn btn-primary">');
        // editButton.text("edit");
        // // Add data to cards for editing
        // editButton.attr('data-key', key);
        // editButton.addClass('edit-btn');
        // editButton.attr('data-title', newBucket.bucketTitle);
        // editButton.attr('data-notes', newBucket.bucketNotes);
        // editButton.attr('data-toggle', "modal");
        // editButton.attr('data-target', "#editModal");

        // console.log("data-key: " + editButton.attr('data-key'))
        
        //append everything to cardbody
        cardBodyDiv.append(h3).append(dateP).append(addressP).append(notesP).append(weatherP).append(deleteButton);

        cardDiv.append(cardBodyDiv);

        $('#bucket-well').append(cardDiv);

    
      // ACTUAL GEOCODING FOR THE MAP
      
      geocoder.geocode( { 'address': totalAddress}, function(results, status) {
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
              var contentString = '<h4>' + newBucket.bucketTitle + '</h4>' + '<p>' + totalAddress + '</p>' + '<p>' + newBucket.bucketNotes + '</p>';
              
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


        /**********************************
         * EDIT BUTTON
         ***********************************/
        // $('body').on('click', '.edit-btn', function(){
        //   event.preventDefault();
        //   // assign from edit button
        //   var dataKey = $(this).attr('data-key');
        //   var bucketTitle = $(this).attr('data-title');
        //   var bucketNotes = $(this).attr('data-notes');
          
        //   $('#modal-submit').attr('data-title', bucketTitle);
        //   $('#modal-submit').attr('data-notes', bucketNotes);

        // });

         // SUBMITTING THE MODAL
    //    $('#modal-submit').on('click', function(){
    //     event.preventDefault();
 
    //     bucketTitle = $('#bucket-title').val().trim();
    //     // var address = $('#address').val().trim();
    //     bucketNotes = $('#bucket-notes').val().trim();
 
    //     $('#editModal').modal('hide');

    //     var dataKey = $(this).attr('data-key');
      

    //     $('#bucket-title').val('');
    //     $('#bucket-notes').val('');

 
                     
    //     firebase.database().ref(dataKey)
    //     .update({ 
    //         bucketTitle: bucketTitle,
    //         bucketNotes: bucketNotes
    //         });
  
    // });



   

    
        