document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the world ranking page
    if (window.location.pathname.endsWith('world-ranking.html')) {
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
});

// Custom implementation of row click functionality for world ranking table
function makeWorldRankingRowsClickable() {
    console.log("Adding click handlers to world ranking table rows");
    const tableRows = document.querySelectorAll('#rankings-table tbody tr');
    
    tableRows.forEach(row => {
        // For world ranking table, player ID is in the 3rd column
        const playerIdCell = row.querySelector('td:nth-child(3)');
        
        if (playerIdCell) {
            // Add click event listener to the row
            row.addEventListener('click', function() {
                const playerId = playerIdCell.textContent.trim();
                console.log(`World ranking row clicked, navigating to player detail for ID: ${playerId}`);
                
                // Navigate to player detail page
                window.location.href = `player-detail.html?id=${playerId}`;
            });
            
            // Add hover class for better UX
            row.classList.add('clickable-row');
        }
    });
}
