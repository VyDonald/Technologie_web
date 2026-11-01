import {useEffect, useId, useMemo, useRef, useState} from 'react'
import D from './contes.json'
import Atlas3D from './Atlas3D.jsx'
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
const MAP_LABELS = {
  Orodara: {x: 16, y: 8, anchor: 'start'},
  Banfora: {x: 18, y: 20, anchor: 'start'},
  'Bobo-Dioulasso': {x: -16, y: -12, anchor: 'end'},
}
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
      const label = MAP_LABELS[conte.lieu] || {x: 18, y: 6, anchor: 'start'}
      return <a key={conte.id} href={`#conte-${conte.id}`} className={`pin${conte.id === selected ? ' selected' : ''}`}
        style={{opacity: visible ? 1 : .2, pointerEvents: visible ? 'auto' : 'none'}} aria-label={`Ouvrir ${conte.titre}`}>
        <circle cx={x} cy={y} r="13"/>
        <text x={x + label.x} y={y + label.y} textAnchor={label.anchor}>{conte.lieu}</text>
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
      <span className="story-status">{conte.statut}</span>
      <span className="card-more">Découvrir le récit <span aria-hidden="true">→</span></span>
    </div>
  </a>
}

function StoryJourney({conte, onListen}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const chapterRefs = useRef([])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver(entries => {
      const activeChapter = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (activeChapter) setActiveIndex(Number(activeChapter.target.dataset.sceneIndex))
    }, {threshold: [.15, .35, .6], rootMargin: '-18% 0px -28% 0px'})
    chapterRefs.current.forEach(chapter => chapter && observer.observe(chapter))
    return () => observer.disconnect()
  }, [conte.id])

  return <section className="story-journey" aria-label={`Récit illustré : ${conte.titre}`}>
    <header className="journey-heading">
      <p className="eyebrow">LE RÉCIT, SCÈNE APRÈS SCÈNE</p>
      <h2>Faites défiler l’histoire</h2>
      <p>Les paysages évoluent avec le récit. Prenez le temps de lire, ou écoutez une scène.</p>
    </header>
    <div className="journey-layout">
      <aside className="journey-visual" aria-label={`Illustration de la scène ${activeIndex + 1}`}>
        <div className="journey-visual-frame" key={`${conte.id}-${activeIndex}`}
          dangerouslySetInnerHTML={{__html: art(conte, activeIndex, 'journey-active')}}/>
        <div className="journey-visual-meta">
          <span>SCÈNE {String(activeIndex + 1).padStart(2, '0')} / {String(conte.scenes.length).padStart(2, '0')}</span>
          <span>{conte.region} · {conte.lieu}</span>
        </div>
        <button className="journey-listen" type="button" onClick={() => onListen(activeIndex)}>
          <span aria-hidden="true">▶</span> Écouter cette scène
        </button>
        <div className="journey-progress" aria-hidden="true">
          <span style={{width: `${((activeIndex + 1) / conte.scenes.length) * 100}%`}}/>
        </div>
      </aside>
      <div className="journey-chapters">
        {conte.scenes.map((scene, index) => <article key={index} ref={element => {chapterRefs.current[index] = element}}
          className={`journey-chapter${index === activeIndex ? ' is-active' : ''}`} data-scene-index={index}>
          <div className="journey-mobile-art" aria-hidden="true" dangerouslySetInnerHTML={{__html: art(conte, index, `journey-chapter-${index}`)}}/>
          <p className="journey-scene-label"><span>{String(index + 1).padStart(2, '0')}</span> · SCÈNE</p>
          <p className="journey-scene-text">{scene}</p>
          <button className="journey-scene-listen" type="button" onClick={() => onListen(index)}>
            Écouter cette scène <span aria-hidden="true">↗</span>
          </button>
        </article>)}
      </div>
    </div>
    <p className="journey-voice-note">Les pistes françaises utilisent une voix de synthèse. Les versions en langues nationales sont à recueillir auprès de conteuses et conteurs, avec leur accord et leurs crédits.</p>
  </section>
}

function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

function Lecteur({conte, close, initialIndex = 0}) {
  const [index, setIndex] = useState(initialIndex)
  const [quiz, setQuiz] = useState(false)
  const [language, setLanguage] = useState(conte.langues.includes('Français') ? 'Français' : conte.langues[0])
  const [auto, setAuto] = useState(false)
  const [playback, setPlayback] = useState('idle')
  const [audioProgress, setAudioProgress] = useState({currentTime: 0, duration: 0})
  const [hasAudioTrack, setHasAudioTrack] = useState(false)
  const [usingSpeechSynthesis, setUsingSpeechSynthesis] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState(null)
  const [frenchVoices, setFrenchVoices] = useState([])
  const [voiceURI, setVoiceURI] = useState('audio')
  const audioRef = useRef(null)
  const closeRef = useRef(null)
  const indexRef = useRef(index)
  const autoRef = useRef(auto)
  const quizRef = useRef(quiz)
  const moveSceneRef = useRef(null)
  const playbackSessionRef = useRef(0)
  const isOriginalFiction = conte.source.startsWith('Fiction originale')
  const last = conte.scenes.length - 1
  indexRef.current = index
  autoRef.current = auto
  quizRef.current = quiz

  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices()
        .filter(voice => /^fr([_-]|$)/i.test(voice.lang))
        .sort((a, b) => Number(/[-_]FR$/i.test(b.lang)) - Number(/[-_]FR$/i.test(a.lang)))
      setFrenchVoices(voices)
      setVoiceURI(current => current === 'audio' || voices.some(voice => voice.voiceURI === current) ? current : 'audio')
    }
    updateVoices()
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', updateVoices)
  }, [])

  const stopPlayback = () => {
    playbackSessionRef.current += 1
    const audio = audioRef.current
    if (audio) {
      audio.onended = null
      audio.onerror = null
      audio.ontimeupdate = null
      audio.onloadedmetadata = null
      audio.onseeked = null
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel()
  }

  const handleSceneEnd = session => {
    if (session !== playbackSessionRef.current) return
    if (autoRef.current && indexRef.current < last) {
      setIndex(indexRef.current + 1)
    } else {
      setPlayback('idle')
    }
  }

  const playScene = () => {
    stopPlayback()
    const session = playbackSessionRef.current
    setAudioProgress({currentTime: 0, duration: 0})
    setHasAudioTrack(false)
    setUsingSpeechSynthesis(false)
    setMessage('')
    setPlayback('playing')

    const speakFrench = () => {
      setHasAudioTrack(false)
      setUsingSpeechSynthesis(true)
      setAudioProgress({currentTime: 0, duration: 0})
      if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') {
        setPlayback('idle')
        setMessage('La piste française est indisponible et ce navigateur ne prend pas en charge la synthèse vocale.')
        return
      }

      const utterance = new window.SpeechSynthesisUtterance(conte.scenes[index])
      const selectedVoice = frenchVoices.find(voice => voice.voiceURI === voiceURI)
      const defaultFrenchVoice = frenchVoices.find(voice => /[-_]FR$/i.test(voice.lang)) || frenchVoices[0]
      const voice = selectedVoice || defaultFrenchVoice
      utterance.lang = voice?.lang || 'fr-FR'
      utterance.voice = voice || null
      utterance.rate = playbackRate
      utterance.volume = volume
      utterance.onend = () => handleSceneEnd(session)
      utterance.onerror = event => {
        if (session !== playbackSessionRef.current || ['canceled', 'interrupted'].includes(event.error)) return
        setPlayback('idle')
        setMessage('La piste française est indisponible et la voix de synthèse de cet appareil a rencontré un problème.')
      }
      try {
        window.speechSynthesis.speak(utterance)
        setMessage(voice ? `Lecture en français avec la voix « ${voice.name} ».` : 'Lecture en français avec la voix de synthèse par défaut de ton appareil.')
      } catch (error) {
        setPlayback('idle')
        setMessage(`Impossible de démarrer la synthèse vocale : ${error.message}`)
      }
    }

    if (language === 'Français' && voiceURI !== 'audio') {
      speakFrench()
      return
    }

    const languageSlug = language === 'Français' ? 'francais' : language.toLowerCase()
    const audio = new Audio(asset(`audio/${conte.id}-${languageSlug}-${index + 1}.mp3`))
    audio.volume = volume
    audio.playbackRate = playbackRate
    setHasAudioTrack(true)
    setUsingSpeechSynthesis(false)
    setAudioProgress({currentTime: 0, duration: 0})
    const updateAudioProgress = () => setAudioProgress({
      currentTime: audio.currentTime,
      duration: Number.isFinite(audio.duration) ? audio.duration : 0,
    })
    let speechFallbackStarted = false
    const fallBackToSpeech = () => {
      if (speechFallbackStarted || session !== playbackSessionRef.current) return
      speechFallbackStarted = true
      if (audioRef.current === audio) audioRef.current = null
      setAudioProgress({currentTime: 0, duration: 0})
      speakFrench()
    }
    audioRef.current = audio
    audio.ontimeupdate = updateAudioProgress
    audio.onloadedmetadata = updateAudioProgress
    audio.onseeked = updateAudioProgress
    audio.onended = () => handleSceneEnd(session)
    audio.onerror = () => {
      if (session !== playbackSessionRef.current) return
      if (language === 'Français') {
        fallBackToSpeech()
        return
      }
      setPlayback('idle')
      setMessage(`L’enregistrement en ${language} n’est pas encore disponible. Le texte reste consultable ci-dessus.`)
    }
    audio.play().catch(error => {
      if (session !== playbackSessionRef.current) return
      if (language === 'Français') {
        fallBackToSpeech()
        return
      }
      setPlayback('idle')
      setMessage(`Impossible de lire l’enregistrement en ${language} : ${error.message}`)
    })
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
    setHasAudioTrack(false)
    setUsingSpeechSynthesis(false)
    setAudioProgress({currentTime: 0, duration: 0})
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

  const seekAudio = event => {
    const audio = audioRef.current
    const time = Number(event.target.value)
    if (!audio || !Number.isFinite(time)) return
    audio.currentTime = time
    setAudioProgress(current => ({...current, currentTime: time}))
  }

  const changeVolume = event => {
    const nextVolume = Number(event.target.value)
    setVolume(nextVolume)
    if (audioRef.current) audioRef.current.volume = nextVolume
  }

  const changePlaybackRate = event => {
    const nextRate = Number(event.target.value)
    setPlaybackRate(nextRate)
    if (audioRef.current) audioRef.current.playbackRate = nextRate
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
          <div className="reader-scene-art" dangerouslySetInnerHTML={{__html: art(conte, index, 'reader')}}/>
          <div className="reader-story">
            <p className="scene-count">Scène {index + 1} <span>sur {conte.scenes.length}</span></p>
            <p className="reader-text" key={index}>{conte.scenes[index]}</p>
            <p className="reader-note">{isOriginalFiction
              ? `Fiction originale située à ${conte.lieu} · elle ne restitue pas une tradition locale recueillie.`
              : 'Adaptation de travail · les versions orales et les enregistrements en langues nationales restent à recueillir.'}</p>
            <div className="reader-controls">
              <button className="control-button secondary" onClick={() => moveScene(-1)} disabled={index === 0}>← <span>Précédent</span></button>
              <button className="control-button primary" onClick={togglePlayback}>
                <span aria-hidden="true">{playback === 'playing' ? 'Ⅱ' : playback === 'paused' ? '▶' : '♪'}</span>
                {playback === 'playing' ? 'Pause' : playback === 'paused' ? 'Continuer' : 'Écouter'}
              </button>
              <button className="control-button secondary" onClick={() => moveScene(1)}>{index === last ? 'Quiz' : 'Suivant'} <span aria-hidden="true">→</span></button>
            </div>
            <section className="reader-audio-controls" aria-label="Réglages audio">
              <label className="audio-seek">
                <span>Progression audio</span>
                <input type="range" min="0" max={audioProgress.duration || 0} step="0.1"
                  value={Math.min(audioProgress.currentTime, audioProgress.duration || 0)}
                  onChange={seekAudio} disabled={!hasAudioTrack || audioProgress.duration <= 0}
                  aria-label="Position dans la piste audio"/>
                <output>{formatAudioTime(audioProgress.currentTime)} / {formatAudioTime(audioProgress.duration)}</output>
              </label>
              <label className="audio-setting">
                <span>Volume <output>{Math.round(volume * 100)} %</output></span>
                <input type="range" min="0" max="1" step="0.05" value={volume}
                  onChange={changeVolume} aria-label="Volume de lecture"/>
              </label>
              <label className="audio-setting">
                <span>Vitesse</span>
                <select value={playbackRate} onChange={changePlaybackRate} aria-label="Vitesse de lecture">
                  {[0.75, 0.9, 1, 1.1, 1.25, 1.5].map(rate =>
                    <option key={rate} value={rate}>{rate.toLocaleString('fr-FR')}×</option>)}
                </select>
              </label>
              {usingSpeechSynthesis && !hasAudioTrack && <p className="audio-unavailable">
                La progression de la piste n’est pas disponible avec la voix de synthèse de l’appareil.
              </p>}
            </section>
            <div className="reader-options">
              <label>Langue de lecture
                <select value={language} onChange={event => {stopPlayback(); setPlayback('idle'); setHasAudioTrack(false); setUsingSpeechSynthesis(false); setAudioProgress({currentTime: 0, duration: 0}); setLanguage(event.target.value)}}>
                  {conte.langues.map(item => <option key={item} value={item}>{item === 'Français' ? item : `${item} · audio à venir`}</option>)}
                </select>
              </label>
              {language === 'Français' && frenchVoices.length > 0 && <label>Voix
                <select value={voiceURI} onChange={event => {stopPlayback(); setPlayback('idle'); setHasAudioTrack(false); setUsingSpeechSynthesis(false); setAudioProgress({currentTime: 0, duration: 0}); setVoiceURI(event.target.value)}}>
                  <option value="audio">Voix neuronale · Piper</option>
                  {frenchVoices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}
                </select>
              </label>}
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
  const [readerStart, setReaderStart] = useState(0)
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
  const filteredStories = useMemo(() => D.filter(visible), [filters, search])
  const current = hash.startsWith('conte-') && D.find(conte => conte.id === hash.slice(6))
  const nav = [['accueil', 'Accueil'], ['carte', 'Carte'], ['contes', 'Contes'], ['apropos', 'À propos']]
  const selected = D.find(conte => conte.id === selectedId && visible(conte)) || filteredStories[0]
  const openReader = sceneIndex => {
    setReaderStart(sceneIndex)
    setReaderOpen(true)
  }

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
          <div className="hero-visual hero-visual-atlas">
            <Atlas3D stories={D} selectedId={selected?.id || D[0].id} onSelect={setSelectedId}/>
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
          <div className="map-atlas-panel">
            {filteredStories.length
              ? <Atlas3D stories={filteredStories} selectedId={selected?.id || filteredStories[0].id} onSelect={setSelectedId}/>
              : <p className="empty-state">Aucun récit ne correspond à ces filtres.</p>}
            <details className="map-2d-details">
              <summary>Afficher aussi la carte 2D</summary>
              <div className="map-panel"><Carte isVisible={visible} selected={selected?.id}/><p className="map-hint">Sélectionnez un repère pour découvrir son histoire.</p></div>
            </details>
          </div>
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
          <p className="meta">{current.peuple === 'Conte original' ? 'Récit original du prototype' : `Tradition orale ${current.peuple}`}</p>
          <div className="tag-list">{current.langues.map(language => <span className="tag" key={language}>{language}</span>)}
            <span className="tag status-tag">{current.statut}</span></div>
          <p className="story-summary">{current.resume}</p>
          <button className="button primary" onClick={() => openReader(0)}>Entrer dans l’histoire <span aria-hidden="true">→</span></button>
          <p className="source-note"><strong>Contexte et source :</strong> {current.source}</p>
        </div>
        {readerOpen && <Lecteur key={`${current.id}-${readerStart}`} conte={current} initialIndex={readerStart} close={() => setReaderOpen(false)}/>}
      </article>}
      {current && <StoryJourney key={current.id} conte={current} onListen={openReader}/>}

      {hash === 'apropos' && <article className="about-page">
        <section className="page-intro">
          <p className="eyebrow">TRANSMETTRE, RESPECTER, CRÉDITER</p>
          <h1>À propos du projet</h1>
          <p>Une petite bibliothèque numérique pour découvrir les récits et paysages du Burkina Faso.</p>
        </section>
        <div className="about-copy">
          <h2>Des histoires à faire vivre</h2>
          <p>La collection réunit douze récits situés dans douze localités du Burkina Faso. Plusieurs textes sont des adaptations originales de travail ; six nouvelles histoires sont explicitement signalées comme des fictions contemporaines et ne prétendent pas représenter les traditions des lieux. La légende de Yennenga est un résumé libre d’un récit oral qui connaît plusieurs variantes.</p>
          <p>Les références bibliographiques indiquées sur certaines fiches sont des pistes de recherche, pas la source textuelle des scènes. Les textes sont à compléter et à faire relire avec des conteuses et conteurs. Les pistes françaises sont générées avec une voix de synthèse ; les versions en langues nationales restent à enregistrer avec des locuteurs et locutrices, leur accord et leurs crédits.</p>
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
