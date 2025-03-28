document.addEventListener('DOMContentLoaded', function() {
    // Set footer year
    document.getElementById('footer-year').textContent = new Date().getFullYear();
    
    // Initialize navigation menu
    initializeNavMenu();
    
    // IMPORTANT FIX: Check page type before initializing world rankings
    if (shouldInitializeWorldRanking()) {
        console.log('Initializing world ranking page');
        // Initialize tooltip
        initializeTooltip();
        
        // Fetch rankings data
        fetchRankings();
    }
});

// Helper function to determine if we should initialize world ranking
function shouldInitializeWorldRanking() {
    // Check current page
    const currentPath = window.location.pathname.toLowerCase();
    
    // Only initialize world ranking on the world ranking page
    // Make sure we're NOT on any other ranking pages
    if (currentPath.endsWith('world-ranking.html')) {
        return true;
    }
    
    // Don't initialize world ranking on these specific pages
    const otherRankingPages = [
        'highest-score.html', 
        'historical-season.html', 
        'total-title.html', 
        'no1-holder-consecutive.html', 
        'no1-holder-regular.html',
        'player-detail.html',
        'player-search.html',
        'about.html'
    ];
    
    for (const page of otherRankingPages) {
        if (currentPath.endsWith(page)) {
            return false;
        }
    }
    
    // If we're on index.html or a path without a specific HTML file, 
    // check for the presence of the rankings table without other classes
    if (currentPath.endsWith('index.html') || currentPath.endsWith('/')) {
        // Don't initialize world ranking on index page
        return false;
    }
    
    // Check DOM structure to confirm this is world ranking
    const rankingsTable = document.getElementById('rankings-table');
    if (rankingsTable && 
        !rankingsTable.classList.contains('highest-score-table') &&
        !rankingsTable.classList.contains('total-title-table') &&
        !rankingsTable.classList.contains('no1-table')) {
        
        // If we have a rankings table that doesn't have special classes
        // for other ranking types, initialize world ranking
        return true;
    }
    
    return false;
}

function initializeTooltip() {
    // Check if tooltip exists, if not create it
    let tooltip = document.getElementById('score-tooltip');
    if (!tooltip) {
        console.log('Creating tooltip element as it was not found');
        tooltip = document.createElement('div');
        tooltip.id = 'score-tooltip';
        tooltip.className = 'tooltip hidden';
        document.body.appendChild(tooltip);
    }
    
    // Hide tooltip when clicking anywhere on the document
    document.addEventListener('click', function(e) {
        // Only hide if clicking outside tooltip and score cells
        if (!e.target.classList.contains('score') && 
            !tooltip.contains(e.target)) {
            tooltip.classList.remove('visible');
            tooltip.classList.add('hidden');
        }
    });
    
    console.log('Tooltip initialized successfully');
}

// Helper function to check if the device is mobile (width <= 768px)
function isMobileDevice() {
    return window.innerWidth <= 768;
}

// Helper function to check if screen is wide enough for side charts
function isWideScreen() {
    return window.innerWidth > 2100;
}

function initializeNavMenu() {
    // Remove any duplicate menu-toggle elements
    const menuToggles = document.querySelectorAll('.menu-toggle');
    if (menuToggles.length > 1) {
        console.log(`Found ${menuToggles.length} menu toggles, removing duplicates`);
        for (let i = 1; i < menuToggles.length; i++) {
            menuToggles[i].parentNode.removeChild(menuToggles[i]);
        }
    }
    
    // Create overlay element if it doesn't exist
    if (!document.querySelector('.menu-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }
    
    // Mobile menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.menu-overlay');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        // Remove any existing event listeners by cloning and replacing
        const newMenuToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
        
        // Add new event listener
        newMenuToggle.addEventListener('click', function() {
            console.log("Menu toggle clicked");
            navMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            
            // Prevent scrolling of the body when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    } else {
        console.error("Menu toggle element not found");
    }
    
    // Add click handler to the overlay
    if (overlay) {
        // Remove any existing event listeners by cloning and replacing
        const newOverlay = overlay.cloneNode(true);
        overlay.parentNode.replaceChild(newOverlay, overlay);
        
        // Add new event listener
        newOverlay.addEventListener('click', function() {
            navMenu.classList.remove('active');
            newOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Add click handlers to menu items to close the menu when clicked
    const menuItems = document.querySelectorAll('.nav-menu .nav-link:not(.dropdown-toggle)');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            navMenu.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Fix dropdown toggle functionality
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        
        if (toggle) {
            // Remove any existing event listeners by cloning and replacing
            const newToggle = toggle.cloneNode(true);
            toggle.parentNode.replaceChild(newToggle, toggle);
            
            // Add new event listener
            newToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // For mobile, we want to keep dropdowns open after clicking
                // For desktop, close other dropdowns first
                if (window.innerWidth <= 768) {
                    dropdown.classList.toggle('show');
                } else {
                    // Close any open dropdowns first
                    dropdowns.forEach(d => {
                        if (d !== dropdown && d.classList.contains('show')) {
                            d.classList.remove('show');
                        }
                    });
                    dropdown.classList.toggle('show');
                }
            });
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        // Only close dropdowns when in desktop mode
        if (window.innerWidth > 768 && !e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
    
    // Set active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
            
            // If link is in dropdown, also highlight parent
            const parentLi = link.closest('.dropdown');
            if (parentLi) {
                const parentLink = parentLi.querySelector('.dropdown-toggle');
                if (parentLink) {
                    parentLink.classList.add('active');
                }
            }
        }
    });
}

// Store rankings data for world ranking page
var rankingsData = null; // Change to var instead of let to be clearer about scope

// Reference to the player chart
let playerChart = null;

async function fetchRankings() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const tableEl = document.getElementById('rankings-table');
    
    try {
        const response = await fetch('data/rankings.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store data globally
        rankingsData = data;
        
        // Update season and last updated info - check if elements exist first
        // since not all ranking pages have the current-season element
        const currentSeasonEl = document.getElementById('current-season');
        if (currentSeasonEl && data.season) {
            currentSeasonEl.textContent = data.season;
        }
        
        const lastUpdatedEl = document.getElementById('last-updated');
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = data.last_updated;
        }
        
        // Populate rankings table
        renderRankings(data.rankings);
        
        // Add event listeners for row interactions
        addRowEventListeners();
        
        // Hide loading, show table
        loadingEl.classList.add('hidden');
        tableEl.style.display = 'table';
        
    } catch (error) {
        console.error('Error fetching rankings:', error);
        loadingEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
    }
}

function setupTooltip() {
    const tooltip = document.getElementById('score-tooltip');
    
    // Hide tooltip when clicking anywhere on the document
    document.addEventListener('click', function(e) {
        // Only hide if clicking outside tooltip and score cells
        if (!e.target.classList.contains('score') && 
            !tooltip.contains(e.target)) {
            tooltip.classList.remove('visible');
            tooltip.classList.add('hidden');
        }
    });
    
    // Add some debugging
    console.log('Tooltip setup complete');
}

function renderRankings(rankings) {
    const tableBody = document.getElementById('rankings-body');
    tableBody.innerHTML = ''; // Clear any existing content
    
    rankings.forEach(player => {
        const row = document.createElement('tr');
        
        // Rank
        const rankCell = document.createElement('td');
        rankCell.textContent = player.rank;
        row.appendChild(rankCell);
        
        // Change
        const changeCell = document.createElement('td');
        if (player.change === "new") {
            changeCell.textContent = "NEW";
            changeCell.className = 'change-new';
        } else {
            const change = parseInt(player.change);
            if (change > 0) {
                changeCell.textContent = `+${change}`;
                changeCell.className = 'change-positive';
            } else if (change < 0) {
                changeCell.textContent = change;
                changeCell.className = 'change-negative';
            } else {
                changeCell.textContent = "=";
            }
        }
        row.appendChild(changeCell);
        
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
        
        // Score with difference
        const scoreCell = document.createElement('td');
        scoreCell.classList.add('score');
        
        // Create base score text
        const scoreText = document.createTextNode(`${player.score} `);
        scoreCell.appendChild(scoreText);
        
        // Add score difference in parentheses
        const scoreDiff = player.score - player.previous_score;
        const diffSpan = document.createElement('span');
        
        if (scoreDiff > 0) {
            diffSpan.textContent = `(+${scoreDiff})`;
            diffSpan.className = 'change-positive';
        } else if (scoreDiff < 0) {
            diffSpan.textContent = `(${scoreDiff})`;
            diffSpan.className = 'change-negative';
        } else {
            diffSpan.textContent = `(0)`;
        }
        
        scoreCell.appendChild(diffSpan);
        
        // Add score breakdown data if available
        if (player.score_breakdown) {
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
        }
        
        row.appendChild(scoreCell);
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners for row interactions
    addRowEventListeners();
    
    // After table is populated, make rows clickable
    makeTableRowsClickable();
}

// Add event listeners to table rows for chart display
function addRowEventListeners() {
    // Only add hover chart event listeners if screen is wide enough
    if (!isWideScreen()) {
        return;
    }
    
    const rows = document.querySelectorAll('#rankings-body tr');
    
    rows.forEach(row => {
        row.addEventListener('mouseenter', showPlayerChart);
        row.addEventListener('mouseleave', hidePlayerChart);
    });
}

// Show chart when hovering over a player row
function showPlayerChart(event) {
    // Don't show chart if screen is not wide enough
    if (!isWideScreen()) {
        return;
    }
    
    const row = event.currentTarget;
    const idCell = row.querySelector('td:nth-child(3)');
    const playerId = parseInt(idCell.textContent);
    
    // Find player data in rankings
    const playerData = rankingsData.rankings.find(p => p.player_id === playerId);
    
    // Check if player has history data
    if (!playerData || !playerData.history || playerData.history.length === 0) {
        return; // No history to display
    }
    
    // Get chart container
    const chartContainer = document.getElementById('player-chart-container');
    
    // Position the chart next to the table row
    const tableRect = document.querySelector('.rankings-wrapper').getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    
    chartContainer.style.top = (window.scrollY + rowRect.top - 50) + 'px';
    chartContainer.style.left = (tableRect.left - 470) + 'px'; // Position to the left of the table
    
    // Create the chart
    createPlayerChart(playerData);
    
    // Show the chart
    chartContainer.classList.remove('hidden');
    chartContainer.classList.add('visible');
}

// Hide chart when mouse leaves row
function hidePlayerChart() {
    const chartContainer = document.getElementById('player-chart-container');
    chartContainer.classList.remove('visible');
    chartContainer.classList.add('hidden');
    
    // Destroy chart to free resources
    if (playerChart) {
        playerChart.destroy();
        playerChart = null;
    }
}

// Create player score history chart
function createPlayerChart(playerData) {
    const chartCanvas = document.getElementById('player-chart');
    
    // Destroy existing chart if any
    if (playerChart) {
        playerChart.destroy();
    }
    
    // Get history data
    const history = playerData.history;
    
    // Extract chart data
    const seasons = history.map(h => `Season ${h.season}`);
    const scores = history.map(h => h.score);
    const ranks = history.map(h => h.rank);
    
    // Calculate y-axis min/max with padding
    const minScore = Math.floor(Math.min(...scores) * 0.9); // 10% padding below min
    const maxScore = Math.ceil(Math.max(...scores) * 1.1); // 10% padding above max
    
    // Create custom plugin to display score and rank on each point
    const dataLabelsPlugin = {
        id: 'datalabels',
        afterDatasetsDraw(chart) {
            const ctx = chart.ctx;
            
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                if (!meta.hidden) {
                    meta.data.forEach((element, index) => {
                        // Prepare label text with score and rank
                        const label = `${scores[index]} (${ranks[index]})`;
                        
                        // Draw label above point
                        ctx.save();
                        ctx.fillStyle = '#34495e';
                        ctx.font = 'bold 12px Roboto';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        ctx.fillText(label, element.x, element.y - 10);
                        ctx.restore();
                    });
                }
            });
        }
    };
    
    // Create chart
    playerChart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: seasons,
            datasets: [{
                label: 'Score History',
                data: scores,
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.2)',
                pointBackgroundColor: '#f39c12',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: minScore,
                    max: maxScore,
                    title: {
                        display: true,
                        text: 'Score',
                        color: '#34495e',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Season',
                        color: '#34495e',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Player ${playerData.player_id} Score History`,
                    color: '#34495e',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            return `Score: ${scores[index]}, Rank: ${ranks[index]}`;
                        }
                    }
                }
            }
        },
        plugins: [dataLabelsPlugin]
    });
}

function showScoreBreakdown(event) {
    console.log('Score interaction detected');
    const tooltip = document.getElementById('score-tooltip');
    
    // Check if tooltip exists, create if needed
    if (!tooltip) {
        console.log('Recreating tooltip element');
        const newTooltip = document.createElement('div');
        newTooltip.id = 'score-tooltip';
        newTooltip.className = 'tooltip hidden';
        document.body.appendChild(newTooltip);
        
        // Use the newly created tooltip
        showScoreBreakdown(event);
        return;
    }
    
    try {
        const breakdownData = JSON.parse(event.currentTarget.dataset.scoreBreakdown);
        console.log('Score breakdown data:', breakdownData);
        
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
        console.log('Raw data:', event.currentTarget.dataset.scoreBreakdown);
    }
}

function moveTooltip(event) {
    const tooltip = document.getElementById('score-tooltip');
    
    // Check if tooltip element exists
    if (!tooltip) {
        console.error("Tooltip element not found in moveTooltip!");
        return;
    }
    
    // Ensure tooltip is visible during calculation
    tooltip.style.display = 'block';
    
    // Position tooltip near the cursor
    const x = event.pageX + 15;
    const y = event.pageY - 30; // Position slightly above cursor
    
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
    
    // Check if tooltip exists
    if (!tooltip) {
        console.error("Tooltip element not found in hideTooltip!");
        return;
    }
    
    tooltip.classList.remove('visible');
    tooltip.classList.add('hidden');
}

// Make all ranking table rows clickable and navigate to player detail page
function makeTableRowsClickable() {
    console.log("Adding click handlers to table rows");
    const tableRows = document.querySelectorAll('#rankings-table tbody tr');
    
    tableRows.forEach(row => {
        // Determine which column has the player ID based on table type
        let playerIdCell;
        
        // Check if we're on a table where player ID is in the 2nd column (Other Rankings)
        if (document.querySelector('.total-title-table') || 
            document.querySelector('.highest-score-table') ||
            document.querySelector('.no1-table')) {
            playerIdCell = row.querySelector('td:nth-child(2)');
        } else {
            // Default (World Ranking) - player ID is in the 3rd column
            playerIdCell = row.querySelector('td:nth-child(3)');
        }
        
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
                            
                            // Determine the current page to add as source parameter
                            let source = "worldranking"; // default
                            
                            if (document.querySelector('.total-title-table')) {
                                source = "totaltitle";
                            } else if (document.querySelector('.highest-score-table')) {
                                source = "highestscore";
                            } else if (document.querySelector('.no1-table')) {
                                if (window.location.pathname.endsWith('no1-holder-consecutive.html')) {
                                    source = "consecutiveno1";
                                } else {
                                    source = "regularno1";
                                }
                            } else if (window.location.pathname.endsWith('historical-season.html')) {
                                source = "historicalseason";
                            }
                            
                            console.log(`Cell clicked, navigating to player detail for ID: ${playerId} from ${source}`);
                            
                            // Navigate to player detail page with source parameter
                            window.location.href = `player-detail.html?id=${playerId}&from=${source}`;
                        });
                    }
                });
                
                // Last cell is handled by the tap-for-tooltip logic already implemented
            } else {
                // On desktop: keep original row click behavior
                row.addEventListener('click', function() {
                    const playerId = playerIdCell.textContent.trim();
                    
                    // Determine the current page to add as source parameter
                    let source = "worldranking"; // default
                    
                    if (document.querySelector('.total-title-table')) {
                        source = "totaltitle";
                    } else if (document.querySelector('.highest-score-table')) {
                        source = "highestscore";
                    } else if (document.querySelector('.no1-table')) {
                        if (window.location.pathname.endsWith('no1-holder-consecutive.html')) {
                            source = "consecutiveno1";
                        } else {
                            source = "regularno1";
                        }
                    } else if (window.location.pathname.endsWith('historical-season.html')) {
                        source = "historicalseason";
                    }
                    
                    console.log(`Row clicked, navigating to player detail for ID: ${playerId} from ${source}`);
                    
                    // Navigate to player detail page with source parameter
                    window.location.href = `player-detail.html?id=${playerId}&from=${source}`;
                });
            }
            
            // Add hover class for better UX
            row.classList.add('clickable-row');
        } else {
            console.warn("Could not find player ID cell in row", row);
        }
    });
}

// Update event listeners when window resizes
window.addEventListener('resize', function() {
    // Re-initialize event listeners based on current viewport size
    if (rankingsData && rankingsData.rankings) {
        renderRankings(rankingsData.rankings);
    }
});

// Make function available globally
window.makeTableRowsClickable = makeTableRowsClickable;
