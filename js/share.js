(() => {
  const content = () => ({ title: document.querySelector('#cardTitle').textContent, message: document.querySelector('#cardMessage').textContent, source: document.querySelector('#cardSource').textContent, signature: document.querySelector('#cardSignature').textContent });
  const messageText = value => `${value.title}\n\n${value.message}${value.source ? `\n${value.source}` : ''}${value.signature ? `\n\n${value.signature}` : ''}`;

  async function createImageBlob(card) {
    const canvas = await window.MesajCanvas.renderCard(card);
    return new Promise((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('Kart görseli oluşturulamadı.')), 'image/png'));
  }

  async function createImageFile(card) {
    return new File([await createImageBlob(card)], 'mesaj-kartim.png', { type: 'image/png' });
  }

  async function copyMessage() {
    const value = content();
    await navigator.clipboard.writeText(messageText(value));
  }

  function openTextShare(platform, text) {
    const base = platform === 'telegram' ? 'https://t.me/share/url?url=&text=' : 'https://wa.me/?text=';
    window.open(`${base}${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  async function directShare(platform, card) {
    const value = content();
    const text = messageText(value);
    if (navigator.share && navigator.canShare) {
      try {
        const file = await createImageFile(card);
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          return 'shared';
        }
      } catch (error) {
        if (error.name === 'AbortError') return 'cancelled';
      }
    }
    await download(card);
    openTextShare(platform, text);
    return 'downloaded';
  }

  async function download(card) {
    const blob = await createImageBlob(card);
    const link = document.createElement('a');
    link.download = 'mesaj-kartim.png';
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  async function share(card) {
    return directShare('whatsapp', card);
  }

  window.MesajShare = { copyMessage, download, share, directShare };
})();
