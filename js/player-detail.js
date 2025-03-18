document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the player detail page
    if (window.location.pathname.endsWith('player-detail.html')) {
        console.log("Player detail page detected");
        
        // Get player ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const playerId = urlParams.get('id');
        const source = urlParams.get('from');
        
        // Set up the "Back to" link
        setupBackLink(source);
        
        if (playerId) {
            // Load player data
            loadPlayerData(playerId);
        } else {
            // No player ID provided
            showError("No player ID provided");
        }
    }
});

// Function to set up the "Back to" link
function setupBackLink(source) {
    const backLink = document.getElementById('back-link');
    if (!backLink) return;
    
    // Get season parameter if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const season = urlParams.get('season');
    
    let targetPage = "Player Search";
    let targetUrl = "player-search.html";
    
    // Determine where to go back to based on the source parameter
    if (source) {
        switch (source) {
            case 'worldranking':
                targetPage = "World Ranking";
                targetUrl = "world-ranking.html";
                break;
            case 'highestscore':
                targetPage = "Highest Score Ranking";
                targetUrl = "highest-score.html";
                break;
            case 'totaltitle':
                targetPage = "Total Title Ranking";
                targetUrl = "total-title.html";
                break;
            case 'consecutiveno1':
                targetPage = "World No.1 Ranking (Consecutive)";
                targetUrl = "no1-holder-consecutive.html";
                break;
            case 'regularno1':
                targetPage = "World No.1 Ranking (Regular)";
                targetUrl = "no1-holder-regular.html";
                break;
            case 'historicalseason':
                if (season) {
                    // Include season in both page name and URL
                    targetPage = `Historical Season Ranking (Season ${season})`;
                    targetUrl = `historical-season.html?season=${season}`;
                } else {
                    targetPage = "Historical Season Ranking";
                    targetUrl = "historical-season.html";
                }
                break;
            default:
                // Default to player search
                break;
        }
    } else if (document.referrer) {
        // Try to guess from the referrer URL if no source parameter is provided
        try {
            const referrer = new URL(document.referrer);
            const referrerPath = referrer.pathname.split('/').pop();
            
            if (referrerPath === 'world-ranking.html') {
                targetPage = "World Ranking";
                targetUrl = "world-ranking.html";
            } else if (referrerPath === 'highest-score.html') {
                targetPage = "Highest Score Ranking";
                targetUrl = "highest-score.html";
            } else if (referrerPath === 'total-title.html') {
                targetPage = "Total Title Ranking";
                targetUrl = "total-title.html";
            } else if (referrerPath === 'no1-holder-consecutive.html') {
                targetPage = "World No.1 Ranking (Consecutive)";
                targetUrl = "no1-holder-consecutive.html";
            } else if (referrerPath === 'no1-holder-regular.html') {
                targetPage = "World No.1 Ranking (Regular)";
                targetUrl = "no1-holder-regular.html";
            } else if (referrerPath === 'historical-season.html') {
                // Try to extract season from referrer URL
                const referrerParams = new URLSearchParams(referrer.search);
                const referrerSeason = referrerParams.get('season');
                
                if (referrerSeason) {
                    targetPage = `Historical Season Ranking (Season ${referrerSeason})`;
                    targetUrl = `historical-season.html?season=${referrerSeason}`;
                } else {
                    targetPage = "Historical Season Ranking";
                    targetUrl = "historical-season.html";
                }
            }
        } catch (error) {
            console.error("Error parsing referrer:", error);
        }
    }
    
    // Update the link text and href
    backLink.textContent = `Back to ${targetPage}`;
    backLink.href = targetUrl;
}

// Variable to store player history chart
let playerHistoryChart = null;

// Load player data from various sources
async function loadPlayerData(playerId) {
    try {
        // Show loading indicator
        document.getElementById('loading').style.display = 'block';
        document.getElementById('player-content').classList.add('hidden');
        document.getElementById('error-message').classList.add('hidden');
        
        // Convert to number to ensure consistent comparison
        const playerIdNum = parseInt(playerId);
        
        // Load data from all necessary sources
        const data = await Promise.all([
            fetch('data/rankings.json').then(res => res.json()),
            fetch('data/highest_scores.json').then(res => res.json()),
            fetch('data/total_titles.json').then(res => res.json()),
            fetch('data/regular_no1.json').then(res => res.json()),
            fetch('data/consecutive_no1.json').then(res => res.json()),
            fetch('data/all_player_history.json').then(res => res.json())
        ]);
        
        // Process the data
        const worldRankings = data[0];
        const highestScores = data[1];
        const totalTitles = data[2];
        const regularNo1 = data[3];
        const consecutiveNo1 = data[4];
        const allPlayerHistory = data[5];
        
        // Find player in current world rankings
        const currentRanking = worldRankings.rankings.find(p => p.player_id === playerIdNum);
        
        // Find player in highest scores
        const highestScore = highestScores.highest_scores.find(p => p.player_id === playerIdNum);
        
        // Find player in total titles
        const titles = totalTitles.total_titles.find(p => p.player_id === playerIdNum);
        
        // Find player in regular No.1 rankings
        const regularNo1Data = regularNo1.rankings.find(p => p.player_id === playerIdNum);
        
        // Find player in consecutive No.1 rankings
        const consecutiveNo1Data = consecutiveNo1.rankings.find(p => p.player_id === playerIdNum);
        
        // Find player history
        const playerHistory = allPlayerHistory.players[playerIdNum];
        
        if (!playerHistory) {
            throw new Error("Player data not found");
        }
        
        // Populate player details
        populatePlayerDetails({
            playerId: playerIdNum,
            currentRanking,
            highestScore,
            titles,
            regularNo1: regularNo1Data,
            consecutiveNo1: consecutiveNo1Data,
            history: playerHistory,
            lastUpdated: worldRankings.last_updated
        });
        
        // Hide loading, show content
        document.getElementById('loading').style.display = 'none';
        document.getElementById('player-content').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading player data:', error);
        showError("Player data could not be loaded");
    }
}

// Show error message
function showError(message) {
    document.getElementById('loading').style.display = 'none';
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

// Populate player details from loaded data
function populatePlayerDetails(playerData) {
    // Basic info
    document.getElementById('player-id').textContent = playerData.playerId;
    document.getElementById('player-image').src = `data/players/${playerData.playerId}.jpg`;
    document.getElementById('player-image').onerror = function() {
        this.src = 'images/no-image.png'; // Fallback image
    };
    document.title = `Player ${playerData.playerId} - GXB2 Rankings`;
    
    // Current world ranking
    if (playerData.currentRanking) {
        document.getElementById('current-ranking').textContent = `#${playerData.currentRanking.rank} (Score ${playerData.currentRanking.score})`;
    } else {
        document.getElementById('current-ranking').textContent = 'No rank currently';
    }
    
    // Highest world ranking ever achieved
    let highestRankEver = Infinity;
    let highestRankSeason = "";
    
    if (playerData.history && playerData.history.rankings.length > 0) {
        // Find the highest (lowest number) ranking and its season
        playerData.history.rankings.forEach(rankData => {
            if (rankData.rank < highestRankEver) {
                highestRankEver = rankData.rank;
                highestRankSeason = rankData.season;
            }
        });
        
        document.getElementById('highest-ranking').textContent = 
            `#${highestRankEver} (Season ${highestRankSeason})`;
    } else {
        document.getElementById('highest-ranking').textContent = 'No data available';
    }
    
    // Highest score
    if (playerData.highestScore) {
        document.getElementById('highest-score').textContent = 
            `${playerData.highestScore.score} (Season ${playerData.highestScore.achieved_season})`;
    } else {
        document.getElementById('highest-score').textContent = 'No data available';
    }
    
    // Title counts
    if (playerData.titles) {
        document.getElementById('total-titles').textContent = playerData.titles.total;
        document.getElementById('champion-count').textContent = playerData.titles.champion;
        document.getElementById('runnerup-count').textContent = playerData.titles.runnerup;
        document.getElementById('top4-count').textContent = playerData.titles.top4;
        document.getElementById('top8-count').textContent = playerData.titles.top8;
    } else {
        document.getElementById('total-titles').textContent = '0';
        document.getElementById('champion-count').textContent = '0';
        document.getElementById('runnerup-count').textContent = '0';
        document.getElementById('top4-count').textContent = '0';
        document.getElementById('top8-count').textContent = '0';
    }
    
    // World No.1 seasons
    let regularNo1Text = 'NA';
    let consecutiveNo1Text = 'NA';
    
    if (playerData.regularNo1) {
        regularNo1Text = playerData.regularNo1.count.toString();
    }
    
    if (playerData.consecutiveNo1) {
        consecutiveNo1Text = playerData.consecutiveNo1.count.toString();
    }
    
    document.getElementById('no1-seasons').textContent = `${regularNo1Text} (${consecutiveNo1Text} consecutive)`;
    
    // First and last appearances
    if (playerData.history && playerData.history.appearances.length > 0) {
        const appearances = playerData.history.appearances.sort((a, b) => a - b);
        const firstAppearance = appearances[0];
        const lastAppearance = appearances[appearances.length - 1];
        
        document.getElementById('appearances').textContent = 
            `Season ${firstAppearance} - Season ${lastAppearance}`;
    } else {
        document.getElementById('appearances').textContent = 'No data available';
    }
    
    // Last updated
    document.getElementById('last-updated').textContent = `Last Updated: ${playerData.lastUpdated}`;
    
    // Create the history chart
    createPlayerHistoryChart(playerData.history);
}

// Create the player history chart
function createPlayerHistoryChart(historyData) {
    if (!historyData || !historyData.rankings || historyData.rankings.length === 0) {
        // If no history data, hide the chart section
        document.querySelector('.chart-section').style.display = 'none';
        return;
    }
    
    // Get the canvas element
    const canvas = document.getElementById('player-history-chart');
    
    // Sort rankings chronologically by season
    const sortedRankings = [...historyData.rankings].sort((a, b) => a.season - b.season);
    
    // Prepare the data
    const seasons = sortedRankings.map(r => `Season ${r.season}`);
    const scores = sortedRankings.map(r => r.score);
    const ranks = sortedRankings.map(r => r.rank);
    
    // Destroy any existing chart
    if (playerHistoryChart) {
        playerHistoryChart.destroy();
    }
    
    // Create the chart
    playerHistoryChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: seasons,
            datasets: [
                {
                    label: 'Score',
                    data: scores,
                    backgroundColor: 'rgba(243, 156, 18, 0.2)',
                    borderColor: 'rgba(243, 156, 18, 1)',
                    borderWidth: 2,
                    yAxisID: 'y',
                    tension: 0.1,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Rank',
                    data: ranks,
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    yAxisID: 'y1',
                    tension: 0.1,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Season'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Score'
                    },
                    min: 0,
                    grid: {
                        drawOnChartArea: false
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Rank'
                    },
                    min: 1,
                    reverse: true, // Higher ranks are lower numbers
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const datasetLabel = context.dataset.label;
                            const value = context.raw;
                            if (datasetLabel === 'Rank') {
                                return `Rank: #${value}`;
                            } else {
                                return `Score: ${value}`;
                            }
                        }
                    }
                }
            }
        }
    });
}
