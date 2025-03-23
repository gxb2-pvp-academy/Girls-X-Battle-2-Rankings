// Use an IIFE to create a closure and avoid global variable conflicts
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Check if we're on the historical season ranking page
        if (window.location.pathname.endsWith('historical-season.html') || 
            document.getElementById('season-select')) {
            console.log("Historical season page detected");
            
            // Initialize tooltip
            initializeHistoricalTooltip();
            
            // Populate season dropdown
            populateSeasonDropdown();
            
            // Add event listener to season select dropdown
            const seasonSelect = document.getElementById('season-select');
            if (seasonSelect) {
                seasonSelect.addEventListener('change', function() {
                    const selectedSeason = this.value;
                    console.log("Selected season:", selectedSeason);
                    if (selectedSeason) {
                        fetchHistoricalRankings(selectedSeason);
                        
                        // Update the URL with the selected season
                        const url = new URL(window.location);
                        url.searchParams.set('season', selectedSeason);
                        window.history.pushState({}, '', url);
                    }
                });
            } else {
                console.error("Season select dropdown not found");
            }
        }
    });

    // Store data for this module - local to this closure
    let historicalRankingsData = null;
    let historicalPlayerChart = null;

    function initializeHistoricalTooltip() {
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
            if (!e.target.classList.contains('score') && 
                !tooltip.contains(e.target)) {
                tooltip.classList.remove('visible');
                tooltip.classList.add('hidden');
            }
        });
        
        console.log("Tooltip initialized");
    }

    async function populateSeasonDropdown() {
        const seasonSelect = document.getElementById('season-select');
        if (!seasonSelect) {
            console.error("Season select dropdown element not found!");
            return Promise.reject("Season select dropdown not found");
        }
        
        console.log("Populating season dropdown...");
        
        try {
            // Fetch available seasons
            console.log("Fetching seasons data...");
            const response = await fetch('data/historical/seasons.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Seasons data received:", data);
            
            // Set current season in welcome message
            const currentSeasonNote = document.getElementById('current-season-note');
            if (currentSeasonNote) {
                currentSeasonNote.textContent = data.current_season;
            }
            
            // Get historical seasons and sort in descending order
            const historicalSeasons = data.historical_seasons.sort((a, b) => b - a);
            console.log("Historical seasons:", historicalSeasons);
            
            // Clear previous options except the first one (the "Select season" placeholder)
            while (seasonSelect.options.length > 1) {
                seasonSelect.remove(1);
            }
            
            // Add options for each season
            historicalSeasons.forEach(season => {
                const option = document.createElement('option');
                option.value = season;
                option.textContent = `Season ${season}`; // Add "Season" prefix
                seasonSelect.appendChild(option);
            });
            
            // Check for season parameter in URL after populating dropdown
            const urlParams = new URLSearchParams(window.location.search);
            const seasonParam = urlParams.get('season');
            
            if (seasonParam) {
                console.log(`Season parameter found in URL: ${seasonParam}`);
                // Set the selected season after a short delay to ensure dropdown is ready
                setTimeout(() => {
                    seasonSelect.value = seasonParam;
                    // Trigger change event to load the season data
                    seasonSelect.dispatchEvent(new Event('change'));
                }, 100);
            }
            
            return Promise.resolve();
            
        } catch (error) {
            console.error('Error fetching seasons data:', error);
            seasonSelect.innerHTML = '<option value="" disabled selected>Error loading seasons</option>';
            return Promise.reject(error);
        }
    }

    async function fetchHistoricalRankings(season) {
        const loadingEl = document.getElementById('loading');
        const errorEl = document.getElementById('error');
        const tableEl = document.getElementById('rankings-table');
        const welcomeEl = document.getElementById('welcome-message');
        const rankingsContainerEl = document.getElementById('rankings-container');
        
        // Reset any previous data
        historicalRankingsData = null;
        if (historicalPlayerChart) {
            historicalPlayerChart.destroy();
            historicalPlayerChart = null;
        }
        
        // Update loading message and hide welcome message
        loadingEl.textContent = `Loading Season ${season} rankings data...`;
        loadingEl.classList.remove('hidden');
        if (errorEl) errorEl.classList.add('hidden');
        if (welcomeEl) welcomeEl.style.display = 'none';
        
        try {
            const response = await fetch(`data/historical/season_${season}.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Store data globally
            historicalRankingsData = data;
            
            // Update season display in dropdown (instead of using current-season span)
            const seasonSelect = document.getElementById('season-select');
            if (seasonSelect) {
                // Make sure the correct season is selected in the dropdown
                for (let i = 0; i < seasonSelect.options.length; i++) {
                    if (seasonSelect.options[i].value == season) {
                        seasonSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            // Update last updated info
            const lastUpdatedEl = document.getElementById('last-updated');
            if (lastUpdatedEl) {
                lastUpdatedEl.textContent = data.last_updated;
            }
            
            // Populate rankings table
            renderRankings(data.rankings);
            
            // Add event listeners for row interactions
            addRowEventListeners();
            
            // Hide loading, show rankings container
            loadingEl.classList.add('hidden');
            if (rankingsContainerEl) rankingsContainerEl.style.display = 'block';
            
        } catch (error) {
            console.error(`Error fetching Season ${season} rankings:`, error);
            loadingEl.classList.add('hidden');
            if (errorEl) errorEl.classList.remove('hidden');
            // Show welcome message again on error
            if (welcomeEl) welcomeEl.style.display = 'block';
        }
    }

    // Helper function to check if the device is mobile (width <= 768px)
    function isMobileDevice() {
        return window.innerWidth <= 768;
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

        // After table is populated, make rows clickable with a local function
        // to avoid dependency on main.js exports
        makeRowsClickable();
    }

    // Local function to make table rows clickable - avoids reference errors
    function makeRowsClickable() {
        console.log("Adding click handlers to historical table rows");
        const tableRows = document.querySelectorAll('#rankings-table tbody tr');
        
        // Get the currently selected season
        const seasonSelect = document.getElementById('season-select');
        const selectedSeason = seasonSelect ? seasonSelect.value : null;
        
        tableRows.forEach(row => {
            // For historical rankings, player ID is always in the 3rd column
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
                                console.log(`Cell clicked, navigating to player detail for ID: ${playerId} from season ${selectedSeason}`);
                                
                                // Navigate to player detail page with season parameter
                                window.location.href = `player-detail.html?id=${playerId}&from=historicalseason&season=${selectedSeason}`;
                            });
                        }
                    });
                    
                    // Last cell is handled by the tap-for-tooltip logic already implemented
                } else {
                    // On desktop: keep original row click behavior
                    row.addEventListener('click', function() {
                        const playerId = playerIdCell.textContent.trim();
                        console.log(`Historical row clicked, navigating to player detail for ID: ${playerId} from season ${selectedSeason}`);
                        
                        // Navigate to player detail page with season parameter
                        window.location.href = `player-detail.html?id=${playerId}&from=historicalseason&season=${selectedSeason}`;
                    });
                }
                
                // Add hover class for better UX
                row.classList.add('clickable-row');
            }
        });
    }

    // Add event listeners to table rows for chart display
    function addRowEventListeners() {
        const rows = document.querySelectorAll('#rankings-body tr');
        
        rows.forEach(row => {
            row.addEventListener('mouseenter', showPlayerChart);
            row.addEventListener('mouseleave', hidePlayerChart);
        });
    }

    // Show chart when hovering over a player row
    function showPlayerChart(event) {
        const row = event.currentTarget;
        const idCell = row.querySelector('td:nth-child(3)');
        const playerId = parseInt(idCell.textContent);
        
        // Find player data in rankings (use the renamed variable)
        const playerData = historicalRankingsData.rankings.find(p => p.player_id === playerId);
        
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
        if (historicalPlayerChart) {
            historicalPlayerChart.destroy();
            historicalPlayerChart = null;
        }
    }

    // Create player score history chart
    function createPlayerChart(playerData) {
        const chartCanvas = document.getElementById('player-chart');
        
        // Destroy existing chart if any
        if (historicalPlayerChart) {
            historicalPlayerChart.destroy();
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

        // Create chart - use historicalPlayerChart instead of playerChart
        historicalPlayerChart = new Chart(chartCanvas, {
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
        const tooltip = document.getElementById('score-tooltip');
        
        if (!tooltip) return;
        
        try {
            const breakdownData = JSON.parse(event.currentTarget.dataset.scoreBreakdown);
            
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

    // Expose functions that need to be called from HTML
    window.showHistoricalScoreBreakdown = showScoreBreakdown;
    window.moveHistoricalTooltip = moveTooltip;
    window.hideHistoricalTooltip = hideTooltip;

    // Update event listeners when window resizes or season changes
    window.addEventListener('resize', function() {
        // Re-fetch data for the currently selected season
        const seasonSelect = document.getElementById('season-select');
        if (seasonSelect && seasonSelect.value) {
            fetchHistoricalRankings(seasonSelect.value);
        }
    });
})();
