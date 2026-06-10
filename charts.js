let weeklyChart, typeChart, progressChart;

function updateCharts() {
    const workouts = getWorkouts();
    
    updateWeeklyChart(workouts);
    updateTypeChart(workouts);
    updateProgressChart(workouts);
}

function updateWeeklyChart(workouts) {
    const ctx = document.getElementById('weekly-chart').getContext('2d');
    
    // Get last 7 days
    const days = [];
    const durations = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        days.push(date.toLocaleDateString('th-TH', { weekday: 'short' }));
        
        const dayWorkouts = workouts.filter(w => w.date === dateStr);
        const totalDuration = dayWorkouts.reduce((sum, w) => sum + w.duration, 0);
        durations.push(totalDuration);
    }
    
    if (weeklyChart) weeklyChart.destroy();
    
    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'เวลาออกกำลังกาย (นาที)',
                data: durations,
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'สรุป 7 วันล่าสุด'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateTypeChart(workouts) {
    const ctx = document.getElementById('type-chart').getContext('2d');
    
    // Count by type
    const typeCounts = {};
    workouts.forEach(w => {
        typeCounts[w.type] = (typeCounts[w.type] || 0) + 1;
    });
    
    const labels = Object.keys(typeCounts).map(t => workoutTypes[t]?.name || t);
    const data = Object.values(typeCounts);
    
    const colors = [
        '#ef4444', '#3b82f6', '#06b6d4', '#f59e0b', '#a855f7', '#64748b'
    ];
    
    if (typeChart) typeChart.destroy();
    
    typeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'สัดส่วนประเภทการออกกำลังกาย'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateProgressChart(workouts) {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    
    // Get last 30 days cumulative data
    const dailyData = {};
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyData[dateStr] = { duration: 0, calories: 0 };
    }
    
    // Fill with workout data
    workouts.forEach(w => {
        if (dailyData[w.date]) {
            dailyData[w.date].duration += w.duration;
            dailyData[w.date].calories += w.calories || 0;
        }
    });
    
    const labels = Object.keys(dailyData).map(d => {
        const date = new Date(d);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    
    // Calculate cumulative values
    let cumDuration = 0;
    let cumCalories = 0;
    const cumulativeDuration = [];
    const cumulativeCalories = [];
    
    Object.values(dailyData).forEach(day => {
        cumDuration += day.duration;
        cumCalories += day.calories;
        cumulativeDuration.push(cumDuration);
        cumulativeCalories.push(cumCalories);
    });
    
    if (progressChart) progressChart.destroy();
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'เวลาสะสม (นาที)',
                    data: cumulativeDuration,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: 'แคลอรี่สะสม',
                    data: cumulativeCalories,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: 'ความก้าวหน้า 30 วัน'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}
