function selectMood(emoji) {
    // Remove selected class from all mood options
    document.querySelectorAll('.mood-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked mood option
    event.target.classList.add('selected');
    
    // Update today's mood in the history
    const today = new Date().getDay();
    const moodDays = document.querySelectorAll('.mood-day');
    if (moodDays[today]) {
        moodDays[today].querySelector('.mood-day-emoji').textContent = emoji;
    }
    
    // Save mood to localStorage
    const moods = JSON.parse(localStorage.getItem('moods') || '{}');
    moods[new Date().toISOString().split('T')[0]] = emoji;
    localStorage.setItem('moods', JSON.stringify(moods));
}

// Load saved moods on page load
function loadMoods() {
    const moods = JSON.parse(localStorage.getItem('moods') || '{}');
    const moodDays = document.querySelectorAll('.mood-day');
    
    // Get last 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayIndex = (date.getDay() + 6) % 7; // Convert to Mon-Sun
        
        if (moods[dateStr] && moodDays[dayIndex]) {
            moodDays[dayIndex].querySelector('.mood-day-emoji').textContent = moods[dateStr];
        }
    }
}

// Call loadMoods when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Show login page by default
    document.getElementById('loginPage').classList.add('active');
    
    // Add navigation between login and signup pages
    document.getElementById('showSignupLink').addEventListener('click', function(e) {
        e.preventDefault();
        switchPage('loginPage', 'signupPage');
    });

    document.getElementById('showLoginLink').addEventListener('click', function(e) {
        e.preventDefault();
        switchPage('signupPage', 'loginPage');
    });

    // Add login button handler
    document.getElementById('loginButton').addEventListener('click', function() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            document.getElementById('loginError').textContent = 'Please fill in all fields';
            return;
        }

        // For demo purposes, we'll just log in without actual authentication
        localStorage.setItem('currentUser', email);
        showNotification('Welcome back!', 'success');
        switchPage('loginPage', 'homePage');
    });

    // Add signup button handler
    document.getElementById('signupButton').addEventListener('click', function() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        if (!name || !email || !password || !confirmPassword) {
            document.getElementById('signupError').textContent = 'Please fill in all fields';
            return;
        }

        if (password !== confirmPassword) {
            document.getElementById('signupError').textContent = 'Passwords do not match';
            return;
        }

        // For demo purposes, we'll just create the account without actual registration
        localStorage.setItem('currentUser', email);
        showNotification('Account created successfully!', 'success');
        switchPage('signupPage', 'homePage');
    });

    // Load saved data
    try {
        goals = JSON.parse(localStorage.getItem('goals')) || [];
        streak = parseInt(localStorage.getItem('streak')) || 0;
        lastCheckIn = localStorage.getItem('lastCheckIn') || '';
        settings = JSON.parse(localStorage.getItem('settings')) || settings;
        
        // Apply saved settings
        document.body.className = `font-${settings.fontSize}`;
        
        // Update UI
        updateGoalsList();
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading saved data', 'error');
    }
}); 