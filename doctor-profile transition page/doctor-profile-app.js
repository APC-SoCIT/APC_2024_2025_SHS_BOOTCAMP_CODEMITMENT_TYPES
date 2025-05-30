class DoctorProfile {
  constructor() {
    this.selectedHospital = null
    this.init()
  }

  init() {
    console.log("Initializing Doctor Profile...")
    this.loadHospitalData()
    this.initializeElements()
    this.setupEventListeners()
    this.updateDoctorInfo()
  }

  initializeElements() {
    this.elements = {
      bookingModal: document.getElementById("bookingModal"),
      bookingForm: document.getElementById("bookingForm"),
      closeModal: document.getElementById("closeModal"),
      cancelBooking: document.getElementById("cancelBooking"),
      hospitalName: document.getElementById("hospitalName"),
      toast: document.getElementById("toast"),
      toastMessage: document.getElementById("toastMessage"),
      toastClose: document.getElementById("toastClose"),
      bookAppointmentBtn: document.getElementById("bookAppointmentBtn"),
      doctorName: document.getElementById("doctorName"),
      doctorSpecialty: document.getElementById("doctorSpecialty"),
    }

    console.log("Elements initialized")
  }

  loadHospitalData() {
    // Get hospital data from localStorage
    const hospitalData = localStorage.getItem("selectedHospital")
    if (hospitalData) {
      this.selectedHospital = JSON.parse(hospitalData)
      console.log("Hospital data loaded:", this.selectedHospital)
    } else {
      // Default hospital data if none found
      this.selectedHospital = {
        id: 1,
        name: "Philippine General Hospital",
        specializations: ["Allergist", "Cardiologist", "Neurologist"],
        doctors: [{ name: "Dr. Phineas Ferb", specialty: "Allergist" }],
      }
    }
  }

  updateDoctorInfo() {
    if (this.selectedHospital && this.selectedHospital.doctors) {
      // Use the first doctor or find an allergist
      const doctor =
        this.selectedHospital.doctors.find((d) => d.specialty === "Allergist") || this.selectedHospital.doctors[0]

      if (doctor) {
        this.elements.doctorName.textContent = doctor.name
        this.elements.doctorSpecialty.textContent = `Resident ${doctor.specialty}`
      }
    }
  }

  setupEventListeners() {
    // Book appointment button
    this.elements.bookAppointmentBtn.addEventListener("click", () => {
      this.openBookingModal()
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

    // Navigation
    document.querySelectorAll(".bottom-nav .nav-btn").forEach((item) => {
      item.addEventListener("click", (e) => {
        this.handleNavigation(e.currentTarget.dataset.tab)
      })
    })

    // Contact button
    document.querySelector(".contact-btn").addEventListener("click", () => {
      this.showToast("Contact feature coming soon!")
    })

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.elements.bookingModal.classList.contains("show")) {
          this.closeModal()
        }
      }
    })

    console.log("Event listeners set up")
  }

  openBookingModal() {
    if (!this.selectedHospital) {
      this.showToast("Hospital information not available", "error")
      return
    }

    this.elements.hospitalName.textContent = this.selectedHospital.name

    // Populate specialist dropdown
    const specialistSelect = document.getElementById("specialistType")
    specialistSelect.innerHTML = '<option value="">Select a specialist</option>'

    this.selectedHospital.specializations.forEach((spec) => {
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

    // Store booking in localStorage
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

  handleNavigation(tab) {
    // Update active nav
    document.querySelectorAll(".bottom-nav .nav-btn").forEach((item) => {
      item.classList.remove("active")
    })
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active")

    // Handle different tab actions
    switch (tab) {
      case "chat":
        this.showToast(
          "Opening Chat. In a full implementation, this would open the messaging interface with the doctor.",
        )
        break
      case "statistics":
        this.showToast(
          "Navigating to Statistics page. In a full implementation, this would show patient statistics and analytics.",
        )
        break
      case "home":
        // Navigate back to hospital finder
        window.location.href = "hospital-finder.html"
        break
      case "profile":
        // Already on profile page, no action needed
        break
      default:
        this.showToast(`You clicked on the ${tab} tab.`)
    }
  }
}

// Go back function
function goBack() {
  window.location.href = "hospital-finder.html"
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing doctor profile...")
  new DoctorProfile()
})
