let currentPage = 1;
let barangHilangData = [];

document.getElementById('barangHilangForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        nama_barang: document.getElementById('nama_barang').value,
        tanggal_hilang: document.getElementById('tanggal_hilang').value,
        lokasi: document.getElementById('lokasi').value,
        deskripsi: document.getElementById('deskripsi').value
    };

    const errors = validateBarangHilang(formData);
    if (errors.length > 0) {
        showToast(errors.join(', '), 'error');
        return;
    }

    try {
        const fotoFile = document.getElementById('foto').files[0];
        if (fotoFile) formData.foto = fotoFile;
        
        await api.createBarangHilang(formData);
        showToast('Laporan barang hilang berhasil dikirim!');
        document.getElementById('barangHilangForm').reset();
        loadBarangHilang(currentPage);
    } catch (error) {
        showToast('Gagal membuat laporan', 'error');
    }
});

async function loadBarangHilang(page = 1) {
    try {
        currentPage = page;
        const response = await api.getBarangHilang(page);
        barangHilangData = response.data || [];
        renderBarangHilangList();
        renderPagination(response);
    } catch (error) {
        showToast('Gagal memuat data', 'error');
    }
}

function renderBarangHilangList() {
    const container = document.getElementById('barangHilangList');
    if (barangHilangData.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Belum ada laporan barang hilang</p>';
        return;
    }

    container.innerHTML = barangHilangData.map(item => `
        <div class="card" style="margin-bottom: 1rem;">
            <h4>${item.nama_barang}</h4>
            <p><strong>Lokasi:</strong> ${item.lokasi}</p>
            <p><strong>Dilaporkan:</strong> ${formatDate(item.created_at)}</p>
            <p><strong>Status:</strong> <span style="color: ${item.status === 'ditemukan' ? '#10b981' : '#ef4444'}">${item.status}</span></p>
            <div style="margin-top: 1rem;">
                <button class="btn-secondary" onclick="showDetail(${item.id})">Detail</button>
            </div>
        </div>
    `).join('');
}

function renderPagination(response) {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(response.total / response.per_page);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = `
        <button onclick="loadBarangHilang(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>
        <span>Halaman ${currentPage} dari ${totalPages}</span>
        <button onclick="loadBarangHilang(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>
    `;
    pagination.innerHTML = paginationHTML;
}

function showDetail(id) {
    showToast(`Melihat detail barang ID: ${id}`, 'info');
    // Bisa buat modal atau redirect ke detail page
}

// Load data saat halaman dimuat
loadBarangHilang();
