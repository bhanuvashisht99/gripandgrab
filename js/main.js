const API_BASE_URL = 'http://localhost:3000'; // Replace with your actual backend URL

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});


// studio section



document.addEventListener("DOMContentLoaded", function() {
    const imageGroups = document.querySelectorAll('.image-group');
    const nextButton = document.querySelector('.next');
    const prevButton = document.querySelector('.prev');
    let currentIndex = 0;

    // Function to change the active image group
    function showImages(index) {
        // Fade out the current images
        imageGroups.forEach((group) => {
            if (group.classList.contains('active')) {
                group.style.opacity = '0'; // Fade out
                setTimeout(() => {
                    group.classList.remove('active'); // Remove active class after fade out
                }, 500); // Match this duration to the CSS transition
            }
        });

        // Fade in the new images
        setTimeout(() => {
            imageGroups.forEach((group, i) => {
                if (i === index || i === index + 1) {
                    group.classList.add('active');
                    group.style.opacity = '1'; // Fade in
                }
            });
        }, 500); // Wait for the fade out to finish before showing new images
    }

    // Show the first two image groups initially
    showImages(currentIndex);

    // Next button click event
    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 2) % imageGroups.length; // Cycle through image groups
        showImages(currentIndex);
    });

    // Prev button click event
    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 2 + imageGroups.length) % imageGroups.length; // Cycle backward through image groups
        showImages(currentIndex);
    });
});







 
// Intersection Observer for fade-in animations
const faders = document.querySelectorAll('.fade-in');
const appearOptions = {
    threshold: 0.5,
    rootMargin: "0px 0px -100px 0px"
};

const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('appear');
            appearOnScroll.unobserve(entry.target);
        }
    });
}, appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});

// Responsive navbar
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
    navToggle.classList.toggle('toggle');
});
// Lazy loading for images
document.addEventListener("DOMContentLoaded", function() {
    var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

    if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove("lazy");
                    lazyImage.classList.add("loaded");
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });

        lazyImages.forEach(function(lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    }
});

  
  
  // FAQ Functionality
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        faqItem.classList.toggle('active');
        question.classList.toggle('active');
        
        // Close other open FAQ items
        document.querySelectorAll('.faq-item.active').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
                item.querySelector('.faq-question').classList.remove('active');
            }
        });
    });
});


// Studio Slider Functionality


document.addEventListener('DOMContentLoaded', function() {
    const studioHalves = document.querySelectorAll('.studio-half');

    studioHalves.forEach(half => {
        const slider = half.querySelector('.studio-slider');
        const slides = slider.querySelectorAll('img, video');
        const prevBtn = slider.querySelector('.prev');
        const nextBtn = slider.querySelector('.next');
        const dotsContainer = slider.querySelector('.slider-dots');
        let currentIndex = 0;

        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        function goToSlide(index) {
            slides[currentIndex].classList.remove('active');
            if (slides[currentIndex].tagName === 'VIDEO') {
                slides[currentIndex].pause();
            }
            dotsContainer.children[currentIndex].classList.remove('active');
            currentIndex = index;
            slides[currentIndex].classList.add('active');
            if (slides[currentIndex].tagName === 'VIDEO') {
                slides[currentIndex].currentTime = 0;
                slides[currentIndex].play();
            }
            dotsContainer.children[currentIndex].classList.add('active');
        }

        prevBtn.addEventListener('click', () => {
            goToSlide((currentIndex - 1 + slides.length) % slides.length);
        });

        nextBtn.addEventListener('click', () => {
            goToSlide((currentIndex + 1) % slides.length);
        });

        // Optional: Auto-slide functionality
        // setInterval(() => {
        //     goToSlide((currentIndex + 1) % slides.length);
        // }, 5000); // Change slide every 5 seconds
    });
});



//Booking Form

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    const centerButtons = document.querySelectorAll('.center-button');
    const businessHoursDisplay = document.getElementById('business-hours-display');
    const showCalendarBtn = document.getElementById('show-calendar');
    const bookSessionBtn = document.getElementById('book-session');
    const calendarContainer = document.getElementById('calendar-container');
    const modal = document.getElementById('booking-modal');
    const closeModal = document.querySelector('.close-modal');
    const bookingForm = document.getElementById('booking-form');
    let selectedLocation, selectedDate, selectedTime;
    let calendar;

    console.log('Show Calendar Button:', showCalendarBtn);
    console.log('Calendar Container:', calendarContainer);
    console.log('Book Session Button:', bookSessionBtn);

    const centerHours = {
        'lajpat-nagar': {
            weekdays: [
                { start: '07:00', end: '12:30' },
                { start: '16:00', end: '21:30' }
            ],
            saturday: [
                { start: '07:00', end: '12:30' },
                { start: '16:00', end: '21:30' }
            ]
        },
        'saket': {
            weekdays: [
                { start: '07:30', end: '10:00' },
                { start: '17:30', end: '21:00' }
            ],
            saturday: [
                { start: '07:30', end: '10:00' }
            ]
        }
    };

    const weekendNote = 'Weekend timings may vary as informed in the group.';

  // Center selection
  centerButtons.forEach(button => {
    button.addEventListener('click', function() {
        console.log('Center button clicked:', this.dataset.center);
        centerButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        selectedLocation = this.dataset.center;
        showCalendarBtn.style.display = 'inline-block';
        calendarContainer.style.display = 'none';
        bookSessionBtn.style.display = 'none';
        updateBusinessHoursDisplay(selectedLocation);
    });
});


    function updateBusinessHoursDisplay(center) {
        if (!centerHours[center]) {
            businessHoursDisplay.innerHTML = '<p>No business hours available for this center.</p>';
            return;
        }

        let hoursHtml = `<h3>${center.charAt(0).toUpperCase() + center.slice(1)} Center Hours:</h3>`;
        hoursHtml += '<table><tr><th>Day</th><th>Morning</th><th>Evening</th></tr>';

        // Weekdays
        let weekdayHours = centerHours[center].weekdays;
        hoursHtml += `<tr><td>Mon-Fri</td><td>${weekdayHours[0].start} - ${weekdayHours[0].end}</td><td>${weekdayHours[1] ? weekdayHours[1].start + ' - ' + weekdayHours[1].end : 'Closed'}</td></tr>`;

        // Saturday
        let saturdayHours = centerHours[center].saturday;
        hoursHtml += `<tr><td>Saturday</td><td>${saturdayHours[0].start} - ${saturdayHours[0].end}</td><td>${saturdayHours[1] ? saturdayHours[1].start + ' - ' + saturdayHours[1].end : 'Closed'}</td></tr>`;

        // Sunday
        hoursHtml += '<tr><td>Sunday</td><td colspan="2">Closed</td></tr>';

        hoursHtml += '</table>';
        hoursHtml += `<p class="weekend-note"><em>Note: ${weekendNote}</em></p>`;

        businessHoursDisplay.innerHTML = hoursHtml;
    }

    // Show calendar button click event
    showCalendarBtn.addEventListener('click', function(e) {
        console.log('Show Calendar button clicked');
        e.preventDefault();
        calendarContainer.style.display = 'block';
        this.style.display = 'none';
        bookSessionBtn.style.display = 'inline-block';
        initializeCalendar(selectedLocation);
    });

    function initializeCalendar(center) {
        console.log('Initializing calendar for center:', center);
        if (calendar) {
            calendar.destroy();
        }
    
        calendar = new FullCalendar.Calendar(calendarContainer, {
            initialView: 'timeGridWeek',
            slotDuration: '00:30:00',
            slotMinTime: '07:00:00',
            slotMaxTime: '22:00:00',
            allDaySlot: false,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridWeek,timeGridDay'
            },
            businessHours: getBusinessHours(center),
            selectable: true,
            selectConstraint: 'businessHours',
            selectAllow: function(selectInfo) {
                return selectInfo.start >= new Date() && selectInfo.start.getDay() !== 0;
            },
            validRange: {
                start: new Date()
            },
            height: 500, // Fixed height for the calendar
            scrollTime: '07:00:00', // Scroll to 7 AM by default
            select: function(info) {
                selectedDate = info.startStr.split('T')[0];
                selectedTime = info.startStr.split('T')[1].substring(0, 5);
                console.log('Date and time selected:', selectedDate, selectedTime);
                updateBookButtonState();
            },
            unselect: function() {
                console.log('Unselect event triggered');
                updateBookButtonState();
            }
        });
        calendar.render();
        console.log('Calendar rendered');
        updateBookButtonState();
    }

    function getBusinessHours(center) {
        if (!centerHours[center]) {
            console.error('Unknown center:', center);
            return [];
        }

        let hours = [];

        if (centerHours[center].weekdays) {
            hours = centerHours[center].weekdays.map(slot => ({
                daysOfWeek: [1, 2, 3, 4, 5],
                startTime: slot.start,
                endTime: slot.end
            }));
        }

        if (centerHours[center].saturday) {
            centerHours[center].saturday.forEach(slot => {
                hours.push({
                    daysOfWeek: [6],
                    startTime: slot.start,
                    endTime: slot.end
                });
            });
        }

        return hours;
    }
    function updateBookButtonState() {
        console.log('Updating book button state. Selected date:', selectedDate, 'Selected time:', selectedTime);
        if (selectedDate && selectedTime) {
            bookSessionBtn.disabled = false;
            bookSessionBtn.textContent = `Book Session for ${selectedDate} at ${selectedTime}`;
        } else {
            bookSessionBtn.disabled = true;
            bookSessionBtn.textContent = 'Select a date and time to book';
        }
        console.log('Book button state updated:', bookSessionBtn.disabled ? 'disabled' : 'enabled');
    }

    // Book session button click event
    bookSessionBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Book Session button clicked. Selected date:', selectedDate, 'Selected time:', selectedTime);
        if (selectedDate && selectedTime) {
            openBookingModal();
        } else {
            alert('Please select a date and time before booking.');
            console.log('Booking attempted without date/time selection');
        }
    });
    function openBookingModal() {
        modal.style.display = 'block';
        document.getElementById('preferredDateHidden').value = selectedDate;
        document.getElementById('preferredTimeHidden').value = selectedTime;
        document.getElementById('locationHidden').value = selectedLocation;
        console.log('Booking modal opened with date:', selectedDate, 'time:', selectedTime, 'location:', selectedLocation);
    }
    

 // Close modal event
 closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
});

// Handle form submission
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(bookingForm);
    const bookingData = Object.fromEntries(formData);

    console.log('Booking Data:', bookingData);

    fetch(`${API_BASE_URL}/api/book-session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || response.statusText);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Response Data:', data);
        modal.style.display = 'none';
        alert('Booking submitted successfully!');
        bookingForm.reset();
    })
    .catch(error => {
        console.error('Error submitting booking:', error);
        alert('Error submitting booking: ' + error.message);
    });
});

});


///////////
// Form validation for the contact form
 
document.getElementById('contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        alert('Thank you for your message. We\'ll get back to you shortly!');
        this.reset();
      } catch (error) {
        console.error('Error:', error);
        alert('There was an error submitting your message. Please try again.');
      }
});



function validateContactForm(name, email, message) {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
        return false;
    }
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    return true;
}







app.post('/api/book-session', async (req, res) => {
    try {
      const bookingData = req.body;
      console.log('Received booking:', bookingData);
      
      console.log('Sending WhatsApp confirmation...');
      await sendWhatsAppConfirmation(bookingData);
      console.log('WhatsApp confirmation sent successfully');
      
      res.json({ message: 'Booking successful and WhatsApp sent' });
    } catch (error) {
      console.error('Booking or WhatsApp error:', error);
      res.status(500).json({ message: 'Error processing booking or sending WhatsApp' });
    }
  });





  document.addEventListener('DOMContentLoaded', () => {
    // Reset scroll position to the top on page load
    window.scrollTo(0, 0);
});