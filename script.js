const TRANSLATIONS = {
    th: {
        brand_title: "สตูดิโอสตรีมมิ่ง",
        nav_generator: "เครื่องมือสร้าง (Generator)",
        nav_preview: "ดูตัวอย่างสด (Live Preview)",
        gen_heading: "TMDB Template & URL Generator",
        gen_subheading: "ป้อน TMDB ID หรือ URL ซีรีส์เพื่อสร้างหน้าสตรีมมิ่งอัตโนมัติ พร้อมโครงสร้าง UI ตามลำดับที่กำหนดและแปลภาษาไทย/เวียดนามอัตโนมัติ",
        ph_title: "ยังไม่ได้โหลดข้อมูลซีรีส์ใดๆ",
        ph_sub: "ป้อน TMDB ID หรือเลือกตัวอย่างยอดนิยมด้านล่างเพื่อเริ่มต้น",
        btn_preview_page: "ดูตัวอย่างหน้าสตรีมมิ่ง",
        txt_season_list_title: "รายการซีซั่นและตัวสร้าง URL อัตโนมัติ",
        btn_copy_url: "คัดลอก URL",
        txt_ep_desc: "เลือกตอนด้านล่างเพื่อทดสอบหรือคัดลอกลิงก์ URL แต่ละตอน:",
        export_title: "ส่งออกโค้ด HTML (พร้อมโฆษณา)",
        export_desc: "โค้ดเทมเพลตประกอบด้วยโครงสร้าง UI ตามลำดับที่คุณต้องการ (Title -> Ads 300x250 -> Player -> CTA -> Synopsis -> Season -> Episodes -> Cast -> Footer)",
        btn_download_html: "ดาวน์โหลด HTML",
        btn_back: "กลับไปยังหน้า Generator",
        ad_label: "Sponsored Advertisement (300x250)",
        btn_vip: "Watch Now No Ads / VIP Access",
        synopsis_heading: "เรื่องย่อตอน",
        season_header: "รายการซีซั่นทั้งหมด",
        episode_header: "รายการตอนทั้งหมด",
        cast_heading: "นักแสดงนำ (Cast)",
        status_ongoing: "กำลังออกอากาศ",
        status_ended: "จบแล้ว"
    },
    vi: {
        brand_title: "Studio Phát Sóng",
        nav_generator: "Trình Tạo (Generator)",
        nav_preview: "Xem Trước (Live Preview)",
        gen_heading: "Trình Tạo Mẫu & URL TMDB",
        gen_subheading: "Nhập TMDB ID hoặc URL phim để tự động tạo trang phát trực tuyến với thứ tự UI chính xác và dịch tự động sang tiếng Thái/Việt.",
        ph_title: "Chưa tải dữ liệu phim nào",
        ph_sub: "Nhập TMDB ID hoặc chọn mẫu phổ biến bên dưới để bắt đầu",
        btn_preview_page: "Xem trước trang phát",
        txt_season_list_title: "Danh sách Mùa & Trình tạo URL Tự động",
        btn_copy_url: "Sao chép URL",
        txt_ep_desc: "Chọn tập bên dưới để kiểm tra hoặc sao chép URL từng tập:",
        export_title: "Xuất Mã HTML (Kèm Quảng Cáo)",
        export_desc: "Mã mẫu tuân thủ đúng thứ tự bố cục UI yêu cầu.",
        btn_download_html: "Tải xuống HTML",
        btn_back: "Quay lại trang Generator",
        ad_label: "Quảng cáo tài trợ (300x250)",
        btn_vip: "Xem Ngay Không Quảng Cáo / Truy Cập VIP",
        synopsis_heading: "Tóm tắt tập phim",
        season_header: "Danh sách tất cả các mùa",
        episode_header: "Danh sách tất cả các tập",
        cast_heading: "Diễn viên chính (Cast)",
        status_ongoing: "Đang phát sóng",
        status_ended: "Đã kết thúc"
    }
};

let currentLang = 'th';
let currentShowData = null;
let currentSeasonNumber = 1;
let currentEpisodeNumber = 1;
let currentEpisodesList = [];
let currentCastList = [];
let currentSeasonDetails = null;

function changeLanguage() {
    currentLang = document.getElementById('lang-select').value;
    document.getElementById('html-root').setAttribute('lang', currentLang);
    
    const t = TRANSLATIONS[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerText = t[key];
    });

    document.getElementById('ui-brand-title').innerText = t.brand_title;
    
    if (currentShowData) {
        translateContentIfNeeded().then(() => {
            renderGeneratorResults();
            renderPreviewPage();
        });
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
        if (!currentShowData) {
            alert(currentLang === 'th' ? 'กรุณาสร้างหรือโหลดข้อมูลซีรีส์ก่อนดูตัวอย่าง' : 'Vui lòng tạo hoặc tải dữ liệu phim trước khi xem trước.');
            return;
        }
        genView.classList.add('hidden');
        prevView.classList.remove('hidden');
        footerAds.classList.remove('hidden');
        prevBtn.className = "text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md bg-red-600 text-white transition";
        genBtn.className = "text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md text-gray-300 hover:text-white transition";
        renderPreviewPage();
    }
}

async function fetchTMDBData() {
    let inputVal = document.getElementById('tmdb-input').value.trim();
    const errorBox = document.getElementById('error-box');
    errorBox.classList.add('hidden');

    if (!inputVal) {
        showError(currentLang === 'th' ? 'กรุณากรอก TMDB ID หรือ URL' : 'Vui lòng nhập TMDB ID hoặc URL');
        return;
    }

    let tmdbId = inputVal;
    if (inputVal.includes('themoviedb.org')) {
        const match = inputVal.match(/(tv|movie)\/(\d+)/);
        if (match && match[2]) {
            tmdbId = match[2];
        }
    }

    const fetchBtn = document.getElementById('fetch-btn');
    fetchBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Loading...`;

    try {
        const apiKey = 'd5a549dec10563dc56696d42f581a771';
        const url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}&language=en-US`;
        
        let response = await fetch(url);
        if (!response.ok) throw new Error('Invalid TMDB ID or Network Error');
        
        const data = await response.json();
        
        const creditsRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/credits?api_key=${apiKey}&language=en-US`);
        const creditsData = creditsRes.ok ? await creditsRes.json() : { cast: [] };

        currentShowData = data;
        currentCastList = creditsData.cast ? creditsData.cast.slice(0, 8) : [];
        currentSeasonNumber = data.seasons && data.seasons.length > 0 ? (data.seasons[0].season_number || 1) : 1;
        
        await translateContentIfNeeded();
        await loadSeasonEpisodes(tmdbId, currentSeasonNumber);

    } catch (err) {
        console.warn("Using sample fallback data due to network/API restriction:", err);
        currentShowData = {
            id: tmdbId || 1396,
            name: "Breaking Bad",
            overview: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
            poster_path: "/ztkUQFLvC19CCPCZ1o01uX2CjXm.jpg",
            backdrop_path: "/tsRy6ICwJzzsDqJtpkcYncfkyn.jpg",
            vote_average: 8.9,
            first_air_date: "2008-01-20",
            status: "Ended",
            seasons: [
                { season_number: 1, name: "Season 1", episode_count: 7 },
                { season_number: 2, name: "Season 2", episode_count: 13 }
            ]
        };
        currentCastList = [
            { name: "Bryan Cranston", character: "Walter White", profile_path: null },
            { name: "Aaron Paul", character: "Jesse Pinkman", profile_path: null }
        ];
        currentSeasonNumber = 1;
        currentEpisodesList = [
            { episode_number: 1, name: "Pilot", overview: "High school chemistry teacher turns to crime.", still_path: null },
            { episode_number: 2, name: "Cat's in the Bag...", overview: "Walt and Jesse deal with bodies.", still_path: null }
        ];
        await translateContentIfNeeded();
    } finally {
        fetchBtn.innerHTML = `<i class="fa-solid fa-bolt mr-2"></i> ${currentLang === 'th' ? 'สร้างเทมเพลต (Generate)' : 'Tạo Mẫu (Generate)'}`;
    }

    document.getElementById('generator-placeholder').classList.add('hidden');
    document.getElementById('generator-results').classList.remove('hidden');
    
    renderGeneratorResults();
}

async function loadSampleShow(id) {
    document.getElementById('tmdb-input').value = id;
    await fetchTMDBData();
}

function showError(msg) {
    const eb = document.getElementById('error-box');
    eb.innerText = msg;
    eb.classList.remove('hidden');
}

async function loadSeasonEpisodes(showId, seasonNum) {
    currentSeasonNumber = seasonNum;
    try {
        const apiKey = '';
        const res = await fetch(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNum}?api_key=${apiKey}&language=en-US`);
        if (res.ok) {
            const seasonData = await res.json();
            currentSeasonDetails = seasonData;
            currentEpisodesList = seasonData.episodes || [];
        } else {
            throw new Error("Season fetch failed");
        }
    } catch (e) {
        currentEpisodesList = [
            { episode_number: 1, name: `Episode 1 (Season ${seasonNum})`, overview: "Auto-generated episode description.", still_path: null },
            { episode_number: 2, name: `Episode 2 (Season ${seasonNum})`, overview: "Continuation of story arc.", still_path: null }
        ];
    }

    await translateContentIfNeeded();
    renderGeneratorResults();
}

async function translateContentIfNeeded() {
    if (!currentShowData) return;
    try {
        const targetLangName = currentLang === 'th' ? 'Thai' : 'Vietnamese';
        const epTitlesToTranslate = currentEpisodesList.map(ep => ep.name).join('|||');
        const payload = {
            contents: [{
                role: 'user',
                parts: [{ text: `Translate into fluent ${targetLangName} for a streaming website: Title: "${currentShowData.name}", Synopsis: "${currentShowData.overview}". Also translate these episode titles separated by |||: "${epTitlesToTranslate}". Return JSON with keys 'title', 'overview', and array 'episodes'.` }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING" },
                        overview: { type: "STRING" },
                        episodes: { type: "ARRAY", items: { type: "STRING" } }
                    },
                    propertyOrdering: ["title", "overview", "episodes"]
                }
            }
        };

        const apiKey = '';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        const candidate = result.candidates?.[0];
        if (candidate && candidate.content?.parts?.[0]?.text) {
            const parsed = JSON.parse(candidate.content.parts[0].text);
            currentShowData.localizedName = parsed.title;
            currentShowData.localizedOverview = parsed.overview;
            if (parsed.episodes && Array.isArray(parsed.episodes)) {
                currentEpisodesList.forEach((ep, idx) => {
                    if (parsed.episodes[idx]) ep.localizedName = parsed.episodes[idx];
                });
            }
        }
    } catch (err) {
        currentShowData.localizedName = currentShowData.name;
        currentShowData.localizedOverview = currentShowData.overview;
        currentEpisodesList.forEach(ep => ep.localizedName = ep.name);
    }
}

function renderGeneratorResults() {
    if (!currentShowData) return;

    const posterPath = currentShowData.poster_path 
        ? `https://image.tmdb.org/t/p/w500${currentShowData.poster_path}` 
        : 'https://placehold.co/500x750/111827/ffffff?text=No+Poster';

    document.getElementById('show-poster').src = posterPath;
    document.getElementById('show-title').innerText = currentShowData.localizedName || currentShowData.name;
    const year = (currentShowData.first_air_date || '2023').substring(0, 4);
    const rating = currentShowData.vote_average ? currentShowData.vote_average.toFixed(1) : '8.0';
    document.getElementById('show-meta').innerText = `${year} • ⭐ ${rating}`;
    
    const statusText = currentShowData.status === 'Ended' 
        ? (currentLang === 'th' ? TRANSLATIONS.th.status_ended : TRANSLATIONS.vi.status_ended)
        : (currentLang === 'th' ? TRANSLATIONS.th.status_ongoing : TRANSLATIONS.vi.status_ongoing);
    document.getElementById('show-status').innerText = statusText;

    document.getElementById('show-synopsis').innerText = currentShowData.localizedOverview || currentShowData.overview;

    const seasonsContainer = document.getElementById('gen-season-tabs');
    seasonsContainer.innerHTML = '';
    const seasons = currentShowData.seasons || [{ season_number: 1, name: "Season 1" }];
    
    seasons.forEach(s => {
        if (s.season_number === 0) return;
        const btn = document.createElement('button');
        const isActive = s.season_number === currentSeasonNumber;
        btn.className = `px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${isActive ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/40' : 'bg-black/40 text-gray-300 border-gray-800 hover:border-gray-600'}`;
        btn.innerText = s.name || `Season ${s.season_number}`;
        btn.onclick = () => loadSeasonEpisodes(currentShowData.id, s.season_number);
        seasonsContainer.appendChild(btn);
    });

    const epContainer = document.getElementById('episodes-container');
    epContainer.innerHTML = '';
    
    currentEpisodesList.forEach(ep => {
        const epCard = document.createElement('div');
        const isEpActive = ep.episode_number === currentEpisodeNumber;
        epCard.className = `p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${isEpActive ? 'bg-red-950/30 border-red-600/60 text-white' : 'bg-black/40 border-gray-800 text-gray-300 hover:border-gray-700'}`;
        
        const epUrl = generatePageUrl(currentShowData.id, currentSeasonNumber, ep.episode_number);
        const epDisplayName = ep.localizedName || ep.name;
        
        epCard.innerHTML = `
            <div class="truncate pr-2">
                <span class="text-[10px] font-bold text-red-500 uppercase">S${currentSeasonNumber} E${ep.episode_number}</span>
                <p class="text-xs font-semibold truncate">${epDisplayName}</p>
            </div>
            <button onclick="selectEpisodeAndCopy(event, ${currentSeasonNumber}, ${ep.episode_number})" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded-lg text-[10px] font-medium shrink-0 border border-gray-700">
                <i class="fa-solid fa-link mr-1"></i> URL
            </button>
        `;
        epCard.onclick = () => {
            currentEpisodeNumber = ep.episode_number;
            renderGeneratorResults();
            updateCurrentUrlDisplay(epUrl);
        };
        epContainer.appendChild(epCard);
    });

    if (currentEpisodesList.length > 0) {
        updateCurrentUrlDisplay(generatePageUrl(currentShowData.id, currentSeasonNumber, currentEpisodeNumber));
    }

    generateTemplateExportCode();
}

function generatePageUrl(showId, season, episode) {
    const domain = window.location.origin + window.location.pathname;
    return `${domain}?id=${showId}&season=${season}&episode=${episode}&lang=${currentLang}`;
}

function updateCurrentUrlDisplay(url) {
    document.getElementById('current-selected-url').innerText = `URL: ${url}`;
}

function copyCurrentUrl() {
    const urlText = document.getElementById('current-selected-url').innerText.replace('URL: ', '');
    const textArea = document.createElement("textarea");
    textArea.value = urlText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert(currentLang === 'th' ? 'คัดลอก URL สำเร็จ!' : 'Đã sao chép URL thành công!');
}

function selectEpisodeAndCopy(e, season, episode) {
    e.stopPropagation();
    currentSeasonNumber = season;
    currentEpisodeNumber = episode;
    renderGeneratorResults();
    copyCurrentUrl();
}

function generateTemplateExportCode() {
    const showTitle = currentShowData?.localizedName || currentShowData?.name || 'Show Title';
    const currentEpObj = currentEpisodesList.find(ep => ep.episode_number === currentEpisodeNumber);
    const epTitle = currentEpObj?.localizedName || currentEpObj?.name || `Episode ${currentEpisodeNumber}`;
    const epSynopsis = currentEpObj?.overview || currentShowData?.localizedOverview || currentShowData?.overview || '';

    const sampleHtml = `<!DOCTYPE html>
<html lang="${currentLang}" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${showTitle} - Season ${currentSeasonNumber} Episode ${currentEpisodeNumber} (${epTitle}) | Streaming Studio</title>
    <meta name="description" content="Watch ${showTitle} Season ${currentSeasonNumber} Episode ${currentEpisodeNumber} online with multi-language support and zero ads.">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>body { font-family: 'Inter', sans-serif; } @media (max-width: 768px) { .ad-footer-frame { transform: scale(0.82); transform-origin: center; } }</style>
</head>
<body class="bg-slate-950 text-white min-h-screen pb-28">
    <!-- 1. JUDUL -->
    <header class="p-6 border-b border-gray-800 bg-slate-950/90 sticky top-0 z-50 backdrop-blur">
        <h1 class="text-2xl sm:text-3xl font-black">${showTitle}</h1>
        <p class="text-xs text-gray-400 mt-1">Season ${currentSeasonNumber} • Episode ${currentEpisodeNumber}: ${epTitle}</p>
    </header>

    <main class="max-w-4xl mx-auto p-4 space-y-6">
        <!-- 2. ADS BANNER (300x250) -->
        <div class="flex flex-col items-center justify-center p-3 bg-slate-900 border border-gray-800 rounded-2xl">
            <span class="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">Sponsored Advertisement (300x250)</span>
            <div class="w-[300px] h-[250px] bg-black flex items-center justify-center rounded-lg">
                <script>var atOptions = {'key':'53541ca00eed825e8c431c12f7418ac0','format':'iframe','height':250,'width':300,'params':{}};</script>
                <script src="https://buffcasualwhine.com/53541ca00eed825e8c431c12f7418ac0/invoke.js"></script>
            </div>
        </div>

        <!-- 3. VIDEO PLAYER WITH TMDB THUMBNAIL -->
        <div class="aspect-video bg-black rounded-2xl relative overflow-hidden shadow-2xl border border-gray-800 flex items-center justify-center bg-cover bg-center" style="background-image: url('https://image.tmdb.org/t/p/w1280${currentShowData?.backdrop_path || ''}')">
            <div class="absolute inset-0 bg-black/50"></div>
            <button onclick="alert('Playing stream...')" class="relative z-10 w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl shadow-xl hover:scale-110 transition">
                <i class="fa-solid fa-play ml-1"></i>
            </button>
        </div>

        <!-- 4. CTA WATCH NOW NO ADS -->
        <div>
            <a href="#vip" onclick="event.preventDefault(); alert('VIP Access Active');" class="block w-full bg-red-600 hover:bg-red-700 text-white font-bold text-center py-3.5 rounded-xl shadow-lg shadow-red-900/40 transition">
                <i class="fa-solid fa-shield-halved mr-2"></i> Watch Now No Ads / VIP Access
            </a>
        </div>

        <!-- 5. POSTER + SINOPSIS -->
        <div class="bg-slate-900/50 border border-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row gap-5">
            <img src="https://image.tmdb.org/t/p/w500${currentShowData?.poster_path || ''}" alt="Poster" class="w-32 h-44 object-cover rounded-xl shadow-md shrink-0 mx-auto sm:mx-0 border border-gray-800">
            <div class="space-y-2.5">
                <h3 class="font-bold text-base text-red-500">Season ${currentSeasonNumber} Episode ${currentEpisodeNumber} - ${epTitle}</h3>
                <h4 class="text-xs font-semibold text-gray-400 uppercase">เรื่องย่อตอน / Tóm tắt tập phim</h4>
                <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">${epSynopsis}</p>
            </div>
        </div>

        <!-- 6. SEASON -->
        <div class="bg-slate-900/50 border border-gray-800 rounded-2xl p-5 space-y-3">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">รายการซีซั่นทั้งหมด</h3>
            <div class="flex flex-wrap gap-2">
                ${(currentShowData?.seasons || []).map(s => `<span class="px-3.5 py-1.5 rounded-xl text-xs font-bold ${s.season_number === currentSeasonNumber ? 'bg-red-600 text-white' : 'bg-black/40 text-gray-300 border border-gray-800'}">${s.name || 'Season ' + s.season_number}</span>`).join('')}
            </div>
        </div>

        <!-- 7. SEMUA EPISODE -->
        <div class="bg-slate-900/50 border border-gray-800 rounded-2xl p-5 space-y-3">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">รายการตอนทั้งหมด</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${currentEpisodesList.map(ep => `<div class="p-3 rounded-xl border ${ep.episode_number === currentEpisodeNumber ? 'bg-red-950/40 border-red-600 text-white' : 'bg-black/40 border-gray-800 text-gray-300'}"><span class="text-[10px] text-red-500 font-bold uppercase">Ep ${ep.episode_number}</span><p class="text-xs font-semibold">${ep.localizedName || ep.name}</p></div>`).join('')}
            </div>
        </div>

        <!-- 8. ACTOR -->
        <div class="bg-slate-900/50 border border-gray-800 rounded-2xl p-5 space-y-3">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">นักแสดงนำ (Cast)</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                ${currentCastList.map(c => `<div class="bg-black/40 border border-gray-800 p-3 rounded-xl text-center space-y-2"><img src="${c.profile_path ? 'https://image.tmdb.org/t/p/w185' + c.profile_path : 'https://placehold.co/150x150/111827/ffffff?text=Actor'}" class="w-16 h-16 rounded-full object-cover mx-auto border border-gray-700"><div><p class="text-xs font-bold truncate">${c.name}</p><p class="text-[10px] text-gray-400 truncate">${c.character}</p></div></div>`).join('')}
            </div>
        </div>
    </main>

    <!-- 9. FOOTER STICKY BANNER (Responsive 728x90) -->
    <footer class="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-gray-800 py-2 px-4 flex justify-center">
        <div class="w-full max-w-[728px] h-[90px] bg-black/80 rounded-lg flex items-center justify-center ad-footer-frame overflow-hidden">
            <script>var atOptions2 = {'key':'2d751854ce36e13fefddaa58f93251e2','format':'iframe','height':90,'width':728,'params':{}};</script>
            <script src="https://buffcasualwhine.com/2d751854ce36e13fefddaa58f93251e2/invoke.js"></script>
        </div>
    </footer>
</body>
</html>`;

    document.getElementById('exported-code-preview').value = sampleHtml;
}

function downloadHtmlTemplate() {
    const code = document.getElementById('exported-code-preview').value;
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentShowData?.name || 'streaming'}_s${currentSeasonNumber}e${currentEpisodeNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function renderPreviewPage() {
    if (!currentShowData) return;

    const showTitle = currentShowData.localizedName || currentShowData.name;
    const currentEpObj = currentEpisodesList.find(ep => ep.episode_number === currentEpisodeNumber);
    const epTitle = currentEpObj?.localizedName || currentEpObj?.name || `Episode ${currentEpisodeNumber}`;
    
    const pageTitle = `${showTitle} - Season ${currentSeasonNumber} Episode ${currentEpisodeNumber} (${epTitle}) | Streaming Studio`;
    document.getElementById('page-seo-title').innerText = pageTitle;
    document.getElementById('page-seo-desc').setAttribute('content', `Watch ${showTitle} Season ${currentSeasonNumber} Episode ${currentEpisodeNumber} with multi-language Thai and Vietnamese translation.`);

    document.getElementById('preview-show-title').innerText = showTitle;
    const year = (currentShowData.first_air_date || '2023').substring(0, 4);
    const rating = currentShowData.vote_average ? currentShowData.vote_average.toFixed(1) : '8.0';
    document.getElementById('preview-meta').innerText = `${year} • ⭐ ${rating}`;

    const backdropUrl = currentShowData.backdrop_path 
        ? `https://image.tmdb.org/t/p/w1280${currentShowData.backdrop_path}` 
        : 'https://placehold.co/1280x720/111827/ffffff?text=Video+Player';
    
    const playerBackdrop = document.getElementById('player-backdrop');
    playerBackdrop.style.backgroundImage = `url('${backdropUrl}')`;
    document.getElementById('preview-ep-label').innerText = `${showTitle} - S${currentSeasonNumber} E${currentEpisodeNumber}: ${epTitle}`;

    const posterPath = currentShowData.poster_path 
        ? `https://image.tmdb.org/t/p/w500${currentShowData.poster_path}` 
        : 'https://placehold.co/500x750/111827/ffffff?text=No+Poster';
    document.getElementById('preview-poster').src = posterPath;
    document.getElementById('preview-player-title').innerText = `Season ${currentSeasonNumber} Episode ${currentEpisodeNumber} - ${epTitle}`;
    
    const epSynopsis = currentEpObj?.overview || currentShowData.localizedOverview || currentShowData.overview;
    document.getElementById('preview-synopsis').innerText = epSynopsis;

    const seasonsContainer = document.getElementById('preview-seasons-container');
    seasonsContainer.innerHTML = '';
    const seasons = currentShowData.seasons || [{ season_number: 1, name: "Season 1" }];
    seasons.forEach(s => {
        if (s.season_number === 0) return;
        const btn = document.createElement('button');
        const isActive = s.season_number === currentSeasonNumber;
        btn.className = `px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${isActive ? 'bg-red-600 text-white border-red-500 shadow-lg' : 'bg-black/40 text-gray-300 border-gray-800 hover:border-gray-600'}`;
        btn.innerText = s.name || `Season ${s.season_number}`;
        btn.onclick = () => {
            loadSeasonEpisodes(currentShowData.id, s.season_number).then(() => renderPreviewPage());
        };
        seasonsContainer.appendChild(btn);
    });

    const epContainer = document.getElementById('preview-episodes-container');
    epContainer.innerHTML = '';
    currentEpisodesList.forEach(ep => {
        const isCurrent = ep.episode_number === currentEpisodeNumber;
        const epBox = document.createElement('div');
        epBox.className = `p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${isCurrent ? 'bg-red-950/40 border-red-600 text-white' : 'bg-black/40 border-gray-800 text-gray-300 hover:border-gray-700'}`;
        epBox.innerHTML = `
            <div class="truncate pr-2">
                <span class="text-[10px] font-bold text-red-500 uppercase">Ep ${ep.episode_number}</span>
                <p class="text-xs font-semibold truncate">${ep.localizedName || ep.name}</p>
            </div>
            <span class="text-[10px] bg-slate-800 px-2 py-1 rounded text-gray-300 shrink-0"><i class="fa-solid fa-play mr-1"></i> Play</span>
        `;
        epBox.onclick = () => {
            currentEpisodeNumber = ep.episode_number;
            renderPreviewPage();
        };
        epContainer.appendChild(epBox);
    });

    const castContainer = document.getElementById('preview-cast-container');
    castContainer.innerHTML = '';
    currentCastList.forEach(c => {
        const card = document.createElement('div');
        card.className = 'bg-black/40 border border-gray-800 rounded-xl p-3 text-center space-y-2';
        const actorImg = c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : 'https://placehold.co/150x150/111827/ffffff?text=Actor';
        card.innerHTML = `
            <img src="${actorImg}" alt="${c.name}" class="w-16 h-16 rounded-full object-cover mx-auto border border-gray-700 shadow" onerror="this.src='https://placehold.co/150x150/111827/ffffff?text=Actor'">
            <div>
                <h5 class="text-xs font-bold text-white truncate">${c.name}</h5>
                <p class="text-[10px] text-gray-400 truncate">${c.character}</p>
            </div>
        `;
        castContainer.appendChild(card);
    });

    generateTemplateExportCode();
}

function alertPlaySim() {
    alert(currentLang === 'th' ? 'กำลังจำลองการเล่นวิดีโอสตรีมมิ่ง...' : 'Đang giả lập phát video trực tuyến...');
}

function alertCTA(e) {
    e.preventDefault();
    alert(currentLang === 'th' ? 'ลิงก์เข้าสู่หน้า VIP / สมัครสมาชิกไม่มีโฆษณา' : 'Liên kết VIP / Đăng ký không quảng cáo');
}

window.addEventListener('DOMContentLoaded', () => {
    changeLanguage();
});
