import {useState,useEffect,useRef} from 'react'
import D from './contes.json'
import {art} from './art.js'
import {BFA,VB,P} from './bfa.js'

const REG={'Guiriko':['sindou','Collines, forêts et vergers du Kénédougou'],'Sourou':['mouhoun','Savane et vallée du Sourou'],'Liptako':['sahel','Dunes, mares et campements du Liptako'],'Oubri':['laongo','Blocs de granit et savane du Oubri'],'Nakambé':['tenkodogo','Terres rouges et karités, berceau du royaume mossi']}
const PA={sindou:['#9BD0E8','#E6F2D5','#3E7F4A'],mouhoun:['#F6B26B','#FBE3A8','#8A9A45'],sahel:['#F2A65A','#FAD7A0','#E2B26A'],laongo:['#A8D4EA','#F0EAD0','#8F9A55'],tenkodogo:['#EE8F5A','#F8D49A','#B5532F']}
const FT={
sindou:<g fill="#B07B4A"><polygon points="50,175 75,65 100,175"/><polygon points="90,175 125,35 160,175"/><polygon points="150,175 175,85 200,175"/></g>,
mouhoun:<g><path d="M0 195 Q120 172 400 200" stroke="#4C97C9" strokeWidth="16" fill="none"/><rect x="82" y="105" width="30" height="75" fill="#6B4A2F"/><ellipse cx="97" cy="102" rx="52" ry="26" fill="#4F7A3A"/></g>,
sahel:<g><path d="M0 188 Q90 120 190 178 T400 150 V220 H0Z" fill="#EAC074"/><rect x="60" y="120" width="5" height="50" fill="#5A4028"/><ellipse cx="62" cy="116" rx="30" ry="9" fill="#5E7F3B"/></g>,
laongo:<g fill="#8B8680"><ellipse cx="110" cy="150" rx="58" ry="38"/><ellipse cx="175" cy="160" rx="40" ry="28"/><ellipse cx="132" cy="108" rx="34" ry="25"/></g>,
tenkodogo:<g><g fill="#8A3F24"><rect x="70" y="118" width="74" height="58"/><polygon points="60,120 107,82 154,120"/><rect x="178" y="136" width="52" height="40"/><polygon points="172,138 204,110 236,138"/></g><rect x="290" y="120" width="6" height="55" fill="#4A3320"/><circle cx="293" cy="116" r="26" fill="#4F7A3A"/></g>}
const uniq=k=>[...new Set(D.flatMap(c=>[].concat(c[k])))].sort((a,b)=>a.localeCompare(b,'fr'))
const star=(x,y,R)=>Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,r=i%2?R*.382:R;return `${x+r*Math.cos(a)},${y+r*Math.sin(a)}`}).join(' ')

function Flag({w}){return <svg viewBox="0 0 150 100" width={w} role="img" aria-label="Drapeau du Burkina Faso" className="flag"><rect width="150" height="50" fill="#EF2B2D"/><rect y="50" width="150" height="50" fill="#009E49"/><polygon points={star(75,50,24)} fill="#FCD116"/></svg>}

function Paysage({r}){const k=REG[r][0],[a,b,g]=PA[k],[ok,setOk]=useState(true)
 return <div className="ph"><svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id={'s'+k} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a}/><stop offset="1" stopColor={b}/></linearGradient></defs><rect width="400" height="220" fill={`url(#s${k})`}/><circle className="pulse" cx="320" cy="55" r="24" fill="#FCD116"/>{FT[k]}<path d="M0 178 Q100 150 200 172 T400 166 V220 H0Z" fill={g}/></svg>{ok&&<img src={`regions/${k}.jpg`} alt={REG[r][1]} onError={()=>setOk(false)}/>}</div>}

function Carte({ok,sel}){return <svg viewBox={`0 0 ${VB[0]} ${VB[1]}`} className="map" role="img" aria-label="Carte du Burkina Faso et lieux des contes">
 <defs><clipPath id="cp"><path d={BFA}/></clipPath></defs>
 <g clipPath="url(#cp)"><rect width={VB[0]} height={VB[1]/2} fill="#EF2B2D"/><rect y={VB[1]/2} width={VB[0]} height={VB[1]/2} fill="#009E49"/></g>
 <path d={BFA} fill="none" stroke="#fff" strokeWidth="3"/>
 <polygon points={star(...P(-1.6,12.3),34)} fill="#FCD116" opacity=".9"/>
 {D.map(c=>{const[x,y]=P(c.lng,c.lat),on=ok(c);return <a key={c.id} href={`#conte-${c.id}`} className={'pin'+(c.id===sel?' sel':'')} style={{opacity:on?1:.2,pointerEvents:on?'auto':'none'}} aria-label={c.titre}><circle cx={x} cy={y} r="13"/><text x={x+18} y={y+6}>{c.lieu}</text></a>})}
</svg>}

function Filtres({f,set}){const g=(l,k)=><div className="grp"><b>{l}</b>{['',...uniq(k==='region'?'region':'langues')].map(v=><button key={v} className="chip" aria-pressed={(f[k]||'')===v} onClick={()=>set({...f,[k]:v})}>{v||'Toutes'}</button>)}</div>
 return <div className="filtres">{g('Région','region')}{g('Langue','langue')}</div>}

function Carton({c}){return <a className="card" href={`#conte-${c.id}`}><Paysage r={c.region}/><div className="cb"><h3>{c.titre}</h3><p>{c.lieu}, {c.region}</p><span>{c.langues.join(', ')}</span></div></a>}

function Lecteur({c,close}){const[i,setI]=useState(0),[q,setQ]=useState(false),[lang,setLang]=useState(c.langues[0]),[auto,setAuto]=useState(false),[on,setOn]=useState(false),[msg,setMsg]=useState(''),[rep,setRep]=useState(null),au=useRef(null),last=c.scenes.length-1
 const stop=()=>{window.speechSynthesis&&speechSynthesis.cancel();const a=au.current;if(a){a.onended=a.onerror=null;a.pause()}}
 const go=d=>{stop();if(d>0&&i===last)setQ(true);else setI(i+d)}
 const play=()=>{stop();setOn(true);let n=0;const end=()=>auto&&go(1)
  const fb=()=>{if(n++)return;if(lang==='Français'&&window.speechSynthesis){const u=new SpeechSynthesisUtterance(c.scenes[i]);u.lang='fr-FR';u.onend=end;speechSynthesis.speak(u);setMsg('Voix de synthèse en français.')}else setMsg(`Enregistrement en ${lang} à venir.`)}
  const a=new Audio(`audio/${c.id}-${lang.toLowerCase()}-${i+1}.mp3`);au.current=a;a.onended=end;a.onerror=fb;a.play().catch(fb)}
 useEffect(()=>{if(on&&auto&&!q)play()},[i])
 useEffect(()=>{const k=e=>e.key==='Escape'&&close();addEventListener('keydown',k);return()=>{removeEventListener('keydown',k);stop()}},[])
 return <div className="rd" role="dialog" aria-modal="true" aria-label="Lecture du conte"><div className="rh"><h2>{c.titre}</h2><button className="chip" onClick={close}>Fermer</button></div>
 <div className="rb">{q?<><p className="big">{c.quiz.q}</p><div className="qs">{c.quiz.choix.map((t,k)=><button key={k} className="chip" onClick={()=>setRep(k)}>{t}</button>)}</div><p aria-live="polite">{rep!==null&&(rep===c.quiz.bon?'Bravo, bonne réponse !':`Pas tout à fait. La bonne réponse : ${c.quiz.choix[c.quiz.bon]}.`)}</p><button className="chip" onClick={()=>{setQ(false);setI(0);setRep(null)}}>Relire le conte</button></>
 :<><div dangerouslySetInnerHTML={{__html:art(c,i)}}/><p className="big" key={i}>{c.scenes[i]}</p><p className="meta">Scène {i+1} sur {last+1}{c.statut!=='Résumé rédigé'&&' – texte provisoire, pas la version du recueil'}</p>
 <div className="ctl"><button className="chip" disabled={!i} onClick={()=>go(-1)}>Précédent</button><button className="chip" onClick={play}>Écouter</button><button className="chip" onClick={()=>go(1)}>{i<last?'Suivant':'Quiz'}</button></div>
 <div className="ctl"><label>Langue <select value={lang} onChange={e=>{stop();setLang(e.target.value)}}>{c.langues.map(l=><option key={l}>{l}</option>)}</select></label><label><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/> Enchaîner les scènes</label></div><p className="meta" aria-live="polite">{msg}</p></>}</div></div>}

export default function App(){
 const[h,setH]=useState(location.hash.slice(1)||'accueil'),[f,setF]=useState({region:'',langue:''}),[lire,setLire]=useState(false),[sel,setSel]=useState(D[0].id)
 useEffect(()=>{const fn=()=>{setH(location.hash.slice(1)||'accueil');scrollTo(0,0)};addEventListener('hashchange',fn);return()=>removeEventListener('hashchange',fn)},[])
 const ok=c=>(!f.region||c.region===f.region)&&(!f.langue||c.langues.includes(f.langue)),L=D.filter(ok)
 const cur=h.startsWith('conte-')&&D.find(c=>c.id===h.slice(6)),nav=[['accueil','Accueil'],['carte','Carte'],['contes','Contes'],['apropos','À propos']]
 const cs=D.find(c=>c.id===sel&&ok(c))||L[0]
 return <>
 <header><div className="tri"/><div className="wrap top"><Flag w={54}/><div><b>BURKINA FASO</b><small>La Patrie ou la Mort, Nous Vaincrons</small></div><p>Contes et légendes du Burkina Faso</p></div>
 <nav aria-label="Navigation principale"><div className="wrap">{nav.map(([k,t])=><a key={k} href={'#'+k} aria-current={h===k||(k==='contes'&&cur)?'page':undefined}>{t}</a>)}</div></nav></header>
 <main className="wrap">
 {h==='accueil'&&<><section className="hero"><div><h1>Les contes et légendes du Burkina Faso, à portée de clic</h1><p>Parcourez le pays, écoutez les récits dans les langues nationales et suivez chaque histoire scène par scène.</p><div className="cta"><a className="btn" href="#carte">Explorer la carte</a><a className="btn alt" href="#contes">Parcourir les contes</a></div>
 <dl className="stats"><div><dt>Contes</dt><dd>{D.length}</dd></div><div><dt>Régions</dt><dd>{uniq('region').length}</dd></div><div><dt>Langues</dt><dd>{uniq('langues').length}</dd></div></dl></div>
 <div className="fm"><Flag w={190}/><Carte ok={()=>true} sel={null}/></div></section>
 <h2 className="sec">Régions à découvrir</h2><div className="grid">{Object.keys(REG).map(r=>{const n=D.filter(c=>c.region===r);return <a key={r} className="card" href={'#conte-'+n[0].id}><Paysage r={r}/><div className="cb"><h3>{r}</h3><p>{REG[r][1]}</p><span>{n.map(c=>c.titre).join(' ; ')}</span></div></a>})}</div></>}
 {h==='carte'&&<><h1 className="pt">Carte des contes</h1><Filtres f={f} set={setF}/><div className="cg"><Carte ok={ok} sel={cs&&cs.id}/><div>{cs?<div className="fiche"><Paysage r={cs.region}/><h2>{cs.titre}</h2><p className="meta">{cs.lieu}, {cs.region}, peuple {cs.peuple}</p><p>{cs.resume}</p><a className="btn" href={'#conte-'+cs.id}>Ouvrir le conte</a></div>:<p>Aucun conte pour ces filtres.</p>}<ul className="lst">{L.map(c=><li key={c.id}><button className="chip" aria-pressed={cs&&c.id===cs.id} onClick={()=>setSel(c.id)}>{c.titre}</button></li>)}</ul></div></div></>}
 {h==='contes'&&<><h1 className="pt">Tous les contes</h1><Filtres f={f} set={setF}/><div className="grid">{L.map(c=><Carton key={c.id} c={c}/>)}</div>{!L.length&&<p>Aucun conte pour ces filtres.</p>}</>}
 {cur&&<article className="conte"><a href="#contes">Retour aux contes</a><Paysage r={cur.region}/><h1>{cur.titre}</h1><p className="meta">{cur.lieu}, {cur.region}, peuple {cur.peuple}</p><p>{cur.langues.map(l=><span className="tag" key={l}>{l}</span>)}<span className="tag st">{cur.statut}</span></p><p>{cur.resume}</p><button className="btn" onClick={()=>setLire(true)}>Lire le conte (mode immersif)</button><p className="meta">Source : {cur.source}</p>{lire&&<Lecteur c={cur} close={()=>setLire(false)}/>}</article>}
 {h==='apropos'&&<article className="conte"><h1>À propos</h1><p>Cette plateforme numérise et transmet le patrimoine oral burkinabè : contes, légendes et récits historiques, avec illustrations animées et audio en langues nationales.</p><p>Les contes sont inspirés de recueils publiés (Diep et Bamba, Koné, Nabié, Sissao, tradition mossi). Leur texte n’est pas reproduit : les scènes sont des adaptations originales courtes, à remplacer par des versions recueillies auprès de conteurs.</p><p>Les enregistrements en mooré, dioula et fulfuldé sont en cours de préparation ; le français est lu par synthèse vocale.</p></article>}
 </main>
 <footer><div className="wrap"><Flag w={40}/><p>Projet Web Multimédia – 2026. Contes et légendes du Burkina Faso.</p></div></footer></>}
