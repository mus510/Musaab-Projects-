// DOM Elements
const registrationForm = document.getElementById('teamRegistrationForm');
const teamNameInput = document.getElementById('teamName');
const gameSelect = document.getElementById('gameSelect');
const teamMembersContainer = document.querySelector('.team-members');
const addMemberBtn = document.querySelector('.add-member-btn');
const submitBtn = document.querySelector('.btn-submit');

// Configuration
const MAX_MEMBERS = 6; // Maximum team members including substitutes
let memberCount = 4; // Initial member count

// Initialize form
document.addEventListener('DOMContentLoaded', () => {
    validateForm();
});

// Real-time Form Validation
function validateForm() {
    let isValid = true;
    const errors = [];

    // Team Name Validation
    if (teamNameInput.value.trim().length < 3) {
        errors.push('Team name must be at least 3 characters');
        isValid = false;
    }

    // Game Selection Validation
    if (gameSelect.value === '') {
        errors.push('Please select a game');
        isValid = false;
    }

    // Member Emails Validation
    const emailInputs = document.querySelectorAll('.member-card input[type="email"]');
    emailInputs.forEach((input, index) => {
        if (!validateEmail(input.value)) {
            errors.push(`Member ${index + 1} has an invalid email`);
            isValid = false;
        }
    });

    // Update submit button state
    submitBtn.disabled = !isValid;
    showErrors(errors);
    return isValid;
}

// Email Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Error Handling
function showErrors(errors) {
    const errorContainer = document.getElementById('errorMessages') || createErrorContainer();
    errorContainer.innerHTML = errors.length ? `
        <div class="error-message">
            <strong>Errors:</strong>
            <ul>${errors.map(error => `<li>${error}</li>`).join('')}</ul>
        </div>
    ` : '';
}

function createErrorContainer() {
    const container = document.createElement('div');
    container.id = 'errorMessages';
    registrationForm.prepend(container);
    return container;
}

// Add Member Functionality
addMemberBtn.addEventListener('click', () => {
    if (memberCount >= MAX_MEMBERS) {
        alert(`Maximum of ${MAX_MEMBERS} members allowed`);
        return;
    }

    const newMember = document.createElement('div');
    newMember.className = 'member-card';
    newMember.innerHTML = `
        <label>Substitute Member</label>
        <input type="email" placeholder="Member email" required>
        <button type="button" class="remove-member-btn">Remove</button>
    `;
    
    teamMembersContainer.appendChild(newMember);
    memberCount++;
    
    // Add remove functionality
    newMember.querySelector('.remove-member-btn').addEventListener('click', () => {
        newMember.remove();
        memberCount--;
        validateForm();
    });

    validateForm();
});

// Form Submission
registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const formData = {
        teamName: teamNameInput.value.trim(),
        game: gameSelect.value,
        members: Array.from(document.querySelectorAll('.member-card input')).map(input => input.value)
    };

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div> Submitting...';

        // Simulated API call - replace with actual fetch()
        const response = await mockApiCall(formData);
        
        if (response.success) {
            showSuccess('Team registered successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = '/team-dashboard.html';
            }, 2000);
        }
    } catch (error) {
        showErrors([error.message]);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register Team';
    }
});

// Simulated API Call
async function mockApiCall(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.1) { // Simulate 10% error rate
                reject(new Error('Registration failed. Please try again.'));
            } else {
                resolve({ 
                    success: true,
                    data: {
                        ...data,
                        id: Date.now()
                    }
                });
            }
        }, 1500);
    });
}

// Success Message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    registrationForm.prepend(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Input Validation Listeners
teamNameInput.addEventListener('input', validateForm);
gameSelect.addEventListener('change', validateForm);
teamMembersContainer.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT') validateForm();
});