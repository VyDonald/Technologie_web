import {useEffect, useId, useRef, useState} from 'react'
import D from './contes.json'
import {art} from './art.js'
import {BFA, VB, P} from './bfa.js'

const REG = {
  Guiriko: {
    image: 'sindou',
    description: 'Pics de Sindou et paysages du Kénédougou',
    landmark: 'Pics de Sindou',
    credit: 'Sylvain Crouzillat',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:PicsdeSindou.jpg',
  },
  Sourou: {
    image: 'mouhoun',
    description: 'Rivière Mouhoun, dans la Boucle du Mouhoun',
    landmark: 'Rivière Mouhoun',
    credit: 'Fred P. M. van der Kraaij / African Studies Centre Leiden',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:ASC_Leiden_-_F._van_der_Kraaij_Collection_-_12_-_052_-_Une_vue_sur_la_rivi%C3%A8re_Mouhoun_-_Boucle_du_Mouhoun,_Burkina_Faso,_1984.tif',
  },
  Liptako: {
    image: 'sahel',
    description: 'Mare d’Oursi, au nord-ouest de Gorom-Gorom',
    landmark: 'Mare d’Oursi',
    credit: 'Martin Wegmann',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Mare_d_oursi2.jpg',
  },
  Oubri: {
    image: 'laongo',
    description: 'Sculpture de granit dans le parc de Laongo',
    landmark: 'Parc de sculptures de Laongo',
    credit: 'Kirsten-h',
    license: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Le_Cri_in_the_sculpture_park_in_Laongo.jpg',
  },
  Nakambé: {
    image: 'tenkodogo',
    description: 'Habitations traditionnelles photographiées à Tenkodogo',
    landmark: 'Tenkodogo',
    credit: 'Fred P. M. van der Kraaij / African Studies Centre Leiden',
    license: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:ASC_Leiden_-_F._van_der_Kraaij_Collection_-_26_-_003_-_Petites_huttes_rondes_aux_toits_de_chaume_pointu_et_des_granges_carr%C3%A9s_-_Tenkodogo,_Burkina_Faso,_1983.tif',
  },
}

const PA = {
  sindou: ['#9BD0E8', '#E6F2D5', '#3E7F4A'],
  mouhoun: ['#F6B26B', '#FBE3A8', '#8A9A45'],
  sahel: ['#F2A65A', '#FAD7A0', '#E2B26A'],
  laongo: ['#A8D4EA', '#F0EAD0', '#8F9A55'],
  tenkodogo: ['#EE8F5A', '#F8D49A', '#B5532F'],
}

const FT = {
  sindou: <g fill="#B07B4A"><polygon points="50,175 75,65 100,175"/><polygon points="90,175 125,35 160,175"/><polygon points="150,175 175,85 200,175"/></g>,
  mouhoun: <g><path d="M0 195 Q120 172 400 200" stroke="#4C97C9" strokeWidth="16" fill="none"/><rect x="82" y="105" width="30" height="75" fill="#6B4A2F"/><ellipse cx="97" cy="102" rx="52" ry="26" fill="#4F7A3A"/></g>,
  sahel: <g><path d="M0 188 Q90 120 190 178 T400 150 V220 H0Z" fill="#EAC074"/><rect x="60" y="120" width="5" height="50" fill="#5A4028"/><ellipse cx="62" cy="116" rx="30" ry="9" fill="#5E7F3B"/></g>,
  laongo: <g fill="#8B8680"><ellipse cx="110" cy="150" rx="58" ry="38"/><ellipse cx="175" cy="160" rx="40" ry="28"/><ellipse cx="132" cy="108" rx="34" ry="25"/></g>,
  tenkodogo: <g><g fill="#8A3F24"><rect x="70" y="118" width="74" height="58"/><polygon points="60,120 107,82 154,120"/><rect x="178" y="136" width="52" height="40"/><polygon points="172,138 204,110 236,138"/></g><rect x="290" y="120" width="6" height="55" fill="#4A3320"/><circle cx="293" cy="116" r="26" fill="#4F7A3A"/></g>,
}

const uniq = key => [...new Set(D.flatMap(conte => [].concat(conte[key])))].sort((a, b) => a.localeCompare(b, 'fr'))
const asset = path => `${import.meta.env.BASE_URL}${path}`
const star = (x, y, radius) => Array.from({length: 10}, (_, i) => {
  const angle = -Math.PI / 2 + i * Math.PI / 5
  const pointRadius = i % 2 ? radius * .382 : radius
  return `${x + pointRadius * Math.cos(angle)},${y + pointRadius * Math.sin(angle)}`
}).join(' ')

function Flag({width}) {
  return <svg viewBox="0 0 150 100" width={width} role="img" aria-label="Drapeau du Burkina Faso" className="flag">
    <rect width="150" height="50" fill="#EF2B2D"/>
    <rect y="50" width="150" height="50" fill="#009E49"/>
    <polygon points={star(75, 50, 24)} fill="#FCD116"/>
  </svg>
}

function Paysage({region}) {
  const details = REG[region]
  const key = details.image
  const gradientId = `sky-${useId().replace(/:/g, '')}`
  const [photoVisible, setPhotoVisible] = useState(true)
  const [sky, horizon, land] = PA[key]

  return <div className="ph">
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={sky}/><stop offset="1" stopColor={horizon}/>
      </linearGradient></defs>
      <rect width="400" height="220" fill={`url(#${gradientId})`}/>
      <circle className="pulse" cx="320" cy="55" r="24" fill="#FCD116"/>
      {FT[key]}
      <path d="M0 178 Q100 150 200 172 T400 166 V220 H0Z" fill={land}/>
    </svg>
    {photoVisible && <img src={asset(`regions/${key}.jpg`)} alt={details.description} loading="lazy" decoding="async" onError={() => setPhotoVisible(false)}/>}
    <span className="photo-caption">{details.landmark}</span>
  </div>
}

function Carte({isVisible, selected}) {
  return <svg viewBox={`0 0 ${VB[0]} ${VB[1]}`} className="map" role="img" aria-label="Carte du Burkina Faso et lieux des contes">
    <defs><clipPath id="country-shape"><path d={BFA}/></clipPath></defs>
    <g clipPath="url(#country-shape)">
      <rect width={VB[0]} height={VB[1] / 2} fill="#EF2B2D"/>
      <rect y={VB[1] / 2} width={VB[0]} height={VB[1] / 2} fill="#009E49"/>
    </g>
    <path d={BFA} fill="none" stroke="#fff" strokeWidth="3"/>
    <polygon points={star(...P(-1.6, 12.3), 34)} fill="#FCD116" opacity=".9"/>
    {D.map(conte => {
      const [x, y] = P(conte.lng, conte.lat)
      const visible = isVisible(conte)
      return <a key={conte.id} href={`#conte-${conte.id}`} className={`pin${conte.id === selected ? ' selected' : ''}`}
        style={{opacity: visible ? 1 : .2, pointerEvents: visible ? 'auto' : 'none'}} aria-label={`Ouvrir ${conte.titre}`}>
        <circle cx={x} cy={y} r="13"/><text x={x + 18} y={y + 6}>{conte.lieu}</text>
      </a>
    })}
  </svg>
}

function Filtres({filters, setFilters, search, setSearch}) {
  const group = (label, key, values) => <div className="filter-group">
    <span className="filter-label">{label}</span>
    <div className="chip-list">
      {['', ...values].map(value => <button key={value || 'all'} className="chip" aria-pressed={(filters[key] || '') === value}
        onClick={() => setFilters({...filters, [key]: value})}>{value || 'Toutes'}</button>)}
    </div>
  </div>

  return <section className="filters" aria-label="Rechercher et filtrer les contes">
    <label className="search-field">
      <span className="sr-only">Rechercher un conte, un lieu ou un peuple</span>
      <span aria-hidden="true" className="search-icon">⌕</span>
      <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Un conte, un lieu, un peuple…"/>
    </label>
    <div className="filter-groups">
      {group('Région', 'region', uniq('region'))}
      {group('Langue', 'language', uniq('langues'))}
    </div>
    {(filters.region || filters.language || search) && <button className="text-button" onClick={() => {setFilters({region: '', language: ''}); setSearch('')}}>
      Effacer les filtres
    </button>}
  </section>
}

function Carton({conte}) {
  return <a className="card story-card" href={`#conte-${conte.id}`}>
    <Paysage region={conte.region}/>
    <div className="card-body">
      <span className="card-kicker">{conte.region} · {conte.lieu}</span>
      <h3>{conte.titre}</h3>
      <p>{conte.resume}</p>
      <span className="card-more">Découvrir le récit <span aria-hidden="true">→</span></span>
    </div>
  </a>
}

function Lecteur({conte, close}) {
  const [index, setIndex] = useState(0)
  const [quiz, setQuiz] = useState(false)
  const [language, setLanguage] = useState(conte.langues[0])
  const [auto, setAuto] = useState(false)
  const [playback, setPlayback] = useState('idle')
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState(null)
  const audioRef = useRef(null)
  const closeRef = useRef(null)
  const indexRef = useRef(index)
  const autoRef = useRef(auto)
  const quizRef = useRef(quiz)
  const moveSceneRef = useRef(null)
  const last = conte.scenes.length - 1
  indexRef.current = index
  autoRef.current = auto
  quizRef.current = quiz

  const stopPlayback = () => {
    const audio = audioRef.current
    if (audio) {
      audio.onended = null
      audio.onerror = null
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel()
  }

  const handleSceneEnd = () => {
    if (autoRef.current && indexRef.current < last) {
      setIndex(indexRef.current + 1)
    } else {
      setPlayback('idle')
    }
  }

  const playScene = () => {
    stopPlayback()
    setMessage('')
    setPlayback('playing')
    let fallbackStarted = false
    const useFallback = () => {
      if (fallbackStarted) return
      fallbackStarted = true
      if (language === 'Français' && window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined') {
        const utterance = new SpeechSynthesisUtterance(conte.scenes[index])
        utterance.lang = 'fr-FR'
        utterance.onend = handleSceneEnd
        utterance.onerror = () => {
          setPlayback('idle')
          setMessage('La lecture vocale n’est pas disponible dans ce navigateur.')
        }
        window.speechSynthesis.speak(utterance)
        setMessage('Lecture en français par synthèse vocale.')
      } else {
        setPlayback('idle')
        setMessage(`L’enregistrement en ${language} n’est pas encore disponible. Le texte reste consultable ci-dessus.`)
      }
    }

    const audio = new Audio(asset(`audio/${conte.id}-${language.toLowerCase()}-${index + 1}.mp3`))
    audioRef.current = audio
    audio.onended = handleSceneEnd
    audio.onerror = useFallback
    audio.play().catch(useFallback)
  }

  useEffect(() => {
    if (playback === 'playing' && auto && !quiz) playScene()
  }, [index])

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKeyDown = event => {
      if (event.key === 'Escape') close()
      if (event.target instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return
      if (!quizRef.current && event.key === 'ArrowLeft' && indexRef.current > 0) moveSceneRef.current?.(-1)
      if (!quizRef.current && event.key === 'ArrowRight') moveSceneRef.current?.(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      stopPlayback()
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [close])

  const moveScene = direction => {
    stopPlayback()
    setPlayback('idle')
    if (direction > 0 && index === last) {
      setQuiz(true)
      setAnswer(null)
      return
    }
    setIndex(Math.max(0, Math.min(last, index + direction)))
  }
  moveSceneRef.current = moveScene

  const togglePlayback = () => {
    if (playback === 'playing') {
      audioRef.current?.pause()
      if (window.speechSynthesis) window.speechSynthesis.pause()
      setPlayback('paused')
    } else if (playback === 'paused') {
      if (audioRef.current) audioRef.current.play().catch(error => {
        setPlayback('idle')
        setMessage(`Impossible de reprendre la lecture : ${error.message}`)
      })
      if (window.speechSynthesis) window.speechSynthesis.resume()
      setPlayback('playing')
    } else {
      playScene()
    }
  }

  const progress = quiz ? 100 : ((index + 1) / conte.scenes.length) * 100

  return <div className="reader-overlay" role="dialog" aria-modal="true" aria-labelledby="reader-title">
    <div className="reader-shell">
      <header className="reader-header">
        <div>
          <p className="eyebrow">LECTURE IMMERSIVE · {conte.lieu}</p>
          <h2 id="reader-title">{conte.titre}</h2>
        </div>
        <button ref={closeRef} className="reader-close" onClick={close} aria-label="Fermer le lecteur">Fermer <span aria-hidden="true">×</span></button>
      </header>
      <div className="reader-progress" role="progressbar" aria-label="Progression du conte" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100">
        <span style={{width: `${progress}%`}}/>
      </div>
      <div className="reader-content">
        {!quiz ? <>
          <div className="reader-scene-art" dangerouslySetInnerHTML={{__html: art(conte, index)}}/>
          <div className="reader-story">
            <p className="scene-count">Scène {index + 1} <span>sur {conte.scenes.length}</span></p>
            <p className="reader-text" key={index}>{conte.scenes[index]}</p>
            <p className="reader-note">Adaptation du projet · les versions en langues nationales restent à enregistrer.</p>
            <div className="reader-controls">
              <button className="control-button secondary" onClick={() => moveScene(-1)} disabled={index === 0}>← <span>Précédent</span></button>
              <button className="control-button primary" onClick={togglePlayback}>
                <span aria-hidden="true">{playback === 'playing' ? 'Ⅱ' : playback === 'paused' ? '▶' : '♪'}</span>
                {playback === 'playing' ? 'Pause' : playback === 'paused' ? 'Continuer' : 'Écouter'}
              </button>
              <button className="control-button secondary" onClick={() => moveScene(1)}>{index === last ? 'Quiz' : 'Suivant'} <span aria-hidden="true">→</span></button>
            </div>
            <div className="reader-options">
              <label>Langue de lecture
                <select value={language} onChange={event => {stopPlayback(); setPlayback('idle'); setLanguage(event.target.value)}}>
                  {conte.langues.map(item => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="auto-option"><input type="checkbox" checked={auto} onChange={event => setAuto(event.target.checked)}/> Enchaîner les scènes</label>
            </div>
            <p className="reader-status" aria-live="polite">{message}</p>
            <div className="reader-key-hint"><kbd>←</kbd> <kbd>→</kbd> pour changer de scène <span>·</span> <kbd>Échap</kbd> pour fermer</div>
          </div>
        </> : <section className="quiz-panel" aria-live="polite">
          <span className="quiz-icon" aria-hidden="true">✦</span>
          <p className="eyebrow">À TOI DE JOUER</p>
          <h3>{conte.quiz.q}</h3>
          <div className="quiz-choices">
            {conte.quiz.choix.map((choice, choiceIndex) => <button key={choice} className="quiz-choice" aria-pressed={answer === choiceIndex}
              onClick={() => setAnswer(choiceIndex)}>{choice}</button>)}
          </div>
          {answer !== null && <p className="quiz-result">
            {answer === conte.quiz.bon ? 'Bravo, bonne réponse !' : `La bonne réponse était : ${conte.quiz.choix[conte.quiz.bon]}.`}
          </p>}
          <button className="control-button primary" onClick={() => {stopPlayback(); setPlayback('idle'); setQuiz(false); setIndex(0); setAnswer(null); setMessage('')}}>
            Relire le conte <span aria-hidden="true">↻</span>
          </button>
        </section>}
      </div>
    </div>
  </div>
}

export default function App() {
  const [hash, setHash] = useState(location.hash.slice(1) || 'accueil')
  const [filters, setFilters] = useState({region: '', language: ''})
  const [search, setSearch] = useState('')
  const [readerOpen, setReaderOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(D[0].id)

  useEffect(() => {
    const onHashChange = () => {
      setHash(location.hash.slice(1) || 'accueil')
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const visible = conte => (!filters.region || conte.region === filters.region)
    && (!filters.language || conte.langues.includes(filters.language))
    && (!search || [conte.titre, conte.resume, conte.region, conte.lieu, conte.peuple]
      .join(' ').toLocaleLowerCase('fr').includes(search.toLocaleLowerCase('fr')))
  const filteredStories = D.filter(visible)
  const current = hash.startsWith('conte-') && D.find(conte => conte.id === hash.slice(6))
  const nav = [['accueil', 'Accueil'], ['carte', 'Carte'], ['contes', 'Contes'], ['apropos', 'À propos']]
  const selected = D.find(conte => conte.id === selectedId && visible(conte)) || filteredStories[0]

  return <>
    <header className="site-header">
      <div className="tri"/>
      <div className="wrap top">
        <a className="brand" href="#accueil" aria-label="Accueil, Contes du Burkina Faso">
          <Flag width={42}/>
          <span><b>BURKINA FASO</b><small>La Patrie ou la Mort, Nous Vaincrons</small></span>
        </a>
        <p className="site-title">Contes <span>&</span> légendes</p>
      </div>
      <nav aria-label="Navigation principale">
        <div className="wrap nav-links">{nav.map(([key, title]) => <a key={key} href={`#${key}`}
          aria-current={hash === key || (key === 'contes' && current) ? 'page' : undefined}>{title}</a>)}</div>
      </nav>
    </header>

    <main className="wrap main-content">
      {hash === 'accueil' && <>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">PATRIMOINE ORAL · BURKINA FASO</p>
            <h1>Un pays, mille histoires à <em>écouter.</em></h1>
            <p className="hero-intro">Voyagez de région en région à la rencontre des contes, des légendes et des voix qui les font vivre.</p>
            <div className="cta">
              <a className="button primary" href="#contes">Explorer les contes <span aria-hidden="true">→</span></a>
              <a className="button quiet" href="#carte">Voir la carte</a>
            </div>
            <dl className="stats">
              <div><dt>Récits</dt><dd>{D.length.toString().padStart(2, '0')}</dd></div>
              <div><dt>Régions</dt><dd>{Object.keys(REG).length.toString().padStart(2, '0')}</dd></div>
              <div><dt>Langues</dt><dd>{uniq('langues').length.toString().padStart(2, '0')}</dd></div>
            </dl>
          </div>
          <div className="hero-visual">
            <Paysage region="Guiriko"/>
            <div className="hero-map"><Carte isVisible={() => true} selected={null}/></div>
            <p className="hero-caption">Des histoires ancrées dans leurs territoires</p>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <div><p className="eyebrow">LE VOYAGE COMMENCE ICI</p><h2>Choisir une histoire</h2></div>
            <a className="text-button" href="#contes">Voir tous les récits <span aria-hidden="true">→</span></a>
          </div>
          <div className="grid">{D.slice(0, 3).map(conte => <Carton key={conte.id} conte={conte}/>)}</div>
        </section>

        <section className="section-block regions-section">
          <div className="section-heading">
            <div><p className="eyebrow">DU SAHEL AU SUD-OUEST</p><h2>Explorer les régions</h2></div>
            <a className="text-button" href="#carte">Parcourir la carte <span aria-hidden="true">→</span></a>
          </div>
          <div className="region-grid">{Object.keys(REG).map(region => {
            const stories = D.filter(conte => conte.region === region)
            return <a key={region} className="region-card" href={`#conte-${stories[0].id}`}>
              <Paysage region={region}/>
              <span className="region-card-label">{region}<span aria-hidden="true">↗</span></span>
            </a>
          })}</div>
        </section>
      </>}

      {hash === 'carte' && <>
        <section className="page-intro">
          <p className="eyebrow">LE BURKINA RACONTÉ PAR SES LIEUX</p>
          <h1>Une carte, des récits</h1>
          <p>Choisissez un repère ou explorez les histoires associées à chaque région.</p>
        </section>
        <Filtres filters={filters} setFilters={setFilters} search={search} setSearch={setSearch}/>
        <div className="cg">
          <div className="map-panel"><Carte isVisible={visible} selected={selected?.id}/><p className="map-hint">Sélectionnez un repère pour découvrir son histoire.</p></div>
          <div className="map-details">
            {selected ? <article className="fiche">
              <Paysage region={selected.region}/>
              <div className="card-body">
                <span className="card-kicker">{selected.region} · {selected.lieu}</span>
                <h2>{selected.titre}</h2>
                <p className="meta">Récit {selected.peuple} · {selected.langues.join(', ')}</p>
                <p>{selected.resume}</p>
                <a className="button primary" href={`#conte-${selected.id}`}>Ouvrir ce récit <span aria-hidden="true">→</span></a>
              </div>
            </article> : <p className="empty-state">Aucun récit ne correspond à ces filtres.</p>}
            <ul className="story-list">{filteredStories.map(conte => <li key={conte.id}>
              <button className="chip" aria-pressed={conte.id === selected?.id} onClick={() => setSelectedId(conte.id)}>
                <span>{conte.titre}</span><small>{conte.lieu}</small>
              </button>
            </li>)}</ul>
          </div>
        </div>
      </>}

      {hash === 'contes' && <>
        <section className="page-intro">
          <p className="eyebrow">À LIRE, À ÉCOUTER, À PARTAGER</p>
          <h1>Les contes du Burkina Faso</h1>
          <p>Des récits à parcourir à votre rythme, du premier mot au quiz final.</p>
        </section>
        <Filtres filters={filters} setFilters={setFilters} search={search} setSearch={setSearch}/>
        {filteredStories.length ? <div className="grid">{filteredStories.map(conte => <Carton key={conte.id} conte={conte}/>)}</div>
          : <p className="empty-state">Aucun récit ne correspond à votre recherche. Essayez un autre mot ou effacez les filtres.</p>}
      </>}

      {current && <article className="conte">
        <a className="back-link" href="#contes">← Retour aux contes</a>
        <Paysage region={current.region}/>
        <div className="story-detail">
          <p className="eyebrow">{current.region} · {current.lieu}</p>
          <h1>{current.titre}</h1>
          <p className="meta">Récit {current.peuple}</p>
          <div className="tag-list">{current.langues.map(language => <span className="tag" key={language}>{language}</span>)}
            <span className="tag status-tag">{current.statut}</span></div>
          <p className="story-summary">{current.resume}</p>
          <button className="button primary" onClick={() => setReaderOpen(true)}>Entrer dans l’histoire <span aria-hidden="true">→</span></button>
          <p className="source-note"><strong>Repère documentaire :</strong> {current.source}</p>
        </div>
        {readerOpen && <Lecteur key={current.id} conte={current} close={() => setReaderOpen(false)}/>}
      </article>}

      {hash === 'apropos' && <article className="about-page">
        <section className="page-intro">
          <p className="eyebrow">TRANSMETTRE, RESPECTER, CRÉDITER</p>
          <h1>À propos du projet</h1>
          <p>Une petite bibliothèque numérique pour découvrir les récits et paysages du Burkina Faso.</p>
        </section>
        <div className="about-copy">
          <h2>Des récits à faire vivre</h2>
          <p>Les cinq premiers récits sont des adaptations originales de travail, à compléter et à faire valider avec des conteuses et conteurs. La légende de Yennenga est un résumé libre de la tradition orale mossi, qui connaît plusieurs variantes. Les textes ne remplacent ni les recueils cités ni la parole des détenteurs de ces récits.</p>
          <p>Les enregistrements en langues nationales restent à réaliser. En attendant, le lecteur propose le texte et, en français, une synthèse vocale du navigateur lorsqu’elle est disponible.</p>
          <h2>Crédits des photographies</h2>
          <ul className="credits-list">{Object.entries(REG).map(([region, details]) => <li key={region}>
            <strong>{region} — {details.landmark}</strong>
            <span>{details.credit}, {details.license}.</span>
            <a href={details.url} target="_blank" rel="noreferrer">Voir la fiche et les conditions sur Wikimedia Commons ↗</a>
          </li>)}</ul>
        </div>
      </article>}
    </main>

    <footer><div className="wrap footer-content">
      <Flag width={32}/>
      <p>Contes & légendes du Burkina Faso <span>·</span> Projet Web Multimédia 2026</p>
      <a href="#apropos">Sources & crédits</a>
    </div></footer>
  </>
}
