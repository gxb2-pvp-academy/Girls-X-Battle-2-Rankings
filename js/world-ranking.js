document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're definitely on the world ranking page
    if (isWorldRankingPage()) {
        console.log("World ranking page detected");
        
        // Add our own event listener to make rows clickable after the table is rendered
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const rankingsBody = document.getElementById('rankings-body');
                    
                    if (rankingsBody && rankingsBody.children.length > 0) {
                        // Table has been populated, make rows clickable
                        makeWorldRankingRowsClickable();
                        
                        // Disconnect observer since we only need to do this once
                        observer.disconnect();
                    }
                }
            });
        });
        
        // Start observing the rankings table body for changes
        const rankingsBody = document.getElementById('rankings-body');
        if (rankingsBody) {
            observer.observe(rankingsBody, { childList: true });
        }
    }
    
    // Check if we need to update chart-related elements based on screen width
    updateChartVisibility();
    
    // Listen for window resize events to update chart visibility
    window.addEventListener('resize', updateChartVisibility);
});

// Helper function to determine if we're on the world ranking page
function isWorldRankingPage() {
    // Check URL path
    if (window.location.pathname.endsWith('world-ranking.html')) {
        return true;
    }
    
    // Don't initialize on these specific pages
    const otherPages = [
        'highest-score.html', 
        'historical-season.html', 
        'total-title.html', 
        'no1-holder-consecutive.html', 
        'no1-holder-regular.html',
        'player-detail.html',
        'player-search.html',
        'about.html',
        'index.html'
    ];
    
    for (const page of otherPages) {
        if (window.location.pathname.endsWith(page)) {
            return false;
        }
    }
    
    // Check for rankings table without other specific classes
    const table = document.getElementById('rankings-table');
    if (table && 
        !table.classList.contains('highest-score-table') &&
        !table.classList.contains('total-title-table') &&
        !table.classList.contains('no1-table')) {
        
        // Ensure we add a data attribute to prevent re-initialization
        if (!table.dataset.initialized) {
            table.dataset.initialized = 'true';
            return true;
        }
    }
    
    return false;
}

// Helper function to check if the device is mobile
function isMobileDevice() {
    return window.innerWidth <= 768;
}

// Helper function to check if screen is wide enough for side charts
function isWideScreen() {
    return window.innerWidth > 2100;
}

// Function to update chart container visibility based on screen width
function updateChartVisibility() {
    const chartContainer = document.getElementById('player-chart-container');
    if (!chartContainer) return;
    
    // If we're on a wide screen, make sure the chart container is ready
    if (isWideScreen()) {
        chartContainer.style.display = 'block';
    } else {
        chartContainer.style.display = 'none';
        chartContainer.classList.add('hidden');
        chartContainer.classList.remove('visible');
    }
}

// Custom implementation of row click functionality for world ranking table
function makeWorldRankingRowsClickable() {
    console.log("Adding click handlers to world ranking table rows");
    const tableRows = document.querySelectorAll('#rankings-table tbody tr');
    
    tableRows.forEach(row => {
        // For world ranking table, player ID is in the 3rd column
        const playerIdCell = row.querySelector('td:nth-child(3)');
        
        if (playerIdCell) {
            // Different behavior for mobile vs desktop
            if (isMobileDevice()) {
                // On mobile: add click handlers to each cell except the last one
                const cells = row.querySelectorAll('td');
                const lastCell = cells[cells.length - 1];
                
                // For all cells except the last one, navigate to player profile
                cells.forEach((cell, index) => {
                    if (index < cells.length - 1) { // Not the last cell
                        cell.addEventListener('click', function(e) {
                            const playerId = playerIdCell.textContent.trim();
                            console.log(`Cell clicked, navigating to player detail for ID: ${playerId}`);
                            
                            // Navigate to player detail page
                            window.location.href = `player-detail.html?id=${playerId}&from=worldranking`;
                        });
                    }
                });
                
                // Last cell is handled by the tap-for-tooltip logic already implemented
            } else {
                // On desktop: keep original row click behavior
                row.addEventListener('click', function() {
                    const playerId = playerIdCell.textContent.trim();
                    console.log(`World ranking row clicked, navigating to player detail for ID: ${playerId}`);
                    
                    // Navigate to player detail page
                    window.location.href = `player-detail.html?id=${playerId}&from=worldranking`;
                });
            }
            
            // Add hover class for better UX
            row.classList.add('clickable-row');
        }
    });
}

// Update event listeners when window resizes
window.addEventListener('resize', function() {
    // Check if we're on the world ranking page before updating
    if (window.location.pathname.endsWith('world-ranking.html') || 
        (window.location.pathname.endsWith('index.html') && document.querySelector('#rankings-table:not(.highest-score-table):not(.total-title-table):not(.no1-table)'))) {
        
        makeWorldRankingRowsClickable();
    }
});
