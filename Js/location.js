document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const locationIcon = document.getElementById('location-icon');
    const locationModal = document.getElementById('location-modal');
    const closeLocationBtn = document.getElementById('close-location-btn');
    
    if (!locationIcon || !locationModal || !closeLocationBtn) {
        console.error('Elementos de localización no encontrados');
        return;
    }

    // Función para mostrar el modal de ubicación
    function showLocationModal() {
        locationModal.classList.add('active');
    document.body.classList.add('no-scroll');
    }

    // Función para ocultar el modal de ubicación
    function hideLocationModal() {
        locationModal.classList.remove('active');
    document.body.classList.remove('no-scroll');
    }

    // Event listeners
    locationIcon.addEventListener('click', showLocationModal);
    closeLocationBtn.addEventListener('click', hideLocationModal);

    // Cerrar modal al hacer clic fuera del panel
    locationModal.addEventListener('click', (e) => {
        if (e.target === locationModal) {
            hideLocationModal();
        }
    });

    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && locationModal.classList.contains('active')) {
            hideLocationModal();
        }
    });
});
