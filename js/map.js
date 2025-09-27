// Map functionality using Leaflet.js
let map = null;

// Initialize the map
function initMap() {
    if (map) {
        map.remove();
    }
    
    map = L.map('map').setView([tideData.location.lat, tideData.location.lng], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add a marker for the coast location
    L.marker([tideData.location.lat, tideData.location.lng])
        .addTo(map)
        .bindPopup(tideData.location.name)
        .openPopup();
        
    // Add a circle to represent the user's location
    L.circle([userLocation.lat, userLocation.lng], {
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.2,
        radius: 500
    }).addTo(map).bindPopup('Your Location');
}