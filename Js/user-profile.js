document.addEventListener('DOMContentLoaded', () => {
    const userProfileIcon = document.getElementById('user-profile-icon');
    const userProfileModal = document.getElementById('user-profile-modal');
    const closeProfileBtn = document.getElementById('close-profile-btn');
    const userProfileForm = document.getElementById('user-profile-form');
    const fullNameInput = document.getElementById('full-name');
    const shippingAddressInput = document.getElementById('shipping-address');
    const homeDeliveryToggle = document.getElementById('home-delivery');
    const deliveryCostMessage = document.getElementById('delivery-cost-message');

    // Function to update the visibility of the delivery cost message
    function updateDeliveryCostMessageVisibility() {
        if (homeDeliveryToggle.checked) {
            deliveryCostMessage.style.display = 'flex'; // Show the message
        } else {
            deliveryCostMessage.style.display = 'none'; // Hide the message
        }
    }

    // Add event listener to the home delivery toggle
    homeDeliveryToggle.addEventListener('change', updateDeliveryCostMessageVisibility);

    // Function to open the user profile modal
    userProfileIcon.addEventListener('click', () => {
        userProfileModal.classList.add('open');
        loadUserProfile(); // Load data when modal opens
        updateDeliveryCostMessageVisibility(); // Update message visibility when modal opens
    });

    // Function to close the user profile modal
    closeProfileBtn.addEventListener('click', () => {
        userProfileModal.classList.remove('open');
    });

    // Close modal when clicking outside the content
    userProfileModal.addEventListener('click', (e) => {
        if (e.target === userProfileModal) {
            userProfileModal.classList.remove('open');
        }
    });

    // Function to save user profile to local storage
    userProfileForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form submission

        const userProfile = {
            fullName: fullNameInput.value,
            shippingAddress: shippingAddressInput.value,
            homeDelivery: homeDeliveryToggle.checked
        };

        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        alert('¡Perfil guardado exitosamente!');
        userProfileModal.classList.remove('open'); // Close modal after saving
    });

    // Function to load user profile from local storage
    function loadUserProfile() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            const userProfile = JSON.parse(savedProfile);
            fullNameInput.value = userProfile.fullName || '';
            shippingAddressInput.value = userProfile.shippingAddress || '';
            homeDeliveryToggle.checked = userProfile.homeDelivery || false;
            updateDeliveryCostMessageVisibility(); // Update message visibility after loading profile
        }
    }

    // Load user profile when the page loads initially (optional, can be done when modal opens)
    // loadUserProfile(); 
});