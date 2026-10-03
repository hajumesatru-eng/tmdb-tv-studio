const TMDB_API_KEY = 'd5a549dec10563dc56696d42f581a771'; // Ganti dengan API Key TMDB Anda yang valid
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

let currentShowData = null;
let currentLanguage = 'th'; // Default Thai, can be 'vi'
let selectedSeasonNum = 1;
let selectedEpisodeNum = 1;

// Terjemahan UI statis (Thai & Vietnamese)
const i18n = {
    th: {
        nav_generator: "เครื่องมือสร้าง (Generator)",
        nav_preview: "ดูตัวอย่างสด (Live Preview)",
        ui_brand_title: "สตูดิโอสตรีมมิ่ง",
        gen_heading: "TMDB Template & URL Generator",
        gen_subheading: "ป้อน TMDB ID atau URL เพื่อสร้างหน้าสตรีมมิ่งอัตโนมัติพร้อมระบบอัปเดตตอนสดแบบเรียลไทม์",
        ph_title: "ยังไม่ได้โหลดข้อมูลซีรีส์ใดๆ",
        ph_sub: "ป้อน TMDB ID หรือเลือกตัวอย่างยอดนิยมด้านล่างเพื่อเริ่มต้น",
        txt_season_list_title: "รายการซีซั่นและตัวสร้าง URL อัตโนมัติ",
        btn_copy_url: "คัดลอก URL",
        txt_ep_desc: "เลือกตอนด้านล่างเพื่อทดสอบหรือคัดลอกลิงก์ URL แต่ละตอน:",
        export_title: "ส่งออกโค้ด HTML (Auto-Update Realtime)",
        export_desc: "โค้ดเทมเพลตที่เชื่อมต่อ API TMDB โดยตรง ทำให้หน้าเว็บอัปเดตตอนอัตโนมัติแม้จะ deploy แล้ว",
        btn_download_html: "ดาวน์โหลด HTML",
        btn_preview_page: "ดูตัวอย่างหน้าสตรีมมิ่ง",
        ad_label: "Sponsored Advertisement (300x250)",
        btn_vip: "Watch Now No Ads / VIP Access",
        synopsis_heading: "เรื่องย่อตอน",
        season_header: "รายการซีซั่นทั้งหมด",
        episode_header: "รายการตอนทั้งหมด",
        cast_heading: "นักแสดงนำ (Cast)",
        btn_back: "กลับไปยังหน้า Generator"
    },
    vi: {
        nav_generator: "Trình tạo (Generator)",
        nav_preview: "Xem trước trực tiếp (Live Preview)",
        ui_brand_title: "Studio Phát Trực Tuyến",
        gen_heading: "Trình tạo Mẫu & URL TMDB",
        gen_subheading: "Nhập ID hoặc URL TMDB để tự động tạo trang phát trực tuyến với hệ thống cập nhật tập phim thời gian thực",
        ph_title: "Chưa có dữ liệu phim nào được tải",
        ph_sub: "Nhập ID TMDB hoặc chọn mẫu phổ biến bên dưới để bắt đầu",
        txt_season_list_title: "Danh sách Mùa & Trình tạo URL tự động",
        btn_copy_url: "Sao chép URL",
        txt_ep_desc: "Chọn tập bên dưới để kiểm tra hoặc sao chép liên kết URL từng tập:",
        export_title: "Xuất mã HTML (Tự động cập nhật trực tiếp)",
        export_desc: "Mã mẫu kết nối trực tiếp với API TMDB, giúp trang tự động cập nhật tập mới ngay cả sau khi đã deploy",
        btn_download_html: "Tải xuống HTML",
        btn_preview_page: "Xem trước trang phát",
        ad_label: "Quảng cáo tài trợ (300x250)",
        btn_vip: "Xem ngay Không Quảng cáo / Truy cập VIP",
        synopsis_heading: "Tóm tắt tập phim",
        season_header: "Danh sách các mùa",
        episode_header: "Danh sách các tập",
        cast_heading: "Diễn viên chính (Cast)",
        btn_back: "Quay lại trang Generator"
    }
};

function changeLanguage() {
    const select = document.getElementById('lang-select');
    if (!select) return;
    currentLanguage = select.value;
    
    // Update HTML lang attribute
    const htmlRoot = document.getElementById('html-root');
    if(htmlRoot) htmlRoot.setAttribute('lang', currentLanguage);

    // Apply translations to elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLanguage][key]) {
            el.textContent = i18n[currentLanguage][key];
        }
    });

    if (currentShowData) {
        renderShowDetails(currentShowData);
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
        if(footerAds) footerAds.classList.add('hidden');
        if(genBtn) { genBtn.className = "text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md bg-red-600 text-white transition"; }
        if(prevBtn) { prevBtn.className = "text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md text-gray-300 hover:text-white transition"; }
    } else {
        if (!currentShowData) {
            alert(currentLanguage === 'th' ? 'กรุณาเลือกหรือสร้างซีรีส์ก่อนดูตัวอย่าง' : 'Vui lòng chọn hoặc tạo series trước khi xem trước');
            return;
        }
        genView.classList.add('hidden');
        prevView.classList.remove('hidden');
        if(footerAds) footerAds.classList.remove('hidden');
        if(prevBtn) { prevBtn.className = "text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md bg-red-600 text-white transition"; }
        if(genBtn) { genBtn.className = "text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md text-gray-300 hover:text-white transition"; }
        
        loadPreviewData(selectedSeasonNum, selectedEpisodeNum);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function fetchTMDBData(customId = null) {
    let inputVal = customId || document.getElementById('tmdb-input').value.trim();
    const errorBox = document.getElementById('error-box');
    if(errorBox) errorBox.classList.add('hidden');

    if (!inputVal) {
        showError(currentLanguage === 'th' ? 'กรุณากรอก TMDB ID หรือ URL' : 'Vui lòng nhập ID hoặc URL TMDB');
        return;
    }

    // Extract ID from URL if user inputted full TMDB URL
    let showId = inputVal;
    const urlMatch = inputVal.match(/\/tv\/(\d+)/);
    if (urlMatch && urlMatch[1]) {
        showId = urlMatch[1];
    }

    const tmdbLang = currentLanguage === 'th' ? 'th-TH' : 'vi-VN';

    try {
        // Fetch show details, credits, and translated overview
        const res = await fetch(`${TMDB_BASE_URL}/tv/${showId}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`);
        if (!res.ok) throw new Error("Failed to fetch from TMDB");
        const data = await res.json();

        // Fetch fallback English if Thai/Vietnamese overview is empty
        if (!data.overview) {
            const resEn = await fetch(`${TMDB_BASE_URL}/tv/${showId}?api_key=${TMDB_API_KEY}&language=en-US`);
            const dataEn = await resEn.json();
            data.overview = dataEn.overview || '';
        }

        // Fetch Credits (Cast)
        const creditsRes = await fetch(`${TMDB_BASE_URL}/tv/${showId}/credits?api_key=${TMDB_API_KEY}`);
        const creditsData = await creditsRes.json();
        data.credits = creditsData.cast || [];

        currentShowData = data;
        selectedSeasonNum = data.seasons && data.seasons.length > 0 ? data.seasons[0].season_number : 1;
        if(selectedSeasonNum === 0 && data.seasons.length > 1) selectedSeasonNum = data.seasons[1].season_number;
        selectedEpisodeNum = 1;

        renderShowDetails(data);
        document.getElementById('generator-placeholder').classList.add('hidden');
        document.getElementById('generator-results').classList.remove('hidden');

        // Update URL query parameters for dynamic generation testing
        const newUrl = `${window.location.pathname}?id=${showId}&s=${selectedSeasonNum}&e=${selectedEpisodeNum}`;
        window.history.pushState({path: newUrl}, '', newUrl);

    } catch (err) {
        console.error(err);
        showError(currentLanguage === 'th' ? 'ไม่พบข้อมูลซีรีส์นี้ หรือ API Key ไม่ถูกต้อง' : 'Không tìm thấy series hoặc API Key không hợp lệ');
    }
}

function showError(msg) {
    const errorBox = document.getElementById('error-box');
    if(errorBox) {
        errorBox.textContent = msg;
        errorBox.classList.remove('hidden');
    }
}

function loadSampleShow(id) {
    document.getElementById('tmdb-input').value = id;
    fetchTMDBData(id);
}

async function renderShowDetails(data) {
    const title = data.name || data.original_name;
    const year = data.first_air_date ? data.first_air_date.split('-')[0] : '';
    const rating = data.vote_average ? data.vote_average.toFixed(1) : '0.0';
    const poster = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'https://placehold.co/500x750/111827/ffffff?text=No+Image';

    // Generator View Elements
    document.getElementById('show-poster').src = poster;
    document.getElementById('show-title').textContent = title;
    document.getElementById('show-meta').textContent = `${year} • ⭐ ${rating}`;
    document.getElementById('show-status').textContent = data.status || 'Ongoing';
    document.getElementById('show-synopsis').textContent = data.overview || (currentLanguage === 'th' ? 'ไม่มีเรื่องย่อ' : 'Không có tóm tắt');

    // SEO Meta update
    document.getElementById('page-seo-title').textContent = `${title} - Season ${selectedSeasonNum} Episode ${selectedEpisodeNum} | Streaming`;
    document.getElementById('page-seo-desc').textContent = data.overview ? data.overview.substring(0, 150) : '';

    // Render Season Tabs in Generator
    const seasonTabs = document.getElementById('gen-season-tabs');
    seasonTabs.innerHTML = '';
    data.seasons.forEach(season => {
        if (season.season_number === 0) return; // skip specials
        const btn = document.createElement('button');
        btn.className = `px-3 py-1.5 rounded-xl text-xs font-bold transition border ${season.season_number === selectedSeasonNum ? 'bg-red-600 border-red-500 text-white' : 'bg-black/40 border-gray-800 text-gray-300 hover:border-gray-600'}`;
        btn.textContent = `Season ${season.season_number}`;
        btn.onclick = () => {
            selectedSeasonNum = season.season_number;
            selectedEpisodeNum = 1;
            renderShowDetails(currentShowData);
        };
        seasonTabs.appendChild(btn);
    });

    // Fetch and render episodes for current season
    await loadSeasonEpisodesForGenerator(data.id, selectedSeasonNum);
    generateExportCode();
}

async function loadSeasonEpisodesForGenerator(showId, seasonNum) {
    const epContainer = document.getElementById('episodes-container');
    epContainer.innerHTML = `<div class="text-xs text-gray-400 p-2">${currentLanguage === 'th' ? 'กำลังโหลดตอน...' : 'Đang tải tập...'}</div>`;

    try {
        const tmdbLang = currentLanguage === 'th' ? 'th-TH' : 'vi-VN';
        let res = await fetch(`${TMDB_BASE_URL}/tv/${showId}/season/${seasonNum}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`);
        let seasonData = await res.json();

        if (!seasonData.episodes || seasonData.episodes.length === 0) {
            const resEn = await fetch(`${TMDB_BASE_URL}/tv/${showId}/season/${seasonNum}?api_key=${TMDB_API_KEY}&language=en-US`);
            seasonData = await resEn.json();
        }

        epContainer.innerHTML = '';
        if (seasonData.episodes) {
            seasonData.episodes.forEach(ep => {
                const isSelected = ep.episode_number === selectedEpisodeNum;
                const div = document.createElement('div');
                div.className = `p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${isSelected ? 'bg-red-950/30 border-red-600/60 text-white' : 'bg-black/40 border-gray-800 text-gray-300 hover:border-gray-700'}`;
                div.innerHTML = `
                    <div class="truncate pr-2">
                        <div class="font-bold text-xs">Ep ${ep.episode_number}: ${ep.name}</div>
                        <div class="text-[10px] text-gray-500">${ep.air_date || ''}</div>
                    </div>
                    <span class="text-[10px] bg-slate-800 px-2 py-1 rounded text-gray-300 shrink-0">${currentLanguage === 'th' ? 'เลือก' : 'Chọn'}</span>
                `;
                div.onclick = () => {
                    selectedEpisodeNum = ep.episode_number;
                    loadSeasonEpisodesForGenerator(showId, seasonNum);
                    updateCurrentUrlDisplay(showId, seasonNum, ep.episode_number);
                };
                epContainer.appendChild(div);
            });
        }
        updateCurrentUrlDisplay(showId, seasonNum, selectedEpisodeNum);
    } catch (e) {
        epContainer.innerHTML = `<div class="text-xs text-red-400">Error loading episodes</div>`;
    }
}

function updateCurrentUrlDisplay(showId, sNum, eNum) {
    const urlDisplay = document.getElementById('current-selected-url');
    const generatedUrl = `${window.location.origin}${window.location.pathname}?id=${showId}&s=${sNum}&e=${eNum}`;
    if(urlDisplay) urlDisplay.textContent = `URL: ${generatedUrl}`;
}

function copyCurrentUrl() {
    const urlText = document.getElementById('current-selected-url').textContent.replace('URL: ', '');
    navigator.clipboard.writeText(urlText);
    alert(currentLanguage === 'th' ? 'คัดลอก URL สำเร็จ!' : 'Đã sao chép URL!');
}

async function loadPreviewData(seasonNum, episodeNum) {
    if (!currentShowData) return;
    const showId = currentShowData.id;
    const title = currentShowData.name;
    const year = currentShowData.first_air_date ? currentShowData.first_air_date.split('-')[0] : '';
    const rating = currentShowData.vote_average ? currentShowData.vote_average.toFixed(1) : '0.0';

    // 1. Title & Meta
    document.getElementById('preview-show-title').textContent = title;
    document.getElementById('preview-meta').textContent = `${year} • ⭐ ${rating}`;

    // 3. Fake Video Player with Backdrop/Thumbnail
    const backdropPath = currentShowData.backdrop_path ? `https://image.tmdb.org/t/p/original${currentShowData.backdrop_path}` : '';
    const playerBox = document.getElementById('player-backdrop');
    if (backdropPath) {
        playerBox.style.backgroundImage = `url('${backdropPath}')`;
    }
    document.getElementById('preview-ep-label').textContent = `${title} - S${seasonNum} E${episodeNum}`;

    // Fetch specific episode details for synopsis
    let epName = `Episode ${episodeNum}`;
    let epOverview = currentShowData.overview;
    try {
        const tmdbLang = currentLanguage === 'th' ? 'th-TH' : 'vi-VN';
        let res = await fetch(`${TMDB_BASE_URL}/tv/${showId}/season/${seasonNum}/episode/${episodeNum}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`);
        let epData = await res.json();
        if (epData.name) epName = epData.name;
        if (epData.overview) epOverview = epData.overview;
    } catch (e) {
        console.error(e);
    }

    // 5. Poster + Synopsis
    const poster = currentShowData.poster_path ? `https://image.tmdb.org/t/p/w500${currentShowData.poster_path}` : 'https://placehold.co/500x750/111827/ffffff?text=No+Image';
    document.getElementById('preview-poster').src = poster;
    document.getElementById('preview-player-title').textContent = `Season ${seasonNum} Episode ${episodeNum} : ${epName}`;
    document.getElementById('preview-synopsis').textContent = epOverview || (currentLanguage === 'th' ? 'ไม่มีเรื่องย่อสำหรับตอนนี้' : 'Không có tóm tắt cho tập này');

    // 6. Season Navigation in Preview
    const seasonContainer = document.getElementById('preview-seasons-container');
    seasonContainer.innerHTML = '';
    currentShowData.seasons.forEach(s => {
        if (s.season_number === 0) return;
        const btn = document.createElement('button');
        btn.className = `px-3 py-1.5 rounded-xl text-xs font-bold transition border ${s.season_number === seasonNum ? 'bg-red-600 border-red-500 text-white' : 'bg-black/40 border-gray-800 text-gray-300 hover:border-gray-600'}`;
        btn.textContent = `Season ${s.season_number}`;
        btn.onclick = () => {
            selectedSeasonNum = s.season_number;
            selectedEpisodeNum = 1;
            loadPreviewData(selectedSeasonNum, selectedEpisodeNum);
        };
        seasonContainer.appendChild(btn);
    });

    // 7. All Episodes Navigation in Preview
    await renderPreviewEpisodesList(showId, seasonNum, episodeNum);

    // 8. Actors / Cast
    const castContainer = document.getElementById('preview-cast-container');
    castContainer.innerHTML = '';
    if (currentShowData.credits && currentShowData.credits.length > 0) {
        currentShowData.credits.slice(0, 8).forEach(actor => {
            const actorImg = actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://placehold.co/185x278/111827/ffffff?text=No+Photo';
            const card = document.createElement('div');
            card.className = 'bg-slate-900 border border-gray-800 rounded-xl p-2 text-center space-y-1.5';
            card.innerHTML = `
                <img src="${actorImg}" alt="${actor.name}" class="w-full h-28 object-cover rounded-lg">
                <div class="font-bold text-[11px] truncate text-white">${actor.name}</div>
                <div class="text-[9px] text-gray-400 truncate">${actor.character || ''}</div>
            `;
            castContainer.appendChild(card);
        });
    }

    // Update Browser History URL & SEO for this specific Season/Episode
    const newUrl = `${window.location.pathname}?id=${showId}&s=${seasonNum}&e=${episodeNum}`;
    window.history.pushState({path: newUrl}, '', newUrl);
    document.getElementById('page-seo-title').textContent = `${title} - S${seasonNum} E${episodeNum} (${epName}) | Streaming`;
}

async function renderPreviewEpisodesList(showId, seasonNum, currentEpNum) {
    const epContainer = document.getElementById('preview-episodes-container');
    epContainer.innerHTML = `<div class="text-xs text-gray-400 p-2">Loading episodes...</div>`;

    try {
        const tmdbLang = currentLanguage === 'th' ? 'th-TH' : 'vi-VN';
        let res = await fetch(`${TMDB_BASE_URL}/tv/${showId}/season/${seasonNum}?api_key=${TMDB_API_KEY}&language=${tmdbLang}`);
        let seasonData = await res.json();

        if (!seasonData.episodes || seasonData.episodes.length === 0) {
            const resEn = await fetch(`${TMDB_BASE_URL}/tv/${showId}/season/${seasonNum}?api_key=${TMDB_API_KEY}&language=en-US`);
            seasonData = await resEn.json();
        }

        epContainer.innerHTML = '';
        if (seasonData.episodes) {
            seasonData.episodes.forEach(ep => {
                const isSelected = ep.episode_number === currentEpNum;
                const div = document.createElement('div');
                div.className = `p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${isSelected ? 'bg-red-950/30 border-red-600/60 text-white' : 'bg-black/40 border-gray-800 text-gray-300 hover:border-gray-700'}`;
                div.innerHTML = `
                    <div class="truncate pr-2">
                        <div class="font-bold text-xs">Ep ${ep.episode_number}: ${ep.name}</div>
                        <div class="text-[10px] text-gray-500">${ep.air_date || ''}</div>
                    </div>
                    <span class="text-[10px] bg-red-600/20 text-red-400 border border-red-600/30 px-2 py-1 rounded shrink-0">${currentLanguage === 'th' ? 'เล่น' : 'Xem'}</span>
                `;
                div.onclick = () => {
                    selectedEpisodeNum = ep.episode_number;
                    loadPreviewData(seasonNum, selectedEpisodeNum);
                };
                epContainer.appendChild(div);
            });
        }
    } catch (e) {
        epContainer.innerHTML = `<div class="text-xs text-red-400">Error loading episodes</div>`;
    }
}

function alertPlaySim() {
    alert(currentLanguage === 'th' ? 'กำลังเปิดเครื่องเล่นวิดีโอสตรีมมิ่ง...' : 'Đang mở trình phát video trực tuyến...');
}

function alertCTA(e) {
    e.preventDefault();
    alert(currentLanguage === 'th' ? 'ไปที่ลิงก์ VIP / ไม่มีโฆษณาเรียบร้อยแล้ว' : 'Đã chuyển đến liên kết VIP / Không quảng cáo thành công');
}

function generateExportCode() {
    if (!currentShowData) return;
    const showId = currentShowData.id;
    const backdropPath = currentShowData.backdrop_path ? `https://image.tmdb.org/t/p/original${currentShowData.backdrop_path}` : (currentShowData.poster_path ? `https://image.tmdb.org/t/p/original${currentShowData.poster_path}` : '');
    
    const templateCode = `<!DOCTYPE html>
<html lang="${currentLanguage}" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentShowData.name} - Streaming</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-950 text-white min-h-screen p-4 sm:p-8 space-y-6">
    <div class="max-w-4xl mx-auto space-y-6">
        <!-- 1. Title -->
        <div class="bg-slate-900 border border-gray-800 p-5 rounded-2xl">
            <h1 class="text-2xl font-black">${currentShowData.name}</h1>
            <p class="text-xs text-gray-400 mt-1">TMDB ID: ${showId} (Auto-Update Realtime Enabled)</p>
        </div>

        <!-- 2. Ads Banner 300x250 -->
        <div class="flex justify-center my-4">
            <div class="w-[300px] h-[250px] bg-slate-900 border border-gray-800 flex items-center justify-center rounded-lg overflow-hidden">
                <script>var atOptions_1 = {'key':'53541ca00eed825e8c431c12f7418ac0','format':'iframe','height':250,'width':300,'params':{}};</script>
                <script src="https://buffcasualwhine.com/53541ca00eed825e8c431c12f7418ac0/invoke.js"></script>
            </div>
        </div>

       <!-- 3. Fake Video Player with TMDB Thumbnail -->
        <div class="aspect-video bg-black rounded-2xl relative overflow-hidden shadow-2xl border border-gray-800 bg-cover bg-center flex items-center justify-center" style="background-image: url('${backdropPath}');">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
            <div class="relative z-10 flex flex-col items-center cursor-pointer" onclick="alert('${currentLanguage === 'th' ? 'กำลังเปิดเครื่องเล่นวิดีโอ...' : 'Đang mở trình phát video...'}')">
                <div class="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl shadow-xl hover:scale-110 transition"><i class="fa-solid fa-play ml-1"></i></div>
                <span class="mt-3 text-xs font-bold bg-black/80 px-3 py-1 rounded-full text-white">${currentShowData.name} - S${selectedSeasonNum} E${selectedEpisodeNum}</span>
            </div>
        </div>

        <!-- 4. CTA Watch Now No Ads -->
        <a href="https://interlinecustomroofingllc.com/4/381eaab06b0c4afd4f526aab207f6ca2" class="block w-full bg-red-600 hover:bg-red-700 text-white font-bold text-center py-3.5 rounded-xl shadow-lg transition">
            <i class="fa-solid fa-shield-halved mr-2"></i> Watch Now No Ads / VIP Access
        </a>

        <!-- 5. Poster + Synopsis -->
        <div class="bg-slate-900 border border-gray-800 p-5 rounded-2xl flex flex-col sm:flex-row gap-5">
            <img src="https://image.tmdb.org/t/p/w500${currentShowData.poster_path}" class="w-32 h-44 object-cover rounded-xl shrink-0 mx-auto sm:mx-0">
            <div class="space-y-2">
                <h3 class="font-bold text-red-500">Season ${selectedSeasonNum} Episode ${selectedEpisodeNum}</h3>
                <h4 class="text-xs font-semibold text-gray-400 uppercase">Sinopsis</h4>
                <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">${currentShowData.overview || ''}</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    const textarea = document.getElementById('exported-code-preview');
    if(textarea) textarea.value = templateCode;
}

function exportTemplateCode() {
    const code = document.getElementById('exported-code-preview').value;
    if (!code) return;
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentShowData ? currentShowData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'streaming'}_auto.html`;
    a.click();
    URL.revokeObjectURL(url);
}

// Auto-load if query params exist on startup
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    const sParam = urlParams.get('s');
    const eParam = urlParams.get('e');

    if (idParam) {
        document.getElementById('tmdb-input').value = idParam;
        if (sParam) selectedSeasonNum = parseInt(sParam);
        if (eParam) selectedEpisodeNum = parseInt(eParam);
        fetchTMDBData(idParam);
    }
});
