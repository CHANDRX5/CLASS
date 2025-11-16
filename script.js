// Initialize map
let map;
let disasterMarkers = [];
let currentFilter = 'all';

// Sample disaster data
const disasterData = [
    {
        id: 1,
        type: 'flood',
        severity: 'high',
        location: { lat: 40.7128, lng: -74.0060 },
        title: 'Flash Flood Warning',
        description: 'Severe flooding in downtown area',
        time: '2024-01-15 14:30',
        affected: '2,500 people'
    },
    {
        id: 2,
        type: 'earthquake',
        severity: 'critical',
        location: { lat: 34.0522, lng: -118.2437 },
        title: 'Magnitude 6.2 Earthquake',
        description: 'Major earthquake detected with aftershocks',
        time: '2024-01-15 12:15',
        affected: '15,000 people'
    },
    {
        id: 3,
        type: 'fire',
        severity: 'medium',
        location: { lat: 37.7749, lng: -122.4194 },
        title: 'Wildfire Alert',
        description: 'Wildfire spreading in forest area',
        time: '2024-01-15 10:45',
        affected: '800 people'
    },
    {
        id: 4,
        type: 'storm',
        severity: 'high',
        location: { lat: 41.8781, lng: -87.6298 },
        title: 'Severe Thunderstorm',
        description: 'Heavy rain and strong winds expected',
        time: '2024-01-15 16:20',
        affected: '5,200 people'
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadAlerts();
    initializeCharts();
    loadResearchData();
    setupEventListeners();
    startRealTimeUpdates();
});

function initializeMap() {
    // Initialize Leaflet map
    map = L.map('disasterMap').setView([39.8283, -98.5795], 4); // Center of USA
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add disaster markers
    disasterData.forEach(disaster => {
        addDisasterMarker(disaster);
    });
}

function addDisasterMarker(disaster) {
    const colors = {
        flood: '#3b82f6',
        earthquake: '#ef4444',
        fire: '#f97316',
        storm: '#8b5cf6'
    };

    const marker = L.circleMarker([disaster.location.lat, disaster.location.lng], {
        radius: 10,
        fillColor: colors[disaster.type],
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);

    // Add popup with disaster information
    marker.bindPopup(`
        <div class="p-2">
            <h4 class="font-bold text-lg">${disaster.title}</h4>
            <p class="text-sm text-gray-600">${disaster.description}</p>
            <div class="mt-2 text-xs">
                <p><strong>Type:</strong> ${disaster.type}</p>
                <p><strong>Severity:</strong> ${disaster.severity}</p>
                <p><strong>Time:</strong> ${disaster.time}</p>
                <p><strong>Affected:</strong> ${disaster.affected}</p>
            </div>
        </div>
    `);

    disasterMarkers.push({ marker, type: disaster.type });
}

function loadAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';

    const alertCards = [
        {
            type: 'flood',
            severity: 'critical',
            title: 'Flash Flood Warning',
            location: 'Manhattan, NY',
            time: '2 hours ago',
            description: 'Immediate evacuation recommended for low-lying areas',
            icon: 'fa-water',
            color: 'red'
        },
        {
            type: 'earthquake',
            severity: 'high',
            title: 'Earthquake Alert',
            location: 'Los Angeles, CA',
            time: '4 hours ago',
            description: 'Magnitude 5.8 earthquake detected, prepare for aftershocks',
            icon: 'fa-house-crack',
            color: 'orange'
        },
        {
            type: 'fire',
            severity: 'medium',
            title: 'Wildfire Warning',
            location: 'Napa Valley, CA',
            time: '6 hours ago',
            description: 'Wildfire spreading, monitor evacuation routes',
            icon: 'fa-fire',
            color: 'yellow'
        },
        {
            type: 'storm',
            severity: 'high',
            title: 'Hurricane Warning',
            location: 'Miami, FL',
            time: '8 hours ago',
            description: 'Category 3 hurricane approaching, secure property',
            icon: 'fa-wind',
            color: 'orange'
        },
        {
            type: 'landslide',
            severity: 'medium',
            title: 'Landslide Risk',
            location: 'Seattle, WA',
            time: '12 hours ago',
            description: 'Heavy rain increases landslide risk in hilly areas',
            icon: 'fa-mountain',
            color: 'yellow'
        },
        {
            type: 'flood',
            severity: 'low',
            title: 'Flood Watch',
            location: 'Houston, TX',
            time: '1 day ago',
            description: 'Heavy rainfall may cause localized flooding',
            icon: 'fa-droplet',
            color: 'blue'
        }
    ];

    alertCards.forEach(alert => {
        const alertCard = createAlertCard(alert);
        alertsContainer.appendChild(alertCard);
    });
}

function createAlertCard(alert) {
    const card = document.createElement('div');
    card.className = `bg-white rounded-xl shadow-lg p-6 border-l-4 border-${alert.color}-500 hover:shadow-xl transition-shadow`;
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex items-center">
                <i class="fas ${alert.icon} text-2xl text-${alert.color}-500 mr-3"></i>
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
            <button class="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                View Details →
            </button>
        </div>
    `;
    
    return card;
}

function initializeCharts() {
    // Disaster Types Distribution Chart
    const disasterCtx = document.getElementById('disasterChart').getContext('2d');
    new Chart(disasterCtx, {
        type: 'doughnut',
        data: {
            labels: ['Flood', 'Earthquake', 'Wildfire', 'Storm', 'Landslide'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
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
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Monthly Incident Trends Chart
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Disaster Incidents',
                data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 28, 20, 15],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
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

function loadResearchData() {
    const researchTable = document.getElementById('researchTable');
    
    const researchData = [
        {
            date: '2024-01-15',
            type: 'flood',
            location: 'New York, NY',
            severity: 'High',
            impact: '2,500 affected',
            status: 'Active'
        },
        {
            date: '2024-01-14',
            type: 'earthquake',
            location: 'Los Angeles, CA',
            severity: 'Critical',
            impact: '15,000 affected',
            status: 'Monitoring'
        },
        {
            date: '2024-01-12',
            type: 'fire',
            location: 'San Francisco, CA',
            severity: 'Medium',
            impact: '800 affected',
            status: 'Contained'
        },
        {
            date: '2024-01-10',
            type: 'storm',
            location: 'Chicago, IL',
            severity: 'High',
            impact: '5,200 affected',
            status: 'Active'
        },
        {
            date: '2024-01-08',
            type: 'landslide',
            location: 'Seattle, WA',
            severity: 'Medium',
            impact: '300 affected',
            status: 'Resolved'
        }
    ];

    researchData.forEach(record => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        const severityColor = {
            'Low': 'text-green-600',
            'Medium': 'text-yellow-600',
            'High': 'text-orange-600',
            'Critical': 'text-red-600'
        }[record.severity];

        const statusColor = {
            'Active': 'text-red-600',
            'Monitoring': 'text-yellow-600',
            'Contained': 'text-blue-600',
            'Resolved': 'text-green-600'
        }[record.status];

        row.innerHTML = `
            <td class="border p-3">${record.date}</td>
            <td class="border p-3 capitalize">${record.type}</td>
            <td class="border p-3">${record.location}</td>
            <td class="border p-3"><span class="${severityColor} font-semibold">${record.severity}</span></td>
            <td class="border p-3">${record.impact}</td>
            <td class="border p-3"><span class="${statusColor} font-semibold">${record.status}</span></td>
        `;
        
        researchTable.appendChild(row);
    });
}

function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when clicking on a link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
        });
    });

    // Filter buttons for map
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update button styles
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-red-500', 'text-white');
                b.classList.add('bg-gray-200', 'text-gray-700');
            });
            this.classList.remove('bg-gray-200', 'text-gray-700');
            this.classList.add('bg-red-500', 'text-white');

            // Filter markers
            const filterType = this.dataset.type;
            filterDisasterMarkers(filterType);
        });
    });

    // Disaster form submission
    const disasterForm = document.getElementById('disasterForm');
    disasterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitDisasterReport();
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Research filters
    document.getElementById('yearFilter').addEventListener('change', filterResearchData);
    document.getElementById('typeFilter').addEventListener('change', filterResearchData);
}

function filterDisasterMarkers(type) {
    disasterMarkers.forEach(({ marker, markerType }) => {
        if (type === 'all' || markerType === type) {
            marker.setOpacity(1);
        } else {
            marker.setOpacity(0.2);
        }
    });
}

function submitDisasterReport() {
    const formData = {
        name: document.getElementById('reporterName').value,
        contact: document.getElementById('reporterContact').value,
        type: document.getElementById('disasterType').value,
        location: document.getElementById('disasterLocation').value,
        severity: document.querySelector('input[name="severity"]:checked')?.value,
        description: document.getElementById('disasterDescription').value,
        photos: document.getElementById('disasterPhotos').files
    };

    // Show success message
    showNotification('Disaster report submitted successfully! Emergency services have been notified.', 'success');
    
    // Reset form
    document.getElementById('disasterForm').reset();
    
    // In a real application, this would send data to a server
    console.log('Disaster report submitted:', formData);
}

function filterResearchData() {
    const yearFilter = document.getElementById('yearFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    // In a real application, this would filter the data from a database
    console.log('Filtering research data:', { yearFilter, typeFilter });
    showNotification('Research data filtered successfully', 'info');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    notification.classList.add(...colors[type].split(' '), 'text-white');
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function startRealTimeUpdates() {
    // Simulate real-time updates
    setInterval(() => {
        updateDashboardStats();
        checkForNewAlerts();
    }, 30000); // Update every 30 seconds
}

function updateDashboardStats() {
    // Simulate changing statistics
    const stats = {
        activeCount: Math.floor(Math.random() * 5) + 10,
        affectedCount: Math.floor(Math.random() * 10000) + 40000,
        responseCount: Math.floor(Math.random() * 3) + 6,
        avgResponse: (Math.random() * 2 + 1.5).toFixed(1) + 'h'
    };

    Object.keys(stats).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = stats[key];
        }
    });
}

function checkForNewAlerts() {
    // Simulate checking for new alerts
    const hasNewAlert = Math.random() > 0.8; // 20% chance of new alert
    
    if (hasNewAlert) {
        const alertTexts = [
            'New flood warning detected in coastal areas',
            'Seismic activity increased in western region',
            'Wildfire risk elevated due to high winds',
            'Storm system approaching eastern coastline'
        ];
        
        const randomAlert = alertTexts[Math.floor(Math.random() * alertTexts.length)];
        document.getElementById('alertText').textContent = randomAlert;
        
        showNotification('New disaster alert received!', 'warning');
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search (if we add search later)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search input
    }
    
    // Escape to close mobile menu
    if (e.key === 'Escape') {
        document.getElementById('mobileMenu').classList.add('hidden');
    }
});

// Add print functionality for emergency contacts
function printEmergencyContacts() {
    window.print();
}

// Add share functionality
function shareEmergencyInfo() {
    if (navigator.share) {
        navigator.share({
            title: 'Emergency Contact Information',
            text: 'Important emergency contacts and resources',
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href);
        showNotification('Emergency information link copied to clipboard', 'success');
    }
}
