document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the total title ranking page
    if (window.location.pathname.endsWith('total-title.html') || 
        document.querySelector('.total-title-table')) {
        
        // Initialize tooltip for title breakdowns
        initializeTitleTooltip();
        
        // Fetch total title rankings
        fetchTotalTitles();
    }
});

function initializeTitleTooltip() {
    // Check if tooltip exists, if not create it
    let tooltip = document.getElementById('title-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'title-tooltip';
        tooltip.className = 'tooltip hidden';
        document.body.appendChild(tooltip);
    }
    
    // Hide tooltip when clicking anywhere on the document
    document.addEventListener('click', function(e) {
        // Only hide if clicking outside tooltip and title cells
        if (!e.target.classList.contains('champion-count') && 
            !e.target.classList.contains('runnerup-count') && 
            !e.target.classList.contains('top4-count') && 
            !e.target.classList.contains('top8-count') && 
            !e.target.classList.contains('total-count') && // Add total-count class check
            !tooltip.contains(e.target)) {
            tooltip.classList.remove('visible');
            tooltip.classList.add('hidden');
        }
    });
}

// Fetch total title rankings data
async function fetchTotalTitles() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const tableEl = document.getElementById('rankings-table');
    
    try {
        const response = await fetch('data/total_titles.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update last updated info
        document.getElementById('last-updated').textContent = data.last_updated;
        
        // Populate total title rankings table
        renderTotalTitles(data.total_titles);
        
        // Hide loading, show table
        if (loadingEl) loadingEl.classList.add('hidden');
        tableEl.style.display = 'table';
        
    } catch (error) {
        console.error('Error fetching total title rankings:', error);
        if (loadingEl) loadingEl.classList.add('hidden');
        if (errorEl) errorEl.classList.remove('hidden');
    }
}

// Helper function to check if the device is mobile (width <= 768px)
function isMobileDevice() {
    return window.innerWidth <= 768;
}

// Render total title rankings
function renderTotalTitles(rankings) {
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
        playerImg.src = `data/players/${player.player_id}.jpg`; // Updated path
        playerImg.alt = `Player ${player.player_id}`;
        playerImg.onerror = function() {
            this.src = 'images/no-image.png'; // Fallback image
        };
        
        infoCell.appendChild(playerImg);
        row.appendChild(infoCell);
        
        // Store the title breakdown data in the row for tooltip access
        row.dataset.titleBreakdown = JSON.stringify(player.title_breakdown);
        
        // Champion Count
        const championCell = document.createElement('td');
        championCell.className = 'champion-count';
        championCell.textContent = player.champion;
        
        // Different event handlers for mobile vs desktop
        if (isMobileDevice()) {
            championCell.addEventListener('click', showTitleBreakdown);
        } else {
            championCell.addEventListener('mouseover', showTitleBreakdown);
            championCell.addEventListener('mousemove', moveTooltip);
            championCell.addEventListener('mouseout', hideTooltip);
        }
        row.appendChild(championCell);
        
        // Runner-up Count
        const runnerupCell = document.createElement('td');
        runnerupCell.className = 'runnerup-count';
        runnerupCell.textContent = player.runnerup;
        
        if (isMobileDevice()) {
            runnerupCell.addEventListener('click', showTitleBreakdown);
        } else {
            runnerupCell.addEventListener('mouseover', showTitleBreakdown);
            runnerupCell.addEventListener('mousemove', moveTooltip);
            runnerupCell.addEventListener('mouseout', hideTooltip);
        }
        row.appendChild(runnerupCell);
        
        // Top-4 Count
        const top4Cell = document.createElement('td');
        top4Cell.className = 'top4-count';
        top4Cell.textContent = player.top4;
        
        if (isMobileDevice()) {
            top4Cell.addEventListener('click', showTitleBreakdown);
        } else {
            top4Cell.addEventListener('mouseover', showTitleBreakdown);
            top4Cell.addEventListener('mousemove', moveTooltip);
            top4Cell.addEventListener('mouseout', hideTooltip);
        }
        row.appendChild(top4Cell);
        
        // Top-8 Count
        const top8Cell = document.createElement('td');
        top8Cell.className = 'top8-count';
        top8Cell.textContent = player.top8;
        
        if (isMobileDevice()) {
            top8Cell.addEventListener('click', showTitleBreakdown);
        } else {
            top8Cell.addEventListener('mouseover', showTitleBreakdown);
            top8Cell.addEventListener('mousemove', moveTooltip);
            top8Cell.addEventListener('mouseout', hideTooltip);
        }
        row.appendChild(top8Cell);
        
        // Total Titles
        const totalCell = document.createElement('td');
        totalCell.className = 'total-count';
        
        // Create desktop total content (regular number)
        const desktopTotal = document.createElement('span');
        desktopTotal.className = 'desktop-total';
        desktopTotal.textContent = player.total;
        totalCell.appendChild(desktopTotal);
        
        // Create mobile-formatted content with proper event handling
        const mobileTotal = document.createElement('span');
        mobileTotal.className = 'mobile-title-breakdown';
        
        // Create spans separately so we can attach event listeners
        const totalSpan = document.createElement('span'); // Changed from createTextNode to createElement
        totalSpan.className = 'total-value'; // Add a class for styling and targeting
        totalSpan.textContent = player.total; // Set the text content
        
        const openParen = document.createTextNode(' (');
        
        const championSpan = document.createElement('span');
        championSpan.className = 'champion';
        championSpan.textContent = player.champion;
        
        const separator1 = document.createTextNode('/');
        
        const runnerupSpan = document.createElement('span');
        runnerupSpan.className = 'runnerup';
        runnerupSpan.textContent = player.runnerup;
        
        const separator2 = document.createTextNode('/');
        
        const top4Span = document.createElement('span');
        top4Span.className = 'top4';
        top4Span.textContent = player.top4;
        
        const separator3 = document.createTextNode('/');
        
        const top8Span = document.createElement('span');
        top8Span.className = 'top8';
        top8Span.textContent = player.top8;
        
        const closeParen = document.createTextNode(')');
        
        // Assemble the mobile breakdown structure
        mobileTotal.appendChild(totalSpan);
        mobileTotal.appendChild(openParen);
        mobileTotal.appendChild(championSpan);
        mobileTotal.appendChild(separator1);
        mobileTotal.appendChild(runnerupSpan);
        mobileTotal.appendChild(separator2);
        mobileTotal.appendChild(top4Span);
        mobileTotal.appendChild(separator3);
        mobileTotal.appendChild(top8Span);
        mobileTotal.appendChild(closeParen);
        
        // If on mobile, attach click handlers to each span
        if (isMobileDevice()) {
            // Attach the same event handler to each span INCLUDING the total number
            [totalSpan, championSpan, runnerupSpan, top4Span, top8Span].forEach(span => {
                span.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent bubbling to avoid double firing
                    
                    // Call showTitleBreakdown with the row's data
                    const row = totalCell.closest('tr');
                    if (row && row.dataset.titleBreakdown) {
                        const customEvent = {
                            currentTarget: totalCell,
                            target: span,
                            pageX: e.pageX,
                            pageY: e.pageY
                        };
                        
                        showTitleBreakdown(customEvent);
                    }
                });
            });
            
            // Also make the entire mobile total span clickable
            mobileTotal.addEventListener('click', function(e) {
                // Only trigger if the click was directly on the mobileTotal element
                // and not on one of its child spans (which have their own handlers)
                if (e.target === mobileTotal) {
                    const customEvent = {
                        currentTarget: totalCell,
                        target: mobileTotal,
                        pageX: e.pageX,
                        pageY: e.pageY
                    };
                    
                    showTitleBreakdown(customEvent);
                }
            });
        }
        
        totalCell.appendChild(mobileTotal);
        
        // Add event listeners to total count column
        if (isMobileDevice()) {
            // Make the totalCell itself clickable
            totalCell.addEventListener('click', function(e) {
                // Only trigger if clicking directly on the cell,
                // not on the spans (which have their own handlers)
                if (e.target === totalCell) {
                    showTitleBreakdown(e);
                }
            });
        } else {
            totalCell.addEventListener('mouseover', showTitleBreakdown);
            totalCell.addEventListener('mousemove', moveTooltip);
            totalCell.addEventListener('mouseout', hideTooltip);
        }
        
        row.appendChild(totalCell);
        
        tableBody.appendChild(row);
    });

    // After table is populated, make rows clickable using local function
    makeTitleRowsClickable();
    
    // Add CSS styling for colored numbers in the mobile breakdown
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .mobile-title-breakdown .champion { color: gold; font-weight: 700; }
        .mobile-title-breakdown .runnerup { color: silver; font-weight: 600; }
        .mobile-title-breakdown .top4 { color: #cd7f32; font-weight: 500; }
        .mobile-title-breakdown .top8 { color: #a0d6b4; }
    `;
    document.head.appendChild(styleEl);
}

// Local implementation of makeTableRowsClickable for total-title.js
function makeTitleRowsClickable() {
    console.log("Adding click handlers to total title table rows");
    const tableRows = document.querySelectorAll('#rankings-table tbody tr');
    
    tableRows.forEach(row => {
        // For total title table, player ID is in the 2nd column
        const playerIdCell = row.querySelector('td:nth-child(2)');
        
        if (playerIdCell) {
            // Different behavior for mobile vs desktop
            if (isMobileDevice()) {
                // On mobile: add click handlers to each cell except the last one
                const cells = row.querySelectorAll('td');
                
                // For all cells except the last column (total count), navigate to player profile
                cells.forEach((cell, index) => {
                    // Skip the last cell (total count) and the cells for individual counts
                    // which are handled by the tooltip logic
                    if (index < cells.length - 5 || (index === cells.length - 4)) {
                        cell.addEventListener('click', function(e) {
                            const playerId = playerIdCell.textContent.trim();
                            console.log(`Cell clicked, navigating to player detail for ID: ${playerId}`);
                            
                            // Navigate to player detail page
                            window.location.href = `player-detail.html?id=${playerId}&from=totaltitle`;
                        });
                    }
                });
                
                // Last cells (champion, runner-up, top4, top8, total) are handled by tap-for-tooltip logic
            } else {
                // On desktop: keep original row click behavior
                row.addEventListener('click', function() {
                    const playerId = playerIdCell.textContent.trim();
                    console.log(`Title row clicked, navigating to player detail for ID: ${playerId}`);
                    
                    // Navigate to player detail page
                    window.location.href = `player-detail.html?id=${playerId}&from=totaltitle`;
                });
            }
            
            // Add hover class for better UX
            row.classList.add('clickable-row');
        }
    });
}

// Show title breakdown tooltip (enhanced to handle different click targets)
function showTitleBreakdown(event) {
    const cell = event.currentTarget;
    const row = cell.closest('tr');
    const tooltip = document.getElementById('title-tooltip');
    
    if (!tooltip || !row || !row.dataset.titleBreakdown) return;
    
    try {
        const breakdownData = JSON.parse(row.dataset.titleBreakdown);
        let tooltipContent = '<div class="breakdown-title">Title Breakdown</div>';
        
        // Get which title type was hovered/tapped
        let hoveredType = '';
        
        // Determine which type was clicked based on classes
        if (event.target.classList.contains('champion')) {
            hoveredType = 'champion';
        } else if (event.target.classList.contains('runnerup')) {
            hoveredType = 'runnerup';
        } else if (event.target.classList.contains('top4')) {
            hoveredType = 'top4';
        } else if (event.target.classList.contains('top8')) {
            hoveredType = 'top8';
        } else if (cell.classList.contains('champion-count')) {
            hoveredType = 'champion';
        } else if (cell.classList.contains('runnerup-count')) {
            hoveredType = 'runnerup';
        } else if (cell.classList.contains('top4-count')) {
            hoveredType = 'top4';
        } else if (cell.classList.contains('top8-count')) {
            hoveredType = 'top8';
        }
        // Note: We don't set hoveredType for total-count or total-value class
        // to show all without highlighting
        
        // Champion
        tooltipContent += '<div class="breakdown-item champion">Champion: ' + breakdownData.champion.length;
        if (breakdownData.champion.length > 0) {
            tooltipContent += ' <span class="seasons">(' + breakdownData.champion.join(', ') + ')</span>';
        }
        tooltipContent += '</div>';
        
        // Runner-up
        tooltipContent += '<div class="breakdown-item runnerup">Runner-up: ' + breakdownData.runnerup.length;
        if (breakdownData.runnerup.length > 0) {
            tooltipContent += ' <span class="seasons">(' + breakdownData.runnerup.join(', ') + ')</span>';
        }
        tooltipContent += '</div>';
        
        // Top-4
        tooltipContent += '<div class="breakdown-item top4">Top-4: ' + breakdownData.top4.length;
        if (breakdownData.top4.length > 0) {
            tooltipContent += ' <span class="seasons">(' + breakdownData.top4.join(', ') + ')</span>';
        }
        tooltipContent += '</div>';
        
        // Top-8
        tooltipContent += '<div class="breakdown-item top8">Top-8: ' + breakdownData.top8.length;
        if (breakdownData.top8.length > 0) {
            tooltipContent += ' <span class="seasons">(' + breakdownData.top8.join(', ') + ')</span>';
        }
        tooltipContent += '</div>';
        
        // Set tooltip content
        tooltip.innerHTML = tooltipContent;
        
        // Highlight the hovered/tapped type
        if (hoveredType) {
            const highlightEl = tooltip.querySelector(`.${hoveredType}`);
            if (highlightEl) highlightEl.style.fontWeight = 'bold';
        }
        
        tooltip.classList.remove('hidden');
        tooltip.classList.add('visible');
        
        // Position the tooltip
        moveTooltip(event);
    } catch (error) {
        console.error('Error showing title breakdown:', error);
    }
}

function moveTooltip(event) {
    const tooltip = document.getElementById('title-tooltip');
    
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
    const tooltip = document.getElementById('title-tooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
        tooltip.classList.add('hidden');
    }
}

// Update event listeners when window resizes
window.addEventListener('resize', function() {
    // Refresh the table to update event listeners
    fetchTotalTitles();
});
