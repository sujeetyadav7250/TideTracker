// Tide chart functionality using Chart.js
let tideChart = null;

// Initialize the tide chart
function initTideChart() {
    const ctx = document.getElementById('tideChart').getContext('2d');
    
    if (tideChart) {
        tideChart.destroy();
    }
    
    // Prepare data for the chart
    const labels = tideData.tides.map(tide => tide.time.format('h A'));
    const data = tideData.tides.map(tide => tide.height);
    const tideTypes = tideData.tides.map(tide => tide.type);
    
    // Create gradient for the chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(52, 152, 219, 0.8)');
    gradient.addColorStop(1, 'rgba(52, 152, 219, 0.1)');
    
    tideChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tide Height (m)',
                data: data,
                backgroundColor: gradient,
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: function(context) {
                    const index = context.dataIndex;
                    return tideTypes[index] === 'high' ? '#e74c3c' : '#3498db';
                },
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const tideType = tideTypes[index];
                            return `${tideType.charAt(0).toUpperCase() + tideType.slice(1)} Tide: ${context.parsed.y}m`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Tide Height (m)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    });
}