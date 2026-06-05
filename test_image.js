const url = 'https://www.kapruka.com/buyonline/glitter-hearts-chocolate-box/kid/ef_pc_choc0v571pod00076';

fetch(url)
  .then(r => r.text())
  .then(html => {
    const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
    const twMatch = html.match(/name="twitter:image"\s+content="([^"]+)"/i);
    const imgMatch = html.match(/id="sync1"[^>]*>.*?<img[^>]+src="([^"]+)"/is);
    
    console.log('OG Image:', ogMatch ? ogMatch[1] : 'Not found');
    console.log('Twitter Image:', twMatch ? twMatch[1] : 'Not found');
    console.log('Sync1 Image:', imgMatch ? imgMatch[1] : 'Not found');
  })
  .catch(console.error);
