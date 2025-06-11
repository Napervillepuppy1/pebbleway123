const API_BASE_URL = 'http://localhost:5000/api';

// Authentication functions
async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const errorElement = document.getElementById('signupError');

    try {
        if (password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error);
        }

        showNotification('Account created! Please check your email for verification.', 'success');
        document.getElementById('signupPage').classList.remove('active');
        document.getElementById('loginPage').classList.add('active');
    } catch (error) {
        errorElement.textContent = error.message;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorElement = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error);
        }

        // Store the token
        localStorage.setItem('token', data.access_token);
        
        // Load user data
        await loadUserData();
        
        showNotification('Welcome back!', 'success');
        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('homePage').classList.add('active');
    } catch (error) {
        errorElement.textContent = error.message;
    }
}

// Goals functions
async function loadGoals() {
    try {
        const response = await fetch(`${API_BASE_URL}/goals`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load goals');
        }

        const goals = await response.json();
        updateGoalsList(goals);
    } catch (error) {
        showNotification('Error loading goals', 'error');
    }
}

async function addGoal(event) {
    event.preventDefault();
    const title = document.getElementById('goalTitle').value;
    const category = document.getElementById('goalCategory').value;
    const description = document.getElementById('goalDescription').value;
    const target = parseInt(document.getElementById('goalTarget').value);

    try {
        const response = await fetch(`${API_BASE_URL}/goals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                title,
                category,
                description,
                target
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add goal');
        }

        await loadGoals();
        closeAddGoalModal();
        showNotification('Goal added successfully!');
        event.target.reset();
    } catch (error) {
        showNotification('Error adding goal', 'error');
    }
}

async function checkIn(goalId) {
    try {
        const re 