document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the regular no1 ranking page
    if (window.location.pathname.endsWith('no1-holder-regular.html')) {
        console.log("Regular No.1 ranking page detected");
        
        // Initialize tooltip for season breakdowns
        initializeNo1Tooltip();
        
        // Fetch regular No.1 rankings
        fetchRegularNo1Rankings();
    }
});

function initializeNo1Tooltip() {
    // Check if tooltip exists, if not create it
    let tooltip = document.getElementById('no1-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'no1-tooltip';
        tooltip.className = 'tooltip hidden';
        document.body.appendChild(tooltip);
    }
    
    // Hide tooltip when clicking anywhere on the document
    document.addEventListener('click', function(e) {
        // Only hide if clicking outside tooltip and season cells
        if (!e.target.classList.contains('no1-seasons') && 
            !tooltip.contains(e.target)) {
            tooltip.classList.remove('visible');
            tooltip.classList.add('hidden');
        }
    });
}

// Fetch regular No.1 rankings data
async function fetchRegularNo1Rankings() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const tableEl = document.getElementById('rankings-table');
    
    try {
        const response = await fetch('data/regular_no1.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update last updated info
        document.getElementById('last-updated').textContent = data.last_updated;
        
        // Populate regular No.1 rankings table
        renderRegularNo1Rankings(data.rankings);
        
        // Hide loading, show table
        if (loadingEl) loadingEl.classList.add('hidden');
        tableEl.style.display = 'table';
        
    } catch (error) {
        console.error('Error fetching regular No.1 rankings:', error);
        if (loadingEl) loadingEl.classList.add('hidden');
        if (errorEl) errorEl.classList.remove('hidden');
    }
}

// Render regular No.1 rankings
function renderRegularNo1Rankings(rankings) {
    const tableBody = document.getElementById('rankings-body');
    tableBody.innerHTML = ''; // Clear any existing content
    
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
        playerImg.src = `data/players/${player.player_id}.jpg`;
        playerImg.alt = `Player ${player.player_id}`;
        playerImg.onerror = function() {
            this.src = 'images/no-image.png'; // Fallback image
        };
        
        infoCell.appendChild(playerImg);
        row.appendChild(infoCell);
        
        // Number of Seasons as World No.1
        const seasonsCell = document.createElement('td');
        seasonsCell.classList.add('no1-seasons');
        seasonsCell.textContent = `${player.count} (Season ${player.last_season})`;
        
        // Add seasons data for tooltip
        seasonsCell.dataset.seasons = JSON.stringify(player.seasons);
        seasonsCell.addEventListener('mouseover', showSeasonsBreakdown);
        seasonsCell.addEventListener('mousemove', moveTooltip);
        seasonsCell.addEventListener('mouseout', hideTooltip);
        
        row.appendChild(seasonsCell);
        
        tableBody.appendChild(row);
    });
    
    // After table is populated, make rows clickable using local function
    makeNo1RowsClickable();
}

// Local implementation of makeTableRowsClickable for regular-no1.js
function makeNo1RowsClickable() {
    console.log("Adding click handlers to regular No.1 table rows");
    const tableRows = document.querySelectorAll('#rankings-table tbody tr');
    
    tableRows.forEach(row => {
        // For No.1 tables, player ID is in the 2nd column
        const playerIdCell = row.querySelector('td:nth-child(2)');
        
        if (playerIdCell) {
            // Add click event listener to the row
            row.addEventListener('click', function() {
                const playerId = playerIdCell.textContent.trim();
                console.log(`Regular No.1 row clicked, navigating to player detail for ID: ${playerId}`);
                
                // Navigate to player detail page
                window.location.href = `player-detail.html?id=${playerId}`;
            });
            
            // Add hover class for better UX
            row.classList.add('clickable-row');
        }
    });
}

// Show seasons breakdown tooltip
function showSeasonsBreakdown(event) {
    const cell = event.currentTarget;
    const tooltip = document.getElementById('no1-tooltip');
    
    if (!tooltip || !cell.dataset.seasons) return;
    
    try {
        const seasons = JSON.parse(cell.dataset.seasons);
        let tooltipContent = '<div class="breakdown-title">Season Breakdown</div>';
        
        // Seasons as World No.1 (regular version)
        tooltipContent += '<div class="breakdown-item">Seasons as World No.1: ';
        tooltipContent += seasons.join(', ');
        tooltipContent += '</div>';
        
        // Set tooltip content
        tooltip.innerHTML = tooltipContent;
        tooltip.classList.remove('hidden');
        tooltip.classList.add('visible');
        
        // Position the tooltip
        moveTooltip(event);
    } catch (error) {
        console.error('Error showing seasons breakdown:', error);
    }
}

function moveTooltip(event) {
    const tooltip = document.getElementById('no1-tooltip');
    
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
    const tooltip = document.getElementById('no1-tooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
        tooltip.classList.add('hidden');
    }
}
