// Countdown Timer
function updateCountdown() {
    const eventDate = new Date('2024-11-15T00:00:00').getTime();
    const now = new Date().getTime();
    const distance = eventDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    document.getElementById('countdown').textContent = 
        `${days} DAYS UNTIL THE EVENT`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Countdown timer
    setInterval(updateCountdown, 1000);
    updateCountdown();
    
    // Form validation (if on form pages)
    if(document.getElementById('registrationForm')) {
        document.getElementById('registrationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const teamName = this.teamName.value.trim();
            const email = this.email.value.trim();

            if (!/^[\w\s]{3,30}$/.test(teamName)) {
                alert('Invalid team name (3-30 alphanumeric characters)');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            // Submit form
            fetch('https://your-secure-api.com/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': 'your-csrf-token'
                },
                body: JSON.stringify({
                    teamName: teamName,
                    email: email
                })
            });
        });
    }
});