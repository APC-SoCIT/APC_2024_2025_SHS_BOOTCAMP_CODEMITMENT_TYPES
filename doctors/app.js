// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get all navigation buttons
  const navButtons = document.querySelectorAll('.nav-btn');
  
  // Add click event listeners to each navigation button
  navButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      navButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Get the tab name from data attribute
      const tabName = this.getAttribute('data-tab');
      
      // Handle different tab actions
      switch(tabName) {
        case 'chat':
          alert('Opening Chat. In a full implementation, this would open the messaging interface with the doctor.');
          break;
        case 'statistics':
          alert('Navigating to Statistics page. In a full implementation, this would show patient statistics and analytics.');
          break;
        case 'home':
          alert('Navigating to Home page. In a full implementation, this would show the main dashboard.');
          break;
        case 'profile':
          // Already on profile page, no action needed
          break;
        default:
          alert(`You clicked on the ${tabName} tab.`);
      }
    });
  });
  
  // Add click event listeners to action buttons
  const bookButton = document.querySelector('.book-btn');
  const contactButton = document.querySelector('.contact-btn');
  
  if (bookButton) {
    bookButton.addEventListener('click', function() {
      alert('Booking appointment with Dr. Phineas Ferb. In a full implementation, this would open a booking calendar.');
    });
  }
  
  if (contactButton) {
    contactButton.addEventListener('click', function() {
      alert('Contacting Dr. Phineas Ferb. In a full implementation, this would open a contact form or messaging interface.');
    });
  }
  
  // Add smooth scrolling for better user experience
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Add a simple animation when the page loads
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.style.opacity = '0';
    mainContent.style.transform = 'translateY(20px)';
    mainContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    // Trigger animation after a small delay
    setTimeout(() => {
      mainContent.style.opacity = '1';
      mainContent.style.transform = 'translateY(0)';
    }, 100);
  }
  
  // Add notification badge functionality (example)
  function addNotificationBadge(tabName, count) {
    const tab = document.querySelector(`[data-tab="${tabName}"]`);
    if (tab && count > 0) {
      // Remove existing badge if any
      const existingBadge = tab.querySelector('.notification-badge');
      if (existingBadge) {
        existingBadge.remove();
      }
      
      // Create new badge
      const badge = document.createElement('div');
      badge.className = 'notification-badge';
      badge.textContent = count;
      badge.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background-color: #ff4444;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      `;
      
      tab.style.position = 'relative';
      tab.appendChild(badge);
    }
  }
  
  // Example: Add notification badges (you can call these functions as needed)
  // addNotificationBadge('chat', 3); // 3 new messages
  // addNotificationBadge('statistics', 1); // 1 new report
});