(() => {
  const $ = selector => document.querySelector(selector);
  const category = $('#category');
  const choice = $('#messageChoice');
  const messageText = $('#messageText');
  const messageSource = $('#messageSource');
  const imageGrid = $('#imageGrid');
  const card = $('#greetingCard');
  const onlineCategories = new Set(['hadith', 'dua', 'bayram', 'kandil', 'esma']);
  const textHistoryKey = 'mesaj-seen-texts-v1';
  let textHistory = {};
  try { textHistory = JSON.parse(localStorage.getItem(textHistoryKey) || '{}') || {}; } catch { textHistory = {}; }
  let activeMessages = [];
  let quranEntry = null;
  let thematicQuran = false;
  let selectedImage = null;
  let loadToken = 0;
  let imageLoadToken = 0;
  let activeImageQuery = 'mosque';
  let isLoading = false;

  function textId(item) {
    return String(item?.text || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr');
  }

  function unseenMessages(key, list) {
    const seen = new Set(textHistory[key] || []);
    const unseen = list.filter(item => !seen.has(textId(item)));
    if (unseen.length) return unseen;
    // Start a new rotation only after every text in this category was shown.
    textHistory[key] = [];
    try { localStorage.setItem(textHistoryKey, JSON.stringify(textHistory)); } catch {}
    return list;
  }

  function rememberMessage(key, item) {
    const id = textId(item);
    if (!id) return;
    const seen = new Set(textHistory[key] || []);
    if (seen.has(id)) return;
    seen.add(id);
    textHistory[key] = Array.from(seen).slice(-5000);
    try { localStorage.setItem(textHistoryKey, JSON.stringify(textHistory)); } catch {}
  }

  function applyTextSizes() {
    const sizes = { title: 'titleSize', message: 'messageSize', arabic: 'arabicSize', source: 'sourceSize', signature: 'signatureSize' };
    Object.entries(sizes).forEach(([key, id]) => {
      const value = Number($(`#${id}`).value);
      card.style.setProperty(`--card-${key}-scale`, String(value / 100));
      card.dataset[`${key}Size`] = String(value);
      $(`#${id}Value`).value = `${value}%`;
      $(`#${id}Value`).textContent = `${value}%`;
    });
  }

  const toast = text => {
    const node = $('#toast');
    node.textContent = text;
    node.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove('show'), 2800);
  };

  function setSource(node, item, prefix = '') {
    node.replaceChildren();
    if (!item?.source) return;
    if (item.sourceUrl) {
      const link = document.createElement('a');
      link.href = item.sourceUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = `${prefix}${item.source}`;
      node.append(link);
    } else {
      node.textContent = `${prefix}${item.source}`;
    }
  }

  function updateMessage() {
    const item = category.value === 'quran' ? quranEntry : activeMessages[Number(choice.value)];
    const selectedItem = category.value === 'quran' && thematicQuran && activeMessages.length ? activeMessages[Number(choice.value)] : item;
    if (selectedItem) rememberMessage(category.value, selectedItem);
    messageText.textContent = selectedItem?.text || '';
    setSource(messageSource, selectedItem);
    $('#cardMessage').textContent = selectedItem?.text || $('#customMessage').value || 'Kalbinden geçen güzel bir söz...';
    setSource($('#cardSource'), selectedItem, '— ');
    const arabic = $('#cardArabic');
    arabic.textContent = selectedItem?.arabic || '';
    arabic.classList.toggle('hidden', !(['quran', 'esma'].includes(category.value) && $('#showArabic').checked && selectedItem?.arabic));
    $('#cardBasmala').classList.toggle('hidden', category.value !== 'quran');
  }

  function updateCard() {
    const key = category.value;
    $('#cardTitle').textContent = key === 'quran' ? 'Kur’an’dan bir ayet' : window.MesajData.titles[key];
    $('#cardKicker').textContent = window.MesajData.categories[key] || 'KUR’AN-I KERİM’DEN';
    $('#customBlock').classList.toggle('hidden', key !== 'custom');
    $('#messagePickerBlock').classList.toggle('hidden', key === 'custom');
    $('#arabicToggle').classList.toggle('hidden', !['quran', 'esma'].includes(key));
    $('#cardBasmala').classList.toggle('hidden', key !== 'quran');
    $('#quranTopicBlock').classList.toggle('hidden', key !== 'quran');
    $('.order-block').classList.toggle('hidden', !['quran', 'esma'].includes(key));
    if (key !== 'custom') updateMessage();
    else {
      $('#cardMessage').textContent = $('#customMessage').value || 'Kalbinden geçen güzel bir söz...';
      $('#cardSource').replaceChildren();
      $('#cardArabic').classList.add('hidden');
    }
    const signature = $('#senderName').value.trim();
    $('#cardSignature').textContent = signature ? `— ${signature}` : '';
    card.className = `greeting-card font-${$('#fontChoice').value}`;
    applyTextSizes();
    card.dataset.overlay = $('#overlayRange').value;
    $('#cardShade').style.background = `linear-gradient(180deg,rgba(11,30,23,${Number($('#overlayRange').value) / 250}),rgba(10,28,22,${Math.min(.94, Number($('#overlayRange').value) / 100 + .32)}))`;
    $('#rangeValue').textContent = `%${$('#overlayRange').value}`;
  }

  function applyTextOrder() {
    const stack = $('#textStack');
    const nodes = { arabic: $('#cardArabic'), message: $('#cardMessage'), source: $('#cardSource'), signature: $('#cardSignature') };
    $('#textOrder').value.split(',').forEach(key => stack.append(nodes[key]));
  }

  function populateMessages(list, randomStart = false, key = category.value) {
    activeMessages = key === 'esma' ? list : unseenMessages(key, list);
    if (key === 'quran' && $('#quranTopic').value !== 'random') activeMessages.forEach(item => rememberMessage(key, item));
    choice.replaceChildren();
    activeMessages.forEach((item, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      const reference = item.citation || item.ref || item.source || `Mesaj ${index + 1}`;
      option.textContent = `${reference} · ${item.text.slice(0, 52)}${item.text.length > 52 ? '…' : ''}`;
      choice.append(option);
    });
    if (randomStart && activeMessages.length) choice.value = String(Math.floor(Math.random() * activeMessages.length));
    updateMessage();
  }

  async function loadOnlineCategory(key, refresh = false) {
    const token = ++loadToken;
    isLoading = true;
    activeMessages = [];
    choice.replaceChildren(new Option('İnternetten içerik yükleniyor…', ''));
    choice.disabled = true;
    $('#anotherMessage').disabled = true;
    messageText.textContent = 'İnternetten içerik aranıyor…';
    messageSource.textContent = '';
    $('#cardMessage').textContent = 'İçerik yükleniyor…';
    $('#cardSource').replaceChildren();
    $('#cardArabic').classList.add('hidden');
    try {
      const list = refresh && key === 'hadith'
        ? await window.MesajData.refreshHadithMessages()
        : await window.MesajData.getOnlineMessages(key);
      if (token !== loadToken || category.value !== key) return;
      populateMessages(list, true);
    } catch (error) {
      if (token !== loadToken || category.value !== key) return;
      const fallback = window.MesajData.messages[key] || [];
      if (fallback.length) {
        populateMessages(fallback, true);
        toast('Çevrimiçi kaynağa ulaşılamadı; kayıtlı seçim gösteriliyor.');
      } else {
        activeMessages = [];
        choice.replaceChildren(new Option('İçerik şu anda yüklenemedi', ''));
        messageText.textContent = '';
        messageSource.textContent = error.message;
        $('#cardMessage').textContent = 'İçerik şu anda yüklenemedi. Biraz sonra yeniden deneyebilirsin.';
        toast(error.message);
      }
    } finally {
      if (token === loadToken) {
        isLoading = false;
        choice.disabled = false;
        $('#anotherMessage').disabled = false;
      }
    }
  }

  async function loadQuran() {
    const token = ++loadToken;
    isLoading = true;
    quranEntry = null;
    activeMessages = [];
    thematicQuran = false;
    choice.replaceChildren(new Option('Türkçe ayet getiriliyor…', ''));
    choice.disabled = true;
    messageText.textContent = 'Türkçe meal aranıyor…';
    messageSource.textContent = '';
    $('#cardMessage').textContent = 'Bir ayet yükleniyor…';
    $('#anotherMessage').disabled = true;
    try {
      const topic = $('#quranTopic').value;
      const verses = topic === 'random'
        ? null
        : await window.MesajData.getThematicQuranMessages(topic, textHistory.quran || []);
      if (token !== loadToken || category.value !== 'quran') return;
      if (verses) {
        thematicQuran = true;
        populateMessages(verses, true, 'quran');
        return;
      }
      const verse = await window.MesajData.getQuranMessage(textHistory.quran || []);
      if (token !== loadToken || category.value !== 'quran') return;
      quranEntry = verse;
      choice.replaceChildren(new Option(verse.citation, 'quran'));
      updateMessage();
    } catch (error) {
      if (token !== loadToken || category.value !== 'quran') return;
      messageText.textContent = '';
      messageSource.textContent = error.message;
      $('#cardMessage').textContent = 'Ayet şu anda yüklenemedi. Yeniden deneyebilirsin.';
      $('#cardSource').replaceChildren();
      $('#cardArabic').classList.add('hidden');
      toast(error.message);
    } finally {
      if (token === loadToken) {
        isLoading = false;
        choice.disabled = false;
        $('#anotherMessage').disabled = false;
      }
    }
  }

  function renderImages(images) {
    imageGrid.replaceChildren();
    if (!images.length) {
      imageGrid.innerHTML = '<span class="image-state">Bu aramada görsel bulunamadı.</span>';
      return;
    }
    images.forEach((image, index) => {
      const button = document.createElement('button');
      button.className = 'image-choice';
      button.type = 'button';
      const details = [image.title, image.credit, image.license].filter(Boolean).join(' · ');
      button.setAttribute('aria-label', details || `Görsel ${index + 1}`);
      button.title = details;
      const img = document.createElement('img');
      img.src = image.url;
      img.alt = '';
      img.loading = 'lazy';
      button.append(img);
      button.addEventListener('click', () => {
        selectedImage = image;
        imageGrid.querySelectorAll('.image-choice').forEach(item => item.classList.remove('selected'));
        button.classList.add('selected');
        $('#cardImage').style.backgroundImage = `url("${image.full || image.url}")`;
        card.dataset.image = image.full || image.url;
      });
      imageGrid.append(button);
      if (index === 0) button.click();
    });
  }

  async function searchImages({ more = false } = {}) {
    const query = $('#imageSearch').value.trim() || 'mosque';
    if (!more || query !== activeImageQuery) {
      more = false;
      activeImageQuery = query;
    }
    const token = ++imageLoadToken;
    if (!more) {
      imageGrid.innerHTML = '<span class="image-state">Görseller aranıyor…</span>';
      $('#moreImages').classList.add('hidden');
    }
    $('#searchButton').disabled = true;
    $('#moreImages').disabled = true;
    if (more) $('#moreImages').textContent = 'Yeni görseller aranıyor…';
    try {
      const images = await window.MesajData.searchCommons(query, { more });
      if (token !== imageLoadToken) return;
      renderImages(images);
      $('#moreImages').classList.toggle('hidden', !images.length);
    } catch (error) {
      if (token !== imageLoadToken) return;
      if (!more) imageGrid.innerHTML = '<span class="image-state">Görseller yüklenemedi. Yeniden deneyebilirsin.</span>';
      toast(error.message);
    } finally {
      if (token === imageLoadToken) {
        $('#searchButton').disabled = false;
        $('#moreImages').disabled = false;
        $('#moreImages').textContent = '↻ Daha fazla görsel yükle';
      }
    }
  }

  category.addEventListener('change', () => {
    quranEntry = null;
    thematicQuran = false;
    activeMessages = [];
    if (category.value === 'quran') {
      updateCard();
      loadQuran();
    } else if (onlineCategories.has(category.value)) {
      updateCard();
      loadOnlineCategory(category.value);
    } else {
      loadToken++;
      isLoading = false;
      populateMessages(window.MesajData.messages[category.value] || []);
      updateCard();
    }
  });
  choice.addEventListener('change', updateMessage);
  $('#quranTopic').addEventListener('change', () => {
    if (category.value === 'quran') loadQuran();
  });
  $('#anotherMessage').addEventListener('click', () => {
    if (isLoading) return;
    if (category.value === 'quran') {
      loadQuran();
      return;
    }
    if (choice.options.length < 2) return;
    if (category.value === 'esma') {
      const current = choice.selectedIndex;
      const next = Math.floor(Math.random() * (choice.options.length - 1));
      choice.selectedIndex = next >= current ? next + 1 : next;
      updateMessage();
      return;
    }
    if (choice.selectedIndex >= choice.options.length - 1) {
      if (onlineCategories.has(category.value)) loadOnlineCategory(category.value, category.value === 'hadith');
      else populateMessages(window.MesajData.messages[category.value] || [], true, category.value);
      return;
    }
    choice.selectedIndex = (choice.selectedIndex + 1) % choice.options.length;
    updateMessage();
  });

  $('#showArabic').addEventListener('change', updateMessage);
  $('#textOrder').addEventListener('change', applyTextOrder);
  document.querySelectorAll('.suggestions [data-query]').forEach(button => button.addEventListener('click', () => {
    $('#imageSearch').value = button.dataset.query;
    searchImages();
  }));
  $('#customMessage').addEventListener('input', event => {
    $('#charCount').textContent = event.target.value.length;
    updateCard();
  });
  $('#senderName').addEventListener('input', updateCard);
  $('#fontChoice').addEventListener('change', updateCard);
  $('#overlayRange').addEventListener('input', updateCard);
  ['titleSize', 'messageSize', 'arabicSize', 'sourceSize', 'signatureSize'].forEach(id => {
    $(`#${id}`).addEventListener('input', applyTextSizes);
  });
  $('#searchButton').addEventListener('click', searchImages);
  $('#moreImages').addEventListener('click', () => searchImages({ more: true }));
  $('#imageSearch').addEventListener('keydown', event => { if (event.key === 'Enter') searchImages(); });
  $('#imageUpload').addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Lütfen bir görsel seç.');
      return;
    }
    const url = URL.createObjectURL(file);
    selectedImage = { url, full: url, title: file.name };
    $('#cardImage').style.backgroundImage = `url("${url}")`;
    card.dataset.image = url;
    imageGrid.querySelectorAll('.image-choice').forEach(item => item.classList.remove('selected'));
    toast('Fotoğrafın eklendi.');
  });
  $('#downloadButton').addEventListener('click', async () => {
    try {
      await window.MesajShare.download(card);
      toast('Kart görselin indirildi.');
    } catch {
      toast('İndirme hazırlanamadı.');
    }
  });
  $('#whatsappButton').addEventListener('click', () => window.MesajShare.directShare('whatsapp'));
  $('#telegramButton').addEventListener('click', () => window.MesajShare.directShare('telegram'));
  $('#copyButton').addEventListener('click', async () => {
    try {
      await window.MesajShare.copyMessage();
      toast('Mesaj kopyalandı.');
    } catch {
      toast('Kopyalama bu tarayıcıda kullanılamıyor.');
    }
  });

  populateMessages(window.MesajData.messages.cuma);
  updateCard();
  applyTextOrder();
  searchImages();
})();
