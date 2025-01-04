// subscription.js

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://localhost:3000'; // Points to your db.json
  
    // -------------
    // HELPER FUNCTIONS
    // -------------
    function isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
  
    async function getUserByEmailAndPassword(email, password) {
      const res = await fetch(`${API_BASE}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      return await res.json();
    }
  
    async function getUserByEmail(email) {
      const res = await fetch(`${API_BASE}/users?email=${encodeURIComponent(email)}`);
      return await res.json();
    }
  
    async function registerUser(email, password) {
      const existing = await getUserByEmail(email);
      if (existing.length > 0) {
        return { status: 409, message: "Email already exists." };
      }
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) return { status: 201, message: "Account created successfully!" };
      return { status: 400, message: "Error creating account." };
    }
  
    async function resetPassword(email, newPassword) {
      const userArr = await getUserByEmail(email);
      if (userArr.length === 0) return { status: 404, message: "Email not found." };
      const user = userArr[0];
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) return { status: 200, message: "Password reset successfully!" };
      return { status: 400, message: "Error resetting password." };
    }
  
    async function loginUser(email, password) {
      const users = await getUserByEmailAndPassword(email, password);
      if (users.length > 0) {
        return { status: 200, message: `Welcome, ${email}!`, user: users[0] };
      }
      return { status: 401, message: "Invalid credentials." };
    }
  
    // Subscription management (reading/writing to db.json)
    async function getSubscriptionByEmail(email) {
      const res = await fetch(`${API_BASE}/subscriptions?email=${encodeURIComponent(email)}`);
      const subs = await res.json();
      return subs.length > 0 ? subs[0] : null;
    }
  
    async function createSubscription(data) {
      const res = await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok ? await res.json() : null;
    }
  
    async function updateSubscription(subscriptionId, data) {
      const res = await fetch(`${API_BASE}/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    }
  
    // -------------
    // DOM ELEMENTS
    //-------------
    // Top info table
    const loggedInAsValue       = document.getElementById('loggedInAsValue');
    const topSubscriptionStatus = document.getElementById('topSubscriptionStatus');
    const topAutoRenewalStatus  = document.getElementById('topAutoRenewalStatus');
    const topMessage            = document.getElementById('topMessage');
  
    // Login
    const loginRowTitle    = document.getElementById('loginRowTitle');
    const loginRowEmail    = document.getElementById('loginRowEmail');
    const loginRowPassword = document.getElementById('loginRowPassword');
    const loginRowOptions  = document.getElementById('loginRowOptions');
    const loginRowButtons  = document.getElementById('loginRowButtons');
  
    // Create account
    const createAccountRowTitle    = document.getElementById('createAccountRowTitle');
    const createAccountRowEmail    = document.getElementById('createAccountRowEmail');
    const createAccountRowPassword = document.getElementById('createAccountRowPassword');
    const createAccountRowButtons  = document.getElementById('createAccountRowButtons');
  
    // Subscription plan
    const subscriptionPlanRow    = document.getElementById('subscriptionPlanRow');
    const autoRenewalRow        = document.getElementById('autoRenewalRow');
    const subscriptionUpdateRow  = document.getElementById('subscriptionUpdateRow');
  
    // Password change
    const changePasswordTitleRow = document.getElementById('changePasswordTitleRow');
    const currentPasswordRow     = document.getElementById('currentPasswordRow');
    const newPasswordRow         = document.getElementById('newPasswordRow');
    const confirmPasswordRow     = document.getElementById('confirmPasswordRow');
    const changePasswordBtnRow   = document.getElementById('changePasswordBtnRow');
  
    // Logout
    const logoutRow = document.getElementById('logoutRow');
  
    // Form inputs
    const loginEmailInput   = document.getElementById('loginEmail');
    const loginPassInput    = document.getElementById('loginPassword');
    const stayLoggedInInput = document.getElementById('stayLoggedIn');
  
    const newEmailInput  = document.getElementById('newEmail');
    const newPassInput   = document.getElementById('newPassword');
  
    const currentPasswordInput  = document.getElementById('currentPassword');
    const userNewPasswordInput  = document.getElementById('userNewPassword');
    const confirmPasswordInput  = document.getElementById('confirmPassword');
  
    // Buttons
    const loginBtnTable          = document.getElementById('loginBtnTable');
    const showCreateAccountRowBtn= document.getElementById('showCreateAccountRowBtn');
    const createAccountBtn       = document.getElementById('createAccountBtn');
    const backToLoginBtn         = document.getElementById('backToLoginBtn');
    const logoutBtn              = document.getElementById('logoutBtn');
  
    // -------------
    // SHOW / HIDE ROWS
    // -------------
    function showLoginRows(show) {
      const displayVal = show ? 'table-row' : 'none';
      loginRowTitle.style.display    = displayVal;
      loginRowEmail.style.display    = displayVal;
      loginRowPassword.style.display = displayVal;
      loginRowOptions.style.display  = displayVal;
      loginRowButtons.style.display  = displayVal;
    }
  
    function showCreateAccountRows(show) {
      const displayVal = show ? 'table-row' : 'none';
      createAccountRowTitle.style.display    = displayVal;
      createAccountRowEmail.style.display    = displayVal;
      createAccountRowPassword.style.display = displayVal;
      createAccountRowButtons.style.display  = displayVal;
    }
  
    function showSubscriptionRows(show) {
      const displayVal = show ? 'table-row' : 'none';
      subscriptionPlanRow.style.display   = displayVal;
      autoRenewalRow.style.display        = displayVal;
      subscriptionUpdateRow.style.display = displayVal;
    }
  
    function showChangePasswordRows(show) {
      const displayVal = show ? 'table-row' : 'none';
      changePasswordTitleRow.style.display = displayVal;
      currentPasswordRow.style.display     = displayVal;
      newPasswordRow.style.display         = displayVal;
      confirmPasswordRow.style.display     = displayVal;
      changePasswordBtnRow.style.display   = displayVal;
    }
  
    function showLogoutRow(show) {
      logoutRow.style.display = show ? 'table-row' : 'none';
    }
  
    // -------------
    // POPULATE BOTTOM TABLE (RADIO BUTTONS)
    // -------------
    function populateSubscriptionForm(sub) {
      // If no subscription or free => check "free"
      if (!sub || sub.plan === 'free') {
        document.querySelector('input[name="subscriptionPlan"][value="free"]').checked = true;
      } else if (sub.plan === 'monthly') {
        document.getElementById('monthlyPlan').checked = true;
      } else if (sub.plan === 'yearly') {
        document.getElementById('yearlyPlan').checked = true;
      }
  
      // Auto-renew
      if (sub && sub.autoRenewal) {
        document.getElementById('autoRenewalOn').checked = true;
      } else {
        document.getElementById('autoRenewalOff').checked = true;
      }
    }
  
    // -------------
    // UPDATE TOP TABLE
    // -------------
    async function updateTopTable() {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
  
      if (!currentUser) {
        // Not logged in
        loggedInAsValue.textContent       = "Not Logged In";
        topSubscriptionStatus.textContent = "N/A";
        topSubscriptionStatus.classList.remove("status-red");
        topAutoRenewalStatus.textContent  = "N/A";
        topMessage.textContent            = "Log in or create an account to manage your subscription.";
        return;
      }
  
      // Logged in
      loggedInAsValue.textContent = currentUser;
  
      // Fetch subscription from db.json
      const sub = await getSubscriptionByEmail(currentUser);
  
      // Force subscription status to always be red
      topSubscriptionStatus.classList.add("status-red");
  
      if (!sub || !sub.isActive) {
        // Free plan
        topSubscriptionStatus.textContent = "Free Plan (Default)";
        topAutoRenewalStatus.textContent  = "Auto-Renewal is Off";
        topMessage.textContent            = "You are on the Free Plan. Choose a Monthly or Yearly plan to unlock premium features.";
      } else {
        // Active plan
        const { plan, autoRenewal, nextBillingDate } = sub;
  
        if (plan === "monthly") {
          topSubscriptionStatus.textContent = "Monthly Plan";
        } else if (plan === "yearly") {
          topSubscriptionStatus.textContent = "Yearly Plan";
        } else {
          topSubscriptionStatus.textContent = "Free Plan (Default)";
        }
  
        topAutoRenewalStatus.textContent = autoRenewal
          ? "Auto-Renewal is On"
          : "Auto-Renewal is Off";
  
        let msg = "You have an active subscription.";
        if (plan === "monthly" || plan === "yearly") {
          if (nextBillingDate) {
            msg += ` Next billing date: ${nextBillingDate}.`;
          } else {
            msg += " Thanks for subscribing!";
          }
        }
        topMessage.textContent = msg;
      }
  
      // Update bottom table radio buttons
      populateSubscriptionForm(sub);
    }
  
    // -------------
    // INITIAL STATE
    // -------------
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUser) {
      showLoginRows(false);
      showCreateAccountRows(false);
      showSubscriptionRows(true);
      showChangePasswordRows(true);
      showLogoutRow(true);
    } else {
      showLoginRows(true);
      showCreateAccountRows(false);
      showSubscriptionRows(false);
      showChangePasswordRows(false);
      showLogoutRow(false);
    }
    updateTopTable();
  
    // -------------
    // BUTTON HANDLERS
    // -------------
  
    // Switch from "Log in" form to "Create Account"
    if (showCreateAccountRowBtn) {
      showCreateAccountRowBtn.addEventListener('click', () => {
        showLoginRows(false);
        showCreateAccountRows(true);
      });
    }
  
    // Switch back to Login
    if (backToLoginBtn) {
      backToLoginBtn.addEventListener('click', () => {
        showCreateAccountRows(false);
        showLoginRows(true);
      });
    }
  
    // Create Account
    if (createAccountBtn) {
      createAccountBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        const email = newEmailInput.value.trim();
        const password = newPassInput.value.trim();
        if (!email || !password) {
          alert('Please fill all fields.');
          return;
        }
        if (!isValidEmail(email)) {
          alert('Please enter a valid email address.');
          return;
        }
        const result = await registerUser(email, password);
        alert(result.message);
        if (result.status === 201) {
          showCreateAccountRows(false);
          showLoginRows(true);
        }
      });
    }
  
    // Log in
    if (loginBtnTable) {
      loginBtnTable.addEventListener('click', async (event) => {
        event.preventDefault();
        const email = loginEmailInput.value.trim();
        const password = loginPassInput.value.trim();
        if (!email || !password) {
          alert('Please enter email and password.');
          return;
        }
        const response = await loginUser(email, password);
        alert(response.message);
        if (response.status === 200) {
          if (stayLoggedInInput.checked) {
            localStorage.setItem('currentUser', email);
          } else {
            sessionStorage.setItem('currentUser', email);
          }
          showLoginRows(false);
          showSubscriptionRows(true);
          showChangePasswordRows(true);
          showLogoutRow(true);
          updateTopTable();
        }
      });
    }
  
    // Reset Password link
    const resetPasswordLink = document.getElementById('resetPassword');
    if (resetPasswordLink) {
      resetPasswordLink.addEventListener('click', async (event) => {
        event.preventDefault();
        const email = prompt('Enter your email:');
        if (!email) {
          alert('Email is required.');
          return;
        }
        const newPassword = prompt('Enter new password:');
        if (!newPassword) {
          alert('Password cannot be empty.');
          return;
        }
        const resp = await resetPassword(email, newPassword);
        alert(resp.message);
      });
    }
  
    // Log out
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        updateTopTable();
        window.location.href = 'homepage.html';
      });
    }
  
    // -------------
    // "Update Subscription" Button
    // -------------
    window.handleSubscriptionChange = async function() {
      const planRadios = document.querySelectorAll('input[name="subscriptionPlan"]');
      let selectedPlan = 'free';
      planRadios.forEach(radio => {
        if (radio.checked) selectedPlan = radio.value;
      });
  
      const autoRenew = document.getElementById('autoRenewalOn').checked;
  
      const email = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!email) {
        alert('No user found. Please log in first.');
        return;
      }
  
      // Check existing sub in db.json
      const subscriptionData = await getSubscriptionByEmail(email);
      const now = new Date();
      const startDate = now.toISOString().split('T')[0];
  
      // Next billing date
      let nextBillingDate = '';
      if (selectedPlan === 'monthly') {
        const next = new Date();
        next.setMonth(next.getMonth() + 1);
        nextBillingDate = next.toISOString().split('T')[0];
      } else if (selectedPlan === 'yearly') {
        const next = new Date();
        next.setFullYear(next.getFullYear() + 1);
        nextBillingDate = next.toISOString().split('T')[0];
      }
  
      const payload = {
        email,
        autoRenewal: autoRenew,
        plan: selectedPlan,
        isActive: (selectedPlan !== 'free'),
        startDate: (selectedPlan === 'free') ? '' : startDate,
        nextBillingDate: (selectedPlan === 'free') ? '' : nextBillingDate
      };
  
      // Create or update in db.json
      if (!subscriptionData) {
        const created = await createSubscription(payload);
        if (created) {
          alert('Subscription created successfully!');
        } else {
          alert('Failed to create subscription.');
        }
      } else {
        const success = await updateSubscription(subscriptionData.id, payload);
        if (success) {
          alert('Subscription updated successfully!');
        } else {
          alert('Failed to update subscription.');
        }
      }
      updateTopTable();
    };
  
    // -------------
    // Optional: specifically downgrade to free
    // -------------
    async function downgradeToFreeSubscription() {
      const confirmation = confirm('Are you sure you want to switch to the free subscription?');
      if (!confirmation) return;
  
      const email = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!email) {
        alert('No user found. Please log in.');
        return;
      }
  
      const subscriptionData = await getSubscriptionByEmail(email);
      if (!subscriptionData || subscriptionData.plan === 'free') {
        alert('You are already on the Free plan.');
        return;
      }
  
      const success = await updateSubscription(subscriptionData.id, {
        isActive: false,
        autoRenewal: false,
        plan: 'free',
        nextBillingDate: ''
      });
  
      if (success) {
        alert('You have been moved to the Free plan.');
        updateTopTable();
      } else {
        alert('Error canceling your subscription. Please try again.');
      }
    }
  
    // -------------
    // CHANGE PASSWORD
    // -------------
    window.changePassword = async function() {
      const currentPassword = currentPasswordInput.value.trim();
      const newPassword     = userNewPasswordInput.value.trim();
      const confirmPassword = confirmPasswordInput.value.trim();
  
      if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all password fields.');
        return;
      }
      if (newPassword !== confirmPassword) {
        alert('New passwords do not match.');
        return;
      }
  
      const email = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!email) {
        alert('No user is logged in.');
        return;
      }
      const users = await getUserByEmailAndPassword(email, currentPassword);
      if (users.length === 0) {
        alert('Current password is incorrect.');
        return;
      }
  
      const user = users[0];
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) {
        alert('Password changed successfully!');
      } else {
        alert('Error changing password.');
      }
    };
  });
  
  // If other pages need to check if user is subscribed
  window.isUserSubscribed = async function() {
    const API_BASE = 'http://localhost:3000';
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!currentUser) return false;
    const res = await fetch(`${API_BASE}/subscriptions?email=${encodeURIComponent(currentUser)}`);
    const subs = await res.json();
    return subs.length > 0 && subs[0].isActive;
  };
  