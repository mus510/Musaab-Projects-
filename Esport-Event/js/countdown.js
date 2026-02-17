// countdown.js - Esports Event Countdown Timer
class CountdownTimer {
    constructor(eventDate, elements) {
      this.eventDate = new Date(eventDate).getTime();
      this.daysElement = elements.days;
      this.hoursElement = elements.hours;
      this.minutesElement = elements.minutes;
      this.secondsElement = elements.seconds;
      this.timerInterval = null;
      this.neonColors = ['#00f3ff', '#ff4655', '#bc00dd'];
      
      this.init();
    }
  
    init() {
      if (!this.eventDate || isNaN(this.eventDate)) {
        console.error('Invalid event date');
        return;
      }
      
      this.updateTimer();
      this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }
  
    updateTimer() {
      const currentTime = new Date().getTime();
      const timeRemaining = this.eventDate - currentTime;
  
      if (timeRemaining < 0) {
        clearInterval(this.timerInterval);
        this.handleEventStart();
        return;
      }
  
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  
      this.updateDisplay(days, hours, minutes, seconds);
      this.animateNumbers();
    }
  
    updateDisplay(d, h, m, s) {
      this.daysElement.textContent = this.formatTime(d);
      this.hoursElement.textContent = this.formatTime(h);
      this.minutesElement.textContent = this.formatTime(m);
      this.secondsElement.textContent = this.formatTime(s);
    }
  
    formatTime(time) {
      return time < 10 ? `0${time}` : time;
    }
  
    animateNumbers() {
      const numbers = document.querySelectorAll('.countdown-number');
      numbers.forEach(num => {
        num.style.textShadow = `0 0 10px ${this.neonColors[Math.floor(Math.random() * this.neonColors.length)]}`;
      });
    }
  
    handleEventStart() {
      const countdownContainer = document.getElementById('countdown');
      if (countdownContainer) {
        countdownContainer.innerHTML = `
          <div class="event-live">
            <span>EVENT LIVE NOW!</span>
            <div class="live-pulse"></div>
          </div>
        `;
      }
    }
  }
  
  // Initialize the timer when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    const timerElements = {
      days: document.getElementById('days'),
      hours: document.getElementById('hours'),
      minutes: document.getElementById('minutes'),
      seconds: document.getElementById('seconds')
    };
  
    if (timerElements.days && timerElements.hours && 
        timerElements.minutes && timerElements.seconds) {
      // Set your event date here (YYYY-MM-DDTHH:mm:ss)
      new CountdownTimer('2025-5-5T23:59:59', timerElements);
    }
  });