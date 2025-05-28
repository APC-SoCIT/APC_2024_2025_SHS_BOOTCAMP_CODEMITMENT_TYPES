// Hospital Finder App - Enhanced with More Hospitals and Specializations
class HospitalFinder {
  constructor() {
    this.map = null
    this.markers = []
    this.hospitals = []
    this.filteredHospitals = []
    this.selectedHospital = null
    this.currentPosition = [14.5995, 120.9842] // Manila default
    this.selectedSpecialization = null
    this.searchTimeout = null

    this.specializations = [
      { name: "Allergist", icon: "🤧" },
      { name: "Cardiologist", icon: "❤️" },
      { name: "Dentist", icon: "🦷" },
      { name: "Dermatologist", icon: "🧴" },
      { name: "Dietician", icon: "🥗" },
      { name: "Endocrinologist", icon: "🩺" },
      { name: "Neurologist", icon: "🧠" },
      { name: "Obstetrician", icon: "👶" },
      { name: "Oncologist", icon: "🎗️" },
      { name: "Ophthalmologist", icon: "👁️" },
      { name: "Orthopedist", icon: "🦴" },
      { name: "Pediatrician", icon: "🧸" },
      { name: "Psychiatrist", icon: "🧘" },
      { name: "Physiatrist", icon: "🏃" },
      { name: "Urologist", icon: "🫘" },
    ]

    this.init()
  }

  init() {
    console.log("Initializing Hospital Finder...")
    this.loadHospitalData()
    this.initializeElements()
    this.setupEventListeners()
    this.initializeSpecializations()
    this.displayHospitals()

    // Initialize map after DOM is ready
    setTimeout(() => {
      this.initializeMap()
    }, 500)
  }

  initializeElements() {
    this.elements = {
      searchInput: document.getElementById("searchInput"),
      clearSearch: document.getElementById("clearSearch"),
      hospitalList: document.getElementById("hospitalList"),
      noResults: document.getElementById("noResults"),
      mapLoading: document.getElementById("mapLoading"),
      specializationsGrid: document.getElementById("specializationsGrid"),
      specDropdown: document.getElementById("specDropdown"),
      dropdownToggle: document.getElementById("dropdownToggle"),
      dropdownArrow: document.getElementById("dropdownArrow"),
      bookingModal: document.getElementById("bookingModal"),
      bookingForm: document.getElementById("bookingForm"),
      closeModal: document.getElementById("closeModal"),
      cancelBooking: document.getElementById("cancelBooking"),
      hospitalName: document.getElementById("hospitalName"),
      toast: document.getElementById("toast"),
      toastMessage: document.getElementById("toastMessage"),
      toastClose: document.getElementById("toastClose"),
      loadingOverlay: document.getElementById("loadingOverlay"),
      resultsCount: document.getElementById("resultsCount"),
    }

    console.log("Elements initialized")
  }

  setupEventListeners() {
    // Search functionality
    this.elements.searchInput.addEventListener("input", (e) => {
      this.debounceSearch()
      this.toggleClearButton()
    })

    this.elements.clearSearch.addEventListener("click", () => {
      this.elements.searchInput.value = ""
      this.filterHospitals()
      this.toggleClearButton()
      this.elements.searchInput.focus()
    })

    // Dropdown toggle
    this.elements.dropdownToggle.addEventListener("click", () => {
      this.toggleDropdown()
    })

    // Modal events
    this.elements.closeModal.addEventListener("click", () => {
      this.closeModal()
    })

    this.elements.cancelBooking.addEventListener("click", () => {
      this.closeModal()
    })

    this.elements.bookingModal.addEventListener("click", (e) => {
      if (e.target === this.elements.bookingModal) {
        this.closeModal()
      }
    })

    // Form submission
    this.elements.bookingForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleBooking()
    })

    // Toast close
    this.elements.toastClose.addEventListener("click", () => {
      this.hideToast()
    })

    // Navigation - Updated for bottom nav
    document.querySelectorAll(".bottom-nav .nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        this.handleNavigation(e.currentTarget.dataset.page)
      })
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!this.elements.specializationsHeader?.contains(e.target) && !this.elements.specDropdown.contains(e.target)) {
        this.elements.specDropdown.classList.remove("show")
        this.elements.dropdownArrow.classList.remove("rotated")
      }
    })

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.elements.bookingModal.classList.contains("show")) {
          this.closeModal()
        }
        if (this.elements.specDropdown.classList.contains("show")) {
          this.elements.specDropdown.classList.remove("show")
          this.elements.dropdownArrow.classList.remove("rotated")
        }
      }
    })

    console.log("Event listeners set up")
  }

  loadHospitalData() {
    this.hospitals = [
      // Metro Manila Hospitals
      {
        id: 1,
        name: "Philippine General Hospital",
        address: "Ermita, Manila, Philippines",
        phone: "+63 2 554 8400",
        position: [14.58, 120.9822],
        specializations: [
          "Allergist",
          "Cardiologist",
          "Dentist",
          "Neurologist",
          "Oncologist",
          "Pediatrician",
          "Psychiatrist",
        ],
        rating: 4.2,
        availability: { beds: 15, emergency: true, waitTime: "30 mins" },
      },
      {
        id: 2,
        name: "Adventist Medical Center Manila",
        address: "1942 Donada Street 1306 Pasay Metro Manila",
        phone: "(02) 8625 9192 to 98",
        position: [14.565, 120.995],
        specializations: ["Cardiologist", "Dentist", "Dermatologist", "Endocrinologist", "Ophthalmologist"],
        rating: 4.1,
        availability: { beds: 8, emergency: true, waitTime: "45 mins" },
      },
      {
        id: 3,
        name: "Manila Doctors Hospital",
        address: "667 United Nations Ave 1000 Manila National Capital Region",
        phone: "(02) 8558 0888",
        position: [14.583, 120.987],
        specializations: ["Allergist", "Dentist", "Dietician", "Urologist"],
        rating: 4.3,
        availability: { beds: 22, emergency: false, waitTime: "15 mins" },
      },
      {
        id: 4,
        name: "St. Luke's Medical Center - Global City",
        address: "279 E Rodriguez Sr. Ave, Quezon City",
        phone: "(02) 8723 0101",
        position: [14.615, 121.0244],
        specializations: ["Allergist", "Cardiologist", "Neurologist", "Oncologist", "Orthopedist", "Pediatrician"],
        rating: 4.5,
        availability: { beds: 35, emergency: true, waitTime: "20 mins" },
      },
      {
        id: 5,
        name: "Makati Medical Center",
        address: "2 Amorsolo St, Makati, Metro Manila",
        phone: "(02) 8888 8999",
        position: [14.558, 121.0144],
        specializations: ["Cardiologist", "Dentist", "Obstetrician", "Urologist", "Physiatrist"],
        rating: 4.4,
        availability: { beds: 12, emergency: true, waitTime: "25 mins" },
      },
      {
        id: 6,
        name: "Asian Hospital and Medical Center",
        address: "2205 Civic Dr, Filinvest Corporate City, Alabang, Muntinlupa",
        phone: "(02) 8771 9000",
        position: [14.4127, 121.042],
        specializations: [
          "Cardiologist",
          "Dermatologist",
          "Endocrinologist",
          "Neurologist",
          "Ophthalmologist",
          "Orthopedist",
        ],
        rating: 4.3,
        availability: { beds: 18, emergency: true, waitTime: "35 mins" },
      },
      {
        id: 7,
        name: "The Medical City",
        address: "Ortigas Ave, Pasig, Metro Manila",
        phone: "(02) 8988 1000",
        position: [14.5865, 121.0644],
        specializations: ["Allergist", "Cardiologist", "Oncologist", "Pediatrician", "Psychiatrist", "Urologist"],
        rating: 4.4,
        availability: { beds: 28, emergency: true, waitTime: "40 mins" },
      },
      {
        id: 8,
        name: "Cardinal Santos Medical Center",
        address: "10 Wilson St, San Juan, Metro Manila",
        phone: "(02) 8727 0001",
        position: [14.6042, 121.0348],
        specializations: ["Cardiologist", "Dentist", "Dermatologist", "Obstetrician", "Ophthalmologist"],
        rating: 4.2,
        availability: { beds: 14, emergency: true, waitTime: "25 mins" },
      },
      {
        id: 9,
        name: "Veterans Memorial Medical Center",
        address: "North Ave, Diliman, Quezon City",
        phone: "(02) 8927 0001",
        position: [14.6507, 121.0434],
        specializations: ["Allergist", "Neurologist", "Orthopedist", "Physiatrist", "Psychiatrist"],
        rating: 4.0,
        availability: { beds: 20, emergency: true, waitTime: "50 mins" },
      },
      {
        id: 10,
        name: "University of Santo Tomas Hospital",
        address: "España Blvd, Sampaloc, Manila",
        phone: "(02) 8731 3001",
        position: [14.6091, 120.9894],
        specializations: ["Cardiologist", "Dentist", "Endocrinologist", "Pediatrician", "Urologist"],
        rating: 4.1,
        availability: { beds: 16, emergency: true, waitTime: "30 mins" },
      },
      {
        id: 11,
        name: "Philippine Heart Center",
        address: "East Ave, Diliman, Quezon City",
        phone: "(02) 8925 2401",
        position: [14.6378, 121.0348],
        specializations: ["Cardiologist", "Physiatrist"],
        rating: 4.6,
        availability: { beds: 8, emergency: true, waitTime: "15 mins" },
      },
      {
        id: 12,
        name: "National Kidney and Transplant Institute",
        address: "East Ave, Diliman, Quezon City",
        phone: "(02) 8981 0300",
        position: [14.6401, 121.0365],
        specializations: ["Endocrinologist", "Urologist", "Dietician"],
        rating: 4.3,
        availability: { beds: 12, emergency: true, waitTime: "20 mins" },
      },
      {
        id: 13,
        name: "Jose Reyes Memorial Medical Center",
        address: "Rizal Ave Ext, Santa Cruz, Manila",
        phone: "(02) 8711 9491",
        position: [14.6234, 120.9736],
        specializations: ["Allergist", "Dermatologist", "Neurologist", "Pediatrician", "Psychiatrist"],
        rating: 3.9,
        availability: { beds: 25, emergency: true, waitTime: "45 mins" },
      },
      {
        id: 14,
        name: "Chinese General Hospital",
        address: "286 Blumentritt Rd, Santa Cruz, Manila",
        phone: "(02) 8711 4141",
        position: [14.6156, 120.9756],
        specializations: ["Cardiologist", "Dentist", "Ophthalmologist", "Orthopedist", "Urologist"],
        rating: 4.0,
        availability: { beds: 18, emergency: true, waitTime: "35 mins" },
      },
      {
        id: 15,
        name: "Mary Johnston Hospital",
        address: "2232 Taft Ave, Malate, Manila",
        phone: "(02) 8524 1078",
        position: [14.5734, 120.9934],
        specializations: ["Obstetrician", "Pediatrician", "Dermatologist", "Dentist"],
        rating: 3.8,
        availability: { beds: 10, emergency: false, waitTime: "25 mins" },
      },
      {
        id: 16,
        name: "De La Salle University Medical Center",
        address: "Dasmariñas, Cavite",
        phone: "(046) 481 8000",
        position: [14.3294, 120.9367],
        specializations: ["Cardiologist", "Neurologist", "Oncologist", "Pediatrician", "Physiatrist"],
        rating: 4.2,
        availability: { beds: 22, emergency: true, waitTime: "30 mins" },
      },
      {
        id: 17,
        name: "Rizal Medical Center",
        address: "Pasig Blvd, Pasig City",
        phone: "(02) 8650 2400",
        position: [14.5718, 121.0792],
        specializations: ["Allergist", "Endocrinologist", "Ophthalmologist", "Orthopedist", "Psychiatrist"],
        rating: 4.0,
        availability: { beds: 15, emergency: true, waitTime: "40 mins" },
      },
      {
        id: 18,
        name: "Lung Center of the Philippines",
        address: "Quezon Ave, Quezon City",
        phone: "(02) 8924 6101",
        position: [14.6378, 121.0234],
        specializations: ["Allergist", "Cardiologist", "Physiatrist"],
        rating: 4.1,
        availability: { beds: 8, emergency: true, waitTime: "25 mins" },
      },
      {
        id: 19,
        name: "Research Institute for Tropical Medicine",
        address: "Alabang, Muntinlupa City",
        phone: "(02) 8807 2631",
        position: [14.4234, 121.0456],
        specializations: ["Allergist", "Dermatologist", "Pediatrician"],
        rating: 4.0,
        availability: { beds: 6, emergency: false, waitTime: "20 mins" },
      },
      {
        id: 20,
        name: "Quirino Memorial Medical Center",
        address: "Katipunan Ave, Quezon City",
        phone: "(02) 8941 4645",
        position: [14.6456, 121.0678],
        specializations: ["Cardiologist", "Neurologist", "Orthopedist", "Pediatrician", "Urologist"],
        rating: 3.9,
        availability: { beds: 30, emergency: true, waitTime: "55 mins" },
      },
      // Cebu Hospitals
      {
        id: 21,
        name: "Vicente Sotto Memorial Medical Center",
        address: "B. Rodriguez St, Cebu City",
        phone: "(032) 253 9891",
        position: [10.3157, 123.8854],
        specializations: ["Cardiologist", "Neurologist", "Oncologist", "Pediatrician", "Psychiatrist"],
        rating: 4.1,
        availability: { beds: 25, emergency: true, waitTime: "35 mins" },
      },
      {
        id: 22,
        name: "Cebu Doctors' University Hospital",
        address: "Osmena Blvd, Cebu City",
        phone: "(032) 255 5555",
        position: [10.3012, 123.8934],
        specializations: ["Allergist", "Cardiologist", "Dermatologist", "Ophthalmologist", "Urologist"],
        rating: 4.3,
        availability: { beds: 18, emergency: true, waitTime: "25 mins" },
      },
      {
        id: 23,
        name: "Chong Hua Hospital",
        address: "Don Mariano Cui St, Cebu City",
        phone: "(032) 255 8000",
        position: [10.3089, 123.8967],
        specializations: ["Cardiologist", "Endocrinologist", "Neurologist", "Orthopedist", "Physiatrist"],
        rating: 4.4,
        availability: { beds: 20, emergency: true, waitTime: "30 mins" },
      },
      // Davao Hospitals
      {
        id: 24,
        name: "Southern Philippines Medical Center",
        address: "J.P. Laurel Ave, Davao City",
        phone: "(082) 227 2731",
        position: [7.0731, 125.6128],
        specializations: ["Cardiologist", "Neurologist", "Oncologist", "Pediatrician", "Psychiatrist"],
        rating: 4.2,
        availability: { beds: 28, emergency: true, waitTime: "40 mins" },
      },
      {
        id: 25,
        name: "Davao Medical School Foundation Hospital",
        address: "Gen. Malvar St, Davao City",
        phone: "(082) 226 4589",
        position: [7.0644, 125.6089],
        specializations: ["Allergist", "Dermatologist", "Ophthalmologist", "Orthopedist", "Urologist"],
        rating: 4.0,
        availability: { beds: 15, emergency: true, waitTime: "35 mins" },
      },
      // Iloilo Hospitals
      {
        id: 26,
        name: "Western Visayas Medical Center",
        address: "Q. Abeto St, Mandurriao, Iloilo City",
        phone: "(033) 321 1532",
        position: [10.7202, 122.5621],
        specializations: ["Cardiologist", "Endocrinologist", "Neurologist", "Pediatrician", "Physiatrist"],
        rating: 4.1,
        availability: { beds: 22, emergency: true, waitTime: "30 mins" },
      },
      {
        id: 27,
        name: "Iloilo Mission Hospital",
        address: "Mission Hospital St, Jaro, Iloilo City",
        phone: "(033) 329 1200",
        position: [10.7345, 122.5534],
        specializations: ["Allergist", "Dentist", "Dermatologist", "Obstetrician", "Ophthalmologist"],
        rating: 4.0,
        availability: { beds: 12, emergency: true, waitTime: "25 mins" },
      },
      // Baguio Hospitals
      {
        id: 28,
        name: "Baguio General Hospital",
        address: "Governor Pack Rd, Baguio City",
        phone: "(074) 442 2216",
        position: [16.4023, 120.596],
        specializations: ["Cardiologist", "Neurologist", "Orthopedist", "Pediatrician", "Psychiatrist"],
        rating: 4.0,
        availability: { beds: 18, emergency: true, waitTime: "35 mins" },
      },
      {
        id: 29,
        name: "Notre Dame de Chartres Hospital",
        address: "Kisad Rd, Baguio City",
        phone: "(074) 442 2741",
        position: [16.4156, 120.5934],
        specializations: ["Allergist", "Dermatologist", "Ophthalmologist", "Urologist"],
        rating: 3.9,
        availability: { beds: 10, emergency: false, waitTime: "20 mins" },
      },
      // Cagayan de Oro Hospitals
      {
        id: 30,
        name: "Northern Mindanao Medical Center",
        address: "Lapasan, Cagayan de Oro City",
        phone: "(088) 857 3045",
        position: [8.4542, 124.6319],
        specializations: ["Cardiologist", "Endocrinologist", "Neurologist", "Oncologist", "Pediatrician"],
        rating: 4.1,
        availability: { beds: 20, emergency: true, waitTime: "40 mins" },
      },
    ]

    this.filteredHospitals = [...this.hospitals]
    console.log("Hospital data loaded:", this.hospitals.length, "hospitals")
  }

  initializeSpecializations() {
    // Clear existing buttons to prevent duplication
    this.elements.specializationsGrid.innerHTML = ""
    this.elements.specDropdown.innerHTML = ""

    // Create specialization buttons
    this.specializations.forEach((spec) => {
      const button = document.createElement("button")
      button.className = "spec-button"
      button.setAttribute("data-spec", spec.name)
      button.setAttribute("aria-label", `Filter by ${spec.name}`)
      button.innerHTML = `
        <div class="spec-icon">${spec.icon}</div>
        <div class="spec-label">${spec.name}</div>
      `

      button.addEventListener("click", () => {
        this.selectSpecialization(spec.name)
      })

      this.elements.specializationsGrid.appendChild(button)
    })

    // Create dropdown items
    const allItem = document.createElement("div")
    allItem.className = "dropdown-item active"
    allItem.setAttribute("data-spec", "All")
    allItem.textContent = "All Specializations"
    allItem.addEventListener("click", () => {
      this.selectSpecialization(null)
    })
    this.elements.specDropdown.appendChild(allItem)

    this.specializations.forEach((spec) => {
      const item = document.createElement("div")
      item.className = "dropdown-item"
      item.setAttribute("data-spec", spec.name)
      item.textContent = spec.name
      item.addEventListener("click", () => {
        this.selectSpecialization(spec.name)
      })
      this.elements.specDropdown.appendChild(item)
    })

    console.log("Specializations initialized")
  }

  initializeMap() {
    try {
      console.log("Initializing map...")

      // Check if Leaflet is loaded
      if (typeof L === "undefined") {
        console.error("Leaflet not loaded")
        this.elements.mapLoading.innerHTML = "<p>Map library not loaded</p>"
        return
      }

      // Create map
      this.map = L.map("map").setView(this.currentPosition, 13)

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(this.map)

      // Hide loading
      this.elements.mapLoading.classList.add("hidden")

      // Add markers
      this.addMarkersToMap()

      console.log("Map initialized successfully")
    } catch (error) {
      console.error("Error initializing map:", error)
      this.elements.mapLoading.innerHTML = "<p>Error loading map</p>"
    }
  }

  addMarkersToMap() {
    if (!this.map) return

    this.filteredHospitals.forEach((hospital) => {
      const marker = L.marker(hospital.position).addTo(this.map)

      const popupContent = `
        <div style="min-width: 200px;">
          <strong>${hospital.name}</strong><br>
          <div style="margin: 8px 0; color: #666;">${hospital.address}</div>
          <div style="margin: 4px 0; color: #666;">${hospital.phone}</div>
          <div style="margin: 8px 0;">
            <strong>Rating:</strong> ${hospital.rating} ⭐
          </div>
          <div style="margin: 8px 0;">
            <strong>Specializations:</strong><br>
            ${hospital.specializations.join(", ")}
          </div>
          ${
            hospital.availability
              ? `
            <div style="margin: 8px 0; padding: 6px; background: #f8f9fa; border-radius: 4px; font-size: 12px;">
              <div>Available Beds: <strong>${hospital.availability.beds}</strong></div>
              <div>Wait Time: <strong>${hospital.availability.waitTime}</strong></div>
              ${hospital.availability.emergency ? '<div style="color: #28a745;">🚨 Emergency Services Available</div>' : ""}
            </div>
          `
              : ""
          }
        </div>
      `

      marker.bindPopup(popupContent)

      marker.on("click", () => {
        this.map.setView(hospital.position, 15)
      })

      this.markers.push(marker)
    })
  }

  clearMarkers() {
    if (this.map) {
      this.markers.forEach((marker) => this.map.removeLayer(marker))
    }
    this.markers = []
  }

  debounceSearch() {
    clearTimeout(this.searchTimeout)
    this.searchTimeout = setTimeout(() => {
      this.filterHospitals()
    }, 300)
  }

  filterHospitals() {
    let filtered = [...this.hospitals]

    // Filter by specialization
    if (this.selectedSpecialization) {
      filtered = filtered.filter((h) => h.specializations.includes(this.selectedSpecialization))
    }

    // Filter by search
    const searchQuery = this.elements.searchInput.value.trim().toLowerCase()
    if (searchQuery) {
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(searchQuery) ||
          h.address.toLowerCase().includes(searchQuery) ||
          h.specializations.some((spec) => spec.toLowerCase().includes(searchQuery)),
      )
    }

    this.filteredHospitals = filtered
    this.displayHospitals()
    this.updateMap()
    this.updateResultsCount()
  }

  updateResultsCount() {
    const count = this.filteredHospitals.length
    this.elements.resultsCount.textContent = `${count} hospital${count !== 1 ? "s" : ""} found`
  }

  displayHospitals() {
    this.elements.hospitalList.innerHTML = ""

    if (this.filteredHospitals.length === 0) {
      this.elements.noResults.style.display = "block"
      this.elements.hospitalList.style.display = "none"
    } else {
      this.elements.noResults.style.display = "none"
      this.elements.hospitalList.style.display = "block"

      this.filteredHospitals.forEach((hospital) => {
        this.createHospitalCard(hospital)
      })
    }
  }

  createHospitalCard(hospital) {
    const card = document.createElement("div")
    card.className = "hospital-card"
    card.setAttribute("role", "button")
    card.setAttribute("tabindex", "0")
    card.setAttribute("aria-label", `${hospital.name} hospital card`)

    const specList = hospital.specializations.slice(0, 3).join(", ")
    const hasMoreSpecs = hospital.specializations.length > 3

    card.innerHTML = `
      <div class="hospital-header">
        <div>
          <div class="hospital-name">${hospital.name}</div>
          <div class="hospital-address">
            <i class="fas fa-map-marker-alt"></i>
            ${hospital.address}
          </div>
          <div class="hospital-phone">
            <i class="fas fa-phone"></i>
            ${hospital.phone}
          </div>
        </div>
        <div class="hospital-rating">
          <i class="fas fa-star"></i>
          <span>${hospital.rating}</span>
        </div>
      </div>
      
      <div class="hospital-specializations">
        ${specList}${hasMoreSpecs ? " and more..." : ""}
      </div>
      
      <div class="hospital-actions">
        <button class="book-btn" aria-label="Book appointment at ${hospital.name}">
          <i class="fas fa-calendar-plus"></i>
          Book
        </button>
      </div>
    `

    // Card click
    card.addEventListener("click", (e) => {
      if (!e.target.closest(".book-btn")) {
        this.focusHospital(hospital)
      }
    })

    // Keyboard navigation
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        this.focusHospital(hospital)
      }
    })

    // Book button
    const bookBtn = card.querySelector(".book-btn")
    bookBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      this.openBookingModal(hospital)
    })

    this.elements.hospitalList.appendChild(card)
  }

  focusHospital(hospital) {
    if (this.map) {
      this.map.setView(hospital.position, 15)

      // Open popup for this hospital
      this.markers.forEach((marker) => {
        const markerPos = marker.getLatLng()
        if (
          Math.abs(markerPos.lat - hospital.position[0]) < 0.001 &&
          Math.abs(markerPos.lng - hospital.position[1]) < 0.001
        ) {
          marker.openPopup()
        }
      })
    }
  }

  updateMap() {
    this.clearMarkers()
    this.addMarkersToMap()
  }

  toggleClearButton() {
    const hasValue = this.elements.searchInput.value.trim() !== ""
    this.elements.clearSearch.style.display = hasValue ? "block" : "none"
  }

  toggleDropdown() {
    const isVisible = this.elements.specDropdown.classList.contains("show")

    if (isVisible) {
      this.elements.specDropdown.classList.remove("show")
      this.elements.dropdownArrow.classList.remove("rotated")
    } else {
      this.elements.specDropdown.classList.add("show")
      this.elements.dropdownArrow.classList.add("rotated")
    }
  }

  selectSpecialization(spec) {
    if (this.selectedSpecialization === spec) {
      this.selectedSpecialization = null
    } else {
      this.selectedSpecialization = spec
    }

    this.updateSpecializationUI()
    this.filterHospitals()

    // Close dropdown
    this.elements.specDropdown.classList.remove("show")
    this.elements.dropdownArrow.classList.remove("rotated")
  }

  updateSpecializationUI() {
    // Update buttons
    const buttons = this.elements.specializationsGrid.querySelectorAll(".spec-button")
    buttons.forEach((btn) => {
      const btnSpec = btn.getAttribute("data-spec")
      if (btnSpec === this.selectedSpecialization) {
        btn.classList.add("active")
        btn.setAttribute("aria-pressed", "true")
      } else {
        btn.classList.remove("active")
        btn.setAttribute("aria-pressed", "false")
      }
    })

    // Update dropdown items
    const items = this.elements.specDropdown.querySelectorAll(".dropdown-item")
    items.forEach((item) => {
      const itemSpec = item.getAttribute("data-spec")
      if ((itemSpec === "All" && !this.selectedSpecialization) || itemSpec === this.selectedSpecialization) {
        item.classList.add("active")
      } else {
        item.classList.remove("active")
      }
    })
  }

  openBookingModal(hospital) {
    this.selectedHospital = hospital
    this.elements.hospitalName.textContent = hospital.name

    // Populate specialist dropdown
    const specialistSelect = document.getElementById("specialistType")
    specialistSelect.innerHTML = '<option value="">Select a specialist</option>'

    hospital.specializations.forEach((spec) => {
      const option = document.createElement("option")
      option.value = spec
      option.textContent = spec
      specialistSelect.appendChild(option)
    })

    // Set minimum date
    const dateInput = document.getElementById("appointmentDate")
    const today = new Date().toISOString().split("T")[0]
    dateInput.min = today

    this.elements.bookingModal.classList.add("show")
    this.elements.bookingModal.setAttribute("aria-hidden", "false")
    document.body.style.overflow = "hidden"

    // Focus first input
    setTimeout(() => {
      document.getElementById("userName").focus()
    }, 100)
  }

  closeModal() {
    this.elements.bookingModal.classList.remove("show")
    this.elements.bookingModal.setAttribute("aria-hidden", "true")
    document.body.style.overflow = ""
    this.elements.bookingForm.reset()
    this.selectedHospital = null
  }

  handleBooking() {
    const formData = new FormData(this.elements.bookingForm)
    const bookingData = {
      hospital: this.selectedHospital.name,
      hospitalId: this.selectedHospital.id,
      userName: formData.get("userName"),
      specialistType: formData.get("specialistType"),
      appointmentDate: formData.get("appointmentDate"),
      appointmentTime: formData.get("appointmentTime"),
      contactNumber: formData.get("contactNumber"),
    }

    console.log("Booking submitted:", bookingData)

    this.closeModal()
    this.showToast(`Booking confirmed for ${bookingData.userName} at ${bookingData.hospital}`, "success")

    // Store booking in localStorage for demo
    this.storeBooking(bookingData)
  }

  storeBooking(bookingData) {
    const bookings = JSON.parse(localStorage.getItem("hospitalBookings") || "[]")
    bookings.push({
      ...bookingData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: "confirmed",
    })
    localStorage.setItem("hospitalBookings", JSON.stringify(bookings))
  }

  showToast(message, type = "success") {
    this.elements.toastMessage.textContent = message
    this.elements.toast.className = `toast ${type} show`

    const icon = this.elements.toast.querySelector(".toast-icon")
    if (type === "success") {
      icon.className = "toast-icon fas fa-check-circle"
    } else if (type === "error") {
      icon.className = "toast-icon fas fa-exclamation-circle"
    }

    setTimeout(() => {
      this.hideToast()
    }, 4000)
  }

  hideToast() {
    this.elements.toast.classList.remove("show")
  }

  showLoading() {
    this.elements.loadingOverlay.classList.add("show")
  }

  hideLoading() {
    this.elements.loadingOverlay.classList.remove("show")
  }

  handleNavigation(page) {
    // Update active nav
    document.querySelectorAll(".bottom-nav .nav-item").forEach((item) => {
      item.classList.remove("active")
    })
    document.querySelector(`[data-page="${page}"]`).classList.add("active")

    // Show message for other pages
    if (page !== "home") {
      this.showToast(`${page.charAt(0).toUpperCase() + page.slice(1)} feature coming soon!`)
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing app...")
  new HospitalFinder()
})

// Also initialize if DOM is already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded (fallback), initializing app...")
    new HospitalFinder()
  })
} else {
  console.log("DOM already loaded, initializing app immediately...")
  new HospitalFinder()
}
