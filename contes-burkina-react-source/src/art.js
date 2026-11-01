export const esc = value => String(value).replace(/[&<>"]/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}[character]))

export function art(conte, sceneIndex) {
  const {deco} = conte
  const night = deco.nuit.includes(sceneIndex)
  const sky = night ? ['#172444', '#465674'] : deco.sky
  const figureX = 64 + (sceneIndex % 4) * 70
  const accent = {arbre: '#5D8144', case: '#B67C45', animal: '#9E7448', cavalier: '#B47647'}[deco.fig] || '#66834B'
  const land = {arbre: '#536B3F', case: '#A7793D', animal: '#8C7444', cavalier: '#9B623B'}[deco.fig] || '#536B3F'
  let subject = ''

  if (deco.fig === 'arbre') {
    subject = `<g class="scene-depth scene-depth--subject scene-subject-sway">
      <path d="M${figureX + 4} 193 Q${figureX + 18} 152 ${figureX + 8} 105" fill="none" stroke="#67472F" stroke-width="15" stroke-linecap="round"/>
      <path d="M${figureX + 9} 127 Q${figureX - 10} 106 ${figureX - 18} 91 M${figureX + 10} 125 Q${figureX + 34} 105 ${figureX + 43} 81" fill="none" stroke="#67472F" stroke-width="8" stroke-linecap="round"/>
      <circle cx="${figureX + 7}" cy="91" r="36" style="fill:var(--ac)"/>
      <circle cx="${figureX - 13}" cy="103" r="21" style="fill:var(--ac);opacity:.85"/>
      <circle cx="${figureX + 34}" cy="100" r="24" style="fill:var(--ac);opacity:.9"/>
    </g>`
  }

  if (deco.fig === 'case') {
    subject = `<g class="scene-depth scene-depth--subject scene-subject-bob">
      <path d="M${figureX - 12} 152 L${figureX + 32} 111 L${figureX + 76} 152" fill="#795333" stroke="#67472F" stroke-width="5" stroke-linejoin="round"/>
      <path d="M${figureX - 3} 151 L${figureX + 32} 120 L${figureX + 67} 151 V192 H${figureX - 3}Z" fill="#C7925E"/>
      <path d="M${figureX + 25} 166 H${figureX + 42} V192 H${figureX + 25}Z" fill="#493522"/>
      <path d="M${figureX + 4} 158 H${figureX + 18} V168 H${figureX + 4}Z" fill="#EACB91"/>
    </g>`
  }

  if (deco.fig === 'animal') {
    subject = `<g class="scene-depth scene-depth--subject scene-subject-bob">
      <path d="M${figureX + 10} 166 Q${figureX + 21} 144 ${figureX + 51} 151 Q${figureX + 69} 155 ${figureX + 76} 172 L${figureX + 62} 185 H${figureX + 13}Z" fill="#916746"/>
      <path d="M${figureX + 68} 158 Q${figureX + 73} 140 ${figureX + 89} 144 Q${figureX + 101} 150 ${figureX + 93} 164 L${figureX + 78} 170Z" fill="#916746"/>
      <circle cx="${figureX + 88}" cy="151" r="2" fill="#201B17"/>
      <path d="M${figureX + 22} 181 L${figureX + 19} 201 M${figureX + 57} 181 L${figureX + 61} 201" stroke="#62452F" stroke-width="6" stroke-linecap="round"/>
      <path d="M${figureX + 11} 163 Q${figureX - 1} 152 ${figureX - 5} 161" fill="none" stroke="#916746" stroke-width="5" stroke-linecap="round"/>
    </g>`
  }

  if (deco.fig === 'cavalier') {
    subject = `<g class="scene-depth scene-depth--subject scene-subject-run">
      <g class="scene-subject-bob">
        <path d="M${figureX + 4} 173 Q${figureX + 23} 145 ${figureX + 58} 156 Q${figureX + 76} 163 ${figureX + 78} 178 L${figureX + 62} 186 H${figureX + 13}Z" fill="#F2EEE4"/>
        <path d="M${figureX + 68} 161 Q${figureX + 74} 140 ${figureX + 91} 144 Q${figureX + 103} 153 ${figureX + 91} 166 L${figureX + 76} 171Z" fill="#F2EEE4"/>
        <path d="M${figureX + 22} 183 L${figureX + 18} 204 M${figureX + 59} 183 L${figureX + 63} 204" stroke="#D8D2C2" stroke-width="6" stroke-linecap="round"/>
        <path d="M${figureX + 39} 146 V166 M${figureX + 35} 143 H${figureX + 45}" stroke="#623735" stroke-width="7" stroke-linecap="round"/>
        <circle cx="${figureX + 39}" cy="137" r="8" fill="#754642"/>
        <path d="M${figureX + 40} 153 L${figureX + 58} 168" stroke="#754642" stroke-width="6" stroke-linecap="round"/>
      </g>
    </g>`
  }

  const skyDetails = night
    ? `<circle class="scene-moon" cx="${315 - sceneIndex * 12}" cy="57" r="22" fill="#F1E9CA"/>
      ${[40, 120, 200, 300, 350].map((x, index) => `<circle class="scene-star" cx="${x}" cy="${22 + index * 12}" r="2" style="animation-delay:${index * .35}s"/>`).join('')}`
    : `<circle class="scene-sun" cx="${315 - sceneIndex * 12}" cy="${57 + (sceneIndex % 3) * 7}" r="24" fill="#F8D56A"/>
      <path d="M${38 + sceneIndex * 5} 65 Q${53 + sceneIndex * 5} 51 ${74 + sceneIndex * 5} 63 Q${88 + sceneIndex * 5} 69 ${102 + sceneIndex * 5} 61" fill="none" stroke="#fff" stroke-width="4" opacity=".58"/>`

  return `<svg class="scene-art-svg" style="--ac:${accent};--land:${land}" viewBox="0 0 400 240" role="img" aria-label="Illustration animée : ${esc(conte.titre)}">
    <defs>
      <linearGradient id="scene-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/>
      </linearGradient>
      <linearGradient id="scene-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--land)"/><stop offset="1" stop-color="#29382B"/>
      </linearGradient>
      <radialGradient id="scene-glow">
        <stop offset="0" stop-color="#FFF8D6" stop-opacity=".5"/><stop offset="1" stop-color="#FFF8D6" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="400" height="240" fill="url(#scene-sky)"/>
    <circle class="scene-depth scene-depth--far scene-glow" cx="315" cy="58" r="58" fill="url(#scene-glow)"/>
    <g class="scene-depth scene-depth--far">${skyDetails}</g>
    <g class="scene-depth scene-depth--middle">
      <path d="M-25 168 Q60 121 132 159 T280 152 T430 153 V240 H-25Z" style="fill:var(--ac);opacity:.36"/>
      <path d="M-20 192 Q68 163 156 185 T324 175 T423 188 V240 H-20Z" fill="#5B7147" opacity=".78"/>
    </g>
    <path d="M0 192 Q92 177 193 192 T400 187 V240 H0Z" fill="url(#scene-ground)"/>
    ${subject}
    <g class="scene-depth scene-depth--front scene-grass">
      <path d="M14 229 l7 -22 l2 22 M37 232 l11 -28 l-2 28 M363 233 l-8 -25 l-1 25 M386 231 l-12 -23 l3 23" fill="none" stroke="#D1B66D" stroke-width="3" stroke-linecap="round" opacity=".85"/>
      <circle class="scene-firefly" cx="${245 - sceneIndex * 13}" cy="176" r="3" fill="#FFF2A5"/>
      <circle class="scene-firefly scene-firefly--delay" cx="${273 - sceneIndex * 9}" cy="157" r="2" fill="#FFF2A5"/>
    </g>
  </svg>`
}
