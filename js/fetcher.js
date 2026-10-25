(() => {
  const messages = {
    cuma: [
      { text: 'Rabbim gönlünü ferah, yolunu açık, haneni huzurla doldursun. Hayırlı cumalar.', source: 'Cuma dileği' },
      { text: 'Bugünün güzelliği kalbine, bereketi evine, tebessümü yüzüne konuk olsun.', source: 'Cuma dileği' },
      { text: 'Duaların kabul, umutların taze, sevdiklerin hep yanında olsun. Huzurlu cumalar.', source: 'Cuma dileği' },
      { text: 'Bir iyilikle başlasın günün; güzellikler çoğalarak sana geri dönsün.', source: 'Cuma dileği' },
      { text: 'Kalbine sükûnet, ömrüne bereket, sevdiklerinle nice güzel günler diliyorum.', source: 'Cuma dileği' }
    ],
    bayram: [
      { text: 'Bayramın gönlüne sevinç, sofrana bereket, sevdiklerinle beraber nice güzel anlar getirsin.', source: 'Bayram dileği' },
      { text: 'Gönüllerin yakın, yüzlerin gülümseyen, hatıraların güzellikle dolu olsun. İyi bayramlar.', source: 'Bayram dileği' },
      { text: 'Paylaştıkça çoğalan mutlulukla; sağlık, huzur ve neşe dolu bir bayram dilerim.', source: 'Bayram dileği' },
      { text: 'Bayram sabahının neşesi yıl boyu evinden ve kalbinden eksik olmasın.', source: 'Bayram dileği' }
    ],
    kandil: [
      { text: 'Bu mübarek gecenin gönlüne umut, hanene huzur ve dualarına güzellik getirmesi dileğiyle.', source: 'Kandil dileği' },
      { text: 'Gecen aydınlık, gönlün huzurlu, duaların hayırlara vesile olsun. Kandilin mübarek olsun.', source: 'Kandil dileği' },
      { text: 'Rahmet ve iyilikle dolu bu gecede, sevdiklerinle gönül gönüle nice güzelliklere.', source: 'Kandil dileği' },
      { text: 'Kalpten edilen her güzel dua, hayatına umut ve esenlik olarak dönsün.', source: 'Kandil dileği' }
    ],
    dua: [
      { text: 'Allah’ım, kalbimize ferahlık, işlerimize kolaylık, sevdiklerimize sağlık ve ömrümüze bereket ver.', source: 'Gönülden bir dua' },
      { text: 'Rabbim, bizi iyilikte buluştur; gönlümüze şükür, dilimize güzel söz, yolumuza ışık nasip et.', source: 'Gönülden bir dua' },
      { text: 'Allah’ım, bugünümüzü dünden güzel; yarınımızı umut ve hayırla dolu eyle.', source: 'Gönülden bir dua' },
      { text: 'Rabbim, gönlümüzden geçen hayırlı dilekleri en güzel zamanda nasip et.', source: 'Gönülden bir dua' }
    ],
    hadith: [
      { text: 'İnsanlara kolaylık gösterin, güçlük çıkarmayın; müjdeleyin, nefret ettirmeyin.', source: 'Sahih-i Buhari, 6125' },
      { text: 'Kardeşine tebessüm etmen de senin için bir sadakadır.', source: 'Camiu’t-Tirmizi, 1956' },
      { text: 'Allah’a ve ahiret gününe iman eden ya hayır söylesin ya da sussun.', source: 'Sahih-i Buhari, 6018' },
      { text: 'Yarım hurma vererek de olsa kendinizi ateşten koruyun.', source: 'Sahih-i Buhari, 1417' }
    ]
  };
  const titles = { cuma: 'Hayırlı Cumalar', bayram: 'İyi Bayramlar', kandil: 'Kandiliniz Mübarek Olsun', dua: 'Gönülden Bir Dua', hadith:'Güzel Bir Hadis', custom: 'Sana özel bir mesaj' };
  const categories = { cuma: 'GÜZEL BİR CUMA DİLEĞİ', bayram: 'BAYRAM SEVİNCİ', kandil: 'MÜBAREK BİR GECE', dua: 'GÖNÜLDEN BİR DUA', hadith:'PEYGAMBERİMİZDEN BİR ÖĞÜT', custom: 'SANA ÖZEL' };
  const imageSearchVariants = {
    mosque: ['mosque', 'Ottoman mosque', 'Sultan Ahmet Mosque', 'mosque minaret', 'Islamic architecture'],
    cami: ['mosque', 'Ottoman mosque', 'Sultan Ahmet Mosque', 'mosque minaret', 'Islamic architecture'],
    lantern: ['Ramadan lantern', 'fanous lantern', 'hanging lantern', 'Islamic lantern', 'Ramadan decorations'],
    fener: ['Ramadan lantern', 'fanous lantern', 'hanging lantern', 'Islamic lantern', 'Ramadan decorations'],
    sunset: ['mosque sunset', 'sunset minaret', 'Istanbul mosque sunset', 'sunset over mosque', 'evening mosque'],
    'gün batımı': ['mosque sunset', 'sunset minaret', 'Istanbul mosque sunset', 'sunset over mosque', 'evening mosque'],
    günbatımı: ['mosque sunset', 'sunset minaret', 'Istanbul mosque sunset', 'sunset over mosque', 'evening mosque'],
    kandil: ['Ramadan lantern', 'mosque at night', 'Islamic architecture night', 'minaret night sky', 'Ramadan decorations'],
    nature: ['nature landscape', 'mountain landscape', 'forest sunlight', 'calm sea landscape', 'flower field'],
    doğa: ['nature landscape', 'mountain landscape', 'forest sunlight', 'calm sea landscape', 'flower field'],
    ramazan: ['Ramadan lantern', 'Ramadan decorations', 'mosque at night', 'fanous lantern', 'Ramadan mosque']
  };
  const imageSearchState = new Map();
  function metadataText(value = '') {
    return new DOMParser().parseFromString(value, 'text/html').body.textContent.trim();
  }
  async function searchCommons(query, { more = false } = {}) {
    const key = query.trim().toLocaleLowerCase('tr') || 'mosque';
    const variants = imageSearchVariants[key] || [query.trim(), `${query.trim()} landscape`, `${query.trim()} architecture`].filter(Boolean);
    let state = imageSearchState.get(key);
    if (!more || !state) {
      state = { offset: Math.floor(Math.random() * 4) * 18, variantStart: Math.floor(Math.random() * variants.length), used: new Set() };
      imageSearchState.set(key, state);
    }

    const found = [];
    for (let attempt = 0; attempt < variants.length && found.length < 6; attempt++) {
      const variant = variants[(state.variantStart + attempt + (more ? 1 : 0)) % variants.length];
      const params = new URLSearchParams({ action:'query', generator:'search', gsrsearch:`filetype:bitmap ${variant}`, gsrnamespace:'6', gsrlimit:'18', gsroffset:String(state.offset + attempt * 18), prop:'imageinfo', iiprop:'url|extmetadata', iiurlwidth:'520', format:'json', origin:'*' });
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
      if (!response.ok) throw new Error('Görseller alınamadı.');
      const result = await response.json();
      const images = Object.values(result.query?.pages || {}).map(page => {
        const info = page.imageinfo?.[0];
        return info && {
          title:page.title.replace('File:',''),
          url:info.thumburl || info.url,
          full:info.url,
          credit:metadataText(info.extmetadata?.Artist?.value || ''),
          license:metadataText(info.extmetadata?.LicenseShortName?.value || ''),
          sourceUrl:`https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ', '_'))}`
        };
      }).filter(image => image?.url && !state.used.has(image.title));
      images.forEach(image => {
        if (found.length < 6) {
          state.used.add(image.title);
          found.push(image);
        }
      });
    }
    state.offset += 18;
    state.variantStart = (state.variantStart + 1) % variants.length;
    if (!found.length) throw new Error('Bu aramada yeni görsel bulunamadı. Başka bir arama deneyebilirsin.');
    return found;
  }
  let turkishEdition;
  async function getQuranMessage(seenTexts = []) {
    if (!turkishEdition) {
      const response = await fetch('https://api.alquran.cloud/v1/edition?language=tr&type=translation');
      if (!response.ok) throw new Error('Ayet kaynağına ulaşılamadı.');
      const result = await response.json();
      const editions = result.data || [];
      turkishEdition = editions.find(item => item.identifier === 'tr.diyanet')?.identifier || editions[0]?.identifier;
      if (!turkishEdition) throw new Error('Türkçe meal bulunamadı.');
    }
    const seen = new Set(seenTexts);
    for (let attempt=0; attempt<20; attempt++) {
      const surah = 1 + Math.floor(Math.random()*114);
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/editions/quran-uthmani,${encodeURIComponent(turkishEdition)}`);
      if (!response.ok) continue;
      const result = await response.json();
      const arabic = result.data?.find(item=>item.edition?.identifier==='quran-uthmani');
      const turkish = result.data?.find(item=>item.edition?.identifier===turkishEdition);
      if (!arabic || !turkish) continue;
      const candidates = turkish.ayahs.map((ayah,index)=>({turkish:ayah,arabic:arabic.ayahs[index]})).filter(pair=>{const count=pair.turkish.text.trim().split(/\s+/).length;const id=pair.turkish.text.trim().replace(/\s+/g,' ').toLocaleLowerCase('tr');return count>=15&&count<=25&&!seen.has(id);});
      if (candidates.length) {
        const pair=candidates[Math.floor(Math.random()*candidates.length)];
        return {text:pair.turkish.text,arabic:pair.arabic.text,source:`Kur'an-ı Kerim · ${turkish.englishName} Suresi, ${pair.turkish.numberInSurah}. ayet`,citation:`${turkish.englishName} ${pair.turkish.numberInSurah}`};
      }
    }
    throw new Error('Uygun uzunlukta bir Türkçe ayet bulunamadı. Tekrar deneyebilirsin.');
  }
  let seasonalContent;
  let hadithContent;
  async function getSeasonalContent() {
    if (!seasonalContent) {
      const response = await fetch('./data/mesajlar-tr.json', { cache:'no-cache' });
      if (!response.ok) throw new Error('Mesaj kataloğu yüklenemedi.');
      seasonalContent = await response.json();
    }
    return seasonalContent;
  }
  async function getHadithContent() {
    if (hadithContent) return hadithContent;
    const topics = ['merhamet','güzel söz','kolaylık','iyilik','sabır','şükür','doğruluk','komşu hakkı','anne baba','ilim','yardımlaşma','güvenilirlik','selamlaşma','öfke','kul hakkı','sadaka','tevazu','kardeşlik','temizlik','niyet'];
    const shuffledTopics = topics.sort(() => Math.random() - .5).slice(0, 6);
    const responses = await Promise.allSettled(shuffledTopics.map(async topic => {
      const params = new URLSearchParams({ q:topic, lang:'tr', limit:'10', offset:String(Math.floor(Math.random() * 4) * 10) });
      const response = await fetch(`https://sunnetimiz.com/api/v1/search?${params}`);
      if (!response.ok) throw new Error('Hadis kaynağına ulaşılamadı.');
      const result = await response.json();
      return result.results || [];
    }));
    const unique = new Map();
    responses.filter(result=>result.status==='fulfilled').forEach(result=>result.value.forEach(hadith=>{
      const text=hadith.turkish;
      const words=text?.trim().split(/\s+/).length||0;
      if(text&&words>=15&&words<=25&&hadith.ref&&!unique.has(hadith.ref)) unique.set(hadith.ref,{text,arabic:hadith.arabic||'',source:`Kaynak: Sünnetimiz.com · ${hadith.ref}`,sourceUrl:hadith.url||`https://sunnetimiz.com/${hadith.ref}`});
    }));
    if(!unique.size) throw new Error('Şu anda uygun uzunlukta çevrimiçi hadis bulunamadı.');
    hadithContent=Array.from(unique.values()).sort(()=>Math.random()-.5);
    return hadithContent;
  }
  async function getOnlineMessages(category) {
    if(category==='hadith') return getHadithContent();
    const content=await getSeasonalContent();
    const messages=content[category];
    if(!Array.isArray(messages)||!messages.length) throw new Error('Bu kategori için çevrimiçi mesaj bulunamadı.');
    return messages;
  }
  async function refreshHadithMessages() {
    hadithContent = null;
    return getHadithContent();
  }
  window.MesajData = { messages, titles, categories, searchCommons, getQuranMessage, getOnlineMessages, refreshHadithMessages };
})();
