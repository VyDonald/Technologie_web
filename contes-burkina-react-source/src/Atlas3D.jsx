import {useEffect, useId, useRef, useState} from 'react'
import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js'
import {BFA, VB, P} from './bfa.js'

const MAP_SCALE = .014
const starCoordinates = (x, y, radius) => Array.from({length: 10}, (_, index) => {
  const angle = -Math.PI / 2 + index * Math.PI / 5
  const pointRadius = index % 2 ? radius * .382 : radius
  return [x + pointRadius * Math.cos(angle), y + pointRadius * Math.sin(angle)]
})

function AtlasFallback({stories, selectedId, onSelect}) {
  const clipId = `atlas-${useId().replace(/:/g, '')}`

  return <svg className="atlas-fallback" viewBox={`0 0 ${VB[0]} ${VB[1]}`} role="img" aria-label="Carte du Burkina Faso en relief simplifié">
    <defs><clipPath id={clipId}><path d={BFA}/></clipPath></defs>
    <g clipPath={`url(#${clipId})`}>
      <rect width={VB[0]} height={VB[1] / 2} fill="#EF2B2D"/>
      <rect y={VB[1] / 2} width={VB[0]} height={VB[1] / 2} fill="#009E49"/>
    </g>
    <polygon points={starCoordinates(...P(-1.6, 12.3), 34).map(point => point.join(',')).join(' ')} fill="#FCD116"/>
    <path d={BFA} fill="none" stroke="#FCD116" strokeWidth="7"/>
    {stories.map(story => {
      const [x, y] = P(story.lng, story.lat)
      return <g key={story.id} className={story.id === selectedId ? 'atlas-fallback-pin selected' : 'atlas-fallback-pin'}
        onClick={() => onSelect(story.id)}>
        <circle cx={x} cy={y} r={story.id === selectedId ? 13 : 9}/>
        <circle className="atlas-pin-core" cx={x} cy={y} r="3"/>
      </g>
    })}
  </svg>
}

export default function Atlas3D({stories, selectedId, onSelect}) {
  const canvasHostRef = useRef(null)
  const markerGroupsRef = useRef(new Map())
  const onSelectRef = useRef(onSelect)
  const [unavailable, setUnavailable] = useState(false)
  const activeStory = stories.find(story => story.id === selectedId) || stories[0]
  onSelectRef.current = onSelect

  useEffect(() => {
    const host = canvasHostRef.current
    if (!host) return undefined

    let renderer
    let controls
    let frame = 0
    let resizeObserver
    let visibilityObserver
    let disposed = false
    let inViewport = true
    const scene = new THREE.Scene()
    const markerGroups = new Map()
    const pickTargets = []
    const pointerDown = {x: 0, y: 0}
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const canvas = document.createElement('canvas')
    let context
    try {
      context = canvas.getContext('webgl2', {alpha: true, antialias: true})
        || canvas.getContext('webgl', {alpha: true, antialias: true})
    } catch (error) {
      setUnavailable(true)
      return undefined
    }
    if (!context) {
      setUnavailable(true)
      return undefined
    }

    try {
      renderer = new THREE.WebGLRenderer({canvas, context, alpha: true, antialias: true, powerPreference: 'low-power'})
    } catch (error) {
      console.error('La carte 3D ne peut pas démarrer dans ce navigateur.', error)
      setUnavailable(true)
      return undefined
    }

    setUnavailable(false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    renderer.domElement.setAttribute('aria-hidden', 'true')
    renderer.domElement.className = 'atlas-canvas'
    host.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(36, 1, .1, 100)
    camera.position.set(0, 9.5, 12.5)
    camera.lookAt(0, .1, 0)
    scene.add(new THREE.HemisphereLight(0xffecc8, 0x173b2c, 2.2))

    const keyLight = new THREE.DirectionalLight(0xffe6a1, 3.1)
    keyLight.position.set(-5, 10, 5)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0x84b9a2, 1.25)
    fillLight.position.set(6, 5, -8)
    scene.add(fillLight)

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB[0]} ${VB[1]}"><path fill="#000" d="${BFA}"/></svg>`
    const paths = new SVGLoader().parse(svg).paths
    const shapes = paths.flatMap(path => SVGLoader.createShapes(path))
    if (!shapes.length) {
      console.error('Impossible de construire la forme de la carte 3D du Burkina Faso.')
      renderer.dispose()
      renderer.domElement.remove()
      setUnavailable(true)
      return undefined
    }

    const map = new THREE.Group()
    scene.add(map)
    const makeLayer = (color, y, depth, bevel = false) => {
      const geometry = new THREE.ExtrudeGeometry(shapes, {
        depth,
        bevelEnabled: bevel,
        bevelSegments: bevel ? 2 : 0,
        bevelThickness: bevel ? .035 : 0,
        bevelSize: bevel ? 2.3 : 0,
        curveSegments: 3,
      })
      geometry.translate(-VB[0] / 2, -VB[1] / 2, 0)
      geometry.rotateX(-Math.PI / 2)
      geometry.scale(MAP_SCALE, 1, MAP_SCALE)
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: .48,
        metalness: .08,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.y = y
      mesh.castShadow = true
      mesh.receiveShadow = true
      map.add(mesh)
      return mesh
    }

    makeLayer('#087541', -.02, .10)
    makeLayer('#FCD116', .08, .08)
    makeLayer('#D9222A', .16, .08)
    const top = makeLayer('#C9A677', .24, .16, true)
    const mapSurface = .44
    const material = top.material
    material.roughness = .78

    const [starX, starY] = P(-1.6, 12.3)
    const starShape = new THREE.Shape()
    starCoordinates(starX, starY, 26).forEach(([x, y], index) => {
      if (index === 0) starShape.moveTo(x, y)
      else starShape.lineTo(x, y)
    })
    starShape.closePath()
    const starGeometry = new THREE.ShapeGeometry(starShape)
    starGeometry.translate(-VB[0] / 2, -VB[1] / 2, 0)
    starGeometry.rotateX(-Math.PI / 2)
    starGeometry.scale(MAP_SCALE, 1, MAP_SCALE)
    const flagStar = new THREE.Mesh(starGeometry, new THREE.MeshStandardMaterial({
      color: '#FCD116',
      emissive: '#5c4100',
      emissiveIntensity: .28,
      roughness: .42,
      side: THREE.DoubleSide,
    }))
    flagStar.position.y = mapSurface + .01
    map.add(flagStar)

    const contourMaterial = new THREE.MeshBasicMaterial({
      color: '#f4d48a',
      transparent: true,
      opacity: .43,
      side: THREE.DoubleSide,
    })
    for (const story of stories.filter((_, index) => index % 3 === 0)) {
      const [px, py] = P(story.lng, story.lat)
      const x = (px - VB[0] / 2) * MAP_SCALE
      const z = -(py - VB[1] / 2) * MAP_SCALE
      for (let ring = 0; ring < 3; ring += 1) {
        const geometry = new THREE.RingGeometry(.16 + ring * .105, .17 + ring * .105, 40)
        const contour = new THREE.Mesh(geometry, contourMaterial)
        contour.rotation.x = -Math.PI / 2
        contour.position.set(x, mapSurface + .006 + ring * .001, z)
        map.add(contour)
      }
    }

    for (const story of stories) {
      const [px, py] = P(story.lng, story.lat)
      const marker = new THREE.Group()
      marker.position.set((px - VB[0] / 2) * MAP_SCALE, mapSurface, -(py - VB[1] / 2) * MAP_SCALE)
      marker.userData.storyId = story.id

      const haloMaterial = new THREE.MeshBasicMaterial({
        color: story.id === selectedId ? '#FCD116' : '#f6e2ae',
        transparent: true,
        opacity: .54,
        side: THREE.DoubleSide,
      })
      const halo = new THREE.Mesh(new THREE.RingGeometry(.11, .16, 28), haloMaterial)
      halo.rotation.x = -Math.PI / 2
      halo.position.y = .012
      marker.add(halo)
      pickTargets.push(halo)

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(.018, .035, .27, 8),
        new THREE.MeshStandardMaterial({color: '#f5dc8c', roughness: .4, metalness: .18}),
      )
      stem.position.y = .14
      marker.add(stem)
      pickTargets.push(stem)

      const orbMaterial = new THREE.MeshStandardMaterial({
        color: story.id === selectedId ? '#FCD116' : '#f3a342',
        emissive: story.id === selectedId ? '#b97916' : '#754020',
        emissiveIntensity: story.id === selectedId ? 1.15 : .45,
        roughness: .3,
        metalness: .12,
      })
      const orb = new THREE.Mesh(new THREE.SphereGeometry(.075, 18, 14), orbMaterial)
      orb.position.y = .3
      marker.add(orb)
      pickTargets.push(orb)
      map.add(marker)
      markerGroups.set(story.id, {group: marker, haloMaterial, orbMaterial})
    }
    markerGroupsRef.current = markerGroups

    const dustPositions = new Float32Array(84)
    for (let i = 0; i < dustPositions.length; i += 3) {
      dustPositions[i] = (Math.random() - .5) * 13
      dustPositions[i + 1] = Math.random() * 2.5
      dustPositions[i + 2] = (Math.random() - .5) * 10
    }
    const dustGeometry = new THREE.BufferGeometry()
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
    const dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({color: '#FCD116', size: .035, transparent: true, opacity: .55, sizeAttenuation: true}),
    )
    scene.add(dust)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, .12, 0)
    controls.enableDamping = true
    controls.dampingFactor = .055
    controls.enablePan = false
    controls.enableZoom = false
    controls.minPolarAngle = Math.PI * .22
    controls.maxPolarAngle = Math.PI * .47
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    controls.autoRotate = !reduceMotion
    controls.autoRotateSpeed = .32

    const resize = () => {
      if (disposed) return
      const {width, height} = host.getBoundingClientRect()
      if (width <= 0 || height <= 0) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const animate = () => {
      frame = 0
      if (disposed || !inViewport || document.hidden) return
      controls.update()
      if (!reduceMotion) dust.rotation.y += .00045
      renderer.render(scene, camera)
      frame = window.requestAnimationFrame(animate)
    }
    const startAnimation = () => {
      if (!frame && inViewport && !document.hidden) frame = window.requestAnimationFrame(animate)
    }
    const stopAnimation = () => {
      window.cancelAnimationFrame(frame)
      frame = 0
    }

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(host)
    } else {
      window.addEventListener('resize', resize)
    }
    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(([entry]) => {
        inViewport = entry.isIntersecting
        if (inViewport) startAnimation()
        else stopAnimation()
      })
      visibilityObserver.observe(host)
    }
    resize()

    const onPointerDown = event => {
      pointerDown.x = event.clientX
      pointerDown.y = event.clientY
    }
    const onClick = event => {
      if (Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 6) return
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(pickTargets, false).find(item => item.object.parent?.userData.storyId)
      if (hit) onSelectRef.current(hit.object.parent.userData.storyId)
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('click', onClick)
    const onContextMenu = event => event.preventDefault()
    renderer.domElement.addEventListener('contextmenu', onContextMenu)

    const onVisibilityChange = () => {
      if (document.hidden) stopAnimation()
      else startAnimation()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    startAnimation()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      resizeObserver?.disconnect()
      visibilityObserver?.disconnect()
      window.removeEventListener('resize', resize)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('click', onClick)
      renderer.domElement.removeEventListener('contextmenu', onContextMenu)
      controls.dispose()
      if (markerGroupsRef.current === markerGroups) markerGroupsRef.current = new Map()
      scene.traverse(object => {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) object.material.forEach(item => item.dispose())
        else object.material?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [stories])

  useEffect(() => {
    markerGroupsRef.current.forEach(({group, haloMaterial, orbMaterial}, id) => {
      const selected = id === selectedId
      group.scale.setScalar(selected ? 1.18 : 1)
      haloMaterial.color.set(selected ? '#FCD116' : '#f6e2ae')
      orbMaterial.color.set(selected ? '#FCD116' : '#f3a342')
      orbMaterial.emissiveIntensity = selected ? 1.15 : .45
    })
  }, [selectedId])

  return <section className="atlas-panel" aria-label="Atlas 3D des récits burkinabè">
    <div className="atlas-heading">
      <span className="atlas-live-dot" aria-hidden="true"/>
      <span>ATLAS VIVANT · BURKINA FASO</span>
      <span className="atlas-coordinate">{stories.length} escales</span>
    </div>
    <div className="atlas-stage">
      {unavailable
        ? <AtlasFallback stories={stories} selectedId={selectedId} onSelect={onSelect}/>
        : <div className="atlas-canvas-host" ref={canvasHostRef} aria-label="Carte 3D interactive. Faites glisser pour l’orienter."/>}
      <span className="atlas-stage-tag">{unavailable ? 'CARTE SIMPLIFIÉE · 2D' : 'RELIEF · RÉCITS · TERRITOIRES'}</span>
      <span className="atlas-map-shadow" aria-hidden="true"/>
    </div>
    <div className="atlas-story-card" aria-live="polite">
      <div>
        <span className="atlas-story-place">{activeStory?.region} · {activeStory?.lieu}</span>
        <h2>{activeStory?.titre}</h2>
      </div>
      {activeStory && <a className="atlas-open" href={`#conte-${activeStory.id}`} aria-label={`Découvrir le récit ${activeStory.titre}`}>↗</a>}
    </div>
    <div className="atlas-locations" role="group" aria-label="Choisir une localité sur la carte">
      {stories.map(story => <button key={story.id} type="button" data-story-id={story.id}
        className={`atlas-location${story.id === selectedId ? ' selected' : ''}`}
        aria-pressed={story.id === selectedId} onClick={() => onSelect(story.id)}>{story.lieu}</button>)}
    </div>
    <p className="atlas-hint">Glissez la carte pour l’orienter · choisissez une escale pour la découvrir.</p>
  </section>
}
