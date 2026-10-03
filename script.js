const translations = {
    th: {
        ui_brand_title: "สตูดิโอสตรีมมิ่ง",
        nav_generator: "เครื่องมือสร้าง (Generator)",
        nav_preview: "ดูตัวอย่างสด (Live Preview)",
        gen_heading: "TMDB Template & URL Generator",
        gen_subheading: "ป้อน TMDB ID หรือ URL ซีรีส์เพื่อสร้างหน้าสตรีมมิ่งอัตโนมัติ พร้อมโครงสร้าง UI ตามลำดับที่กำหนดและรองรับ SEO แต่ละหน้า",
        ph_title: "ยังไม่ได้โหลดข้อมูลซีรีส์ใดๆ",
        ph_sub: "ป้อน TMDB ID หรือเลือกตัวอย่างยอดนิยมด้านล่างเพื่อเริ่มต้น",
        btn_preview_page: "ดูตัวอย่างหน้าสตรีมมิ่ง",
        txt_season_list_title: "รายการซีซั่นและตัวสร้าง URL อัตโนมัติ",
        btn_copy_url: "คัดลอก URL",
        txt_ep_desc: "เลือกซีซั่นและตอนด้านล่างเพื่อสร้างลิงก์แยกหน้าอัตโนมัติ:",
        export_title: "ส่งออกโค้ด HTML (พร้อมโครงสร้าง SEO และ Ads)",
        export_desc: "โค้ดเทมเพลตประกอบด้วยโครงสร้าง UI ตามลำดับที่คุณต้องการ พร้อมรองรับ SEO ต่อตอน",
        btn_download_html: "ดาวน์โหลด HTML",
        btn_back: "กลับไปยังหน้า Generator",
        ad_label: "Sponsored Advertisement (300x250)",
        btn_vip: "Watch Now No Ads / VIP Access",
        synopsis_heading: "เรื่องย่อตอน",
        season_header: "รายการซีซั่นทั้งหมด",
        episode_header: "รายการตอนทั้งหมด",
        cast_heading: "นักแสดงนำ (Cast)"
    },
    vi: {
        ui_brand_title: "Streaming Studio",
        nav_generator: "Công cụ tạo (Generator)",
        nav_preview: "Xem trước (Live Preview)",
        gen_heading: "Trình tạo URL & Mẫu TMDB",
        gen_subheading: "Nhập ID TMDB hoặc URL phim bộ để tạo trang phát trực tuyến tự động với cấu trúc UI chuẩn SEO theo từng tập.",
        ph_title: "Chưa có dữ liệu phim nào được tải",
        ph_sub: "Nhập ID TMDB hoặc chọn mẫu phổ biến bên dưới để bắt đầu",
        btn_preview_page: "Xem trước trang phát",
        txt_season_list_title: "Danh sách mùa & Trình tạo URL tự động",
        btn_copy_url: "Sao chép URL",
        txt_ep_desc: "Chọn mùa và tập bên dưới để tạo liên kết trang riêng biệt:",
        export_title: "Xuất mã HTML (Có kèm Quảng cáo & SEO)",
        export_desc: "Mã mẫu chứa đầy đủ cấu trúc UI theo thứ tự yêu cầu và tối ưu SEO cho từng tập.",
        btn_download_html: "Tải xuống HTML",
        btn_back: "Quay lại trang Generator",
        ad_label: "Quảng cáo tài trợ (300x250)",
        btn_vip: "Xem ngay không quảng cáo / Truy cập VIP",
        synopsis_heading: "Tóm tắt tập phim",
        season_header: "Tất cả các mùa",
        episode_header: "Danh sách tập phim",
        cast_heading: "Diễn viên chính (Cast)"
    }
};

let currentLang = 'th';
let currentShowData = null;
let currentSeasonIndex = 1;
let currentEpisodeIndex = 1;
let seasonEpisodesCache = {};

function changeLanguage() {
    const select = document.getElementById('lang-select');
    currentLang = select.value;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });

    if(currentShowData) {
        renderGeneratorResults();
        renderPreviewContent();
    }
}

function switchView(viewName) {
    const genView = document.getElementById('view-generator');
    const prevView = document.getElementById('view-preview');
    const footerAds = document.getElementById('preview-footer-ads');
    const genBtn = document.getElementById('nav-gen-btn');
    const prevBtn = document.getElementById('nav-prev-btn');

    if(viewName === 'generator') {
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
        renderPreviewContent();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadSampleShow(id) {
    document.getElementById('tmdb-input').value = id;
    await fetchTMDBData();
}

async function fetchTMDBData() {
    const inputVal = document.getElementById('tmdb-input').value.trim();
    const errorBox = document.getElementById('error-box');
    errorBox.classList.add('hidden');

    if(!inputVal) {
        showError("กรุณากรอก TMDB ID หรือ URL ซีรีส์");
        return;
    }

    // Extract ID if URL is pasted
    let tmdbId = inputVal;
    if(inputVal.includes('themoviedb.org')) {
        const parts = inputVal.split('/');
        const foundId = parts.find(p => !isNaN(p) && p !== '');
        if(foundId) tmdbId = foundId;
    }

    // Fallback simulation / API fetch mock
    try {
        // Using public CORS proxy or mock fallback if key is missing
        const apiKey = 'd5a549dec10563dc56696d42f581a771'; // Public demo key
        let res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}&language=en-US`);
        if(!res.ok) throw new Error("ไม่พบข้อมูลซีรีส์จาก TMDB ID นี้");
        
        let data = await res.json();
        
        // Fetch credits
        let credRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/credits?api_key=${apiKey}`);
        let credData = await credRes.json();
        data.cast = credData.cast ? credData.cast.slice(0, 8) : [];

        currentShowData = data;
        currentSeasonIndex = data.seasons && data.seasons.length > 0 ? data.seasons[0].season_number : 1;
        if(currentSeasonIndex === 0 && data.seasons.length > 1) currentSeasonIndex = data.seasons[1].season_number;
        currentEpisodeIndex = 1;

        await loadSeasonDetails(currentShowData.id, currentSeasonIndex);
        renderGeneratorResults();
        switchView('preview');

    } catch (err) {
        // Fallback robust mock dataset for demonstration if offline/rate-limited
        currentShowData = getMockShowData(tmdbId);
        currentSeasonIndex = 1;
        currentEpisodeIndex = 1;
        renderGeneratorResults();
        switchView('preview');
    }
}

function showError(msg) {
    const eb = document.getElementById('error-box');
    eb.innerText = msg;
    eb.classList.remove('hidden');
}

function getMockShowData(id) {
    return {
        id: id,
        name: "Breaking Bad (Sample)",
        overview: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's financial future.",
        poster_path: "/ztkgnbLOAtGNrDGNqgXW1u9xJ8K.jpg",
        backdrop_path: "/tsRy6ICGNnzaQ7sOOr6F8Fv833f.jpg",
        first_air_date: "2008-01-20",
        vote_average: 8.9,
        status: "Ended",
        number_of_seasons: 5,
        seasons: [
            { season_number: 1, name: "Season 1", episode_count: 7, poster_path: "/1BP4xYv9ZG4ZVHkL7ocOziBbSYh.jpg" },
            { season_number: 2, name: "Season 2", episode_count: 13, poster_path: "/eNOifIdiLpSBKwsC85m0R1q9D7v.jpg" }
        ],
        cast: [
            { name: "Bryan Cranston", character: "Walter White", profile_path: "/d8d9U3T50k8uF7lB0kS97G69bM1.jpg" },
            { name: "Aaron Paul", character: "Jesse Pinkman", profile_path: "/u2yF223w1mJtLzC5W3w7x3C16X1.jpg" }
        ]
    };
}

async function loadSeasonDetails(tvId, seasonNum) {
    currentSeasonIndex = seasonNum;
    if(seasonEpisodesCache[`${tvId}_${seasonNum}`]) {
        renderEpisodesList();
        return;
    }
    try {
        const apiKey = '2d2b1f1a54a938c5fcf72dd40cfa9ee6';
        let res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNum}?api_key=${apiKey}&language=en-US`);
        let data = await res.json();
        seasonEpisodesCache[`${tvId}_${seasonNum}`] = data.episodes || [];
    } catch(e) {
        // Fallback mock episodes
        let eps = [];
        let count = 10;
        if(currentShowData && currentShowData.seasons) {
            let sObj = currentShowData.seasons.find(s => s.season_number === seasonNum);
            if(sObj) count = sObj.episode_count || 10;
        }
        for(let i=1; i<=count; i++) {
            eps.push({
                episode_number: i,
                name: `Episode ${i} (${currentLang === 'th' ? 'ตอนที่ ' + i : 'Tập ' + i})`,
                overview: `Detailed description for episode ${i} of season ${seasonNum}. Translated automatically into Thai & Vietnamese for optimal streaming user experience.`,
                still_path: currentShowData.backdrop_path
            });
        }
        seasonEpisodesCache[`${tvId}_${seasonNum}`] = eps;
    }
    renderEpisodesList();
}

function renderGeneratorResults() {
    if(!currentShowData) return;

    document.getElementById('generator-placeholder').classList.add('hidden');
    document.getElementById('generator-results').classList.remove('hidden');

    // Left info card
    document.getElementById('show-title').innerText = currentShowData.name;
    document.getElementById('show-meta').innerText = `${(currentShowData.first_air_date||'2023').substring(0,4)} • ⭐ ${currentShowData.vote_average || '8.0'}`;
    document.getElementById('show-status').innerText = currentShowData.status || 'Ongoing';
    document.getElementById('show-poster').src = currentShowData.poster_path ? `https://image.tmdb.org/t/p/w500${currentShowData.poster_path}` : 'https://placehold.co/500x750/111827/ffffff?text=No+Image';
    
    // Auto translate simulation for synopsis
    let translatedSynopsis = currentShowData.overview;
    if(currentLang === 'th') {
        translatedSynopsis = `[แปลไทยอัตโนมัติ]: ${currentShowData.overview}`;
    } else {
        translatedSynopsis = `[Bản dịch tiếng Việt tự động]: ${currentShowData.overview}`;
    }
    document.getElementById('show-synopsis').innerText = translatedSynopsis;

    // Season tabs for generator
    const tabsContainer = document.getElementById('gen-season-tabs');
    tabsContainer.innerHTML = '';
    
    const seasons = currentShowData.seasons || [{season_number: 1, name: 'Season 1'}];
    seasons.forEach(s => {
        const btn = document.createElement('button');
        btn.className = `px-3 py-1.5 rounded-lg text-xs font-bold transition ${s.season_number === currentSeasonIndex ? 'bg-red-600 text-white' : 'bg-slate-900 border border-gray-800 text-gray-300 hover:text-white'}`;
        btn.innerText = s.name || `Season ${s.season_number}`;
        btn.onclick = async () => {
            await loadSeasonDetails(currentShowData.id, s.season_number);
            renderGeneratorResults();
        };
        tabsContainer.appendChild(btn);
    });

    renderEpisodesList();
    generateExportCode();
}

function renderEpisodesList() {
    const container = document.getElementById('episodes-container');
    container.innerHTML = '';
    
    const eps = seasonEpisodesCache[`${currentShowData.id}_${currentSeasonIndex}`] || [];
    eps.forEach(ep => {
        const div = document.createElement('div');
        const isSelected = ep.episode_number === currentEpisodeIndex;
        div.className = `p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${isSelected ? 'bg-red-600/20 border-red-600 text-white' : 'bg-black/40 border-gray-800 text-gray-300 hover:border-gray-600'}`;
        
        const epTitle = currentLang === 'th' ? `ตอนที่ ${ep.episode_number}: ${ep.name}` : `Tập ${ep.episode_number}: ${ep.name}`;
        div.innerHTML = `
            <div class="truncate text-xs font-semibold pr-2"><i class="fa-solid fa-play mr-1.5 text-red-500"></i> ${epTitle}</div>
            <span class="text-[10px] px-2 py-0.5 rounded bg-black/60 text-gray-400 shrink-0">S${currentSeasonIndex}E${ep.episode_number}</span>
        `;
        div.onclick = () => {
            currentEpisodeIndex = ep.episode_number;
            renderEpisodesList();
            renderPreviewContent();
            updateSelectedUrlDisplay();
        };
        container.appendChild(div);
    });

    updateSelectedUrlDisplay();
}

function updateSelectedUrlDisplay() {
    const urlBox = document.getElementById('current-selected-url');
    const cleanName = currentShowData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const generatedUrl = `https://yourdomain.com/watch/${cleanName}-season-${currentSeasonIndex}-episode-${currentEpisodeIndex}.html`;
    urlBox.innerText = `URL: ${generatedUrl}`;
}

function copyCurrentUrl() {
    const urlBox = document.getElementById('current-selected-url');
    const textToCopy = urlBox.innerText.replace('URL: ', '');
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alertBoxCustom("คัดลอก URL สำเร็จ!");
    } catch (e) {
        console.error(e);
    }
    document.body.removeChild(textarea);
}

function alertBoxCustom(msg) {
    const div = document.createElement('div');
    div.className = "fixed bottom-5 right-5 z-50 bg-red-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl animate-bounce";
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2500);
}

function renderPreviewContent() {
    if(!currentShowData) return;

    const eps = seasonEpisodesCache[`${currentShowData.id}_${currentSeasonIndex}`] || [];
    const currentEp = eps.find(e => e.episode_number === currentEpisodeIndex) || { episode_number: 1, name: "Episode 1", overview: currentShowData.overview, still_path: currentShowData.backdrop_path };

    // Update dynamic SEO & Page Titles based on Season & Episode
    const cleanName = currentShowData.name;
    const seoTitle = `${cleanName} Season ${currentSeasonIndex} Episode ${currentEpisodeIndex} - Watch Online Free`;
    const seoDesc = `Stream ${cleanName} S${currentSeasonIndex}E${currentEpisodeIndex} in HD with Thai and Vietnamese auto-translations.`;
    
    document.getElementById('page-seo-title').innerText = seoTitle;
    document.getElementById('page-seo-desc').content = seoDesc;

    // 1. JUDUL
    document.getElementById('preview-show-title').innerText = currentShowData.name;
    document.getElementById('preview-meta').innerText = `${(currentShowData.first_air_date||'2023').substring(0,4)} • Season ${currentSeasonIndex} Episode ${currentEpisodeIndex} • ⭐ ${currentShowData.vote_average || '8.5'}`;

    // 3. FAKE VIDEO PLAYER WITH TMDB BACKDROP/THUMBNAIL
    const backdropUrl = currentEp.still_path ? `https://image.tmdb.org/t/p/w1280${currentEp.still_path}` : (currentShowData.backdrop_path ? `https://image.tmdb.org/t/p/w1280${currentShowData.backdrop_path}` : 'https://placehold.co/1280x720/111827/ffffff?text=Player+Preview');
    const playerBackdrop = document.getElementById('player-backdrop');
    playerBackdrop.style.backgroundImage = `url('${backdropUrl}')`;
    document.getElementById('preview-ep-label').innerText = `${currentShowData.name} - S${currentSeasonIndex} E${currentEpisodeIndex}`;

    // 5. POSTER + SINOPSIS
    document.getElementById('preview-poster').src = currentShowData.poster_path ? `https://image.tmdb.org/t/p/w500${currentShowData.poster_path}` : 'https://placehold.co/500x750/111827/ffffff?text=No+Image';
    document.getElementById('preview-player-title').innerText = `Season ${currentSeasonIndex} Episode ${currentEpisodeIndex}: ${currentEp.name}`;
    
    let epSynopsis = currentEp.overview || currentShowData.overview;
    if(currentLang === 'th') {
        epSynopsis = `[แปลไทยอัตโนมัติ]: ${epSynopsis}`;
    } else {
        epSynopsis = `[Bản dịch tiếng Việt tự động]: ${epSynopsis}`;
    }
    document.getElementById('preview-synopsis').innerText = epSynopsis;

    // 6. SEASON NAVIGATION TABS IN PREVIEW
    const prevSeasonsContainer = document.getElementById('preview-seasons-container');
    prevSeasonsContainer.innerHTML = '';
    const seasons = currentShowData.seasons || [{season_number: 1, name: 'Season 1'}];
    seasons.forEach(s => {
        const btn = document.createElement('button');
        btn.className = `px-3 py-1.5 rounded-lg text-xs font-bold transition ${s.season_number === currentSeasonIndex ? 'bg-red-600 text-white' : 'bg-slate-900 border border-gray-800 text-gray-300 hover:text-white'}`;
        btn.innerText = s.name || `Season ${s.season_number}`;
        btn.onclick = async () => {
            await loadSeasonDetails(currentShowData.id, s.season_number);
            currentEpisodeIndex = 1;
            renderPreviewContent();
        };
        prevSeasonsContainer.appendChild(btn);
    });

    // 7. EPISODES NAVIGATION LIST IN PREVIEW
    const prevEpsContainer = document.getElementById('preview-episodes-container');
    prevEpsContainer.innerHTML = '';
    eps.forEach(ep => {
        const div = document.createElement('div');
        const isSelected = ep.episode_number === currentEpisodeIndex;
        div.className = `p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${isSelected ? 'bg-red-600/20 border-red-600 text-white' : 'bg-black/40 border-gray-800 text-gray-300 hover:border-gray-600'}`;
        div.innerHTML = `
            <div class="truncate text-xs font-semibold pr-2"><i class="fa-solid fa-play mr-1.5 text-red-500"></i> ${ep.name}</div>
            <span class="text-[10px] px-2 py-0.5 rounded bg-black/60 text-gray-400 shrink-0">E${ep.episode_number}</span>
        `;
        div.onclick = () => {
            currentEpisodeIndex = ep.episode_number;
            renderPreviewContent();
        };
        prevEpsContainer.appendChild(div);
    });

    // 8. ACTORS
    const castContainer = document.getElementById('preview-cast-container');
    castContainer.innerHTML = '';
    const castList = currentShowData.cast || [];
    castList.forEach(actor => {
        const card = document.createElement('div');
        card.className = "bg-black/40 border border-gray-800 rounded-xl p-2.5 flex items-center space-x-3";
        const actorImg = actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://placehold.co/150x150/111827/ffffff?text=Actor';
        card.innerHTML = `
            <img src="${actorImg}" alt="${actor.name}" class="w-10 h-10 rounded-full object-cover border border-gray-700 shrink-0" onerror="this.src='https://placehold.co/150x150/111827/ffffff?text=Actor'">
            <div class="overflow-hidden">
                <h5 class="font-bold text-xs text-white truncate">${actor.name}</h5>
                <p class="text-[10px] text-gray-400 truncate">${actor.character}</p>
            </div>
        `;
        castContainer.appendChild(card);
    });
}

function alertPlaySim() {
    alertBoxCustom("กำลังเริ่มเล่นวิดีโอสตรีมมิ่ง HD (No Ads Mode Active)");
}

function alertCTA(e) {
    e.preventDefault();
    alertBoxCustom("นำทางไปยังหน้าสมาชิก VIP / ไม่มีโฆษณาเรียบร้อยแล้ว");
}

function generateExportCode() {
    if(!currentShowData) return;
    const cleanName = currentShowData.name;
    const sampleCode = `<!DOCTYPE html>
<html lang="${currentLang}" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cleanName} Season ${currentSeasonIndex} Episode ${currentEpisodeIndex} - Watch Online</title>
    <meta name="description" content="Watch ${cleanName} Season ${currentSeasonIndex} Episode ${currentEpisodeIndex} online in HD with Thai and Vietnamese translation.">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-950 text-white min-h-screen p-4 max-w-4xl mx-auto space-y-6">
    <!-- 1. JUDUL -->
    <div class="bg-slate-900/50 border border-gray-800 rounded-2xl p-5">
        <h1 class="text-2xl font-black">${cleanName}</h1>
        <p class="text-xs text-gray-400">Season ${currentSeasonIndex} • Episode ${currentEpisodeIndex}</p>
    </div>
    <!-- 2. ADS 300x250 -->
    <div class="flex justify-center p-3 bg-slate-900/50 border border-gray-800 rounded-2xl">
        <div class="w-[300px] h-[250px] bg-black flex items-center justify-center text-gray-500 text-xs">Ads 300x250</div>
    </div>
    <!-- 3. VIDEO PLAYER -->
    <div class="aspect-video bg-black rounded-2xl flex items-center justify-center border border-gray-800">
        <div class="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white text-xl"><i class="fa-solid fa-play"></i></div>
    </div>
    <!-- 4. CTA -->
    <a href="#" class="block w-full bg-red-600 text-white font-bold text-center py-3.5 rounded-xl">Watch Now No Ads / VIP Access</a>
    <!-- 5. POSTER + SYNOPSIS -->
    <div class="bg-slate-900/50 border border-gray-800 rounded-2xl p-5 flex gap-4">
        <img src="https://image.tmdb.org/t/p/w500${currentShowData.poster_path || ''}" class="w-32 h-44 object-cover rounded-xl" alt="Poster">
        <div>
            <h3 class="font-bold text-red-500">Season ${currentSeasonIndex} Episode ${currentEpisodeIndex}</h3>
            <p class="text-xs text-gray-300 mt-2">${currentShowData.overview}</p>
        </div>
    </div>
</body>
</html>`;
    document.getElementById('exported-code-preview').value = sampleCode;
}

function exportTemplateCode() {
    const code = document.getElementById('exported-code-preview').value;
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentShowData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_s${currentSeasonIndex}e${currentEpisodeIndex}.html`;
    a.click();
    URL.revokeObjectURL(url);
    alertBoxCustom("ดาวน์โหลดไฟล์ HTML สำเร็จ!");
}
