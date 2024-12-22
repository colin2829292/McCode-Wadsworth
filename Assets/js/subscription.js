// subscription.js

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://localhost:3000'; // For production, change this URL.

    // PayPal Plan IDs (replace with your actual Plan IDs from PayPal)
    const MONTHLY_PLAN_ID = 'P-XXXXXXX'; // Replace with your monthly plan ID
    const YEARLY_PLAN_ID = 'P-YYYYYYY';  // Replace with your yearly plan ID

    let paypalButtonsInstance = null;
    let chosenPlanId = null;

    // Utility Functions
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

    // Subscription functions
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

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function updateUIForLoggedInUser(email) {
        const loginWrapper = document.querySelector('.login-wrapper');
        if (loginWrapper) {
            loginWrapper.innerHTML = `
                <span>Welcome, ${email}!</span>
                <button id="manageAccountBtn" class="manage-account-button">Manage Account</button>
                <button id="logoutBtn" class="logout-button">Log out</button>
            `;
            document.getElementById('logoutBtn').addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('currentUser');
                loginWrapper.innerHTML = `<button id="loginBtn" class="login-button">Log in</button>`;
                const newLoginBtn = document.getElementById('loginBtn');
                const modal = document.getElementById('loginModal');
                if (newLoginBtn && modal) {
                    newLoginBtn.addEventListener('click', () => {
                        modal.style.display = 'block';
                    });
                }
            });

            document.getElementById('manageAccountBtn').addEventListener('click', () => {
                window.location.href = 'subscription-manage-account.html';
            });
        }
    }

    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUser) {
        updateUIForLoggedInUser(currentUser);
    }

    // Modal and forms logic (login/register)
    const showCreateFormButton = document.getElementById('showCreateForm');
    const showLoginFormButton = document.getElementById('showLoginForm');
    const loginForm = document.getElementById('loginForm');
    const createAccountForm = document.getElementById('createAccountForm');
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtn = loginModal ? loginModal.querySelector('.close') : null;

    if (showCreateFormButton && showLoginFormButton && loginForm && createAccountForm) {
        showCreateFormButton.addEventListener('click', () => {
            loginForm.style.display = 'none';
            createAccountForm.style.display = 'block';
        });

        showLoginFormButton.addEventListener('click', () => {
            createAccountForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    if (loginBtn && loginModal && closeBtn) {
        loginBtn.addEventListener('click', () => {
            loginModal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }

    const createAccountButton = document.querySelector('#createAccountForm button[type="submit"]');
    if (createAccountButton) {
        createAccountButton.addEventListener('click', async (event) => {
            event.preventDefault();
            const email = document.getElementById('newEmail').value.trim();
            const password = document.getElementById('newPassword').value;
            if (!email || !password) {
                alert('Please fill all fields.');
                return;
            }
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            const response = await registerUser(email, password);
            alert(response.message);
            if (response.status === 201) {
                createAccountForm.style.display = 'none';
                loginForm.style.display = 'block';
            }
        });
    }

    const loginButton = document.querySelector('#loginForm button[type="submit"]');
    if (loginButton) {
        loginButton.addEventListener('click', async (event) => {
            event.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            const response = await loginUser(email, password);
            alert(response.message);
            if (response.status === 200) {
                if (loginModal) loginModal.style.display = 'none';
                const stayLoggedIn = document.getElementById('stayLoggedIn')?.checked;
                if (stayLoggedIn) {
                    localStorage.setItem('currentUser', email);
                } else {
                    sessionStorage.setItem('currentUser', email);
                }
                updateUIForLoggedInUser(email);
            }
        });
    }

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
            const response = await resetPassword(email, newPassword);
            alert(response.message);
        });
    }

    // Manage-account page logic
    const manageAccountSection = document.querySelector('.account-section');

    // Subscription Modal functions
    window.showSubscriptionModal = function(message) {
        const modal = document.getElementById('subscriptionModal');
        const modalMessage = document.getElementById('subscriptionModalMessage');
        modalMessage.textContent = message;
        modal.style.display = 'block';
    };

    window.closeSubscriptionModal = function() {
        const modal = document.getElementById('subscriptionModal');
        modal.style.display = 'none';
    };

    // Render PayPal Buttons when a paid plan is selected
    function renderPayPalButtons() {
        const container = document.getElementById('paypal-button-container');
        if (paypalButtonsInstance) {
            paypalButtonsInstance.close();
        }

        paypalButtonsInstance = paypal.Buttons({
            style: {
                shape: 'pill',
                color: 'gold',
                layout: 'vertical',
                label: 'subscribe'
            },
            createSubscription: function(data, actions) {
                return actions.subscription.create({
                    'plan_id': chosenPlanId
                });
            },
            onApprove: async function(data, actions) {
                // Called after the subscription is created successfully
                const email = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
                if (!email) {
                    showSubscriptionModal("No user found. Please log in.");
                    return;
                }

                const now = new Date();
                const startDate = now.toISOString().split('T')[0];
                let nextBillingDate;
                if (chosenPlanId === MONTHLY_PLAN_ID) {
                    const next = new Date();
                    next.setMonth(next.getMonth() + 1);
                    nextBillingDate = next.toISOString().split('T')[0];
                } else {
                    const next = new Date();
                    next.setFullYear(next.getFullYear() + 1);
                    nextBillingDate = next.toISOString().split('T')[0];
                }

                let subscriptionData = await getSubscriptionByEmail(email);
                const autoRenewalChecked = document.getElementById('autoRenewalOn').checked;
                const chosenPlan = (chosenPlanId === MONTHLY_PLAN_ID) ? 'monthly' : 'yearly';

                const payload = {
                    email: email,
                    autoRenewal: autoRenewalChecked,
                    plan: chosenPlan,
                    isActive: true,
                    startDate: startDate,
                    nextBillingDate: nextBillingDate,
                    paypalSubscriptionId: data.subscriptionID
                };

                if (!subscriptionData) {
                    // Create new subscription
                    const created = await createSubscription(payload);
                    if (created) {
                        showSubscriptionModal("Your subscription has been upgraded successfully!");
                    } else {
                        showSubscriptionModal("Failed to create subscription. Please try again.");
                    }
                } else {
                    // Update existing subscription
                    const success = await updateSubscription(subscriptionData.id, payload);
                    if (success) {
                        showSubscriptionModal("Your subscription has been upgraded successfully!");
                    } else {
                        showSubscriptionModal("Failed to update subscription.");
                    }
                }
            },
            onError: function(err) {
                console.error(err);
                showSubscriptionModal("There was an error processing your subscription. Please try again.");
            }
        });

        paypalButtonsInstance.render('#paypal-button-container');
    }

    window.handleSubscriptionChange = function() {
        const planRadios = document.querySelectorAll('input[name="subscriptionPlan"]');
        let selectedPlan = 'free';
        planRadios.forEach(radio => {
            if (radio.checked) selectedPlan = radio.value;
        });

        const paypalContainer = document.getElementById('paypal-button-container');

        if (selectedPlan === 'monthly') {
            chosenPlanId = MONTHLY_PLAN_ID;
            paypalContainer.style.display = 'block';
            renderPayPalButtons();
        } else if (selectedPlan === 'yearly') {
            chosenPlanId = YEARLY_PLAN_ID;
            paypalContainer.style.display = 'block';
            renderPayPalButtons();
        } else {
            // Free plan selected: downgrade/cancel if necessary
            chosenPlanId = null;
            paypalContainer.style.display = 'none';
            downgradeToFreeSubscription();
        }
    };

    async function downgradeToFreeSubscription() {
        const confirmation = confirm('Are you sure you want to switch to the free subscription? This will cancel your paid plan.');
        if (!confirmation) return;

        const email = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (!email) {
            showSubscriptionModal("No user found. Please log in.");
            return;
        }

        const subscriptionData = await getSubscriptionByEmail(email);
        if (!subscriptionData || subscriptionData.plan === 'free') {
            showSubscriptionModal("You are already on the Free plan.");
            return;
        }

        const success = await updateSubscription(subscriptionData.id, {
            isActive: false,
            autoRenewal: false,
            plan: 'free',
            paypalSubscriptionId: '',
            nextBillingDate: ''
        });

        if (success) {
            showSubscriptionModal("Your subscription has been canceled and you've been moved to the Free plan.");
        } else {
            showSubscriptionModal("There was an error canceling your subscription. Please try again.");
        }
    }

    if (manageAccountSection) {
        const currentUserAccount = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (!currentUserAccount) {
            window.location.href = 'homepage.html';
        } else {
            // Display the user's email in a non-editable <span>
            const userEmailDisplay = document.getElementById('userEmailDisplay');
            if (userEmailDisplay) {
                userEmailDisplay.innerText = currentUserAccount;
            }

            window.changePassword = async function() {
                const currentPassword = document.getElementById('currentPassword')?.value.trim();
                const newPassword = document.getElementById('newPassword')?.value.trim();
                const confirmPassword = document.getElementById('confirmPassword')?.value.trim();

                if (!currentPassword || !newPassword || !confirmPassword) {
                    alert('Please fill in all password fields.');
                    return;
                }

                if (newPassword !== confirmPassword) {
                    alert('New passwords do not match.');
                    return;
                }

                const users = await getUserByEmailAndPassword(currentUserAccount, currentPassword);
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
                    alert('Password has been changed successfully!');
                } else {
                    alert('Error changing password.');
                }
            };

            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('currentUser');
                    sessionStorage.removeItem('currentUser');
                    window.location.href = 'homepage.html';
                });
            }
        }
    }
});

window.isUserSubscribed = async function() {
    const API_BASE = 'http://localhost:3000';
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!currentUser) return false;
    const res = await fetch(`${API_BASE}/subscriptions?email=${encodeURIComponent(currentUser)}`);
    const subs = await res.json();
    return subs.length > 0 && subs[0].isActive;
};
