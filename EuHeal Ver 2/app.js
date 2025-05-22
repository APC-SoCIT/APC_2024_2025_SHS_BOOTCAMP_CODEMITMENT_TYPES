document.addEventListener("DOMContentLoaded", function () {
  // === Elements ===
  const appSection = document.getElementById("app-section");
  const welcomeMsg = document.getElementById("welcome-msg");
  const tipSpan = document.getElementById("tip");
  const checkinForm = document.getElementById("checkin-form");
  const moodSelect = document.getElementById("mood");
  const noteInput = document.getElementById("note");
  const sleepInput = document.getElementById("sleep");
  const saveReminderBtn = document.getElementById("save-reminder");
  const reminderInput = document.getElementById("reminder-text");
  const reminderPopup = document.getElementById("reminder-popup");

  // === Show main section ===
  appSection.style.display = "block";
  welcomeMsg.textContent = "Good morning! 🌿";

  // === Tips ===
  const tips = [
    "Take a 5-minute walk to refresh your mind.",
    "Drink a full glass of water and stretch.",
    "Practice deep breathing for 2 minutes.",
    "Write down 3 things you're grateful for.",
    "Step away from screens and look outside."
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  tipSpan.textContent = randomTip;

  // === FullCalendar ===
  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridWeek",
    height: "auto",
    events: [] 
  });
  calendar.render();
  const toggleBtn = document.getElementById("toggle-calendar");
  toggleBtn.addEventListener("click", () => {
  calendarEl.classList.toggle("hidden");
  });


  // === Mood Check-in Submission ===
  checkinForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const mood = moodSelect.value;
    const note = noteInput.value.trim();
    const sleep = parseInt(sleepInput.value, 10);

    if (!mood || isNaN(sleep)) {
      alert("Please select a mood and enter sleep hours.");
      return;
    }

    const checkinData = {
      date: new Date().toLocaleDateString(),
      mood,
      note,
      sleep
    };

    // Store locally (or send to backend)
    let moodHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];
    moodHistory.push(checkinData);
    localStorage.setItem("moodHistory", JSON.stringify(moodHistory));

    renderChart(moodHistory);
    alert("Check-in saved! 🌱");

    checkinForm.reset();
  });

  // === Reminder Save Button ===
  saveReminderBtn.addEventListener("click", function () {
    const reminder = reminderInput.value.trim();
    if (reminder) {
      localStorage.setItem("reminder", reminder);
      alert("Reminder saved! 📝");
    }
  });

  // === Load Reminder on Start ===
  const savedReminder = localStorage.getItem("reminder");
  if (savedReminder) {
    reminderInput.value = savedReminder;
    reminderPopup.style.display = "block";
  }

  // === Mood Chart (Chart.js) ===
  function renderChart(data) {
    const ctx = document.getElementById("moodChart").getContext("2d");

    const moodMap = {
      happy: 5,
      okay: 4,
      confused: 3,
      mad: 2,
      anxious: 1,
      sad: 0
    };

    const labels = data.map(entry => entry.date);
    const moodValues = data.map(entry => moodMap[entry.mood]);
    const sleepValues = data.map(entry => entry.sleep);

    if (window.moodChartInstance) {
      window.moodChartInstance.destroy();
    }

    window.moodChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Mood",
            data: moodValues,
            borderColor: "#2a9d8f",
            backgroundColor: "rgba(42,157,143,0.2)",
            tension: 0.3,
            yAxisID: 'y1'
          },
          {
            label: "Sleep (hrs)",
            data: sleepValues,
            borderColor: "#e76f51",
            backgroundColor: "rgba(231,111,81,0.2)",
            tension: 0.3,
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y1: {
            type: 'linear',
            position: 'left',
            min: 0,
            max: 5,
            ticks: {
              stepSize: 1,
              callback: (value) => Object.keys(moodMap).find(key => moodMap[key] === value)
            }
          },
          y2: {
            type: 'linear',
            position: 'right',
            min: 0,
            max: 12
          }
        }
      }
    });
  }

  // Render chart on load if data exists
  const moodData = JSON.parse(localStorage.getItem("moodHistory")) || [];
  if (moodData.length > 0) renderChart(moodData);

  // === Button actions (placeholders) ===
  document.getElementById("find-doctors").addEventListener("click", () => {
    alert("Redirecting to local health services map... (feature coming soon!)");
  });

  document.getElementById("weekly-progress").addEventListener("click", () => {
    alert("Weekly report under development 🧘‍♀️📊");
  });

  document.getElementById("add-quick-access").addEventListener("click", () => {
    alert("Quick access saved! ⚡️");
  });

  document.getElementById("history").addEventListener("click", () => {
    const history = JSON.parse(localStorage.getItem("moodHistory")) || [];
    if (history.length === 0) {
      alert("No check-in history yet.");
    } else {
      alert("Showing history in dev tools console.");
      console.table(history);
    }
  });
});
