// Global variables
let userLocation = null;
let tideData = null;
let moonData = null;
let favorites = JSON.parse(localStorage.getItem('tideTrackerFavorites')) || [];

// DOM elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMessageEl = document.getElementById('errorMessage');
const contentEl = document.getElementById('content');
const coastNameEl = document.getElementById('coastName');
const coordinatesEl = document.getElementById('coordinates');
const currentTimeEl = document.getElementById('currentTime');
const nextHighTideEl = document.getElementById('nextHighTide');
const nextLowTideEl = document.getElementById('nextLowTide');
const highTideCountdownEl = document.getElementById('highTideCountdown');
const lowTideCountdownEl = document.getElementById('lowTideCountdown');
const refreshBtn = document.getElementById('refreshBtn');
const favoriteBtn = document.getElementById('favoriteBtn');
const clearStorageBtn = document.getElementById('clearStorageBtn');
const moonIconEl = document.getElementById('moonIcon');
const moonPhaseEl = document.getElementById('moonPhase');
const moonIlluminationEl = document.getElementById('moonIllumination');
const activitySuggestionsEl = document.getElementById('activitySuggestions');
const favoriteLocationsEl = document.getElementById('favoriteLocations');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if we have a stored location
    const storedLocation = localStorage.getItem('tideTrackerLastLocation');
    if (storedLocation) {
        userLocation = JSON.parse(storedLocation);
        fetchTideData(userLocation.lat, userLocation.lng);
    } else {
        getUserLocation();
    }
    
    // Set up event listeners
    refreshBtn.addEventListener('click', refreshData);
    favoriteBtn.addEventListener('click', addToFavorites);
    clearStorageBtn.addEventListener('click', clearStorage);
    
    // Display favorite locations
    displayFavorites();
    
    // Update current time every second
    setInterval(updateCurrentTime, 1000);
});

// Get user's current location
function getUserLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Store the location for future use
            localStorage.setItem('tideTrackerLastLocation', JSON.stringify(userLocation));
            
            fetchTideData(userLocation.lat, userLocation.lng);
        },
        function(error) {
            showError('Unable to retrieve your location: ' + error.message);
        }
    );
}

// Fetch tide data from API
async function fetchTideData(lat, lng) {
    try {
        // For demonstration purposes, we'll use mock data since we don't have a real API key
        // In a real application, you would use an API like WorldTides
        await simulateAPICall();
        
        // Mock tide data
        tideData = generateMockTideData(lat, lng);
        moonData = generateMockMoonData();
        
        // Update the UI with the data
        updateUI();
        
        // Hide loading and show content
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
    } catch (error) {
        showError('Failed to fetch tide data: ' + error.message);
    }
}

// Simulate API call delay
function simulateAPICall() {
    return new Promise(resolve => setTimeout(resolve, 1500));
}

// Generate mock tide data for demonstration
function generateMockTideData(lat, lng) {
    const now = moment();
    const timezone = moment.tz.guess();
    
    // Generate tide events for the next 24 hours
    const tides = [];
    let currentTime = now.clone().startOf('hour');
    
    // Start with a random tide type
    let isHighTide = Math.random() > 0.5;
    
    for (let i = 0; i < 24; i++) {
        // Add some randomness to tide times and heights
        const tideTime = currentTime.clone().add(i * (5 + Math.random() * 2), 'hours');
        const height = isHighTide ? 
            (2 + Math.random() * 3).toFixed(1) : 
            (0.5 + Math.random() * 1).toFixed(1);
        
        tides.push({
            time: tideTime,
            height: parseFloat(height),
            type: isHighTide ? 'high' : 'low'
        });
        
        // Alternate between high and low tides
        isHighTide = !isHighTide;
    }
    
    // Find the nearest coast name (mock)
    const coastNames = [
        "Pacific Coast", "Atlantic Coast", "Gulf Coast", 
        "Great Lakes Shore", "New England Coast", "Florida Keys"
    ];
    const randomCoast = coastNames[Math.floor(Math.random() * coastNames.length)];
    
    return {
        location: {
            name: randomCoast,
            lat: lat,
            lng: lng
        },
        tides: tides,
        timezone: timezone
    };
}

// Generate mock moon data
function generateMockMoonData() {
    const phases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", 
                   "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
    const icons = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
    
    const randomIndex = Math.floor(Math.random() * phases.length);
    const illumination = (Math.random() * 100).toFixed(1);
    
    return {
        phase: phases[randomIndex],
        icon: icons[randomIndex],
        illumination: illumination
    };
}

// Update the UI with the fetched data
function updateUI() {
    // Update location information
    coastNameEl.textContent = tideData.location.name;
    coordinatesEl.textContent = `${tideData.location.lat.toFixed(4)}, ${tideData.location.lng.toFixed(4)}`;
    updateCurrentTime();
    
    // Find next high and low tides
    const now = moment();
    const nextHighTide = tideData.tides.find(tide => tide.type === 'high' && tide.time.isAfter(now));
    const nextLowTide = tideData.tides.find(tide => tide.type === 'low' && tide.time.isAfter(now));
    
    // Update tide information
    if (nextHighTide) {
        nextHighTideEl.textContent = nextHighTide.time.format('h:mm A');
        updateCountdown(highTideCountdownEl, nextHighTide.time);
    }
    
    if (nextLowTide) {
        nextLowTideEl.textContent = nextLowTide.time.format('h:mm A');
        updateCountdown(lowTideCountdownEl, nextLowTide.time);
    }
    
    // Update moon information
    moonIconEl.textContent = moonData.icon;
    moonPhaseEl.textContent = moonData.phase;
    moonIlluminationEl.textContent = `${moonData.illumination}% illuminated`;
    
    // Initialize or update the map
    initMap();
    
    // Initialize or update the tide chart
    initTideChart();
    
    // Update activity suggestions
    updateActivitySuggestions(nextHighTide, nextLowTide);
}

// Update countdown to a specific time
function updateCountdown(element, targetTime) {
    const now = moment();
    const duration = moment.duration(targetTime.diff(now));
    
    if (duration.asSeconds() <= 0) {
        element.textContent = "Now";
        return;
    }
    
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    
    element.textContent = `in ${hours}h ${minutes}m`;
}

// Update activity suggestions based on tide conditions
function updateActivitySuggestions(highTide, lowTide) {
    const activities = [
        { name: "Beach Walking", goodTide: "low", description: "Best at low tide when more beach is exposed" },
        { name: "Surfing", goodTide: "high", description: "Better waves during high tide" },
        { name: "Fishing", goodTide: "either", description: "Good around tide changes" },
        { name: "Clam Digging", goodTide: "low", description: "Only possible at low tide" },
        { name: "Boating", goodTide: "high", description: "Easier access during high tide" },
        { name: "Tide Pooling", goodTide: "low", description: "Best at low tide when pools are exposed" }
    ];
    
    // Clear previous suggestions
    activitySuggestionsEl.innerHTML = '';
    
    // Add new suggestions
    activities.forEach(activity => {
        const activityEl = document.createElement('div');
        activityEl.className = `activity ${isActivityGood(activity, highTide, lowTide) ? 'good' : 'poor'}`;
        
        activityEl.innerHTML = `
            <strong>${activity.name}</strong>
            <div>${activity.description}</div>
        `;
        
        activitySuggestionsEl.appendChild(activityEl);
    });
}

// Determine if an activity is good based on current tide conditions
function isActivityGood(activity, highTide, lowTide) {
    const now = moment();
    const nextTide = highTide.time.isBefore(lowTide.time) ? highTide : lowTide;
    const timeToNextTide = nextTide.time.diff(now, 'hours');
    
    if (activity.goodTide === "either") {
        return timeToNextTide <= 2; // Good around tide changes
    }
    
    if (activity.goodTide === "high") {
        return nextTide.type === "high" && timeToNextTide <= 2;
    }
    
    if (activity.goodTide === "low") {
        return nextTide.type === "low" && timeToNextTide <= 2;
    }
    
    return false;
}

// Add current location to favorites
function addToFavorites() {
    const favorite = {
        name: tideData.location.name,
        lat: tideData.location.lat,
        lng: tideData.location.lng,
        timestamp: moment().format('YYYY-MM-DD HH:mm')
    };
    
    // Check if already in favorites
    const exists = favorites.some(fav => 
        fav.lat === favorite.lat && fav.lng === favorite.lng
    );
    
    if (!exists) {
        favorites.push(favorite);
        localStorage.setItem('tideTrackerFavorites', JSON.stringify(favorites));
        displayFavorites();
        
        // Provide feedback
        alert(`${favorite.name} added to favorites!`);
    } else {
        alert(`${favorite.name} is already in your favorites!`);
    }
}

// Display favorite locations
function displayFavorites() {
    favoriteLocationsEl.innerHTML = '';
    
    if (favorites.length === 0) {
        favoriteLocationsEl.innerHTML = '<p>No favorite locations yet.</p>';
        return;
    }
    
    favorites.forEach((favorite, index) => {
        const favoriteEl = document.createElement('div');
        favoriteEl.className = 'favorite-item';
        
        favoriteEl.innerHTML = `
            <div>
                <strong>${favorite.name}</strong><br>
                <small>Saved: ${favorite.timestamp}</small>
            </div>
            <div>
                <button class="load-favorite" data-index="${index}">Load</button>
                <button class="remove-favorite" data-index="${index}">Remove</button>
            </div>
        `;
        
        favoriteLocationsEl.appendChild(favoriteEl);
    });
    
    // Add event listeners to the buttons
    document.querySelectorAll('.load-favorite').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            loadFavorite(index);
        });
    });
    
    document.querySelectorAll('.remove-favorite').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFavorite(index);
        });
    });
}

// Load a favorite location
function loadFavorite(index) {
    const favorite = favorites[index];
    userLocation = { lat: favorite.lat, lng: favorite.lng };
    localStorage.setItem('tideTrackerLastLocation', JSON.stringify(userLocation));
    fetchTideData(userLocation.lat, userLocation.lng);
}

// Remove a favorite location
function removeFavorite(index) {
    favorites.splice(index, 1);
    localStorage.setItem('tideTrackerFavorites', JSON.stringify(favorites));
    displayFavorites();
}

// Clear local storage
function clearStorage() {
    if (confirm('Are you sure you want to clear all stored data?')) {
        localStorage.removeItem('tideTrackerLastLocation');
        localStorage.removeItem('tideTrackerFavorites');
        favorites = [];
        displayFavorites();
        alert('All stored data has been cleared.');
    }
}

// Refresh data
function refreshData() {
    loadingEl.style.display = 'block';
    contentEl.style.display = 'none';
    errorEl.style.display = 'none';
    
    if (userLocation) {
        fetchTideData(userLocation.lat, userLocation.lng);
    } else {
        getUserLocation();
    }
}

// Update current time display
function updateCurrentTime() {
    const now = moment();
    currentTimeEl.textContent = now.format('MMMM Do YYYY, h:mm:ss A');
}

// Show error message
function showError(message) {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
    errorMessageEl.textContent = message;
}