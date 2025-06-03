class HealthTracker {
  constructor() {
    // Fitbit API Configuration
    this.fitbitConfig = {
      clientId: "DEMO_FITBIT_CLIENT_ID_23ABCD",
      clientSecret: "DEMO_FITBIT_SECRET_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      redirectUri: "http://localhost:3000/callback",
      scope: "activity heartrate nutrition profile sleep weight",
      apiBaseUrl: "https://api.fitbit.com/1/user/-",
    }

    this.accessToken = localStorage.getItem("fitbit_access_token")
    this.refreshToken = localStorage.getItem("fitbit_refresh_token")

    this.userData = {
      calories: 394,
      steps: 7165,
      activeMinutes: 45,
      standHours: 10,
      weeklyWorkouts: 5,
      currentWeight: 82.4,
      dailyRating: "Balanced",
      waterCount: 6,
      waterGoal: 8,
      heartRate: 75,
      sleepScore: 85,
    }

    this.init()
  }

  init() {
    this.checkFitbitAuth()
    this.updateAllStats()
    this.updateProgressRings()
    this.drawWeightChart()
    this.updateWaterDisplay()
    this.fetchFitbitData()
    this.setupEventListeners()
  }

  // Fitbit OAuth Authentication
  checkFitbitAuth() {
    const urlParams = new URLSearchParams(window.location.search)
    const authCode = urlParams.get("code")

    if (authCode && !this.accessToken) {
      this.exchangeCodeForToken(authCode)
    } else if (!this.accessToken) {
      console.log("No Fitbit access token found. Using demo data.")
      this.showAuthButton()
    }
  }

  showAuthButton() {
    const authButton = document.createElement("button")
    authButton.innerHTML = '<i class="fab fa-fitbit"></i> Connect Fitbit'
    authButton.className = "fitbit-auth-btn"

    authButton.addEventListener("click", () => this.initiateFitbitAuth())
    document.body.appendChild(authButton)
  }

  initiateFitbitAuth() {
    const authUrl =
      `https://www.fitbit.com/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${this.fitbitConfig.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.fitbitConfig.redirectUri)}&` +
      `scope=${encodeURIComponent(this.fitbitConfig.scope)}&` +
      `state=demo_state_123`

    window.location.href = authUrl
  }

  async exchangeCodeForToken(authCode) {
    try {
      const response = await fetch("https://api.fitbit.com/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(this.fitbitConfig.clientId + ":" + this.fitbitConfig.clientSecret)}`,
        },
        body: new URLSearchParams({
          client_id: this.fitbitConfig.clientId,
          grant_type: "authorization_code",
          redirect_uri: this.fitbitConfig.redirectUri,
          code: authCode,
        }),
      })

      const tokenData = await response.json()

      if (tokenData.access_token) {
        this.accessToken = tokenData.access_token
        this.refreshToken = tokenData.refresh_token

        localStorage.setItem("fitbit_access_token", this.accessToken)
        localStorage.setItem("fitbit_refresh_token", this.refreshToken)

        window.history.replaceState({}, document.title, window.location.pathname)

        const authBtn = document.querySelector(".fitbit-auth-btn")
        if (authBtn) authBtn.remove()

        this.fetchFitbitData()
      }
    } catch (error) {
      console.error("Error exchanging code for token:", error)
      this.fallbackToMockData()
    }
  }

  async refreshAccessToken() {
    try {
      const response = await fetch("https://api.fitbit.com/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(this.fitbitConfig.clientId + ":" + this.fitbitConfig.clientSecret)}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
        }),
      })

      const tokenData = await response.json()

      if (tokenData.access_token) {
        this.accessToken = tokenData.access_token
        this.refreshToken = tokenData.refresh_token

        localStorage.setItem("fitbit_access_token", this.accessToken)
        localStorage.setItem("fitbit_refresh_token", this.refreshToken)

        return true
      }
    } catch (error) {
      console.error("Error refreshing token:", error)
      return false
    }
  }

  async fetchFitbitData() {
    if (!this.accessToken) {
      console.log("No access token available, using mock data")
      this.fallbackToMockData()
      return
    }

    try {
      const today = new Date().toISOString().split("T")[0]

      const [activitiesResponse, heartRateResponse, sleepResponse, weightResponse, profileResponse] = await Promise.all(
        [
          this.fitbitApiCall(`/activities/date/${today}.json`),
          this.fitbitApiCall(`/activities/heart/date/${today}/1d.json`),
          this.fitbitApiCall(`/sleep/date/${today}.json`),
          this.fitbitApiCall(`/body/log/weight/date/${today}.json`),
          this.fitbitApiCall(`/profile.json`),
        ],
      )

      this.processFitbitData({
        activities: activitiesResponse,
        heartRate: heartRateResponse,
        sleep: sleepResponse,
        weight: weightResponse,
        profile: profileResponse,
      })

      this.fetchFitbitWeeklyData()
    } catch (error) {
      console.error("Error fetching Fitbit data:", error)
      this.fallbackToMockData()
    }
  }

  async fitbitApiCall(endpoint) {
    const response = await fetch(`${this.fitbitConfig.apiBaseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken()
      if (refreshed) {
        return this.fitbitApiCall(endpoint)
      } else {
        throw new Error("Authentication failed")
      }
    }

    if (!response.ok) {
      throw new Error(`Fitbit API error: ${response.status}`)
    }

    return response.json()
  }

  processFitbitData(data) {
    try {
      if (data.activities && data.activities.summary) {
        const summary = data.activities.summary
        this.userData.steps = summary.steps || this.userData.steps
        this.userData.calories = summary.caloriesOut || this.userData.calories
        this.userData.activeMinutes =
          summary.veryActiveMinutes + summary.fairlyActiveMinutes || this.userData.activeMinutes
      }

      if (data.heartRate && data.heartRate["activities-heart"] && data.heartRate["activities-heart"].length > 0) {
        const heartData = data.heartRate["activities-heart"][0]
        if (heartData.value && heartData.value.restingHeartRate) {
          this.userData.heartRate = heartData.value.restingHeartRate
        }
      }

      if (data.sleep && data.sleep.summary) {
        this.userData.sleepScore = data.sleep.summary.efficiency || this.userData.sleepScore
      }

      if (data.weight && data.weight.weight && data.weight.weight.length > 0) {
        this.userData.currentWeight = data.weight.weight[0].weight
      }

      this.updateAllStats()
      this.updateProgressRings()

      console.log("Fitbit data successfully loaded and processed")
    } catch (error) {
      console.error("Error processing Fitbit data:", error)
    }
  }

  async fetchFitbitWeeklyData() {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 7)

      const startDateStr = startDate.toISOString().split("T")[0]
      const endDateStr = endDate.toISOString().split("T")[0]

      const weeklyActivities = await this.fitbitApiCall(`/activities/steps/date/${startDateStr}/${endDateStr}.json`)

      const weeklyData = this.processWeeklyFitbitData(weeklyActivities)
      this.displayWeeklySummary(weeklyData)
    } catch (error) {
      console.error("Error fetching weekly Fitbit data:", error)
      this.fallbackToMockData()
    }
  }

  processWeeklyFitbitData(activitiesData) {
    const weeklySteps = activitiesData["activities-steps"] || []
    const totalSteps = weeklySteps.reduce((sum, day) => sum + Number.parseInt(day.value), 0)

    return {
      totalSteps: totalSteps,
      avgHeartRate: this.userData.heartRate,
      totalCalories: Math.round(totalSteps * 0.04),
      workoutsCompleted: weeklySteps.filter((day) => Number.parseInt(day.value) > 8000).length,
      avgSleep: 7.5,
      weeklyGoalProgress: Math.min((totalSteps / 70000) * 100, 100),
      improvements: [
        `Achieved ${totalSteps.toLocaleString()} steps this week`,
        "Maintained consistent activity levels",
        "Met daily step goals",
      ],
      recommendations: [
        "Try to increase daily step goal",
        "Add strength training to routine",
        "Monitor heart rate during workouts",
      ],
    }
  }

  fallbackToMockData() {
    setTimeout(() => {
      const mockWeeklyData = {
        totalSteps: 45230,
        avgHeartRate: 72,
        totalCalories: 2016,
        workoutsCompleted: 5,
        avgSleep: 7.5,
        weeklyGoalProgress: 78,
        improvements: ["Increased daily steps by 12%", "Improved sleep quality", "Consistent workout routine"],
        recommendations: [
          "Try to increase water intake",
          "Add 10 minutes to morning workout",
          "Maintain current sleep schedule",
        ],
      }

      this.displayWeeklySummary(mockWeeklyData)
      this.showDemoNotice()
    }, 1500)
  }

  showDemoNotice() {
    const notice = document.createElement("div")
    notice.className = "demo-notice"
    notice.innerHTML = `
      <i class="fas fa-info-circle"></i> <strong>Demo Mode:</strong> Using sample data. Connect your Fitbit account for real health data.
    `

    const mainContent = document.querySelector(".main-content")
    mainContent.insertBefore(notice, mainContent.firstChild)
  }

  updateAllStats() {
    document.getElementById("calories").textContent = this.userData.calories
    document.getElementById("steps").textContent = this.userData.steps.toLocaleString()
    document.getElementById("activeMinutes").textContent = this.userData.activeMinutes
    document.getElementById("standHours").textContent = this.userData.standHours
    document.getElementById("weeklyWorkouts").textContent = this.userData.weeklyWorkouts
    document.getElementById("currentWeight").textContent = this.userData.currentWeight
    document.getElementById("dailyRating").textContent = this.userData.dailyRating
    document.getElementById("waterCount").textContent = this.userData.waterCount
    document.getElementById("waterRemaining").textContent = this.userData.waterGoal - this.userData.waterCount
    document.getElementById("heartRate").textContent = this.userData.heartRate
    document.getElementById("sleepScore").textContent = this.userData.sleepScore
  }

  updateProgressRings() {
    const moveProgress = Math.min((this.userData.calories / 400) * 100, 100)
    const exerciseProgress = Math.min((this.userData.activeMinutes / 60) * 100, 100)
    const standProgress = Math.min((this.userData.standHours / 12) * 100, 100)

    this.animateRing("moveRing", moveProgress, 65)
    this.animateRing("exerciseRing", exerciseProgress, 50)
    this.animateRing("standRing", standProgress, 35)
  }

  animateRing(ringId, percentage, radius) {
    const ring = document.getElementById(ringId)
    if (!ring) return

    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    ring.style.strokeDasharray = circumference
    ring.style.strokeDashoffset = offset
  }

  drawWeightChart() {
    const canvas = document.getElementById("weightChart")
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const weightData = [81.8, 82.0, 82.1, 82.3, 82.2, 82.4, 82.4]

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const padding = 10
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    const minWeight = Math.min(...weightData) - 0.2
    const maxWeight = Math.max(...weightData) + 0.2
    const weightRange = maxWeight - minWeight

    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
    ctx.lineWidth = 2
    ctx.beginPath()

    weightData.forEach((weight, index) => {
      const x = padding + (index / (weightData.length - 1)) * chartWidth
      const y = padding + chartHeight - ((weight - minWeight) / weightRange) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    ctx.fillStyle = "white"
    weightData.forEach((weight, index) => {
      const x = padding + (index / (weightData.length - 1)) * chartWidth
      const y = padding + chartHeight - ((weight - minWeight) / weightRange) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  updateWaterDisplay() {
    const glasses = document.querySelectorAll(".glass")
    glasses.forEach((glass, index) => {
      const glassNumber = index + 1
      glass.classList.remove("filled", "current", "empty")

      if (glassNumber <= this.userData.waterCount) {
        glass.classList.add("filled")
        glass.textContent = "💧"
      } else if (glassNumber === this.userData.waterCount + 1) {
        glass.classList.add("current")
        glass.textContent = "💧"
      } else {
        glass.classList.add("empty")
        glass.textContent = "🥤"
      }
    })
  }

  displayWeeklySummary(data) {
    const summaryContent = document.getElementById("weeklySummaryContent")

    summaryContent.innerHTML = `
            <div class="summary-grid">
                <div class="summary-item">
                    <span class="value">${(data.totalSteps / 1000).toFixed(1)}k</span>
                    <span class="label">Total Steps</span>
                </div>
                <div class="summary-item">
                    <span class="value">${data.avgHeartRate}</span>
                    <span class="label">Avg Heart Rate</span>
                </div>
                <div class="summary-item">
                    <span class="value">${data.totalCalories}</span>
                    <span class="label">Calories Burned</span>
                </div>
                <div class="summary-item">
                    <span class="value">${data.workoutsCompleted}</span>
                    <span class="label">Workouts</span>
                </div>
            </div>
            
            <div class="weekly-progress-section">
                <h4>📊 This Week's Progress</h4>
                <div class="progress-text">
                    <span>Weekly Goal Progress</span>
                    <span class="progress-percentage">${data.weeklyGoalProgress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${data.weeklyGoalProgress}%;"></div>
                </div>
            </div>
            
            <div class="improvements-recommendations">
                <div class="improvements-section">
                    <h4>✅ Improvements</h4>
                    <ul>
                        ${data.improvements.map((improvement) => `<li>• ${improvement}</li>`).join("")}
                    </ul>
                </div>
                
                <div class="recommendations-section">
                    <h4>💡 Recommendations</h4>
                    <ul>
                        ${data.recommendations.map((rec) => `<li>• ${rec}</li>`).join("")}
                    </ul>
                </div>
            </div>
            
            <div class="fitbit-branding">
                <i class="fab fa-fitbit"></i>
                <span>Data synced from Fitbit API</span>
            </div>
        `
  }

  setupEventListeners() {
    document.querySelectorAll(".nav-item").forEach((item, index) => {
      item.addEventListener("click", (e) => {
        document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"))
        e.currentTarget.classList.add("active")

        const navItems = ["chat", "statistics", "home", "profile"]
        const selectedNav = navItems[index]
        console.log(`Navigated to: ${selectedNav}`)
      })
    })

    document.querySelectorAll(".glass").forEach((glass, index) => {
      glass.addEventListener("click", () => {
        this.userData.waterCount = index + 1
        this.updateWaterDisplay()
        this.updateAllStats()
      })
    })

    const ratingBtn = document.querySelector(".rating-card .card-btn")
    if (ratingBtn) {
      ratingBtn.addEventListener("click", () => {
        const ratings = ["Excellent", "Good", "Balanced", "Tired", "Stressed"]
        const currentIndex = ratings.indexOf(this.userData.dailyRating)
        const nextIndex = (currentIndex + 1) % ratings.length
        this.userData.dailyRating = ratings[nextIndex]
        document.getElementById("dailyRating").textContent = this.userData.dailyRating
      })
    }

    setInterval(() => {
      if (this.accessToken) {
        this.fetchFitbitData()
      }
    }, 300000)

    setInterval(() => {
      if (!this.accessToken) {
        this.userData.steps += Math.floor(Math.random() * 20)
        this.userData.calories += Math.floor(Math.random() * 3)
        this.userData.heartRate = 68 + Math.floor(Math.random() * 8)

        this.updateAllStats()
        this.updateProgressRings()
      }
    }, 30000)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new HealthTracker()
})
