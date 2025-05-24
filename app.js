document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const searchInput = document.getElementById("searchInput");
  const hospitalList = document.getElementById("hospitalList");
  const bookingModal = document.getElementById("bookingModal");
  const bookingForm = document.getElementById("bookingForm");
  const closeModalBtn = document.getElementById("closeModal");
  const hospitalNameElement = document.getElementById("hospitalName");
  const specDropdownBtn = document.getElementById("specDropdownBtn");
  const specDropdown = document.getElementById("specDropdown");
  const specButtons = document.querySelectorAll(".icon-button, .icon-button2, .icon-button3");
  const dropdownItems = document.querySelectorAll(".dropdown-item");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const specializationIcons = document.getElementById("specializationIcons");
  const specNavLeft = document.getElementById("specNavLeft");
  const specNavRight = document.getElementById("specNavRight");
  
  // State variables
  let map;
  let markers = [];
  let hospitals = [];
  let selectedHospital = null;
  let currentPosition = [14.5995, 120.9842]; // Default: Manila
  let selectedSpecialization = null;
  
  // List of all specializations
  const allSpecializations = [
    "Allergist", 
    "Cardiologist", 
    "Dentist", 
    "Dermatologist", 
    "Endocrinologist", 
    "Gastroenterologist", 
    "Neurologist", 
    "Obstetrician", 
    "Oncologist", 
    "Ophthalmologist", 
    "Orthopedist", 
    "Pediatrician", 
    "Psychiatrist", 
    "Urologist"
  ];
  
  // Initialize map
  function initMap() {
    map = L.map('map').setView(currentPosition, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentPosition = [position.coords.latitude, position.coords.longitude];
        map.setView(currentPosition, 13);
        loadHospitalsNear(currentPosition[0], currentPosition[1]);
      },
      (error) => {
        console.warn("Geolocation failed, using default location (Manila):", error);
        loadHospitalsNear(currentPosition[0], currentPosition[1]);
      }
    );
  }
  
  // Load hospitals near a location
  function loadHospitalsNear(lat, lng) {
    // Clear existing markers
    clearMarkers();
    
    // In a real application, you would fetch this data from an API
    // For this example, we'll use mock data with expanded specializations
    hospitals = [
      {
        id: 1,
        name: "Philippine General Hospital",
        address: "Ermita, Manila, Philippines",
        phone: "+63 2 554 8400",
        position: [14.58, 120.9822],
        specializations: ["Allergist", "Cardiologist", "Dentist", "Neurologist", "Oncologist"]
      },
      {
        id: 2,
        name: "Adventist Medical Center Manila",
        address: "1942 Donada Street 1306 Pasay Metro Manila",
        phone: "(02) 8625 9192 to 98",
        position: [14.565, 120.995],
        specializations: ["Cardiologist", "Dentist", "Dermatologist", "Endocrinologist"]
      },
      {
        id: 3,
        name: "Manila Doctors Hospital",
        address: "667 United Nations Ave 1000 Manila National Capital Region",
        phone: "(02) 8558 0888",
        position: [14.583, 120.987],
        specializations: ["Allergist", "Dentist", "Gastroenterologist", "Ophthalmologist"]
      },
      {
        id: 4,
        name: "St. Luke's Medical Center",
        address: "279 E Rodriguez Sr. Ave, Quezon City",
        phone: "(02) 8723 0101",
        position: [14.615, 121.0244],
        specializations: ["Allergist", "Cardiologist", "Orthopedist", "Psychiatrist"]
      },
      {
        id: 5,
        name: "Makati Medical Center",
        address: "2 Amorsolo St, Makati, Metro Manila",
        phone: "(02) 8888 8999",
        position: [14.558, 121.0144],
        specializations: ["Cardiologist", "Dentist", "Obstetrician", "Urologist"]
      },
      {
        id: 6,
        name: "The Medical City",
        address: "Ortigas Avenue, Pasig City",
        phone: "(02) 8988 1000",
        position: [14.588, 121.061],
        specializations: ["Neurologist", "Oncologist", "Pediatrician", "Psychiatrist"]
      },
      {
        id: 7,
        name: "Cardinal Santos Medical Center",
        address: "10 Wilson St, San Juan, Metro Manila",
        phone: "(02) 8727 0001",
        position: [14.599, 121.036],
        specializations: ["Dermatologist", "Gastroenterologist", "Orthopedist", "Urologist"]
      }
    ];
    
    // Filter hospitals by specialization if one is selected
    const filteredHospitals = selectedSpecialization 
      ? hospitals.filter(h => h.specializations.includes(selectedSpecialization))
      : hospitals;
    
    // Filter by search query if present
    const searchFiltered = searchInput.value.trim() !== "" 
      ? filteredHospitals.filter(h => h.name.toLowerCase().includes(searchInput.value.toLowerCase()))
      : filteredHospitals;
    
    // Add markers and create hospital cards
    searchFiltered.forEach(hospital => {
      addHospitalMarker(hospital);
      createHospitalCard(hospital);
    });
  }
  
  // Add a marker for a hospital
  function addHospitalMarker(hospital) {
    const marker = L.marker(hospital.position).addTo(map);
    
    marker.bindPopup(`
      <strong>${hospital.name}</strong><br>
      ${hospital.address}<br>
      ${hospital.phone}<br>
      <strong>Specializations:</strong> ${hospital.specializations.join(", ")}
    `);
    
    marker.on('click', () => {
      map.setView(hospital.position, 15);
    });
    
    markers.push(marker);
  }
  
  // Clear all markers from the map
  function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    hospitalList.innerHTML = '';
  }
  
  // Create a hospital card
  function createHospitalCard(hospital) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Create specializations list (limited to first 3 for space)
    const specList = hospital.specializations.slice(0, 3).join(", ");
    const hasMoreSpecs = hospital.specializations.length > 3;
    
    card.innerHTML = `
      <div class="title">${hospital.name}</div>
      <div class="address">${hospital.address}</div>
      <div class="phone">${hospital.phone}</div>
      <div class="specializations-list">
        ${specList}${hasMoreSpecs ? ' and more...' : ''}
      </div>
      <div class="button">
        <div class="button2">Book</div>
      </div>
    `;
    
    // Add click event to the card
    card.addEventListener('click', () => {
      map.setView(hospital.position, 15);
      
      // Open the popup for this marker
      markers.forEach(marker => {
        const markerLatLng = marker.getLatLng();
        if (markerLatLng.lat === hospital.position[0] && markerLatLng.lng === hospital.position[1]) {
          marker.openPopup();
        }
      });
    });
    
    // Add click event to the book button
    const bookButton = card.querySelector('.button');
    bookButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card click
      openBookingModal(hospital);
    });
    
    hospitalList.appendChild(card);
  }
  
  // Open the booking modal
  function openBookingModal(hospital) {
    selectedHospital = hospital;
    hospitalNameElement.textContent = hospital.name;
    
    // Show available specializations in the modal
    const specialistSelect = document.getElementById('specialistType') || createSpecialistSelect();
    specialistSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a specialist';
    specialistSelect.appendChild(defaultOption);
    
    // Add options for each specialization this hospital offers
    hospital.specializations.forEach(spec => {
      const option = document.createElement('option');
      option.value = spec;
      option.textContent = spec;
      specialistSelect.appendChild(option);
    });
    
    bookingModal.style.display = 'flex';
  }
  
  // Create specialist select dropdown if it doesn't exist
  function createSpecialistSelect() {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    formGroup.innerHTML = `
      <label for="specialistType">Specialist Type</label>
      <select id="specialistType" required></select>
    `;
    
    // Insert before the last form group (which contains the buttons)
    const formGroups = bookingForm.querySelectorAll('.form-group');
    bookingForm.insertBefore(formGroup, formGroups[formGroups.length - 1]);
    
    return document.getElementById('specialistType');
  }
  
  // Close the booking modal
  function closeBookingModal() {
    bookingModal.style.display = 'none';
    bookingForm.reset();
  }
  
  // Show toast notification
  function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
  
  // Filter hospitals by search query
  function filterHospitals() {
    // Reload hospitals with current filters
    loadHospitalsNear(currentPosition[0], currentPosition[1]);
  }
  
  // Toggle specialization dropdown
  function toggleSpecDropdown() {
    specDropdown.classList.toggle('show');
  }
  
  // Select a specialization
  function selectSpecialization(spec) {
    // If clicking the already selected specialization, deselect it
    if (selectedSpecialization === spec) {
      selectedSpecialization = null;
      
      // Remove active class from all spec buttons
      specButtons.forEach(btn => {
        btn.classList.remove('active-spec');
      });
      
      // Remove active class from all dropdown items
      dropdownItems.forEach(item => {
        item.classList.remove('active');
      });
      
      // Set "All" as active in dropdown
      const allItem = document.querySelector('.dropdown-item[data-spec="All"]');
      if (allItem) allItem.classList.add('active');
    } else {
      selectedSpecialization = spec === 'All' ? null : spec;
      
      // Update active state for spec buttons
      specButtons.forEach(btn => {
        const btnSpec = btn.getAttribute('data-spec');
        if (btnSpec === spec) {
          btn.classList.add('active-spec');
        } else {
          btn.classList.remove('active-spec');
        }
      });
      
      // Update active state for dropdown items
      dropdownItems.forEach(item => {
        const itemSpec = item.getAttribute('data-spec');
        if (itemSpec === (spec === null ? 'All' : spec)) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
    
    // Close dropdown
    specDropdown.classList.remove('show');
    
    // Reload hospitals with the new filter
    loadHospitalsNear(currentPosition[0], currentPosition[1]);
  }
  
  // Handle specialization icons scrolling
  function setupSpecializationScrolling() {
    if (specNavLeft && specNavRight) {
      specNavLeft.addEventListener('click', () => {
        specializationIcons.scrollBy({ left: -200, behavior: 'smooth' });
      });
      
      specNavRight.addEventListener('click', () => {
        specializationIcons.scrollBy({ left: 200, behavior: 'smooth' });
      });
    }
  }
  
  // Event Listeners
  
  // Search input
  searchInput.addEventListener('input', filterHospitals);
  
  // Booking form submission
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userName = document.getElementById('userName').value;
    const appointmentTime = document.getElementById('appointmentTime').value;
    const specialistType = document.getElementById('specialistType')?.value || 'General';
    
    // In a real application, you would send this data to your backend
    console.log('Booking submitted:', {
      hospital: selectedHospital.name,
      userName,
      appointmentTime,
      specialistType
    });
    
    // Close modal and show confirmation
    closeBookingModal();
    showToast(`Booking confirmed for ${userName} with ${specialistType} at ${selectedHospital.name}`);
  });
  
  // Close modal button
  closeModalBtn.addEventListener('click', closeBookingModal);
  
  // Close modal when clicking outside
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
      closeBookingModal();
    }
  });
  
  // Specialization dropdown toggle
  specDropdownBtn.addEventListener('click', toggleSpecDropdown);
  
  // Specialization buttons
  specButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const spec = btn.getAttribute('data-spec');
      selectSpecialization(spec);
    });
  });
  
  // Dropdown items
  dropdownItems.forEach(item => {
    item.addEventListener('click', () => {
      const spec = item.getAttribute('data-spec');
      selectSpecialization(spec);
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!specDropdownBtn.contains(e.target) && !specDropdown.contains(e.target)) {
      specDropdown.classList.remove('show');
    }
  });
  
  // Setup specialization scrolling
  setupSpecializationScrolling();
  
  // Initialize the map
  initMap();
});
