const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const sharp=require('sharp');
(async()=>{
 const illustration=await sharp(path.join(root,'assets/anatomy-ripple-tank.webp')).png().toBuffer();
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="627" viewBox="0 0 1200 627">
 <rect width="1200" height="627" fill="#fbfbfa"/>
 <g font-family="DejaVu Sans,Arial,Helvetica,sans-serif" fill="#181b19">
 <path d="M58 83H1142M58 559H1142" stroke="#cdd0c8" stroke-width="1"/>
 <rect x="58" y="46" width="8" height="8" fill="#234b35"/>
 <text x="78" y="55" font-size="12" font-weight="700" letter-spacing="1.4">A CURATED LEARNING TOOLKIT</text>
 <text x="1142" y="55" text-anchor="end" font-size="12" font-weight="700" letter-spacing="1.4">KIRIL KLEIN</text>
 <text x="54" y="234" font-size="92" font-weight="700" letter-spacing="-5">Learn</text>
 <text x="54" y="329" font-size="92" font-weight="700" letter-spacing="-5">with <tspan fill="#234b35">AI.</tspan></text>
 <text x="58" y="390" font-size="22" fill="#545b54">Explanations you can explore.</text>
 <text x="58" y="422" font-size="22" fill="#545b54">Concepts you can practise.</text>
 <path d="M58 460H116" stroke="#234b35" stroke-width="3"/>
 <text x="58" y="495" font-size="13" fill="#234b35" font-weight="700" letter-spacing="1.2">EXPLAIN / EXPLORE / PRACTISE</text>
 <image x="635" y="94" width="488" height="451" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${illustration.toString('base64')}"/>
 <text x="58" y="593" font-size="15" fill="#3c423c">awesome-learning-with-ai</text>
 <text x="1142" y="593" text-anchor="end" font-size="15" fill="#3c423c">Ripple tank illustration: Anatomy / Ryan · MIT</text>
 </g></svg>`;
 fs.writeFileSync(path.join(root,'assets/cover.svg'),svg);
 await sharp(Buffer.from(svg),{density:144}).png().toFile(path.join(root,'assets/cover.png'));
 const metadata=await sharp(path.join(root,'assets/cover.png')).metadata();
 console.log(JSON.stringify({cover:'assets/cover.png',width:metadata.width,height:metadata.height}));
})().catch(e=>{console.error(e);process.exitCode=1;});
