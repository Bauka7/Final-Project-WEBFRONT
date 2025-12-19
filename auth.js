// auth.js - Authentication functionality

$(document).ready(function() {
  'use strict';

  // Local Storage keys
  const LS = {
    USERS: "readowl.users",
    CURRENT_USER: "readowl.currentUser",
    REMEMBER_ME: "readowl.rememberMe"
  };

  // Demo users (will be replaced by localStorage data)
  const demoUsers = [
    {
      id: "user-1",
      email: "user@readowl.com",
      password: "password123",
      firstName: "Stephan",
      lastName: "Reader",
      avatar: "S",
      createdAt: new Date().toISOString(),
      library: {
        totalBooks: 15,
        readingNow: 3,
        finished: 6,
        dayStreak: 12
      }
    },
    {
      id: "user-2",
      email: "admin@readowl.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      avatar: "A",
      createdAt: new Date().toISOString(),
      isAdmin: true,
      library: {
        totalBooks: 42,
        readingNow: 5,
        finished: 37,
        dayStreak: 30
      }
    }
  ];

  // Initialize users in localStorage
  function initUsers() {
    const existingUsers = getLocalStorage(LS.USERS, []);
    if (existingUsers.length === 0) {
      setLocalStorage(LS.USERS, demoUsers);
    }
    return getLocalStorage(LS.USERS, []);
  }

  // Local Storage helpers
  function getLocalStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  function setLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  }

  // Show error message
  function showError(elementId, message) {
    const $element = $(`#${elementId}`);
    $element.text(message).addClass('show');
    $(`#${elementId.split('Error')[0]}`).addClass('error');
    return false;
  }

  // Hide error message
  function hideError(elementId) {
    const $element = $(`#${elementId}`);
    $element.text('').removeClass('show');
    $(`#${elementId.split('Error')[0]}`).removeClass('error');
    return true;
  }

  // Validate email
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Check password strength
  function checkPasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const passed = Object.values(checks).filter(Boolean).length;
    let strength = 'weak';
    
    if (passed === 5) strength = 'very-strong';
    else if (passed >= 4) strength = 'strong';
    else if (passed >= 3) strength = 'good';
    else if (passed >= 2) strength = 'fair';

    // Update UI
    $('.strength-bar').attr('class', `strength-bar ${strength}`);
    $('.strength-text span').text(strength.charAt(0).toUpperCase() + strength.slice(1));

    // Update requirements list
    $('.req-length').toggleClass('valid', checks.length);
    $('.req-uppercase').toggleClass('valid', checks.uppercase);
    $('.req-lowercase').toggleClass('valid', checks.lowercase);
    $('.req-number').toggleClass('valid', checks.number);
    $('.req-special').toggleClass('valid', checks.special);

    return { strength, checks };
  }

  // Toggle password visibility
  function initPasswordToggle() {
    $('.toggle-password').on('click', function() {
      const $button = $(this);
      const $input = $button.closest('.password-input').find('input');
      const isPassword = $input.attr('type') === 'password';
      
      $input.attr('type', isPassword ? 'text' : 'password');
      $button.text(isPassword ? '🙈' : '👁️');
      $button.attr('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  }

  // Show success message
  function showSuccessMessage(message) {
    const $success = $(`
      <div class="success-message">
        <span>✅</span>
        <span>${message}</span>
      </div>
    `);
    
    $('body').append($success);
    
    setTimeout(() => {
      $success.addClass('hide');
      setTimeout(() => $success.remove(), 300);
    }, 3000);
  }

  // Handle login form
  function initLoginForm() {
    if (!$('#loginForm').length) return;

    const $form = $('#loginForm');
    const users = initUsers();

    // Check remember me
    const rememberMe = getLocalStorage(LS.REMEMBER_ME, {});
    if (rememberMe.email) {
      $('#loginEmail').val(rememberMe.email);
      $('#rememberMe').prop('checked', true);
    }

    $form.on('submit', function(e) {
      e.preventDefault();
      
      const email = $('#loginEmail').val().trim();
      const password = $('#loginPassword').val();
      const remember = $('#rememberMe').is(':checked');

      // Reset errors
      hideError('emailError');
      hideError('passwordError');

      // Validate
      let isValid = true;

      if (!email) {
        showError('emailError', 'Email is required');
        isValid = false;
      } else if (!validateEmail(email)) {
        showError('emailError', 'Please enter a valid email');
        isValid = false;
      }

      if (!password) {
        showError('passwordError', 'Password is required');
        isValid = false;
      }

      if (!isValid) return;

      // Find user
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        showError('passwordError', 'Invalid email or password');
        return;
      }

      // Save remember me
      if (remember) {
        setLocalStorage(LS.REMEMBER_ME, { email: user.email });
      } else {
        localStorage.removeItem(LS.REMEMBER_ME);
      }

      // Set current user
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isAdmin: user.isAdmin || false
      };
      
      setLocalStorage(LS.CURRENT_USER, userData);
      
      // Show success and redirect
      showSuccessMessage('Login successful! Redirecting...');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    });
  }

  // Handle registration form
  function initRegisterForm() {
    if (!$('#registerForm').length) return;

    const $form = $('#registerForm');
    let users = initUsers();

    // Password strength check
    $('#registerPassword').on('input', function() {
      checkPasswordStrength($(this).val());
    });

    $form.on('submit', function(e) {
      e.preventDefault();
      
      const firstName = $('#firstName').val().trim();
      const lastName = $('#lastName').val().trim();
      const email = $('#registerEmail').val().trim();
      const password = $('#registerPassword').val();
      const confirmPassword = $('#confirmPassword').val();
      const agreeTerms = $('#termsAgreement').is(':checked');
      const newsletter = $('#newsletter').is(':checked');

      // Reset errors
      hideError('firstNameError');
      hideError('lastNameError');
      hideError('registerEmailError');
      hideError('confirmPasswordError');

      // Validate
      let isValid = true;

      if (!firstName) {
        showError('firstNameError', 'First name is required');
        isValid = false;
      }

      if (!lastName) {
        showError('lastNameError', 'Last name is required');
        isValid = false;
      }

      if (!email) {
        showError('registerEmailError', 'Email is required');
        isValid = false;
      } else if (!validateEmail(email)) {
        showError('registerEmailError', 'Please enter a valid email');
        isValid = false;
      } else if (users.some(u => u.email === email)) {
        showError('registerEmailError', 'Email already registered');
        isValid = false;
      }

      if (!password) {
        showError('passwordError', 'Password is required');
        isValid = false;
      } else {
        const strength = checkPasswordStrength(password);
        if (strength.strength === 'weak' || strength.strength === 'fair') {
          showError('passwordError', 'Please choose a stronger password');
          isValid = false;
        }
      }

      if (!confirmPassword) {
        showError('confirmPasswordError', 'Please confirm your password');
        isValid = false;
      } else if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
      }

      if (!agreeTerms) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        isValid = false;
      }

      if (!isValid) return;

      // Create new user
      const newUser = {
        id: 'user-' + Date.now(),
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        avatar: firstName.charAt(0).toUpperCase(),
        createdAt: new Date().toISOString(),
        newsletter: newsletter,
        library: {
          totalBooks: 0,
          readingNow: 0,
          finished: 0,
          dayStreak: 0
        }
      };

      // Add to users
      users.push(newUser);
      setLocalStorage(LS.USERS, users);

      // Auto login
      const userData = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        avatar: newUser.avatar
      };
      
      setLocalStorage(LS.CURRENT_USER, userData);
      
      // Show success and redirect
      showSuccessMessage('Account created successfully! Redirecting...');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    });
  }

  // Social login simulation
  function initSocialAuth() {
    $('.google-btn').on('click', function() {
      // Simulate social login
      const demoUser = demoUsers[0];
      const userData = {
        id: demoUser.id,
        email: demoUser.email,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        avatar: demoUser.avatar
      };
      
      setLocalStorage(LS.CURRENT_USER, userData);
      
      showSuccessMessage('Signed in with Google! Redirecting...');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    });
  }

  // Initialize
  initPasswordToggle();
  initLoginForm();
  initRegisterForm();
  initSocialAuth();
});