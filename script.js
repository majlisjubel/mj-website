let allProducts = [];
let topupItems = [];
let currentCategory = 'Beranda';
let danaRestokAdmin = "Rp 0";

const URL_STOK_CHANNEL = "https://whatsapp.com/channel/0029Vb8MLHCHLHQgH3KTTV0K";
const URL_TESTI_CHANNEL = "https://whatsapp.com/channel/0029VbDRClmG8l5Clsknh53W";

let currentProduct = { title: '', desc: '', rawPrice: 0, formattedPrice: '', stock: 0, category: '', isTopUp: false, serviceCode: '', gameType: '', sellerPhone: '' };
let currentQty = 1;

const nokosItems = [
  { name: 'Nokos WhatsApp', desc: 'Nomor Kosong / OTP Instan WhatsApp Fresh', price: 'Rp 6.000', keywords: 'nokos whatsapp wa', stock: 99, category: 'Nokos' },
  { name: 'Nokos Facebook', desc: 'Nomor Kosong / OTP Instan Facebook Fresh', price: 'Rp 1.200', keywords: 'nokos facebook fb', stock: 99, category: 'Nokos' },
  { name: 'Nokos Google / Gmail / YT', desc: 'Nomor Kosong / OTP Instan Google, Gmail, dan YouTube', price: 'Rp 1.200', keywords: 'nokos google gmail youtube yt', stock: 99, category: 'Nokos' },
  { name: 'Nokos DANA', desc: 'Nomor Kosong / OTP Instan Aplikasi DANA', price: 'Rp 3.000', keywords: 'nokos dana', stock: 99, category: 'Nokos' },
  { name: 'Nokos OVO', desc: 'Nomor Kosong / OTP Instan Aplikasi OVO', price: 'Rp 1.600', keywords: 'nokos ovo', stock: 99, category: 'Nokos' },
  { name: 'Nokos SeaBank', desc: 'Nomor Kosong / OTP Instan Aplikasi SeaBank', price: 'Rp 3.000', keywords: 'nokos seabank', stock: 99, category: 'Nokos' }
];

const SUPABASE_URL = "https://sgadlmoskhfyyksobggk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnYWRsbW9za2hmeXlrc29iZ2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NzcxNzksImV4cCI6MjEwNjU1MzE3OX0.XASgEjWt-PEK0jsFAkncDGfQ7Tu8JHDtW3eHIqn0mwk";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadData() {
  try {
    const { data: prodData } = await supabaseClient
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    allProducts = prodData || [];

    const { data: topupData } = await supabaseClient
      .from("topup_items")
      .select("*")
      .order("id", { ascending: true });

    if (topupData) {
      topupItems = topupData.map(item => ({
        name: item.name,
        desc: item.description || '',
        price: item.price_display || `Rp ${Number(item.raw_price).toLocaleString('id-ID')}`,
        rawPrice: item.raw_price,
        serviceCode: item.service_code,
        category: item.category || 'Top Up',
        gameType: item.game_type || 'MLBB',
        stock: item.stock !== undefined ? item.stock : 999
      }));
    }

    renderAll();

  } catch (err) {
    console.error("Gagal memuat data:", err);
  }
}

// FUNGSI TITIP LAPAK
function openTitipLapakModal() {
  document.getElementById("titipLapakModal").style.display = "flex";
}

function closeTitipLapakModal() {
  document.getElementById("titipLapakModal").style.display = "none";
}

function submitTitipLapakToWA() {
  const nama = document.getElementById("titipNamaProduk").value.trim();
  const kategori = document.getElementById("titipKategori").value;
  const harga = document.getElementById("titipHarga").value.trim();
  const desc = document.getElementById("titipDeskripsi").value.trim();
  const nohp = document.getElementById("titipNoHP").value.trim();
  const gambar = document.getElementById("titipGambar").value.trim() || "-";

  if (!nama || !harga || !desc) {
    alert("Harap isi Nama Produk, Harga, dan Deskripsi Spek!");
    return;
  }

  const hargaFormatted = Number(harga).toLocaleString("id-ID");

  const textWA = encodeURIComponent(
    `Halo Admin Majlis Jubel 👋\n\n` +
    `Saya mau *TITIP LAPAK / TITIP JUAL* produk di website:\n\n` +
    `📌 *Nama Produk:* ${nama}\n` +
    `🏷️ *Kategori:* ${kategori}\n` +
    `💰 *Harga Jual:* Rp ${hargaFormatted}\n` +
    `📝 *Deskripsi Spek:* ${desc}\n` +
    `📱 *WA Penjual:* ${nohp || '-'}\n` +
    `🖼️ *Link Gambar/SS:* ${gambar}\n\n` +
    `Mohon dipostingkan di katalog Titip Lapak web ya min, terima kasih!`
  );

  window.open(`https://wa.me/6285179807522?text=${textWA}`, '_blank');
  closeTitipLapakModal();
}

// FUNGSI SUPABASE FITUR SELL / DANA RESTOK
async function fetchDanaRestok() {
  try {
    const { data, error } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'dana_restok')
      .single();

    if (data && data.value) {
      const nominal = Number(data.value) || 0;
      danaRestokAdmin = "Rp " + nominal.toLocaleString("id-ID");
    } else {
      danaRestokAdmin = "Rp 0";
    }
  } catch (err) {
    console.error("Gagal mengambil dana restok:", err);
    danaRestokAdmin = "Rp 0";
  }
}

async function openSellModal() {
  document.getElementById("danaRestokDisplay").innerText = "Memuat...";
  document.getElementById("sellModal").style.display = "flex";
  
  await fetchDanaRestok();
  document.getElementById("danaRestokDisplay").innerText = danaRestokAdmin;
}

function closeSellModal() {
  document.getElementById("sellModal").style.display = "none";
}

function submitSellToWA() {
  const item = document.getElementById("sellItemName").value.trim();
  const desc = document.getElementById("sellItemDesc").value.trim();
  const price = document.getElementById("sellItemPrice").value.trim();

  if (!item || !desc || !price) {
    alert("Harap lengkapi semua kolom penawaran!");
    return;
  }

  const priceFormatted = Number(price).toLocaleString("id-ID");

  const textWA = encodeURIComponent(
    `Halo Admin Majlis Jubel 👋\n\nSaya mau nawarin/jual akun/item nih:\n\n` +
    `📌 *Item/Game:* ${item}\n` +
    `📝 *Deskripsi Spek:* ${desc}\n` +
    `💰 *Harga Penawaran:* Rp ${priceFormatted}\n\n` +
    `Apakah Admin berminat menampung/restok? Terima kasih!`
  );

  window.open(`https://wa.me/6285179807522?text=${textWA}`, '_blank');
  closeSellModal();
}

function renderTopup(keyword) {
  const topupGrid = document.getElementById("topup-grid");
  const topupSection = document.getElementById("topup-section");

  if (currentCategory !== 'Beranda' && currentCategory !== 'Top Up') {
    topupSection.style.display = "none";
    return;
  }

  const filteredTopup = topupItems.filter(item => {
    const text = (item.name + " " + item.desc).toLowerCase();
    return text.includes(keyword);
  });

  if (filteredTopup.length === 0) {
    topupSection.style.display = "none";
  } else {
    topupSection.style.display = "block";
    topupGrid.innerHTML = filteredTopup.map(item => {
      const isAvailable = item.stock > 0;
      const badgeClass = isAvailable ? "badge-tag" : "badge-tag badge-soldout";
      const badgeText = isAvailable ? "INSTAN" : "SOLD OUT";

      return `
        <div class="card-product" onclick="openTopupModal('${item.name}', '${item.desc}', '${item.price}', ${item.rawPrice}, '${item.serviceCode}', '${item.gameType}', ${item.stock})">
          <div class="card-body">
            <div class="card-header-badge">
              <span class="${badgeClass}">${badgeText}</span>
              <span class="nokos-badge-game">${item.gameType}</span>
            </div>
            <h3 class="card-title">💎 ${item.name}</h3>
            <div class="card-price">${item.price}</div>
          </div>
        </div>
      `;
    }).join("");
  }
}

function renderNokos(keyword) {
  const nokosGrid = document.getElementById("nokos-grid");
  const nokosSection = document.getElementById("nokos-section");

  if (currentCategory !== 'Beranda' && currentCategory !== 'Nokos') {
    nokosSection.style.display = "none";
    return;
  }

  const filteredNokos = nokosItems.filter(item => {
    const text = (item.name + " " + item.desc + " " + item.keywords).toLowerCase();
    return text.includes(keyword);
  });

  if (filteredNokos.length === 0) {
    nokosSection.style.display = "none";
  } else {
    nokosSection.style.display = "block";
    nokosGrid.innerHTML = filteredNokos.map(item => `
      <div class="card-product" onclick="openModal('${item.name}', '${item.desc}', '${item.price}', ${item.stock}, '${item.category}')">
        <div class="card-body">
          <div class="card-header-badge">
            <span class="badge-tag">READY (${item.stock})</span>
            <span class="nokos-badge-game">NOKOS</span>
          </div>
          <h3 class="card-title">🔹 ${item.name.replace('Nokos ', '')}</h3>
          <div class="card-price">${item.price}</div>
        </div>
      </div>
    `).join("");
  }
}

// FUNGSI RENDER PRODUK SUPABASE DENGAN SISTEM ID
function renderProducts(keyword) {
  const container = document.getElementById("product-container");
  const titleEl = document.getElementById("other-products-title");

  const filtered = allProducts.filter(p => {
    const name = (p.name || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    
    const matchesSearch = name.includes(keyword) || cat.includes(keyword) || desc.includes(keyword);
    const matchesCat = (currentCategory === "Beranda") || cat.includes(currentCategory.toLowerCase()) || name.includes(currentCategory.toLowerCase());

    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    if (titleEl) titleEl.style.display = "none";
    container.innerHTML = "";
    return;
  }

  if (titleEl) titleEl.style.display = "block";
  container.innerHTML = filtered.map(p => {
    const name = p.name || "Produk Tanpa Nama";
    const category = p.category || "PRODUK";
    const stock = (p.stock !== undefined && p.stock !== null) ? Number(p.stock) : 0;
    const isAvailable = stock > 0;
    
    let priceDisplay = "Cek Stok";
    if (p.price && Number(p.price) > 0) {
      priceDisplay = "Rp " + Number(p.price).toLocaleString("id-ID");
    }

    const imgUrl = (p.image_url && p.image_url.trim() !== "") ? p.image_url : "";

    let imageHTML = "";
    if (imgUrl) {
      imageHTML = `
        <div class="card-image-wrapper">
          <img src="${imgUrl}" alt="${name}" class="card-img" loading="lazy" onerror="this.onerror=null; this.parentElement.style.display='none';">
          <span class="badge-game">${category}</span>
        </div>
      `;
    }

    const badgeClass = isAvailable ? "badge-tag" : "badge-tag badge-soldout";
    const badgeText = isAvailable ? `STOK: ${stock}` : "SOLD OUT";

    return `
      <div class="card-product" onclick="openProductById('${p.id}')">
        ${imageHTML}
        <div class="card-body">
          ${!imgUrl ? `
            <div class="card-header-badge">
              <span class="${badgeClass}">${badgeText}</span>
              <span class="nokos-badge-game">${category}</span>
            </div>
          ` : `<span class="${badgeClass}">${badgeText}</span>`}
          <h3 class="card-title">${name}</h3>
          <div class="card-price">${priceDisplay}</div>
        </div>
      </div>
    `;
  }).join("");
}

// FUNGSI HELPER MEMBUKA MODAL BERDASARKAN ID PRODUK SUPABASE & MEMBACA NOMOR PENJUAL
function openProductById(productId) {
  const p = allProducts.find(item => String(item.id) === String(productId));
  if (!p) return;

  const name = p.name || "Produk Tanpa Nama";
  const desc = p.description || "Belum ada deskripsi";
  const category = p.category || "PRODUK";
  const stock = (p.stock !== undefined && p.stock !== null) ? Number(p.stock) : 0;
  const sellerPhone = p.seller_phone || "";

  let priceDisplay = "Cek Stok";
  if (p.price && Number(p.price) > 0) {
    priceDisplay = "Rp " + Number(p.price).toLocaleString("id-ID");
  }

  currentProduct = {
    title: name,
    desc: desc,
    rawPrice: (p.price && Number(p.price) > 0) ? Number(p.price) : 0,
    formattedPrice: priceDisplay,
    stock: stock,
    category: category,
    isTopUp: false,
    serviceCode: '',
    sellerPhone: sellerPhone
  };

  openModal(name, desc, priceDisplay, stock, category);
}

function renderAll() {
  const keyword = document.getElementById("searchInput").value.toLowerCase().trim();
  renderProducts(keyword);
  renderNokos(keyword);
  renderTopup(keyword);

  const reviewWrapper = document.getElementById("review-section-wrapper");
  if (currentCategory === "Beranda") {
    reviewWrapper.style.display = "block";
  } else {
    reviewWrapper.style.display = "none";
  }
}

function openTopupModal(title, desc, priceStr, rawPrice, serviceCode, gameType = 'MLBB', stock = 999) {
  if (stock <= 0) {
    alert("Maaf, stok item topup ini sedang kosong!");
    return;
  }

  currentQty = 1;
  document.getElementById("qtyInput").value = 1;

  currentProduct = {
    title: title,
    desc: desc,
    rawPrice: rawPrice,
    formattedPrice: priceStr,
    stock: stock,
    category: 'Top Up',
    isTopUp: true,
    serviceCode: serviceCode,
    gameType: gameType,
    sellerPhone: ''
  };

  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalDesc").innerText = desc;
  
  const topupContainer = document.getElementById("topupInputContainer");
  const targetInput = document.getElementById("topupTargetId");
  const zoneInput = document.getElementById("topupZoneId");
  const topupLabel = document.getElementById("topupLabel");

  topupContainer.style.display = "block";
  targetInput.value = "";
  zoneInput.value = "";

  if (gameType === 'MLBB') {
    topupLabel.innerText = "🎯 Masukkan ID & Zone ID MLBB:";
    targetInput.placeholder = "User ID";
    zoneInput.style.display = "block";
  } else if (gameType === 'PULSA') {
    topupLabel.innerText = "📱 Masukkan Nomor HP:";
    targetInput.placeholder = "08xxxxxxxxxx";
    zoneInput.style.display = "none";
  } else {
    topupLabel.innerText = "🎯 Masukkan Username / ID:";
    targetInput.placeholder = "User ID / Username";
    zoneInput.style.display = "none";
  }

  document.getElementById("qtyBox").style.display = "none";
  document.getElementById("modalSecondaryBtn").style.display = "none";

  const btnBuy = document.getElementById("modalBuyBtn");
  btnBuy.innerText = "⚡ Beli sekarang";
  btnBuy.style.background = "#f05b9b";

  document.getElementById("totalPriceText").innerText = `Total: ${priceStr}`;
  document.getElementById("detailModal").style.display = "flex";
}

function openModal(title, desc, priceStr, stock, category) {
  const numStock = Number(stock) || 0;
  const isAvailable = numStock > 0;
  const catLower = (category || "").toLowerCase();
  
  const isMLBB = catLower.includes("mlbb") || catLower.includes("mobile legend") || catLower.includes("ml");

  currentQty = isAvailable ? 1 : 0;
  document.getElementById("qtyInput").value = currentQty;
  document.getElementById("topupInputContainer").style.display = "none";

  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalDesc").innerText = desc;

  const qtyBox = document.getElementById("qtyBox");
  const btnBuy = document.getElementById("modalBuyBtn");
  const btnSecondary = document.getElementById("modalSecondaryBtn");

  if (!isAvailable) {
    qtyBox.style.display = "none";
    document.getElementById("totalPriceText").innerText = "❌ PRODUK INI SUDAH TERJUAL / SOLD OUT";
    
    if (isMLBB) {
      btnBuy.innerText = "📸 SPEK LENGKAP & TESTI";
      btnBuy.onclick = () => window.open(URL_TESTI_CHANNEL, '_blank');
      btnBuy.style.background = "#25d366";
      btnBuy.style.display = "block";
    } else {
      btnBuy.style.display = "none";
    }

    btnSecondary.style.display = "none";

  } else {
    qtyBox.style.display = "flex";
    document.getElementById("modalStockLabel").innerText = `Jumlah Pesanan (Stok: ${numStock}):`;
    
    btnBuy.style.display = "block";
    btnBuy.innerText = "Beli via WhatsApp";
    btnBuy.style.background = "#25d366";
    btnBuy.onclick = () => handleCheckout();

    if (isMLBB) {
      btnSecondary.innerText = "📋 LIHAT SPEK LENGKAP";
      btnSecondary.href = URL_STOK_CHANNEL;
      btnSecondary.style.display = "block";
    } else {
      btnSecondary.style.display = "none";
    }

    updateModalTotal();
  }
  
  document.getElementById("detailModal").style.display = "flex";
}

function changeQty(amount) {
  if (currentProduct.stock <= 0) return;

  currentQty += amount;
  if (currentQty < 1) currentQty = 1;
  if (currentQty > currentProduct.stock) currentQty = currentProduct.stock;
  
  document.getElementById("qtyInput").value = currentQty;
  updateModalTotal();
}

function updateModalTotal() {
  if (currentProduct.stock <= 0) return;

  let totalText = "";
  if (currentProduct.rawPrice > 0) {
    const totalPrice = currentProduct.rawPrice * currentQty;
    totalText = `Total: Rp ${totalPrice.toLocaleString("id-ID")} (${currentQty}x)`;
  } else {
    totalText = `Harga: ${currentProduct.formattedPrice}`;
  }

  document.getElementById("totalPriceText").innerText = totalText;
}

async function handleCheckout() {
  if (currentProduct.isTopUp) {
    const targetId = document.getElementById("topupTargetId").value.trim();
    const zoneId = document.getElementById("topupZoneId").value.trim();

    if (!targetId) {
      alert("Harap masukkan ID / Nomor tujuan kamu!");
      return;
    }

    let fullTarget = targetId;
    if (currentProduct.gameType === 'MLBB') {
      if (!zoneId) {
        alert("Harap masukkan Zone ID MLBB kamu!");
        return;
      }
      fullTarget = `${targetId}(${zoneId})`;
    }

    const btnBuy = document.getElementById("modalBuyBtn");
    btnBuy.disabled = true;
    btnBuy.innerText = "Menyimpan Pesanan...";

    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .insert([
          {
            nama_produk: currentProduct.title,
            kode_layanan: currentProduct.serviceCode,
            target_id: fullTarget,
            harga_total: currentProduct.rawPrice,
            status: 'pending'
          }
        ]);

      if (error) {
        alert("Gagal membuat order: " + error.message);
        btnBuy.disabled = false;
        btnBuy.innerText = "⚡ Beli sekarang";
        return;
      }

      const textWa = encodeURIComponent(`Halo Admin Majlis Jubel 👋\n\nSaya sudah buat orderan Top Up:\n🔹 Produk: ${currentProduct.title}\n🎯 ID/Tujuan: ${fullTarget}\n💰 Total: Rp ${currentProduct.rawPrice.toLocaleString("id-ID")}\n\nMohon info QRIS / No Rekening untuk pembayarannya ya!`);
      window.open(`https://wa.me/6285179807522?text=${textWa}`, '_blank');
      
      closeModal();
      btnBuy.disabled = false;
      btnBuy.innerText = "⚡ Beli sekarang";

    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
      btnBuy.disabled = false;
      btnBuy.innerText = "⚡ Beli sekarang";
    }

  } else {
    let totalText = currentProduct.rawPrice > 0 
      ? `Rp ${(currentProduct.rawPrice * currentQty).toLocaleString("id-ID")} (${currentQty}x)`
      : currentProduct.formattedPrice;

    // MENAMPILKAN KONTAK PENJUAL JIKA TERSEDIA
    let infoPenjual = "";
    if (currentProduct.sellerPhone && currentProduct.sellerPhone.trim() !== "") {
      infoPenjual = `\n👤 *Kontak Penjual:* ${currentProduct.sellerPhone}`;
    }

    const textWa = encodeURIComponent(
      `Halo Admin Majlis Jubel 👋\n\n` +
      `Saya mau order produk berikut via Rekber:\n` +
      `🔹 *Layanan:* ${currentProduct.title}\n` +
      `🏷️ *Kategori:* ${currentProduct.category}` +
      `${infoPenjual}\n` +
      `📦 *Jumlah:* ${currentQty}x\n` +
      `💰 *Total:* ${totalText}\n\n` +
      `Apakah stoknya ready? Mohon info nomor QRIS/Rekening untuk pembayarannya ya, terima kasih!`
    );

    window.open(`https://wa.me/6285179807522?text=${textWa}`, '_blank');
  }
}

function closeModal() {
  document.getElementById("detailModal").style.display = "none";
}

document.getElementById("searchInput").addEventListener("input", renderAll);

function filterCategory(el, catName) {
  document.querySelectorAll(".category").forEach(c => c.classList.remove("active-cat"));
  el.classList.add("active-cat");
  currentCategory = catName;
  renderAll();
}

async function loadReviews() {
  const container = document.getElementById('daftar-ulasan');

  try {
    const { data: reviews, error } = await supabaseClient
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !reviews || reviews.length === 0) {
      container.innerHTML = '<p style="color:#aaa; font-size:13px;">Belum ada ulasan dari pembeli.</p>';
      return;
    }

    container.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="review-card-header">
          <span>👤 ${r.nama_pembeli}</span>
          <span>${'⭐'.repeat(r.rating)}</span>
        </div>
        <p class="review-card-text">${r.komentar}</p>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p style="color:#ff6b99; font-size:13px;">Gagal memuat ulasan.</p>';
  }
}

async function kirimUlasan() {
  const nama = document.getElementById('rev-nama').value.trim();
  const rating = document.getElementById('rev-rating').value;
  const komentar = document.getElementById('rev-komentar').value.trim();
  const btn = document.getElementById('btn-submit-review');

  if (!nama || !komentar) {
    alert('Harap isi nama dan komentar ulasan kamu!');
    return;
  }

  btn.disabled = true;
  btn.innerText = 'Mengirim...';

  const { error } = await supabaseClient
    .from('reviews')
    .insert([{ nama_pembeli: nama, rating: parseInt(rating), komentar: komentar }]);

  if (error) {
    alert('Gagal mengirim ulasan: ' + error.message);
  } else {
    alert('Terima kasih atas ulasannya! 🙏');
    document.getElementById('rev-nama').value = '';
    document.getElementById('rev-komentar').value = '';
    loadReviews();
  }

  btn.disabled = false;
  btn.innerText = 'Kirim Ulasan';
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  loadReviews();
});
