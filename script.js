const TMDB_API_KEY = "d5a549dec10563dc56696d42f581a771";
let currentLanguage = 'th'; // 'th' or 'vi'
let currentShowData = null;
let selectedSeasonNum = 1;
let selectedEpisodeNum = 1;
let currentSeasonEpisodes = [];
let currentCast = [];
let allSeasonsEpisodesData = {}; // Store all episodes grouped by season for batch generation

const i18n = {
    th: {
        nav_generator: "เครื่องมือสร้าง (Generator)",
        nav_preview: "ดูตัวอย่างสด (Live Preview)",
        ui_brand_title: "สตูดิโอสตรีมมิ่ง",
        gen_heading: "TMDB Batch URL & All-Season Generator",
        gen_subheading: "ป้อน TMDB ID หรือ URL เพื่อสร้างหน้าสตรีมมิ่งอัตโนมัติพร้อมรายการทุกซีซั่น ทุกตอน และแปลภาษาไทย/เวียดนามทันที",
        btn_generate_all: "สร้าง URL และซีซั่นทั้งหมด",
        ph_title: "ยังไม่ได้โหลดข้อมูลซีรีส์ใดๆ",
        ph_sub: "ป้อน TMDB ID หรือเลือกตัวอย่างด้านล่างเพื่อเริ่มสร้างหน้าสตรีมมิ่ง",
        lbl_sample: "ตัวอย่าง:",
        btn_preview_page: "ดูตัวอย่างหน้าสตรีมมิ่ง",
        txt_season_list_title: "รายการ URL และซีซั่นทั้งหมด (คลิกเพื่อเปลี่ยนตอน)",
        btn_copy_all_urls: "คัดลอก URL ทั้งหมด",
        txt_ep_desc: "รายการตอนทั้งหมดของทุกซีซั่น (คลิกเพื่อเปิดหน้าเพจ/ดูตัวอย่างทันที):",
        export_title: "ส่งออกโค้ด HTML (จัดเรียงตามลำดับ UI เป๊ะ)",
        export_desc: "ดาวน์โหลดไฟล์ HTML พร้อมโครงสร้าง: Title -> Ads 300x250 -> Player -> CTA -> Poster+Synopsis -> Seasons -> All Episodes -> Actor -> Footer",
        btn_download_html: "ดาวน์โหลด HTML",
        btn_back: "กลับไปยัง Generator",
        ad_label: "Sponsored Advertisement (300x250)",
        btn_vip: "Watch Now No Ads / VIP Access",
        synopsis_heading: "เรื่องย่อตอน / Tóm tắt",
        season_header: "รายการซีซั่น (Seasons)",
        episode_header: "รายการตอนทั้งหมด (All Episodes)",
        cast_heading: "นักแสดงนำ (Cast)",
        alert_play: "กำลังเปิดเครื่องเล่นวิดีโอสตรีมมิ่ง...",
        alert_vip: "ไปที่ลิงก์ VIP / ไม่มีโฆษณาเรียบร้อยแล้ว",
        copied: "คัดลอกลิงก์สำเร็จแล้ว!"
    },
    vi: {
        nav_generator: "Công cụ tạo (Generator)",
        nav_preview: "Xem trước (Live Preview)",
        ui_brand_title: "Studio Phát Trực Tuyến",
        gen_heading: "Trình tạo URL & Tất Cả Các Mùa TMDB",
        gen_subheading: "Nhập ID TMDB hoặc URL để tạo trang phát trực tuyến tự động với tất cả các mùa, tập phim và dịch tiếng Thái/Việt",
        btn_generate_all: "Tạo Tất Cả URL & Mùa",
        ph_title: "Chưa có dữ liệu phim nào được tải",
        ph_sub: "Nhập ID TMDB hoặc chọn phim mẫu bên dưới để bắt đầu",
        lbl_sample: "Phim mẫu:",
        btn_preview_page: "Xem trước trang phát trực tuyến",
        txt_season_list_title: "Danh sách URL & Các mùa phim (Nhấp để chọn)",
        btn_copy_all_urls: "Sao chép tất cả URL",
        txt_ep_desc: "Danh sách tất cả các tập phim (Nhấp để mở trang/kiểm tra ngay):",
        export_title: "Xuất mã HTML (Theo đúng thứ tự UI chuẩn)",
        export_desc: "Tải xuống tệp HTML hoàn chỉnh với thứ tự giao diện chuẩn cho desktop và mobile",
        btn_download_html: "Tải xuống HTML",
        btn_back: "Quay lại Generator",
        ad_label: "Quảng cáo tài trợ (300x250)",
        btn_vip: "Watch Now No Ads / Truy cập VIP",
        synopsis_heading: "Tóm tắt tập phim",
        season_header: "Danh sách mùa (Seasons)",
        episode_header: "Danh sách tất cả các tập (All Episodes)",
        cast_heading: "Diễn viên chính (Cast)",
        alert_play: "Đang mở trình phát video...",
        alert_vip: "Đã chuyển đến liên kết VIP thành công!",
        copied: "Đã sao chép liên kết thành công!"
    }
};

function changeLanguage() {
    const select = document.getElementById('lang-select');
    currentLanguage = select.value;
    const htmlRoot = document.getElementById('html-root');
    htmlRoot.setAttribute('lang', currentLanguage);

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLanguage][key]) {
            el.innerText = i18n[currentLanguage][key];
        }
    });

    if (currentShowData) {
        renderShowDetails();
        generateExportCode();
    }
}

function switchView(viewName) {
    const genView = document.getElementById('view-generator');
    const prevView = document.getElementById('view-preview');
    const footerAds = document.getElementById('preview-footer-ads');
    const genBtn = document.getElementById('nav-gen-btn');
    const prevBtn = document.getElementById('nav-prev-btn');

    if (viewName === 'generator') {
        genView.classList.remove('hidden');
        prevView.classList.add('hidden');
        footerAds.classList.add('hidden');
        genBtn.className = "text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md bg-red-600 text-white transition";
        prevBtn.className = "text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md text-gray-300 hover:text-white transition";
    } else {
        genView.classList.add('hidden');
        prevView.classList.remove('hidden');
        footerAds.classList.remove('hidden');
        prevBtn.className = "text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md bg-red-600 text-white transition";
        genBtn.className = "text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md text-gray-300 hover:text-white transition";
    }
}

async function fetchTMDBData() {
    const inputVal = document.getElementById('tmdb-input').value.trim();
    let showId = inputVal;

    if (inputVal.includes('themoviedb.org')) {
        const match = inputVal.match(/\/tv\/(\d+)/);
        if (match && match[1]) showId = match[1];
    }

    if (!showId || isNaN(showId)) {
        showError(currentLanguage === 'th' ? "โปรดป้อน TMDB ID หรือ URL ซีรีส์ที่ถูกต้อง" : "Vui lòng nhập ID TMDB hoặc URL hợp lệ");
        return;
    }

    hideError();
    const tmdbLang = currentLanguage === 'th' ? 'th-TH' : 'vi-VN';
    const url = `https://api.themoviedb.org/3/tv/${showId}?api_key=${TMDB_API_KEY}&language=${tmdbLang}&append_to_response=credits`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Gagal mengambil data dari TMDB. Periksa ID atau API Key Anda.");
        const data = await res.json();
        
        if (!data.overview) {
            const resEn = await fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits`);
            const dataEn = await resEn.json();
            data.overview = dataEn.overview + " (Auto-Translated)";
        }

        currentShowData = data;
        selectedSeasonNum = data.seasons && data.seasons.length > 0 ? (data.seasons[0].season_number === 0 && data.seasons.length > 1 ? data.seasons[1].season_number : data.seasons[0].season_number) : 1;
        selectedEpisodeNum = 1;
        currentCast = data.credits && data.credits.cast ? data.credits.cast : [];

        // Batch load episodes for ALL valid seasons
        allSeasonsEpisodesData = {};
        for (let season of data.seasons) {
            if (season.season_number === 0) continue; // Skip specials if needed
            try {
                const sRes = await fetch(`https://api.themoviedb.org/3/tv/${showId}/season/${season.season_number}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`);
                const sData = await sRes.json();
                allSeasonsEpisodesData[season.season_number] = sData.episodes || [];
            } catch(e) {
                allSeasonsEpisodesData[season.season_number] = [];
            }
        }

        currentSeasonEpisodes = allSeasonsEpisodesData[selectedSeasonNum] || [];
        renderShowDetails();
        document.getElementById('generator-placeholder').classList.add('hidden');
        document.getElementById('generator-results').classList.remove('hidden');
        generateExportCode();

    } catch (err) {
        showError(err.message);
    }
}

function showError(msg) {
    const errBox = document.getElementById('error-box');
    errBox.innerText = msg;
    errBox.classList.remove('hidden');
}

function hideError() {
    const errBox = document.getElementById('error-box');
    errBox.classList.add('hidden');
}

async function loadSampleShow(id) {
    document.getElementById('tmdb-input').value = id;
    await fetchTMDBData();
}

function selectSeason(sNum) {
    selectedSeasonNum = sNum;
    selectedEpisodeNum = 1;
    currentSeasonEpisodes = allSeasonsEpisodesData[sNum] || [];
    renderShowDetails();
    generateExportCode();
}

function renderShowDetails() {
    if (!currentShowData) return;

    document.getElementById('show-poster').src = currentShowData.poster_path ? `https://image.tmdb.org/t/p/w500${currentShowData.poster_path}` : 'https://placehold.co/500x750/111827/ffffff?text=No+Image';
    document.getElementById('show-title').innerText = currentShowData.name || currentShowData.original_name;
    const year = currentShowData.first_air_date ? currentShowData.first_air_date.split('-')[0] : '2023';
    const rating = currentShowData.vote_average ? currentShowData.vote_average.toFixed(1) : '8.0';
    document.getElementById('show-meta').innerText = `${year} • ⭐ ${rating}`;
    document.getElementById('show-status').innerText = currentShowData.status || 'Ongoing';
    document.getElementById('show-synopsis').innerText = currentShowData.overview || 'Sinopsis tidak tersedia.';

    document.getElementById('preview-show-title').innerText = currentShowData.name || currentShowData.original_name;
    document.getElementById('preview-meta').innerText = `${year} • ⭐ ${rating}`;
    document.getElementById('preview-poster').src = currentShowData.poster_path ? `https://image.tmdb.org/t/p/w500${currentShowData.poster_path}` : 'https://placehold.co/500x750/111827/ffffff?text=No+Image';
    
    let backdrop = currentShowData.backdrop_path ? `https://image.tmdb.org/t/p/original${currentShowData.backdrop_path}` : '';
    const foundEp = currentSeasonEpisodes.find(e => e.episode_number === selectedEpisodeNum);
    if (foundEp && foundEp.still_path) {
        backdrop = `https://image.tmdb.org/t/p/original${foundEp.still_path}`;
    }

    if(backdrop) {
        document.getElementById('player-backdrop').style.backgroundImage = `url('${backdrop}')`;
    }

    const epName = foundEp ? foundEp.name : `Episode ${selectedEpisodeNum}`;
    document.getElementById('preview-ep-label').innerText = `${currentShowData.name} - S${selectedSeasonNum} E${selectedEpisodeNum}: ${epName}`;
    document.getElementById('preview-player-title').innerText = `Season ${selectedSeasonNum} Episode ${selectedEpisodeNum} - ${epName}`;
    
    let epOverview = foundEp && foundEp.overview ? foundEp.overview : currentShowData.overview;
    document.getElementById('preview-synopsis').innerText = epOverview || 'Sinopsis episode...';

    // Dynamic SEO Metadata per season and episode
    const seoTitle = `${currentShowData.name} - Season ${selectedSeasonNum} Episode ${selectedEpisodeNum} (${epName}) | Streaming`;
    document.getElementById('page-seo-title').innerText = seoTitle;
    document.getElementById('page-seo-desc').content = `Watch ${currentShowData.name} Season ${selectedSeasonNum} Episode ${selectedEpisodeNum} online with zero ads. ${epOverview ? epOverview.substring(0, 120) : ''}`;

    renderSeasonsUI();
    renderEpisodesUI();
    renderCastUI();
    updateUrlBox();
}

function renderSeasonsUI() {
    if (!currentShowData || !currentShowData.seasons) return;
    const containerGen = document.getElementById('gen-season-tabs');
    const containerPrev = document.getElementById('preview-seasons-container');
    
    let htmlGen = '';
    let htmlPrev = '';

    currentShowData.seasons.forEach(s => {
        if(s.season_number === 0) return;
        const activeClass = s.season_number === selectedSeasonNum ? 'bg-red-600 text-white font-bold' : 'bg-slate-800 text-gray-300 hover:bg-slate-700';
        
        htmlGen += `<button onclick="selectSeason(${s.season_number})" class="px-3 py-1.5 rounded-xl text-xs transition border border-gray-700 ${activeClass}">${s.name || 'Season ' + s.season_number}</button>`;
        htmlPrev += `<button onclick="selectSeason(${s.season_number})" class="px-3 py-1.5 rounded-xl text-xs transition border border-gray-700 ${activeClass}">${s.name || 'Season ' + s.season_number}</button>`;
    });

    containerGen.innerHTML = htmlGen;
    containerPrev.innerHTML = htmlPrev;
}

function renderEpisodesUI() {
    const containerGen = document.getElementById('episodes-container');
    const containerPrev = document.getElementById('preview-episodes-container');

    if (!allSeasonsEpisodesData || Object.keys(allSeasonsEpisodesData).length === 0) {
        containerGen.innerHTML = '<div class="text-xs text-gray-500">Memuat semua episode...</div>';
        containerPrev.innerHTML = '<div class="text-xs text-gray-500">Memuat semua episode...</div>';
        return;
    }

    let html = '';
    // Loop through all seasons and their episodes so everything generates in a single view
    Object.keys(allSeasonsEpisodesData).forEach(sNum => {
        const eps = allSeasonsEpisodesData[sNum];
        html += `<div class="col-span-full font-bold text-xs text-red-400 mt-2">Season ${sNum}</div>`;
        eps.forEach(ep => {
            const activeClass = (parseInt(sNum) === selectedSeasonNum && ep.episode_number === selectedEpisodeNum) ? 'border-red-600 bg-red-950/30 text-white' : 'border-gray-800 bg-black/40 text-gray-300 hover:border-gray-600';
            const epTargetUrl = `${window.location.origin}${window.location.pathname}?id=${currentShowData.id}&s=${sNum}&e=${ep.episode_number}`;
            html += `
                <div onclick="openEpisodePage(${sNum}, ${ep.episode_number})" class="p-2.5 rounded-xl border ${activeClass} cursor-pointer transition flex items-center justify-between">
                    <div class="truncate">
                        <span class="font-bold text-xs text-red-500 mr-2">S${sNum}E${ep.episode_number}</span>
                        <span class="text-xs font-medium">${ep.name || 'Episode ' + ep.episode_number}</span>
                    </div>
                    <i class="fa-solid fa-arrow-up-right-from-square text-[10px] text-gray-500 ml-2" title="Buka Halaman Baru"></i>
                </div>
            `;
        });
    });

    containerGen.innerHTML = html;
    containerPrev.innerHTML = html;
    updateUrlBox();
}

function selectEpisode(sNum, eNum) {
    selectedSeasonNum = sNum;
    selectedEpisodeNum = eNum;
    currentSeasonEpisodes = allSeasonsEpisodesData[sNum] || [];
    renderShowDetails();
    generateExportCode();
}

function openEpisodePage(sNum, eNum) {
    selectedSeasonNum = sNum;
    selectedEpisodeNum = eNum;
    currentSeasonEpisodes = allSeasonsEpisodesData[sNum] || [];
    renderShowDetails();
    generateExportCode();
    // Simulate opening new page / switching view to preview and updating URL simulation
    switchView('preview');
}

function renderCastUI() {
    const container = document.getElementById('preview-cast-container');
    if (!currentCast || currentCast.length === 0) {
        container.innerHTML = '<div class="text-xs text-gray-500 col-span-4">Tidak ada data aktor.</div>';
        return;
    }

    let html = '';
    currentCast.slice(0, 8).forEach(actor => {
        const img = actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://placehold.co/185x278/111827/ffffff?text=No+Photo';
        html += `
            <div class="bg-slate-900 border border-gray-800 p-2.5 rounded-xl text-center space-y-1.5">
                <img src="${img}" class="w-full h-28 object-cover rounded-lg" onerror="this.src='https://placehold.co/185x278/111827/ffffff?text=No+Photo'">
                <h5 class="font-bold text-xs text-white truncate">${actor.name}</h5>
                <p class="text-[10px] text-gray-400 truncate">${actor.character || '-'}</p>
            </div>
        `;
    });
    container.innerHTML = html;
}

function updateUrlBox() {
    if (!currentShowData) return;
    const currentUrl = `${window.location.origin}${window.location.pathname}?id=${currentShowData.id}&s=${selectedSeasonNum}&e=${selectedEpisodeNum}`;
    document.getElementById('current-selected-url').innerText = `URL: ${currentUrl}`;
}

function copyAllGeneratedUrls() {
    if (!currentShowData) return;
    let allUrls = [];
    Object.keys(allSeasonsEpisodesData).forEach(sNum => {
        const eps = allSeasonsEpisodesData[sNum];
        eps.forEach(ep => {
            allUrls.push(`${window.location.origin}${window.location.pathname}?id=${currentShowData.id}&s=${sNum}&e=${ep.episode_number}`);
        });
    });

    const textToCopy = allUrls.join('\n');
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert(i18n[currentLanguage].copied);
}

function generateExportCode() {
    if (!currentShowData) return;
    const showId = currentShowData.id;
    const backdropPath = currentShowData.backdrop_path ? `https://image.tmdb.org/t/p/original${currentShowData.backdrop_path}` : (currentShowData.poster_path ? `https://image.tmdb.org/t/p/original${currentShowData.poster_path}` : '');
    const foundEp = (allSeasonsEpisodesData[selectedSeasonNum] || []).find(e => e.episode_number === selectedEpisodeNum);
    const epName = foundEp ? foundEp.name : `Episode ${selectedEpisodeNum}`;
    const epOverview = foundEp && foundEp.overview ? foundEp.overview : currentShowData.overview;
    
    // Strict UI Component Order: 1. Title -> 2. Ads 300x250 -> 3. Video Player -> 4. CTA -> 5. Poster+Synopsis -> 6. Season -> 7. All Episodes -> 8. Actor -> 9. Footer
    const templateCode = `<!DOCTYPE html>
<html lang="${currentLanguage}" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentShowData.name} - Season ${selectedSeasonNum} Episode ${selectedEpisodeNum} (${epName})</title>
    <meta name="description" content="Watch ${currentShowData.name} Season ${selectedSeasonNum} Episode ${selectedEpisodeNum} online with zero ads. ${epOverview ? epOverview.substring(0, 120) : ''}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { font-family: 'Inter', sans-serif; }
        @media (max-width: 768px) {
            .ad-footer-frame { transform: scale(0.82); transform-origin: center; }
        }
    </style>
</head>
<body class="bg-slate-950 text-white min-h-screen p-4 sm:p-6 space-y-6 pb-28">
    <div class="max-w-4xl mx-auto space-y-6">
        
        <!-- 1. TITLE -->
        <div class="bg-slate-900 border border-gray-800 p-5 rounded-2xl">
            <h1 class="text-2xl sm:text-3xl font-black">${currentShowData.name}</h1>
            <p class="text-xs text-gray-400 mt-1">TMDB ID: ${showId} • Season ${selectedSeasonNum} Episode ${selectedEpisodeNum}: ${epName}</p>
        </div>

        <!-- 2. ADS BANNER (300x250) -->
        <div class="my-4 flex flex-col items-center justify-center p-3 bg-slate-900/50 border border-gray-800 rounded-2xl">
            <span class="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Sponsored Advertisement (300x250)</span>
            <div class="w-[300px] h-[250px] bg-slate-900 flex items-center justify-center rounded-lg overflow-hidden border border-gray-800">
                <script>var atOptions_1 = {'key':'53541ca00eed825e8c431c12f7418ac0','format':'iframe','height':250,'width':300,'params':{}};</script>
                <script src="https://buffcasualwhine.com/53541ca00eed825e8c431c12f7418ac0/invoke.js"></script>
            </div>
        </div>

        <!-- 3. FAKE VIDEO PLAYER WITH TMDB THUMBNAIL/BACKDROP -->
        <div class="aspect-video bg-black rounded-2xl relative overflow-hidden shadow-2xl border border-gray-800 bg-cover bg-center flex items-center justify-center" style="background-image: url('${backdropPath}');">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
            <div class="relative z-10 flex flex-col items-center cursor-pointer" onclick="alert('${currentLanguage === 'th' ? 'กำลังเปิดเครื่องเล่นวิดีโอ...' : 'Đang mở trình phát video...'}')">
                <div class="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl shadow-xl hover:scale-110 transition"><i class="fa-solid fa-play ml-1"></i></div>
                <span class="mt-3 text-xs font-bold bg-black/80 px-3 py-1 rounded-full text-white">${currentShowData.name} - S${selectedSeasonNum} E${selectedEpisodeNum}</span>
            </div>
        </div>

        <!-- 4. CTA WATCH NOW NO ADS -->
        <div>
            <a href="#vip" onclick="event.preventDefault(); alert('${currentLanguage === 'th' ? 'ไปที่ลิงก์ VIP / ไม่มีโฆษณาเรียบร้อยแล้ว' : 'Đã chuyển đến liên kết VIP thành công'}');" class="block w-full bg-red-600 hover:bg-red-700 text-white font-bold text-center py-3.5 rounded-xl shadow-lg transition">
                <i class="fa-solid fa-shield-halved mr-2"></i> Watch Now No Ads / VIP Access
            </a>
        </div>

        <!-- 5. POSTER + SYNOPSIS -->
        <div class="bg-slate-900 border border-gray-800 p-5 rounded-2xl flex flex-col sm:flex-row gap-5">
            <img src="https://image.tmdb.org/t/p/w500${currentShowData.poster_path}" class="w-32 h-44 object-cover rounded-xl shrink-0 mx-auto sm:mx-0 border border-gray-800">
            <div class="space-y-2">
                <h3 class="font-bold text-base text-red-500">Season ${selectedSeasonNum} Episode ${selectedEpisodeNum} - ${epName}</h3>
                <h4 class="text-xs font-semibold text-gray-400 uppercase">Sinopsis / Tóm tắt</h4>
                <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">${epOverview || ''}</p>
            </div>
        </div>

        <!-- 6. SEASON NAVIGATION -->
        <div class="bg-slate-900 border border-gray-800 p-5 rounded-2xl space-y-3">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Seasons</h3>
            <div class="flex flex-wrap gap-2">
                ${currentShowData.seasons.map(s => s.season_number > 0 ? `<a href="?id=${showId}&s=${s.season_number}&e=1" class="px-3 py-1.5 rounded-xl text-xs bg-slate-800 text-gray-300 border border-gray-700 hover:bg-red-600 hover:text-white transition">Season ${s.season_number}</a>` : '').join('')}
            </div>
        </div>

        <!-- 7. ALL EPISODES NAVIGATION -->
        <div class="bg-slate-900 border border-gray-800 p-5 rounded-2xl space-y-3">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">All Episodes</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                ${Object.keys(allSeasonsEpisodesData).map(sNum => allSeasonsEpisodesData[sNum].map(ep => `<a href="?id=${showId}&s=${sNum}&e=${ep.episode_number}" class="p-2.5 rounded-xl border border-gray-800 bg-black/40 text-gray-300 flex items-center justify-between hover:border-red-600 transition"><span class="font-bold text-xs text-red-400 mr-2">S${sNum}E${ep.episode_number}</span><span class="text-xs truncate">${ep.name || 'Episode ' + ep.episode_number}</span></a>`).join('')).join('')}
            </div>
        </div>

        <!-- 8. ACTORS -->
        <div class="bg-slate-900 border border-gray-800 p-5 rounded-2xl space-y-3">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Cast / Aktor</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                ${currentCast.slice(0, 8).map(actor => `<div class="bg-slate-950 border border-gray-800 p-2.5 rounded-xl text-center space-y-1"><img src="${actor.profile_path ? 'https://image.tmdb.org/t/p/w185' + actor.profile_path : 'https://placehold.co/185x278'}" class="w-full h-24 object-cover rounded-lg"><h5 class="font-bold text-xs text-white truncate">${actor.name}</h5><p class="text-[10px] text-gray-400 truncate">${actor.character || '-'}</p></div>`).join('')}
            </div>
        </div>

    </div>

    <!-- 9. STICKY BANNER FOOTER (Responsive 728x90 desktop / scaled mobile) -->
    <footer class="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-gray-800 py-2 px-4 flex justify-center">
        <div class="w-full max-w-[728px] h-[90px] bg-black/80 rounded-lg overflow-hidden flex items-center justify-center ad-footer-frame">
            <script>var atOptions_2 = {'key':'2d751854ce36e13fefddaa58f93251e2','format':'iframe','height':90,'width':728,'params':{}};</script>
            <script src="https://buffcasualwhine.com/2d751854ce36e13fefddaa58f93251e2/invoke.js"></script>
        </div>
    </footer>
</body>
</html>`;

    const textarea = document.getElementById('exported-code-preview');
    if(textarea) textarea.value = templateCode;
}
