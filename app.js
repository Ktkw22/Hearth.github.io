// ==================== Data Management ====================

const STORAGE_KEY = 'fitness_workouts';

const workoutTypes = {
    running: { name: 'วิ่ง', icon: '🏃' },
    cycling: { name: 'ปั่นจักรยาน', icon: '🚴' },
    swimming: { name: 'ว่ายน้ำ', icon: '🏊' },
    weight: { name: 'ยกน้ำหนัก', icon: '🏋️' },
    yoga: { name: 'โยคะ', icon: '🧘' },
    other: { name: 'อื่นๆ', icon: '💪' }
};

function getWorkouts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveWorkouts(workouts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

function addWorkout(workout) {
    const workouts = getWorkouts();
    workout.id = Date.now();
    workout.createdAt = new Date().toISOString();
    workouts.unshift(workout);
    saveWorkouts(workouts);
    return workout;
}

function deleteWorkout(id) {
    const workouts = getWorkouts().filter(w => w.id !== id);
    saveWorkouts(workouts);
}

// ==================== UI Functions ====================

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function updateStats() {
    const workouts = getWorkouts();
    
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const totalDistance = workouts.reduce((sum, w) => sum + (w.distance || 0), 0);
    
    document.getElementById('total-workouts').textContent = totalWorkouts;
    document.getElementById('total-duration').textContent = totalDuration.toLocaleString();
    document.getElementById('total-calories').textContent = totalCalories.toLocaleString();
    document.getElementById('total-distance').textContent = totalDistance.toFixed(1);
}

function renderWorkoutList() {
    const container = document.getElementById('workout-list');
    const filterType = document.getElementById('filter-type').value;
    const filterPeriod = document.getElementById('filter-period').value;
    
    let workouts = getWorkouts();
    
    // Filter by type
    if (filterType !== 'all') {
        workouts = workouts.filter(w => w.type === filterType);
    }
    
    // Filter by period
    if (filterPeriod !== 'all') {
        const days = parseInt(filterPeriod);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        workouts = workouts.filter(w => new Date(w.date) >= cutoff);
    }
    
    if (workouts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">ยังไม่มีข้อมูล</p>';
        return;
    }
    
    container.innerHTML = workouts.map(workout => {
        const typeInfo = workoutTypes[workout.type] || workoutTypes.other;
        return `
            <div class="workout-item" data-id="${workout.id}">
                <div class="workout-info">
                    <h4>${typeInfo.icon} ${typeInfo.name}</h4>
                    <span>${formatDate(workout.date)}</span>
                    ${workout.notes ? `<p style="font-size: 0.8rem; margin-top: 4px;">${workout.notes}</p>` : ''}
                </div>
                <div class="workout-stats">
                    <div class="duration">${workout.duration} นาที</div>
                    ${workout.calories ? `<div class="calories">${workout.calories} kcal</div>` : ''}
                    ${workout.distance ? `<div class="calories">${workout.distance} km</div>` : ''}
                </div>
                <div class="workout-actions">
                    <button onclick="handleDelete(${workout.id})" title="ลบ">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function handleDelete(id) {
    if (confirm('ต้องการลบรายการนี้หรือไม่?')) {
        deleteWorkout(id);
        refreshUI();
    }
}

function refreshUI() {
    updateStats();
    renderWorkoutList();
    updateCharts();
}

// ==================== Form Handling ====================

document.getElementById('workout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const workout = {
        date: document.getElementById('date').value,
        type: document.getElementById('type').value,
        duration: parseInt(document.getElementById('duration').value),
        calories: parseInt(document.getElementById('calories').value) || 0,
        distance: parseFloat(document.getElementById('distance').value) || 0,
        notes: document.getElementById('notes').value.trim()
    };
    
    addWorkout(workout);
    e.target.reset();
    
    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();
    
    refreshUI();
    
    // Show success feedback
    const btn = e.target.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = '✓ บันทึกแล้ว!';
    btn.style.background = 'var(--success)';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 1500);
});

// Filter event listeners
document.getElementById('filter-type').addEventListener('change', renderWorkoutList);
document.getElementById('filter-period').addEventListener('change', renderWorkoutList);

// ==================== Initialize ====================

document.addEventListener('DOMContentLoaded', () => {
    // Set default date
    document.getElementById('date').valueAsDate = new Date();
    
    // Initial render
    refreshUI();
});
