document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the player search page
    if (window.location.pathname.endsWith('player-search.html')) {
        console.log("Player search page detected");
        
        // Load all player IDs for autocomplete
        loadPlayerIds();
        
        // Set up search button click handler
        const searchButton = document.getElementById('search-button');
        if (searchButton) {
            searchButton.addEventListener('click', handleSearch);
        }
        
        // Set up enter key press in input field
        const playerIdInput = document.getElementById('player-id-input');
        if (playerIdInput) {
            playerIdInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleSearch();
                }
            });
        }
    }
});

// Global variable to store all player IDs
let allPlayerIds = [];

// Load all player IDs from JSON file
async function loadPlayerIds() {
    try {
        const response = await fetch('data/all_players.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        allPlayerIds = data.player_ids;
        console.log(`Loaded ${allPlayerIds.length} player IDs`);
        
        // Set up autocomplete
        setupAutocomplete();
    } catch (error) {
        console.error('Error loading player IDs:', error);
    }
}

// Set up autocomplete functionality
function setupAutocomplete() {
    const inputElement = document.getElementById('player-id-input');
    
    // Add input event listener for filtering
    inputElement.addEventListener('input', function() {
        const inputValue = this.value.trim();
        
        // Close any already open lists
        closeAllLists();
        
        if (!inputValue) { return false; }
        
        // Create a container for matching items
        const autocompleteList = document.getElementById('autocomplete-list');
        
        // Filter player IDs that match the input
        const matches = allPlayerIds.filter(id => 
            id.toString().startsWith(inputValue)
        );
        
        // Limit to 3 matches
        const limitedMatches = matches.slice(0, 3);
        
        // Add matches to the dropdown
        if (limitedMatches.length > 0) {
            // Ensure the autocomplete container is visible and positioned correctly
            const autoCompleteContainer = document.querySelector('.autocomplete');
            if (autoCompleteContainer) {
                // Make sure nothing is cutting off the dropdown
                autoCompleteContainer.style.overflow = 'visible';
                
                // Update the list with matches
                limitedMatches.forEach(match => {
                    const item = document.createElement('div');
                    item.textContent = match;
                    item.style.padding = '12px 15px';
                    item.style.cursor = 'pointer';
                    
                    // Set the item as the input value when clicked
                    item.addEventListener('click', function() {
                        inputElement.value = this.textContent;
                        closeAllLists();
                    });
                    
                    autocompleteList.appendChild(item);
                });
            }
        }
    });
    
    // Close autocomplete list when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== inputElement) {
            closeAllLists();
        }
    });
}

// Close all autocomplete lists
function closeAllLists() {
    const autocompleteList = document.getElementById('autocomplete-list');
    if (autocompleteList) {
        autocompleteList.innerHTML = '';
    }
}

// Handle search button click
function handleSearch() {
    const playerIdInput = document.getElementById('player-id-input');
    const errorMessage = document.getElementById('search-error');
    
    // Get the entered player ID
    const playerId = playerIdInput.value.trim();
    
    // Validate player ID
    if (!playerId || !allPlayerIds.includes(parseInt(playerId))) {
        errorMessage.classList.remove('hidden');
        return;
    }
    
    // Hide error message if it was shown
    errorMessage.classList.add('hidden');
    
    // Redirect to player detail page with query parameter and source parameter
    window.location.href = `player-detail.html?id=${playerId}&from=playersearch`;
}
