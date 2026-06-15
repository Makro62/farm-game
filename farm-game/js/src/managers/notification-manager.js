// ========================================
// FARM TYCOON - NOTIFICATION MANAGER
// ========================================

export function initNotificationManager() {
    window.notificationManager = {
        show,
        showToast,
        showModal,
    };
}

/**
 * Show toast notification
 * @param {string} message - Pesan notifikasi
 * @param {string} type - Tipe: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Durasi dalam ms (default 3000)
 */
export function show(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Alias for show
export function showToast(message, type = 'info', duration = 3000) {
    show(message, type, duration);
}

/**
 * Show modal dialog
 * @param {string} title - Judul modal
 * @param {string} message - Pesan modal
 * @param {Function} onConfirm - Callback saat confirm diklik
 * @param {Function} onCancel - Callback saat cancel diklik
 */
export function showModal(title, message, onConfirm = null, onCancel = null) {
    const modal = document.getElementById('modal-dialog');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm');
    const cancelBtn = document.getElementById('modal-cancel');
    
    if (!modal || !modalTitle || !modalMessage) return;
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Setup confirm button
    if (confirmBtn) {
        // Remove old listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            modal.close();
            if (onConfirm) onConfirm();
        });
    }
    
    // Setup cancel button
    if (cancelBtn) {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        newCancelBtn.addEventListener('click', () => {
            modal.close();
            if (onCancel) onCancel();
        });
    }
    
    modal.showModal();
}

// Export untuk global access
window.showNotification = show;
window.showToast = showToast;
window.showModal = showModal;
