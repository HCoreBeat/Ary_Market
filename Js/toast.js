class ToastNotification {
    constructor() {
        this.createContainer();
    }

    createContainer() {
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    show(options = {}) {
        const {
            title = '',
            message = '',
            type = 'success', // 'success' o 'error'
            duration = 3000
        } = options;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.querySelector('.toast-container');
        container.appendChild(toast);

        // Close button functionality
        const closeButton = toast.querySelector('.toast-close');
        closeButton.addEventListener('click', () => this.close(toast));

        // Auto close after duration
        setTimeout(() => {
            if (toast.parentNode) {
                this.close(toast);
            }
        }, duration);
    }

    close(toast) {
        toast.style.animation = 'toast-out 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

// Exportar la instancia para uso global
window.toastNotification = new ToastNotification();
