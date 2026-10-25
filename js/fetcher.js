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
  const searchTerms = { mosque: 'mosque', cami: 'mosque', lantern:'lantern', fener:'lantern', 'gün batımı':'sunset over mosque', sunset:'sunset mosque', günbatımı: 'sunset mosque', kandil: 'lantern mosque', nature:'nature landscape', doğa: 'nature landscape', ramazan: 'ramadan lantern' };
  async function searchCommons(query) {
    const term = searchTerms[query.toLocaleLowerCase('tr')] || query;
    const params = new URLSearchParams({ action:'query', generator:'search', gsrsearch:`filetype:bitmap ${term}`, gsrnamespace:'6', gsrlimit:'6', prop:'imageinfo', iiprop:'url|extmetadata', iiurlwidth:'520', format:'json', origin:'*' });
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
    if (!response.ok) throw new Error('Görseller alınamadı.');
    const result = await response.json();
    return Object.values(result.query?.pages || {}).map(page => ({ title:page.title.replace('File:',''), url:page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url, full:page.imageinfo?.[0]?.url, credit:page.imageinfo?.[0]?.extmetadata?.Artist?.value || '' })).filter(image => image.url);
  }
  async function searchUnsplash(query) {
    const terms = { mosque:'photo-1564769625905-50e93615e769', cami:'photo-1564769625905-50e93615e769', lantern:'photo-1519817650390-64a93db51149', fener:'photo-1519817650390-64a93db51149', ramadan:'photo-1519817650390-64a93db51149', kandil:'photo-1519817650390-64a93db51149', sunset:'photo-1500530855697-b586d89ba3ee', 'gün batımı':'photo-1500530855697-b586d89ba3ee', nature:'photo-1470770841072-f978cf4d019e', doğa:'photo-1470770841072-f978cf4d019e' };
    const id = terms[query.toLocaleLowerCase('tr')] || terms.mosque;
    return [0,1,2,3,4,5].map((n) => ({ title:`Unsplash · ${query}`, url:`https://images.unsplash.com/${id}?auto=format&fit=crop&w=520&h=720&q=75&sat=-8&sig=${n}`, full:`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&h=1900&q=90&sat=-8&sig=${n}`, credit:'Unsplash' }));
  }
  let turkishEdition;
  async function getQuranMessage() {
    if (!turkishEdition) {
      const response = await fetch('https://api.alquran.cloud/v1/edition?language=tr&type=translation');
      if (!response.ok) throw new Error('Ayet kaynağına ulaşılamadı.');
      const result = await response.json();
      const editions = result.data || [];
      turkishEdition = editions.find(item => item.identifier === 'tr.diyanet')?.identifier || editions[0]?.identifier;
      if (!turkishEdition) throw new Error('Türkçe meal bulunamadı.');
    }
    for (let attempt=0; attempt<8; attempt++) {
      const surah = 1 + Math.floor(Math.random()*114);
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/editions/quran-uthmani,${encodeURIComponent(turkishEdition)}`);
      if (!response.ok) continue;
      const result = await response.json();
      const arabic = result.data?.find(item=>item.edition?.identifier==='quran-uthmani');
      const turkish = result.data?.find(item=>item.edition?.identifier===turkishEdition);
      if (!arabic || !turkish) continue;
      const candidates = turkish.ayahs.map((ayah,index)=>({turkish:ayah,arabic:arabic.ayahs[index]})).filter(pair=>{const count=pair.turkish.text.trim().split(/\s+/).length;return count>=15&&count<=25;});
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
    const topics = ['merhamet','güzel söz','kolaylık','iyilik','sabır','şükür'];
    const responses = await Promise.allSettled(topics.map(async topic => {
      const params = new URLSearchParams({ q:topic, lang:'tr', limit:'10' });
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
  window.MesajData = { messages, titles, categories, searchCommons, searchUnsplash, getQuranMessage, getOnlineMessages, refreshHadithMessages };
})();
