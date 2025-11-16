// Global Variables
let map;
let disasterMarkers = [];
let charts = {};
let measurementInterval;
let alertInterval;
let currentFilter = 'all';
let isMonitoring = false;
let measurementMode = false;

// Disaster Data
const disasterData = [
    {
        id: 1,
        type: 'flood',
        severity: 'critical',
        location: { lat: 40.7128, lng: -74.0060 },
        title: 'Flash Flood Emergency',
        description: 'Severe flooding in Manhattan area',
        time: new Date().toISOString(),
        affected: '5,000+ people',
        windSpeed: 45,
        temperature: 18,
        humidity: 85
    },
    {
        id: 2,
        type: 'earthquake',
        severity: 'high',
        location: { lat: 34.0522, lng: -118.2437 },
        title: 'Magnitude 5.8 Earthquake',
        description: 'Earthquake detected near Los Angeles',
        time: new Date().toISOString(),
        affected: '12,000+ people',
        windSpeed: 12,
        temperature: 22,
        humidity: 45
    },
    {
        id: 3,
        type: 'fire',
        severity: 'medium',
        location: { lat: 37.7749, lng: -122.4194 },
        title: 'Wildfire Alert',
        description: 'Wildfire spreading in Napa Valley',
        time: new Date().toISOString(),
        affected: '800+ people',
        windSpeed: 25,
        temperature: 35,
        humidity: 25
    },
    {
        id: 4,
        type: 'storm',
        severity: 'high',
        location: { lat: 41.8781, lng: -87.6298 },
        title: 'Severe Thunderstorm',
        description: 'Heavy rain and strong winds in Chicago',
        time: new Date().toISOString(),
        affected: '3,500+ people',
        windSpeed: 65,
        temperature: 15,
        humidity: 90
    },
    {
        id: 5,
        type: 'landslide',
        severity: 'medium',
        location: { lat: 47.6062, lng: -122.3321 },
        title: 'Landslide Warning',
        description: 'Landslide risk in Seattle area',
        time: new Date().toISOString(),
        affected: '300+ people',
        windSpeed: 18,
        temperature: 12,
        humidity: 75
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeCharts();
    setupEventListeners();
    startRealTimeUpdates();
    loadAlerts();
    updateStatistics();
});

// Initialize Leaflet Map
function initializeMap() {
    // Create map centered on USA
    map = L.map('disasterMap').setView([39.8283, -98.5795], 4);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    // Add disaster markers
    disasterData.forEach(disaster => {
        addDisasterMarker(disaster);
    });

    // Add map controls
    addMapControls();
}

// Add Disaster Marker to Map
function addDisasterMarker(disaster) {
    const colors = {
        flood: '#3b82f6',
        earthquake: '#ef4444',
        fire: '#f97316',
        storm: '#8b5cf6',
        landslide: '#10b981'
    };

    const sizeColors = {
        critical: 15,
        high: 12,
        medium: 10,
        low: 8
    };

    const marker = L.circleMarker([disaster.location.lat, disaster.location.lng], {
        radius: sizeColors[disaster.severity] || 10,
        fillColor: colors[disaster.type],
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);

    // Create popup content
    const popupContent = `
        <div class="p-3 max-w-xs">
            <div class="flex items-center mb-2">
                <div class="w-3 h-3 rounded-full mr-2 disaster-severity-${disaster.severity}"></div>
                <h4 class="font-bold text-lg">${disaster.title}</h4>
            </div>
            <p class="text-sm text-gray-600 mb-3">${disaster.description}</p>
            <div class="space-y-1 text-xs">
                <div class="flex justify-between">
                    <span class="font-semibold">Type:</span>
                    <span class="capitalize">${disaster.type}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-semibold">Severity:</span>
                    <span class="capitalize text-${getSeverityColor(disaster.severity)}-600">${disaster.severity}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-semibold">Affected:</span>
                    <span>${disaster.affected}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-semibold">Wind:</span>
                    <span>${disaster.windSpeed} km/h</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-semibold">Temp:</span>
                    <span>${disaster.temperature}°C</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-semibold">Humidity:</span>
                    <span>${disaster.humidity}%</span>
                </div>
            </div>
            <div class="mt-3 pt-3 border-t">
                <button onclick="viewDisasterDetails(${disaster.id})" class="w-full bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600 transition-colors">
                    View Details
                </button>
            </div>
        </div>
    `;

    marker.bindPopup(popupContent);
    
    disasterMarkers.push({ marker, type: disaster.type, severity: disaster.severity });
}

// Add Map Controls
function addMapControls() {
    // Measurement control
    const measureControl = L.control({ position: 'topleft' });
    measureControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.innerHTML = `
            <a class="leaflet-bar-part" href="#" id="measureToggle" title="Toggle measurement mode">
                <i class="fas fa-ruler-combined"></i>
            </a>
        `;
        return div;
    };
    measureControl.addTo(map);

    // Heatmap toggle
    const heatmapControl = L.control({ position: 'topleft' });
    heatmapControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.innerHTML = `
            <a class="leaflet-bar-part" href="#" id="heatmapToggle" title="Toggle heatmap">
                <i class="fas fa-thermometer-half"></i>
            </a>
        `;
        return div;
    };
    heatmapControl.addTo(map);

    // Zoom to fit all markers
    const fitControl = L.control({ position: 'topleft' });
    fitControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.innerHTML = `
            <a class="leaflet-bar-part" href="#" id="fitMarkers" title="Fit all markers">
                <i class="fas fa-expand"></i>
            </a>
        `;
        return div;
    };
    fitControl.addTo(map);
}

// Initialize Charts
function initializeCharts() {
    // Disaster Distribution Chart
    const disasterCtx = document.getElementById('disasterChart').getContext('2d');
    charts.disaster = new Chart(disasterCtx, {
        type: 'doughnut',
        data: {
            labels: ['Flood', 'Earthquake', 'Wildfire', 'Storm', 'Landslide'],
            datasets: [{
                data: [30, 25, 20, 20, 5],
                backgroundColor: [
                    '#3b82f6',
                    '#ef4444',
                    '#f97316',
                    '#8b5cf6',
                    '#10b981'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });

    // Real-time Activity Chart
    const activityCtx = document.getElementById('activityChart').getContext('2d');
    charts.activity = new Chart(activityCtx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(12),
            datasets: [{
                label: 'Disaster Events',
                data: generateRandomData(12, 5, 25),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 750
            }
        }
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile menu
    document.getElementById('mobileMenuBtn').addEventListener('click', toggleMobileMenu);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterDisasters(this.dataset.type);
            updateFilterButtons(this);
        });
    });

    // Map controls
    document.getElementById('measureBtn').addEventListener('click', toggleMeasurement);
    document.getElementById('heatmapBtn').addEventListener('click', toggleHeatmap);
    document.getElementById('viewMapBtn').addEventListener('click', scrollToMap);
    document.getElementById('startMonitoringBtn').addEventListener('click', toggleMonitoring);
    document.getElementById('refreshBtn').addEventListener('click', refreshData);

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Map control listeners
    document.getElementById('measureToggle')?.addEventListener('click', toggleMeasurement);
    document.getElementById('heatmapToggle')?.addEventListener('click', toggleHeatmap);
    document.getElementById('fitMarkers')?.addEventListener('click', fitAllMarkers);
}

// Real-time Updates
function startRealTimeUpdates() {
    // Update measurements every 2 seconds
    measurementInterval = setInterval(updateMeasurements, 2000);
    
    // Update statistics every 5 seconds
    setInterval(updateStatistics, 5000);
    
    // Update charts every 10 seconds
    setInterval(updateCharts, 10000);
    
    // Check for new alerts every 15 seconds
    alertInterval = setInterval(checkNewAlerts, 15000);
}

// Update Real-time Measurements
function updateMeasurements() {
    const measurements = {
        windSpeed: Math.floor(Math.random() * 80) + 10,
        temperature: Math.floor(Math.random() * 35) + 5,
        humidity: Math.floor(Math.random() * 60) + 30,
        airQuality: Math.floor(Math.random() * 150) + 20,
        seismic: (Math.random() * 4).toFixed(1),
        pressure: Math.floor(Math.random() * 50) + 980
    };

    // Update wind speed
    updateMeasurement('windSpeed', measurements.windSpeed, 100, 'km/h');
    document.getElementById('maxWindSpeed').textContent = Math.floor(Math.random() * 40) + 60;

    // Update temperature
    updateMeasurement('temperature', measurements.temperature, 50, '°C');
    document.getElementById('tempRange').textContent = `${Math.floor(Math.random() * 5) + 10}-${Math.floor(Math.random() * 10) + 35}`;

    // Update humidity
    updateMeasurement('humidity', measurements.humidity, 100, '%');
    const humidityStatus = measurements.humidity > 70 ? 'High' : measurements.humidity > 40 ? 'Normal' : 'Low';
    document.getElementById('humidityStatus').textContent = humidityStatus;

    // Update air quality
    updateMeasurement('airQuality', measurements.airQuality, 300, '');
    const aqiLevel = measurements.airQuality > 150 ? 'Hazardous' : measurements.airQuality > 100 ? 'Unhealthy' : measurements.airQuality > 50 ? 'Moderate' : 'Good';
    document.getElementById('airQualityLevel').textContent = aqiLevel;

    // Update seismic activity
    document.getElementById('seismic').textContent = measurements.seismic;
    const seismicPercent = (measurements.seismic / 6) * 100;
    document.getElementById('seismicBar').style.width = seismicPercent + '%';
    const seismicStatus = measurements.seismic > 4 ? 'High' : measurements.seismic > 2 ? 'Moderate' : 'Low';
    document.getElementById('seismicStatus').textContent = seismicStatus;

    // Update pressure
    updateMeasurement('pressure', measurements.pressure, 1050, 'hPa');
    const pressureTrend = Math.random() > 0.5 ? 'Rising' : Math.random() > 0.5 ? 'Falling' : 'Stable';
    document.getElementById('pressureTrend').textContent = pressureTrend;
}

// Update Individual Measurement
function updateMeasurement(id, value, max, unit) {
    const element = document.getElementById(id);
    const barElement = document.getElementById(id + 'Bar');
    
    if (element) {
        element.textContent = value;
    }
    
    if (barElement) {
        const percentage = (value / max) * 100;
        barElement.style.width = Math.min(percentage, 100) + '%';
    }
}

// Update Statistics
function updateStatistics() {
    const stats = {
        activeDisasters: Math.floor(Math.random() * 8) + 5,
        affectedPeople: Math.floor(Math.random() * 20000) + 10000,
        responseTime: Math.floor(Math.random() * 180) + 30,
        totalDisasters: Math.floor(Math.random() * 50) + 20,
        criticalAlerts: Math.floor(Math.random() * 5) + 1,
        activeRegions: Math.floor(Math.random() * 10) + 5,
        systemHealth: Math.floor(Math.random() * 5) + 95
    };

    // Update hero section stats
    document.getElementById('activeDisasters').textContent = stats.activeDisasters;
    document.getElementById('affectedPeople').textContent = (stats.affectedPeople / 1000).toFixed(1) + 'K';
    document.getElementById('responseTime').textContent = stats.responseTime + 's';

    // Update analytics cards
    document.getElementById('totalDisasters').textContent = stats.totalDisasters;
    document.getElementById('criticalAlerts').textContent = stats.criticalAlerts;
    document.getElementById('activeRegions').textContent = stats.activeRegions;
    document.getElementById('systemHealth').textContent = stats.systemHealth + '%';
}

// Update Charts
function updateCharts() {
    // Update activity chart with new data point
    if (charts.activity) {
        const newData = Math.floor(Math.random() * 20) + 5;
        charts.activity.data.datasets[0].data.shift();
        charts.activity.data.datasets[0].data.push(newData);
        
        const newLabel = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        charts.activity.data.labels.shift();
        charts.activity.data.labels.push(newLabel);
        
        charts.activity.update('none');
    }

    // Update disaster distribution randomly
    if (charts.disaster) {
        charts.disaster.data.datasets[0].data = charts.disaster.data.datasets[0].data.map(() => 
            Math.floor(Math.random() * 30) + 10
        );
        charts.disaster.update();
    }
}

// Load Alerts
function loadAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';

    const alertTypes = [
        {
            type: 'flood',
            severity: 'critical',
            title: 'Flash Flood Emergency',
            location: 'Manhattan, NY',
            time: '2 minutes ago',
            description: 'Immediate evacuation required for low-lying areas',
            icon: 'fa-water',
            color: 'red'
        },
        {
            type: 'earthquake',
            severity: 'high',
            title: 'Earthquake Alert',
            location: 'Los Angeles, CA',
            time: '15 minutes ago',
            description: 'Magnitude 5.8 earthquake detected, aftershocks expected',
            icon: 'fa-house-crack',
            color: 'orange'
        },
        {
            type: 'fire',
            severity: 'medium',
            title: 'Wildfire Warning',
            location: 'Napa Valley, CA',
            time: '1 hour ago',
            description: 'Wildfire spreading, monitor evacuation routes',
            icon: 'fa-fire',
            color: 'yellow'
        },
        {
            type: 'storm',
            severity: 'high',
            title: 'Severe Thunderstorm',
            location: 'Chicago, IL',
            time: '2 hours ago',
            description: 'Heavy rain and damaging winds expected',
            icon: 'fa-wind',
            color: 'orange'
        },
        {
            type: 'landslide',
            severity: 'medium',
            title: 'Landslide Risk',
            location: 'Seattle, WA',
            time: '3 hours ago',
            description: 'Heavy rain increases landslide risk in hilly areas',
            icon: 'fa-mountain',
            color: 'yellow'
        },
        {
            type: 'flood',
            severity: 'low',
            title: 'Flood Watch',
            location: 'Houston, TX',
            time: '6 hours ago',
            description: 'Heavy rainfall may cause localized flooding',
            icon: 'fa-droplet',
            color: 'blue'
        }
    ];

    alertTypes.forEach(alert => {
        const alertCard = createAlertCard(alert);
        alertsContainer.appendChild(alertCard);
    });
}

// Create Alert Card
function createAlertCard(alert) {
    const card = document.createElement('div');
    card.className = `bg-white rounded-xl shadow-lg p-6 border-l-4 border-${alert.color}-500 hover-lift fade-in`;
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex items-center">
                <div class="w-10 h-10 bg-${alert.color}-100 rounded-lg flex items-center justify-center mr-3">
                    <i class="fas ${alert.icon} text-${alert.color}-500"></i>
                </div>
                <div>
                    <h4 class="font-bold text-lg text-gray-800">${alert.title}</h4>
                    <p class="text-sm text-gray-600">${alert.location}</p>
                </div>
            </div>
            <span class="px-3 py-1 bg-${alert.color}-100 text-${alert.color}-800 rounded-full text-xs font-semibold">
                ${alert.severity.toUpperCase()}
            </span>
        </div>
        <p class="text-gray-700 mb-3">${alert.description}</p>
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">
                <i class="far fa-clock mr-1"></i>${alert.time}
            </span>
            <button onclick="viewAlertDetails('${alert.type}')" class="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors">
                View Details →
            </button>
        </div>
    `;
    
    return card;
}

// Filter Disasters
function filterDisasters(type) {
    currentFilter = type;
    
    disasterMarkers.forEach(({ marker, markerType }) => {
        if (type === 'all' || markerType === type) {
            marker.setOpacity(1);
            marker.setZIndexOffset(1000);
        } else {
            marker.setOpacity(0.3);
            marker.setZIndexOffset(0);
        }
    });

    showNotification(`Showing ${type === 'all' ? 'all disasters' : type + ' disasters'}`, 'info');
}

// Update Filter Buttons
function updateFilterButtons(activeBtn) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-purple-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
    activeBtn.classList.add('bg-purple-600', 'text-white');
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

// Toggle Measurement Mode
function toggleMeasurement() {
    measurementMode = !measurementMode;
    const btn = document.getElementById('measureBtn');
    
    if (measurementMode) {
        btn.classList.remove('bg-blue-500');
        btn.classList.add('bg-green-500');
        showNotification('Measurement mode activated - Click points to measure', 'info');
        enableMapMeasurement();
    } else {
        btn.classList.remove('bg-green-500');
        btn.classList.add('bg-blue-500');
        showNotification('Measurement mode deactivated', 'info');
        disableMapMeasurement();
    }
}

// Toggle Heatmap
function toggleHeatmap() {
    const btn = document.getElementById('heatmapBtn');
    btn.classList.toggle('bg-orange-500');
    btn.classList.toggle('bg-gray-500');
    
    showNotification(btn.classList.contains('bg-orange-500') ? 'Heatmap enabled' : 'Heatmap disabled', 'info');
    
    // In a real implementation, this would add/remove heatmap layer
}

// Toggle Monitoring
function toggleMonitoring() {
    isMonitoring = !isMonitoring;
    const btn = document.getElementById('startMonitoringBtn');
    
    if (isMonitoring) {
        btn.innerHTML = '<i class="fas fa-stop mr-2"></i>Stop Monitoring';
        btn.classList.add('bg-red-600');
        showNotification('Real-time monitoring started', 'success');
    } else {
        btn.innerHTML = '<i class="fas fa-play mr-2"></i>Start Monitoring';
        btn.classList.remove('bg-red-600');
        showNotification('Real-time monitoring stopped', 'warning');
    }
}

// Refresh Data
function refreshData() {
    const btn = document.getElementById('refreshBtn');
    btn.querySelector('i').classList.add('fa-spin');
    
    setTimeout(() => {
        updateStatistics();
        updateCharts();
        loadAlerts();
        btn.querySelector('i').classList.remove('fa-spin');
        showNotification('Data refreshed successfully', 'success');
    }, 1000);
}

// Show Notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    container.className = `notification ${colors[type]} text-white p-4 rounded-lg shadow-lg`;
    container.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${icons[type]} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.classList.add('show');
    
    setTimeout(() => {
        container.classList.remove('show');
    }, 3000);
}

// Check for New Alerts
function checkNewAlerts() {
    if (Math.random() > 0.7) { // 30% chance of new alert
        const alertTexts = [
            'New seismic activity detected in western region',
            'Severe weather warning issued for coastal areas',
            'Wildfire risk elevated due to high winds',
            'Flood warning in effect for river communities'
        ];
        
        const randomAlert = alertTexts[Math.floor(Math.random() * alertTexts.length)];
        document.getElementById('alertText').textContent = randomAlert;
        
        showNotification('New disaster alert received!', 'warning');
    }
}

// Utility Functions
function generateTimeLabels(count) {
    const labels = [];
    const now = new Date();
    
    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now - i * 60000);
        labels.push(time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }));
    }
    
    return labels;
}

function generateRandomData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
}

function getSeverityColor(severity) {
    const colors = {
        critical: 'red',
        high: 'orange',
        medium: 'yellow',
        low: 'green'
    };
    return colors[severity] || 'gray';
}

function scrollToMap() {
    document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
}

function fitAllMarkers() {
    if (disasterMarkers.length > 0) {
        const group = new L.featureGroup(disasterMarkers.map(d => d.marker));
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

function viewDisasterDetails(id) {
    showNotification(`Opening details for disaster #${id}`, 'info');
}

function viewAlertDetails(type) {
    showNotification(`Loading ${type} alert details...`, 'info');
}

function enableMapMeasurement() {
    // Implementation for map measurement tool
    map.getContainer().style.cursor = 'crosshair';
}

function disableMapMeasurement() {
    // Implementation to disable map measurement
    map.getContainer().style.cursor = '';
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (measurementInterval) clearInterval(measurementInterval);
    if (alertInterval) clearInterval(alertInterval);
});
