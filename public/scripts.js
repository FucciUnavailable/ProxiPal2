// Smooth Scroll for Anchor Links
document.addEventListener('click', function (e) {
  if (e.target.matches('a[href^="#"]')) {
    e.preventDefault();
    document.querySelector(e.target.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  }
});

// Scroll-to-Top Button
let isScrolling = false;

window.addEventListener('scroll', () => {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      const scrollBtn = document.getElementById('scrollToTop');
      if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        scrollBtn.style.display = "block";
      } else {
        scrollBtn.style.display = "none";
      }
      isScrolling = false;
    });
    isScrolling = true;
  }
});

document.getElementById('scrollToTop').addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Counter Animation
const counters = document.querySelectorAll('.counter');

counters.forEach(counter => {
  const target = +counter.getAttribute('data-count');
  const speed = 200;

  const updateCount = () => {
    const count = +counter.innerText;
    const increment = target / speed;

    if (count < target) {
      counter.innerText = Math.ceil(count + increment);
      requestAnimationFrame(updateCount);
    } else {
      counter.innerText = target;
    }
  };

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        updateCount();
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 1 });

  counterObserver.observe(counter);
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

darkModeToggle.addEventListener('change', () => {
  body.classList.toggle('dark-mode');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');

  sunIcon.style.display = body.classList.contains('dark-mode') ? 'none' : 'block';
  moonIcon.style.display = body.classList.contains('dark-mode') ? 'block' : 'none';
});

// Newsletter Modal Functionality
setTimeout(() => {
  const newsletterModal = document.getElementById('newsletterModal');
  newsletterModal.classList.remove('hidden'); // Show the modal after 5 seconds
}, 5000);

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('newsletterModal').classList.add('hidden'); // Hide the modal
});

// Optional: Close modal when clicking outside of it
document.getElementById('newsletterModal').addEventListener('click', (e) => {
  if (e.target === newsletterModal) {
    newsletterModal.classList.add('hidden');
  }
});






    //slides

const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

const showSlide = (index) => {
  slides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (i === index) {
          slide.classList.add('active');
      }
  });
};

document.getElementById('nextBtn').addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
});

document.getElementById('prevBtn').addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
});

// Automatic slide change
setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}, 5000); // Change image every 5 seconds

// Sign-Up Modal functionality
document.querySelectorAll('#signUpNowBtn').forEach(btn => {
  btn.addEventListener('click', () => {
      document.getElementById('signUpModal').classList.remove('hidden');
  });
});

document.getElementById('closeSignUpModal').addEventListener('click', () => {
  document.getElementById('signUpModal').classList.add('hidden');
});