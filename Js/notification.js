class NotificationPanel {
    constructor() {
        this.STORAGE_KEY = 'lastSeenNotificationId';
        this.createNotificationElement();
        this.loadNotificationData();
    }

    createNotificationElement() {
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        overlay.innerHTML = `
            <div class="notification-panel">
                <div class="notification-header">
                    <div class="notification-icon">
                        <i class="fas fa-bell"></i>
                    </div>
                    <h3 class="notification-title"></h3>
                </div>
                <div class="notification-message"></div>
                <div class="notification-badges-container"></div>
                <div class="notification-action">
                    <button class="notification-close">
                        <i class="fas fa-check"></i>
                        <span>Entendido</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Add event listeners
        const closeButton = overlay.querySelector('.notification-close');
        closeButton.addEventListener('click', () => this.hideNotification());
        
        // Close on overlay click (outside panel)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hideNotification();
            }
        });
    }

    async loadNotificationData() {
        try {
            const response = await fetch('data/datos.json');
            const data = await response.json();

            // Check if notification is visible and not expired
            const expirationDate = this.parseDate(data.expira);
            const currentDate = new Date();

            // Check if notification was already seen
            const lastSeenId = localStorage.getItem(this.STORAGE_KEY);

            if (data.visible && currentDate <= expirationDate && lastSeenId !== data.id.toString()) {
                this.updateNotificationContent(data);
                this.showNotification();
            }
        } catch (error) {
            console.error('Error loading notification data:', error);
        }
    }

    parseDate(dateString) {
        // Parse date in format "dd/mm/yyyy"
        const [day, month, year] = dateString.split('/');
        return new Date(year, month - 1, day);
    }

    updateNotificationContent(data) {
        const overlay = document.querySelector('.notification-overlay');
        const title = overlay.querySelector('.notification-title');
        const message = overlay.querySelector('.notification-message');
        const badgesContainer = overlay.querySelector('.notification-badges-container');

        title.textContent = data.titulo;
        message.textContent = data.mensaje;

        // Store current notification ID
        this.currentNotificationId = data.id;

        // Clear previous badges
        badgesContainer.innerHTML = '';

        // Add badges with icons
        const badgeConfigs = [
            { flag: data.nuevo, text: 'Nuevo', icon: 'fas fa-star', class: 'nuevo' },
            { flag: data.oferta, text: 'Oferta', icon: 'fas fa-tag', class: 'oferta' },
            { flag: data.evento, text: 'Evento', icon: 'fas fa-calendar', class: 'evento' }
        ];

        badgeConfigs.forEach(config => {
            if (config.flag) {
                const badge = document.createElement('span');
                badge.className = `notification-badge ${config.class}`;
                badge.innerHTML = `
                    <i class="${config.icon}"></i>
                    ${config.text}
                    <div class="shine"></div>
                `;
                badgesContainer.appendChild(badge);
            }
        });
    }

    showNotification() {
        const overlay = document.querySelector('.notification-overlay');
        document.body.classList.add('notification-open');
        overlay.classList.add('active');
        
        // Add sparkles
        this.addSparkles();
    }

    hideNotification() {
        const overlay = document.querySelector('.notification-overlay');
        document.body.classList.remove('notification-open');
        overlay.classList.remove('active');

        // Store the notification ID in localStorage
        if (this.currentNotificationId) {
            localStorage.setItem(this.STORAGE_KEY, this.currentNotificationId.toString());
        }
    }

    addSparkles() {
        const panel = document.querySelector('.notification-panel');
        for (let i = 0; i < 5; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--color-accent1);
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: float-sparkle ${2 + Math.random() * 3}s linear infinite;
            `;
            panel.appendChild(sparkle);
        }
    }
    
}

// Initialize notification panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NotificationPanel();
});
