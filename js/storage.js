const StorageManager = {
    save(state) {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
            return new Date().toLocaleString('id-ID');
        } catch (e) {
            console.error('Gagal menyimpan data', e);
            return null;
        }
    },

    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error('Gagal memuat data', e);
            return null;
        }
    },

    clear() {
        localStorage.removeItem(SAVE_KEY);
    }
};
