document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the highest score ranking page more precisely
    if (isHighestScorePage()) {
        console.log("Highest score page detected");
        
        // Initialize tooltip
        initializeTooltip();
        
        // Fetch highest score rankings
        fetchHighestScores();
    }
});

// Helper function to more reliably determine if we're on the highest score page
function isHighestScorePage() {
    // Check URL path
    if (window.location.pathname.endsWith('highest-score.html')) {
        return true;
    }
    
    // Check for table with highest-score-table class
    const table = document.querySelector('.highest-score-table');
    if (table) {
        // Ensure we add a data attribute to prevent re-initialization
        if (!table.dataset.initialized) {
            table.dataset.initialized = 'true';
            return true;
        }
    }
    
    return false;
}

function initializeTooltip() {
    // Check if tooltip exists, if not create it
    let tooltip = document.getElementById('score-tooltip');
    if (!tooltip) {
        console.log("Creating tooltip element");
        tooltip = document.createElement('div');
        tooltip.id = 'score-tooltip';
        tooltip.className = 'tooltip hidden';
        document.body.appendChild(tooltip);
    }
    
    // Hide tooltip when clicking anywhere on the document
    document.addEventListener('click', function(e) {
        // Only hide if clicking outside tooltip and score cells
        if (!e.target.classList.contains('highest-score-cell') && 
            !tooltip.contains(e.target)) {
            tooltip.classList.remove('visible');
            tooltip.classList.add('hidden');
        }
    });
    
    console.log("Tooltip initialized");
}

// Fetch highest score rankings data
async function fetchHighestScores() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const tableEl = document.getElementById('rankings-table');
    
    try {
        const response = await fetch('data/highest_scores.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update last updated info
        document.getElementById('last-updated').textContent = data.last_updated;
        
        // Populate highest score rankings table
        renderHighestScores(data.highest_scores);
        
        // Hide loading, show table
        if (loadingEl) loadingEl.classList.add('hidden');
        tableEl.style.display = 'table';
        
    } catch (error) {
        console.error('Error fetching highest score rankings:', error);
        if (loadingEl) loadingEl.classList.add('hidden');
        if (errorEl) errorEl.classList.remove('hidden');
    }
}

// Helper function to check if the device is mobile (width <= 768px)
function isMobileDevice() {
    return window.innerWidth <= 768;
}

// Render highest score rankings
function renderHighestScores(rankings) {
    const tableBody = document.getElementById('rankings-body');
    tableBody.innerHTML = ''; // Clear any existing content
    
    console.log(`Rendering ${rankings.length} highest score rows`);
    
    rankings.forEach(player => {
        const row = document.createElement('tr');
        
        // Rank
        const rankCell = document.createElement('td');
        rankCell.textContent = player.rank;
        row.appendChild(rankCell);
        
        // Player ID
        const idCell = document.createElement('td');
        idCell.textContent = player.player_id;
        row.appendChild(idCell);
        
        // Player Info
        const infoCell = document.createElement('td');
        infoCell.className = 'player-info';
        
        // Create player image
        const playerImg = document.createElement('img');
        playerImg.className = 'player-img';
        playerImg.src = `data/players/${player.player_id}.jpg`; // Updated path
        playerImg.alt = `Player ${player.player_id}`;
        playerImg.onerror = function() {
            this.src = 'images/no-image.png'; // Fallback image
        };
        
        infoCell.appendChild(playerImg);
        row.appendChild(infoCell);
        
        // Highest Score with season
        const scoreCell = document.createElement('td');
        scoreCell.classList.add('highest-score-cell');
        scoreCell.textContent = `${player.score} (Season ${player.achieved_season})`;
        scoreCell.style.cursor = 'pointer';  // Changed from 'help' to 'pointer'
        
        // Add score breakdown data if available
        if (player.score_breakdown) {
            console.log(`Adding breakdown for player ${player.player_id}`);
            scoreCell.dataset.scoreBreakdown = JSON.stringify(player.score_breakdown);
            
            // Different event handlers for mobile vs desktop
            if (isMobileDevice()) {
                // For mobile: use click/tap
                scoreCell.addEventListener('click', showScoreBreakdown);
            } else {
                // For desktop: use hover
                scoreCell.addEventListener('mouseover', showScoreBreakdown);
                scoreCell.addEventListener('mousemove', moveTooltip);
                scoreCell.addEventListener('mouseout', hideTooltip);
            }
        } else {
            console.log(`No breakdown data for player ${player.player_id}`);
        }
        
        row.appendChild(scoreCell);
        
        tableBody.appendChild(row);
    });
    
    console.log("Finished rendering highest scores table");
    
    // Make rows clickable with a local implementation rather than relying on imported function
    makeScoreRowsClickable();
}

// Local function to make table rows clickable
function makeScoreRowsClickable() {
    console.log("Adding click handlers to highest score table rows");
    const tableRows = document.querySelectorAll('#rankings-table tbody tr');
    
    tableRows.forEach(row => {
        // For highest score table, player ID is in the 2nd column
        const playerIdCell = row.querySelector('td:nth-child(2)');
        
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
                            window.location.href = `player-detail.html?id=${playerId}&from=highestscore`;
                        });
                    }
                });
                
                // Last cell is handled by the tap-for-tooltip logic already implemented
            } else {
                // On desktop: keep original row click behavior
                row.addEventListener('click', function() {
                    const playerId = playerIdCell.textContent.trim();
                    console.log(`Score row clicked, navigating to player detail for ID: ${playerId}`);
                    
                    // Navigate to player detail page
                    window.location.href = `player-detail.html?id=${playerId}&from=highestscore`;
                });
            }
            
            // Add hover class for better UX
            row.classList.add('clickable-row');
        }
    });
}

function showScoreBreakdown(event) {
    console.log("showScoreBreakdown triggered");
    const tooltip = document.getElementById('score-tooltip');
    
    if (!tooltip) return;
    
    try {
        const breakdownData = JSON.parse(event.currentTarget.dataset.scoreBreakdown);
        console.log("Breakdown data:", breakdownData);
        
        // Create tooltip content
        let tooltipContent = '<div class="breakdown-title">Score Breakdown</div>';
        
        // Champion
        tooltipContent += '<div class="breakdown-item champion">Champion: ' + breakdownData.champion.count;
        if (breakdownData.champion.count > 0) {
            tooltipContent += ' <span class="seasons">(' + breakdownData.champion.seasons.join(', ') + ')</span>';
        }
        tooltipContent += '</div>';
        
        // Runner-up
        tooltipContent += '<div class="breakdown-item runnerup">Runner-up: ' + breakdownData.runnerup.count;
        if (breakdownData.runnerup.count > 0) {
            tooltipContent += ' <span class="seasons">(' + breakdownData.runnerup.seasons.join(', ') + ')</span>';
        }
        tooltipContent += '</div>';
        
        // Top-4
        tooltipContent += '<div class="breakdown-item top4">Top-4: ' + breakdownData.top4.count;
        if (breakdownData.top4.count > 0) {
            tooltipContent += ' <span class="seasons">(' + breakdownData.top4.seasons.join(', ') + ')</span>';
        }
        tooltipContent += '</div>';
        
        // Top-8
        tooltipContent += '<div class="breakdown-item top8">Top-8: ' + breakdownData.top8.count;
        if (breakdownData.top8.count > 0) {
            tooltipContent += ' <span class="seasons">(' + breakdownData.top8.seasons.join(', ') + ')</span>';
        }
        tooltipContent += '</div>';
        
        tooltip.innerHTML = tooltipContent;
        tooltip.classList.remove('hidden');
        tooltip.classList.add('visible');
        
        // Position the tooltip
        moveTooltip(event);
    } catch (error) {
        console.error('Error showing score breakdown:', error);
    }
}

function moveTooltip(event) {
    const tooltip = document.getElementById('score-tooltip');
    
    if (!tooltip) return;
    
    // Position tooltip near the cursor
    const x = event.pageX + 15;
    const y = event.pageY - 30;
    
    // Check if tooltip would go off-screen
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Adjust position if needed
    const adjustedX = x + tooltipWidth > windowWidth ? x - tooltipWidth - 30 : x;
    const adjustedY = y - tooltipHeight < 0 ? y + 60 : y;
    
    tooltip.style.left = adjustedX + 'px';
    tooltip.style.top = adjustedY + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('score-tooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
        tooltip.classList.add('hidden');
    }
}

// Update event listeners when window resizes
window.addEventListener('resize', function() {
    // Refresh the table to update event listeners
    fetchHighestScores();
});
