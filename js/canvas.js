(() => {
  function loadImage(url) { return new Promise((resolve, reject) => { const image = new Image(); image.crossOrigin = 'anonymous'; image.onload = () => resolve(image); image.onerror = reject; image.src = url; }); }
  async function renderCard(card) {
    const width = 1080, height = 1480, canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d');
    context.fillStyle = '#405d4c'; context.fillRect(0,0,width,height);
    const url = card.dataset.image;
    if (url) { try { const img = await loadImage(url); const scale = Math.max(width/img.width,height/img.height); const w=img.width*scale,h=img.height*scale; context.drawImage(img,(width-w)/2,(height-h)/2,w,h); } catch { /* The solid background is a useful fallback when an image disallows export. */ } }
    const opacity = Number(card.dataset.overlay || 38)/100;
    const gradient = context.createLinearGradient(0,0,0,height); gradient.addColorStop(0,`rgba(10,26,20,${opacity*.55})`); gradient.addColorStop(.48,`rgba(10,26,20,${opacity*.74})`); gradient.addColorStop(1,`rgba(10,26,20,${Math.min(.94,opacity+0.32)})`);
    context.fillStyle=gradient; context.fillRect(0,0,width,height); context.textAlign='center'; context.fillStyle='#e5c697';
    context.font='48px Georgia'; context.fillText('✳',width/2,320);
    const hasKicker=!card.querySelector('#cardKicker').classList.contains('hidden');
    if(hasKicker){context.fillStyle='#ead7b5';context.font='22px Arial';context.fillText(card.querySelector('#cardKicker').textContent,width/2,390);}
    const titleScale=Number(card.dataset.titleSize||100)/100;
    const titleY=hasKicker?475:400;
    const ruleY=titleY+130;
    context.fillStyle='#fffdf2'; context.font=`bold ${62*titleScale}px Georgia`; wrapText(context,card.querySelector('#cardTitle').textContent,width/2,titleY,870,78*titleScale);
    context.fillStyle='#e6c896'; context.font='22px Georgia'; context.fillText('—  ✦  —',width/2,ruleY);
    let textY=ruleY+85;
    for(const node of card.querySelector('#textStack').children){
      const value=node.textContent.trim();if(!value||node.classList.contains('hidden'))continue;
      const scaleKey=node.id==='cardArabic'||node.id==='cardBasmala'?'arabic':node.id==='cardSource'?'source':node.id==='cardSignature'?'signature':'message';
      const scale=Number(card.dataset[`${scaleKey}Size`]||100)/100;
      let font='38px Georgia',color='#fffdf2',lineHeight=62,maxWidth=820,direction='ltr';
      if(node.id==='cardArabic'){font=`${44*scale}px Amiri, serif`;color='#f2dfbd';lineHeight=72*scale;maxWidth=850;direction='rtl';}
      else if(node.id==='cardBasmala'){font=`${38*scale}px Amiri, serif`;color='#f2dfbd';lineHeight=64*scale;maxWidth=900;direction='rtl';}
      else if(node.id==='cardSource'){font=`${22*scale}px Arial`;color='#fffdf2';lineHeight=34*scale;maxWidth=850;}
      else if(node.id==='cardSignature'){font=`italic ${40*scale}px Georgia`;lineHeight=56*scale;maxWidth=850;}
      else font=`${38*scale}px Georgia`;
      context.font=font;context.fillStyle=color;context.direction=direction;context.globalAlpha=node.id==='cardSource'?.85:1;
      const lines=Math.max(1,Math.ceil(context.measureText(value).width/maxWidth));
      if(node.id==='cardSource'||node.id==='cardSignature')context.fillText(value,width/2,textY);
      else wrapText(context,value,width/2,textY,maxWidth,lineHeight);
      textY+=lines*lineHeight+18;
    }
    context.globalAlpha=1;context.direction='ltr';
    return canvas;
  }
  function wrapText(ctx,text,x,y,maxWidth,lineHeight){const words=text.trim().split(/\s+/);let line='',lines=[];for(const word of words){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);const start=y-(lines.length-1)*lineHeight/2;lines.forEach((item,index)=>ctx.fillText(item,x,start+index*lineHeight));}
  window.MesajCanvas = { renderCard };
})();
