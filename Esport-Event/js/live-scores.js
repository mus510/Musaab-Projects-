// live-scores.js - Real-time Esports Match Scores
class LiveScoreboard {
    constructor() {
      this.socket = null;
      this.scoreContainer = document.getElementById('live-scores');
      this.animationDuration = 1000;
      this.teamColors = {
        team1: '#00f3ff',
        team2: '#ff4655'
      };
      
      this.initWebSocket();
      this.initFallback();
      this.initUI();
    }
  
    initWebSocket() {
      if ('WebSocket' in window) {
        this.socket = new WebSocket('wss://api.youresports.com/live-scores');
  
        this.socket.onopen = () => {
          console.log('Connected to live scores feed');
          this.sendConnectionMessage();
        };
  
        this.socket.onmessage = (event) => {
          this.processScoreUpdate(JSON.parse(event.data));
        };
  
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.showError('Connection lost - Switching to fallback');
          this.initFallback();
        };
  
        this.socket.onclose = () => {
          console.log('WebSocket closed');
        };
      }
    }
  
    initFallback() {
      if (!this.socket || this.socket.readyState > 1) {
        setInterval(() => {
          fetch('https://api.youresports.com/live-scores')
            .then(response => response.json())
            .then(data => this.processScoreUpdate(data))
            .catch(error => this.showError(error.message));
        }, 5000);
      }
    }
  
    processScoreUpdate(matchData) {
      if (!this.validateData(matchData)) return;
  
      const existingMatch = this.scoreContainer.querySelector(
        `[data-match-id="${matchData.id}"]`
      );
  
      if (existingMatch) {
        this.updateMatch(existingMatch, matchData);
      } else {
        this.createMatchElement(matchData);
      }
    }
  
    validateData(data) {
      const requiredFields = ['id', 'team1', 'team2', 'score1', 'score2'];
      return requiredFields.every(field => data.hasOwnProperty(field));
    }
  
    createMatchElement(match) {
      const matchElement = document.createElement('div');
      matchElement.className = 'live-match';
      matchElement.dataset.matchId = match.id;
      matchElement.innerHTML = `
        <div class="match-status ${match.live ? 'live' : ''}">
          ${match.live ? '🔴 LIVE' : 'Upcoming'}
        </div>
        <div class="teams-container">
          <div class="team" style="--team-color: ${this.teamColors.team1}">
            <div class="team-logo">
              <img src="${match.team1.logo}" alt="${match.team1.name}">
            </div>
            <div class="team-name">${match.team1.name}</div>
            <div class="team-score">${match.score1}</div>
          </div>
          <div class="vs">VS</div>
          <div class="team" style="--team-color: ${this.teamColors.team2}">
            <div class="team-logo">
              <img src="${match.team2.logo}" alt="${match.team2.name}">
            </div>
            <div class="team-name">${match.team2.name}</div>
            <div class="team-score">${match.score2}</div>
          </div>
        </div>
        ${this.createTimelineElement(match.events)}
      `;
      
      this.scoreContainer.appendChild(matchElement);
      this.animateElement(matchElement, 'fadeIn');
    }
  
    updateMatch(existingMatch, newData) {
      const updateElements = {
        score1: existingMatch.querySelector('.team:nth-child(1) .team-score'),
        score2: existingMatch.querySelector('.team:nth-child(3) .team-score'),
        status: existingMatch.querySelector('.match-status'),
        timeline: existingMatch.querySelector('.match-timeline')
      };
  
      // Update scores with animation
      this.animateScoreChange(updateElements.score1, newData.score1);
      this.animateScoreChange(updateElements.score2, newData.score2);
  
      // Update timeline
      if (newData.events.length > 0) {
        updateElements.timeline.innerHTML = 
          this.createTimelineElement(newData.events).innerHTML;
      }
  
      // Update live status
      updateElements.status.className = `match-status ${newData.live ? 'live' : ''}`;
      updateElements.status.textContent = newData.live ? '🔴 LIVE' : 'Completed';
    }
  
    createTimelineElement(events) {
      const timeline = document.createElement('div');
      timeline.className = 'match-timeline';
      
      events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `timeline-event ${event.type}`;
        eventElement.innerHTML = `
          <span class="event-time">${event.time}'</span>
          <span class="event-icon">
            ${event.type === 'kill' ? '⚡' : '🏆'}
          </span>
          <span class="event-text">${event.description}</span>
        `;
        timeline.appendChild(eventElement);
      });
      
      return timeline;
    }
  
    animateScoreChange(element, newValue) {
      element.style.transform = 'scale(1.2)';
      element.style.color = '#ffd700';
      setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'scale(1)';
        element.style.color = '';
      }, this.animationDuration / 2);
    }
  
    animateElement(element, animationType) {
      element.style.opacity = 0;
      setTimeout(() => {
        element.style.opacity = 1;
        element.style.transition = `opacity ${this.animationDuration}ms`;
      }, 50);
    }
  
    showError(message) {
      const errorBanner = document.createElement('div');
      errorBanner.className = 'score-error-banner';
      errorBanner.textContent = message;
      document.body.prepend(errorBanner);
      
      setTimeout(() => {
        errorBanner.remove();
      }, 5000);
    }
  
    sendConnectionMessage() {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'subscription',
          matches: ['all']
        }));
      }
    }
  }
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('live-scores')) {
      new LiveScoreboard();
    }
  });