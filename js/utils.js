function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => toast.remove(), 3000);
    }, 100);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateBarangHilang(data) {
    const errors = [];
    if (!data.nama_barang?.trim()) errors.push('Nama barang wajib diisi');
    if (!data.deskripsi?.trim()) errors.push('Deskripsi wajib diisi');
    if (!data.tanggal_hilang) errors.push('Tanggal hilang wajib dipilih');
    if (!data.lokasi?.trim()) errors.push('Lokasi wajib diisi');
    return errors;
}
