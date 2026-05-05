const socket = io();
socket.on("server:location:update", (data) => {
  const {id, latitude, longitude} = data;
  if(remoteMarkers.has(id)) {
    const currentMarker = remoteMarkers.get(id);
    currentMarker.setLatLng([latitude, longitude]);
  }
  else {
    const marker = L.marker([latitude, longitude]).addTo(map)
    
    marker.bindPopup(`<b>${id}</b>`).openPopup();
    remoteMarkers.set(id, marker)
  }
})

let map;
const remoteMarkers = new Map();
let currentLocationMarker = null;

function initializeMap() {
  map = L.map('map').setView([51.505, -0.09], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
}

function getUsersCurrentLocation()  {
  return new Promise((res, rej) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          res({"latitude": position.coords.latitude, "longitude": position.coords.longitude});
        },
        (error) => {
          rej(error);
        },
        {enableHighAccuracy: true}
      )
    }
    else {
      alert("No geolocation available in your browser.")
    }
  })    
}

// let fakeLat = 12.9716;   // Bangalore (or any start)
// let fakeLng = 77.5946;

// function getUsersCurrentLocation() {
//   return new Promise((res) => {
//     // simulate movement
//     fakeLat += 0.05;   // move north
//     fakeLng += 0.05;   // move east

//     res({
//       latitude: fakeLat,
//       longitude: fakeLng,
//     });
//   });
// }

async function main () {
  try {
    const userLocation = await getUsersCurrentLocation();

    // map.setView([userLocation.latitude, userLocation.longitude], 13);

    if(!currentLocationMarker) {
      currentLocationMarker = L.marker([userLocation.latitude, userLocation.longitude]).addTo(map)
    
      currentLocationMarker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
    }

    else {
      currentLocationMarker.setLatLng([userLocation.latitude, userLocation.longitude])
    }

    socket.emit("client:location:update", userLocation);
  }
  catch(err) {
    console.log("Unable to get location coordinates of user: ", {err});
  }
}

window.addEventListener("load", async() => {
  const response = await fetch("/me", {
    credentials: "include" 
  });
  if (!response.ok) {
      console.log("Some error occured.");
  }
  else {
    initializeMap();
    main();
    setInterval(main, 5 * 1000);
  }
})