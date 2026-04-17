// =============================================
// Blindspot Mascot + Enhanced Site Animations
// =============================================

// =============================================
// Mascot SVG Injection
// =============================================

function injectMascot() {
  // Scroll progress bar
  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  document.body.insertBefore(progressBar, document.body.firstChild);

  // Mascot wrapper + SVG
  const wrapper = document.createElement('div');
  wrapper.id = 'mascot-wrapper';
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.setAttribute('role', 'presentation');

  // Tooltip bubble
  const bubble = document.createElement('div');
  bubble.id = 'mascot-bubble';
  bubble.textContent = 'Hello!';
  wrapper.appendChild(bubble);

  // The SVG: viewBox 0 0 100 155
  wrapper.innerHTML += `
    <svg
      id="blindspot-mascot"
      viewBox="0 0 100 155"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      overflow="visible"
    >
      <!-- Ground shadow -->
      <ellipse
        id="m-shadow"
        cx="50" cy="152" rx="20" ry="4.5"
        fill="#c9a84c"
        opacity="0.18"
      />

      <!-- Right arm (behind body) -->
      <g id="m-arm-r">
        <line x1="78" y1="52" x2="96" y2="76" stroke="#c9a84c" stroke-width="4" stroke-linecap="round"/>
        <line x1="96" y1="76" x2="91" y2="87" stroke="#c9a84c" stroke-width="2.8" stroke-linecap="round"/>
        <line x1="96" y1="76" x2="95" y2="88" stroke="#c9a84c" stroke-width="2.8" stroke-linecap="round"/>
        <line x1="96" y1="76" x2="99" y2="87" stroke="#c9a84c" stroke-width="2.8" stroke-linecap="round"/>
        <line x1="96" y1="76" x2="102" y2="84" stroke="#c9a84c" stroke-width="2.8" stroke-linecap="round"/>
        <line x1="96" y1="76" x2="103" y2="79" stroke="#c9a84c" stroke-width="2.8" stroke-linecap="round"/>
      </g>

      <!-- Right leg -->
      <g id="m-leg-r-upper">
        <line x1="59" y1="76" x2="65" y2="103" stroke="#c9a84c" stroke-width="4.5" stroke-linecap="round"/>
        <g id="m-leg-r-lower">
          <line x1="65" y1="103" x2="70" y2="130" stroke="#c9a84c" stroke-width="4.5" stroke-linecap="round"/>
          <ellipse cx="72" cy="135" rx="11" ry="5" fill="#c9a84c"/>
        </g>
      </g>

      <!-- Left leg -->
      <g id="m-leg-l-upper">
        <line x1="41" y1="76" x2="35" y2="103" stroke="#c9a84c" stroke-width="4.5" stroke-linecap="round"/>
        <g id="m-leg-l-lower">
          <line x1="35" y1="103" x2="30" y2="130" stroke="#c9a84c" stroke-width="4.5" stroke-linecap="round"/>
          <ellipse cx="28" cy="135" rx="11" ry="5" fill="#c9a84c"/>
        </g>
      </g>

      <!-- Body circle -->
      <circle cx="50" cy="50" r="28" stroke="#c9a84c" stroke-width="4.5" fill="none"/>

      <!-- Inner pupil -->
      <circle cx="54" cy="46" r="8.5" fill="#c9a84c"/>

      <!-- Left arm (in front) -->
      <g id="m-arm-l">
        <line x1="22" y1="50" x2="6" y2="16" stroke="#c9a84c" stroke-width="4" stroke-linecap="round"/>
        <line x1="6" y1="16" x2="0"  y2="7"  stroke="#c9a84c" stroke-width="2.8" stroke-linecap="round"/>
        <line x1="6" y1="16" x2="4"  y2="6"  stroke="#c9a84c" stroke-width="2.8" stroke-linecap="round"/>
        <line x1="6" y1="16" x2="8"  y2="5"  stroke="#c9a84c" stroke-width="2.8" stroke-linecap="round"/>
        <line x1="6" y1="16" x2="12" y2="6"  stroke="#c9a84c" stroke-width="2.8" stroke-linecap="round"/>
        <line x1="6" y1="16" x2="15" y2="10" stroke="#c9a84c" stroke-width="2.8" stroke-linecap="round"/>
      </g>
    </svg>
  `;

  document.body.appendChild(wrapper);
}

// =============================================
// Mascot Animation State
// =============================================

const mascot = {
  x: 4,
  targetX: 4,
  walkPhase: 0,
  isWalking: false,
  facingRight: true,
  stopTimer: null,
  lastParticleTime: 0,
  lastParticleX: -999,
  bubbleTimer: null,
  bubbleShown: false,
  isScrollActive: false,
  avoidUsedThisScroll: false,
  isDragging: false,
  physicsActive: false,
  physicsX: 0,
  physicsY: 0,
  physicsVx: 0,
  physicsVy: 0,
  lastFrameTime: 0,
  dragOffsetX: 0,
  dragOffsetY: 0,
  dragPointerId: null,
  lastDragX: 0,
  lastDragY: 0,
  lastDragTime: 0,
  lastImpactTime: 0,

  // Jump state
  isJumping: false,
  jumpStartTime: 0,
  jumpDuration: 560,
  jumpHeight: 60,
  jumpTimer: null,
  skidStartTime: 0,
  skidDuration: 380,
  skidDirection: 1,
  skidDistance: 0,
  skidTravelPct: 0,

  pivots: {
    armL: [22, 50],
    armR: [78, 52],
    legLUpper: [41, 76],
    legRUpper: [59, 76],
    legLKnee: [35, 103],
    legRKnee: [65, 103]
  },

  tips: [
    'Hello there!',
    'Fix your blindspot!',
    'Scroll to explore.',
    'Welcome!'
  ]
};

// =============================================
// Mascot rAF Loop
// =============================================

function mascotLoop(timestamp) {
  const wrapper = document.getElementById('mascot-wrapper');
  const svg     = document.getElementById('blindspot-mascot');
  if (!wrapper || !svg) { requestAnimationFrame(mascotLoop); return; }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const wrapperWidth = 88;
  const wrapperHeight = 148;
  const floorY = viewportHeight - wrapperHeight - 16;
  const dt = Math.min((timestamp - (mascot.lastFrameTime || timestamp)) / 16.6667, 2);
  mascot.lastFrameTime = timestamp;

  if (mascot.physicsActive || mascot.isDragging) {
    if (!mascot.isDragging) {
      mascot.physicsX += mascot.physicsVx * dt;
      mascot.physicsY += mascot.physicsVy * dt;
      mascot.physicsVy += 0.72 * dt;

      if (mascot.physicsX <= 0) {
        mascot.physicsX = 0;
        mascot.physicsVx = Math.abs(mascot.physicsVx) * 0.62;
        emitImpactDust(mascot.physicsX + 10, mascot.physicsY + wrapperHeight * 0.55, 16, -8, 6);
      } else if (mascot.physicsX >= viewportWidth - wrapperWidth) {
        mascot.physicsX = viewportWidth - wrapperWidth;
        mascot.physicsVx = -Math.abs(mascot.physicsVx) * 0.62;
        emitImpactDust(mascot.physicsX + wrapperWidth - 10, mascot.physicsY + wrapperHeight * 0.55, -16, -8, 6);
      }

      if (mascot.physicsY <= 0) {
        mascot.physicsY = 0;
        mascot.physicsVy = Math.abs(mascot.physicsVy) * 0.55;
        emitImpactDust(mascot.physicsX + wrapperWidth * 0.5, mascot.physicsY + 8, mascot.physicsVx * 0.35, 12, 6);
      } else if (mascot.physicsY >= floorY) {
        mascot.physicsY = floorY;
        if (Math.abs(mascot.physicsVy) > 2.4) {
          mascot.physicsVy = -Math.abs(mascot.physicsVy) * 0.48;
          mascot.physicsVx *= 0.9;
          emitImpactDust(mascot.physicsX + wrapperWidth * 0.5, mascot.physicsY + wrapperHeight - 10, -mascot.physicsVx * 0.55, -14, 7);
          triggerLandingSkid();
        } else {
          mascot.physicsVy = 0;
          mascot.physicsVx *= 0.84;
          if (Math.abs(mascot.physicsVx) < 0.25) {
            mascot.physicsActive = false;
            mascot.physicsVx = 0;
            mascot.physicsVy = 0;
            mascot.x = Math.max(4, Math.min(88, (mascot.physicsX / Math.max(1, viewportWidth - wrapperWidth)) * 84 + 4));
            mascot.targetX = mascot.x;
          }
        }
      }
    }

    if (Math.abs(mascot.physicsVx) > 0.2) {
      mascot.facingRight = mascot.physicsVx > 0;
    }

    wrapper.style.top = `${mascot.physicsY.toFixed(2)}px`;
    wrapper.style.bottom = 'auto';
    wrapper.style.left = `${mascot.physicsX.toFixed(2)}px`;
    wrapper.style.transform = 'translateX(0)';

    const physicsTilt = Math.max(-18, Math.min(18, mascot.physicsVx * 1.6));
    const physicsStretch = 1 + Math.min(Math.abs(mascot.physicsVy) * 0.015, 0.12);
    const fallReach = Math.max(-1, Math.min(1, mascot.physicsVy / 18));
    const drift = Math.max(-1, Math.min(1, mascot.physicsVx / 14));
    const armL = -24 - fallReach * 20 + drift * 8;
    const armR = -8 - fallReach * 14 + drift * 6;
    const legLUpper = 6 + fallReach * 18 + drift * 10;
    const legRUpper = -4 + fallReach * 16 + drift * 6;
    const legLLower = 10 + Math.max(0, fallReach) * 20;
    const legRLower = 8 + Math.max(0, fallReach) * 16;

    rotateLimb('m-arm-l', armL, mascot.pivots.armL);
    rotateLimb('m-arm-r', armR, mascot.pivots.armR);
    rotateLimb('m-leg-l-upper', legLUpper, mascot.pivots.legLUpper);
    rotateLimb('m-leg-r-upper', legRUpper, mascot.pivots.legRUpper);
    rotateLimb('m-leg-l-lower', legLLower, mascot.pivots.legLKnee);
    rotateLimb('m-leg-r-lower', legRLower, mascot.pivots.legRKnee);
    svg.style.transform = `rotate(${physicsTilt.toFixed(2)}deg) scaleX(${mascot.facingRight ? 1 : -1}) scaleY(${physicsStretch.toFixed(3)})`;
    requestAnimationFrame(mascotLoop);
    return;
  }

  // Smooth X position interpolation
  const xDiff = mascot.targetX - mascot.x;
  mascot.x += xDiff * 0.055;

  // Walk phase advancement
  if (mascot.isWalking) {
    mascot.walkPhase += 0.115;
  } else if (mascot.isJumping) {
    mascot.walkPhase += 0.07; // advance for leg kick during jump
  }

  // Body bob (used when not jumping)
  const idleBob = Math.sin(timestamp * 0.0013) * 3;
  const walkBob = Math.abs(Math.sin(mascot.walkPhase * 2)) * -6;
  const bobY    = mascot.isWalking ? walkBob : idleBob;

  // --- Jump arc + squash/stretch ---
  const facingScale = mascot.facingRight ? 1 : -1;
  let finalBottom;
  let svgScaleX = facingScale;
  let svgScaleY = 1;
  let wrapperOffsetX = 0;
  let svgRotate = 0;
  let displayX = mascot.x;

  if (mascot.skidStartTime) {
    const skidElapsed = timestamp - mascot.skidStartTime;
    const skidT = Math.min(skidElapsed / mascot.skidDuration, 1);
    const skidEase = 1 - Math.pow(1 - skidT, 2);
    const skidFalloff = 1 - skidEase;
    displayX += mascot.skidDirection * mascot.skidTravelPct * skidEase;
    wrapperOffsetX = mascot.skidDirection * mascot.skidDistance * skidFalloff;
    svgRotate = mascot.skidDirection * 8 * skidFalloff;
    svgScaleY *= 1 - 0.16 * skidFalloff;
    svgScaleX *= 1 + 0.2 * skidFalloff;

    if (skidT >= 1) {
      mascot.x = Math.max(4, Math.min(88, mascot.x + mascot.skidDirection * mascot.skidTravelPct));
      mascot.targetX = mascot.x;
      mascot.skidStartTime = 0;
      mascot.skidDistance = 0;
      mascot.skidTravelPct = 0;
      displayX = mascot.x;
    }
  }

  if (mascot.isJumping) {
    const elapsed = timestamp - mascot.jumpStartTime;
    const t       = Math.min(elapsed / mascot.jumpDuration, 1);

    if (t >= 1) {
      mascot.isJumping = false;
      triggerLandingSkid();
      finalBottom = 16 - bobY;
    } else {
      const arc      = Math.sin(t * Math.PI);
      const heightPx = arc * mascot.jumpHeight;
      finalBottom    = 16 + heightPx;

      if (heightPx < 10 && t > 0.5) {
        // Landing squash
        const land = 1 - heightPx / 10;
        svgScaleY  = 1 - land * 0.32;
        svgScaleX  = facingScale * (1 + land * 0.22);
      } else {
        // Mid-air stretch
        svgScaleY = 1 + arc * 0.15;
        svgScaleX = facingScale * (1 - arc * 0.08);
      }
    }
  } else {
    finalBottom = 16 - bobY;
  }

  wrapper.style.left = displayX.toFixed(2) + '%';
  wrapper.style.top = 'auto';
  wrapper.style.bottom = finalBottom.toFixed(2) + 'px';
  wrapper.style.transform = `translateX(${wrapperOffsetX.toFixed(2)}px)`;
  svg.style.transform  = `rotate(${svgRotate.toFixed(2)}deg) scaleX(${svgScaleX.toFixed(3)}) scaleY(${svgScaleY.toFixed(3)})`;

  // --- Limb rotations ---
  let legLUpper, legRUpper, legLLower, legRLower, armL, armR;

  if (mascot.isJumping) {
    const elapsed  = timestamp - mascot.jumpStartTime;
    const t        = Math.min(elapsed / mascot.jumpDuration, 1);
    const arc      = Math.sin(t * Math.PI);
    // Arms raised and spread, legs tucked slightly
    armL = -35 - arc * 18;
    armR = -15 - arc * 12;
    legLUpper = arc * -16;
    legRUpper = arc * -10;
    legLLower = 12 + arc * 24;
    legRLower = 10 + arc * 20;
  } else if (mascot.isWalking) {
    const p = mascot.walkPhase;
    const leftLeg = getWalkLegPose(p);
    const rightLeg = getWalkLegPose(p + Math.PI);
    legLUpper = leftLeg.upper;
    legRUpper = rightLeg.upper;
    legLLower = leftLeg.lower;
    legRLower = rightLeg.lower;
    armL = Math.sin(p + Math.PI) * 22;
    armR = Math.sin(p) * 22;
  } else {
    const t    = timestamp;
    const slow = Math.sin(t * 0.0007);
    legLUpper = slow * 4;
    legRUpper = -slow * 3 + 2;
    legLLower = 5 + Math.max(0, slow) * 3;
    legRLower = 5 + Math.max(0, -slow) * 3;
    armR = Math.sin(t * 0.0009) * 8 - 4;
    armL = -55 + Math.sin(t * 0.0021) * 30;
  }

  rotateLimb('m-arm-l', armL, mascot.pivots.armL);
  rotateLimb('m-arm-r', armR, mascot.pivots.armR);
  rotateLimb('m-leg-l-upper', legLUpper, mascot.pivots.legLUpper);
  rotateLimb('m-leg-r-upper', legRUpper, mascot.pivots.legRUpper);
  rotateLimb('m-leg-l-lower', legLLower, mascot.pivots.legLKnee);
  rotateLimb('m-leg-r-lower', legRLower, mascot.pivots.legRKnee);

  // Shadow: shrinks when mascot is in the air
  const shadow = document.getElementById('m-shadow');
  if (shadow) {
    let airHeight = -bobY;
    if (mascot.isJumping) {
      const elapsed = timestamp - mascot.jumpStartTime;
      airHeight = Math.sin(Math.min(elapsed / mascot.jumpDuration, 1) * Math.PI) * mascot.jumpHeight;
    }
    const shadowScale = Math.max(0.2, 1 - airHeight / 100);
    shadow.setAttribute('rx',      (20 * shadowScale).toFixed(1));
    shadow.setAttribute('opacity', (0.18 * shadowScale).toFixed(3));
  }

  // Particle trail when walking (not mid-jump)
  if (mascot.isWalking && !mascot.isJumping) {
    emitParticle(wrapper);
  }

  requestAnimationFrame(mascotLoop);
}

function rotateLimb(id, angleDeg, pivot) {
  const el = document.getElementById(id);
  if (el) {
    el.setAttribute('transform', `rotate(${angleDeg.toFixed(2)}, ${pivot[0]}, ${pivot[1]})`);
  }
}

function getWalkLegPose(phase) {
  const swing = Math.sin(phase);
  const swingForward = Math.max(0, swing);
  const stanceLoad = Math.max(0, -swing);

  return {
    // Thigh leads the stride. A little cosine softens the turnaround.
    upper: swing * 16 + Math.cos(phase) * 3,
    // Knee bends mainly on the recovery/swing leg and stays close to straight in stance.
    lower: 4 + swingForward * 22 + swingForward * swingForward * 8 + stanceLoad * 2
  };
}

function emitImpactDust(x, y, vx, vy, count = 6) {
  const now = performance.now();
  if (now - mascot.lastImpactTime < 80) return;
  mascot.lastImpactTime = now;

  for (let i = 0; i < count; i += 1) {
    const dust = document.createElement('div');
    const size = 5 + Math.random() * 7;
    dust.className = 'mascot-skid-dust';
    dust.style.width = `${size}px`;
    dust.style.height = `${size * (0.7 + Math.random() * 0.4)}px`;
    dust.style.left = `${x + (Math.random() * 10 - 5)}px`;
    dust.style.top = `${y + (Math.random() * 10 - 5)}px`;
    dust.style.setProperty('--dust-x', `${vx + (Math.random() * 12 - 6)}px`);
    dust.style.setProperty('--dust-y', `${vy + (Math.random() * 12 - 6)}px`);
    dust.style.animationDelay = `${i * 12}ms`;
    document.body.appendChild(dust);
    setTimeout(() => {
      if (dust.parentNode) dust.remove();
    }, 720);
  }
}

// =============================================
// Particle Trail
// =============================================

function emitParticle(wrapper) {
  const now = Date.now();
  if (now - mascot.lastParticleTime < 130) return;
  if (Math.abs(mascot.x - mascot.lastParticleX) < 0.3) return;

  mascot.lastParticleTime = now;
  mascot.lastParticleX    = mascot.x;

  const rect       = wrapper.getBoundingClientRect();
  const footOffset = (Math.sin(mascot.walkPhase) > 0) ? 0.25 : 0.75;
  const px         = rect.left + rect.width * footOffset;
  const py         = rect.bottom - 6;

  const size = 4 + Math.random() * 4;
  const p    = document.createElement('div');
  p.className    = 'mascot-particle';
  p.style.width  = size + 'px';
  p.style.height = size + 'px';
  p.style.left   = px + 'px';
  p.style.top    = py + 'px';
  document.body.appendChild(p);

  setTimeout(() => { if (p.parentNode) p.remove(); }, 750);
}

function emitLandingDust(direction) {
  const wrapper = document.getElementById('mascot-wrapper');
  if (!wrapper) return;

  const rect = wrapper.getBoundingClientRect();
  const baseX = direction > 0 ? rect.left + rect.width * 0.32 : rect.left + rect.width * 0.68;
  const baseY = rect.bottom - 10;

  for (let i = 0; i < 7; i += 1) {
    const dust = document.createElement('div');
    const size = 5 + Math.random() * 8;
    const spreadX = (-direction * (10 + Math.random() * 18)) + (Math.random() * 8 - 4);
    const spreadY = -(8 + Math.random() * 16);

    dust.className = 'mascot-skid-dust';
    dust.style.width = `${size}px`;
    dust.style.height = `${size * (0.72 + Math.random() * 0.45)}px`;
    dust.style.left = `${baseX + (Math.random() * 12 - 6)}px`;
    dust.style.top = `${baseY + (Math.random() * 5 - 2)}px`;
    dust.style.setProperty('--dust-x', `${spreadX}px`);
    dust.style.setProperty('--dust-y', `${spreadY}px`);
    dust.style.animationDelay = `${i * 18}ms`;
    document.body.appendChild(dust);

    setTimeout(() => {
      if (dust.parentNode) dust.remove();
    }, 720);
  }
}

// =============================================
// Jump Control
// =============================================

function triggerJump(height) {
  if (mascot.isJumping) return;
  mascot.isJumping     = true;
  mascot.jumpStartTime = performance.now();
  if (typeof height === 'number') mascot.jumpHeight = height;
}

function triggerLandingSkid() {
  mascot.skidStartTime = performance.now();
  mascot.skidDirection = mascot.facingRight ? 1 : -1;
  mascot.skidDistance = 14 + Math.min(mascot.jumpHeight * 0.18, 14);
  mascot.skidTravelPct = 1.8 + Math.min(mascot.jumpHeight * 0.03, 1.8);
  emitLandingDust(mascot.skidDirection);
}

// =============================================
// Avoidance System
// =============================================

// Returns true if the element (or an ancestor) is something worth avoiding
function isInteractiveEl(el) {
  let node  = el;
  let depth = 0;
  while (node && node !== document.body && depth < 8) {
    const tag = node.tagName ? node.tagName.toLowerCase() : '';
    if (['button', 'a', 'input', 'select', 'textarea', 'label'].includes(tag)) return true;
    const cls = node.classList;
    if (cls && (
      cls.contains('pricing-card')    ||
      cls.contains('case-card')       ||
      cls.contains('team-card')       ||
      cls.contains('value-card')      ||
      cls.contains('numbers-grid')    ||
      cls.contains('numbers-bar')     ||
      cls.contains('footer-cta')      ||
      cls.contains('wwd-item')        ||
      cls.contains('wwd-grid')        ||
      cls.contains('section-heading') ||
      cls.contains('page-hero-heading') ||
      cls.contains('hero-headline')   ||
      cls.contains('builder-grid')    ||
      cls.contains('builder-col')
    )) return true;
    node = node.parentElement;
    depth++;
  }
  return false;
}

// Sample several points within the mascot's bounding box
function sampleMascotOverlap() {
  const wrapper = document.getElementById('mascot-wrapper');
  if (!wrapper) return false;

  const rect = wrapper.getBoundingClientRect();
  const points = [
    [rect.left + rect.width * 0.25, rect.top + rect.height * 0.2],
    [rect.left + rect.width * 0.5,  rect.top + rect.height * 0.2],
    [rect.left + rect.width * 0.75, rect.top + rect.height * 0.2],
    [rect.left + rect.width * 0.5,  rect.top + rect.height * 0.5],
    [rect.left + rect.width * 0.5,  rect.top + rect.height * 0.75],
  ];

  for (const [x, y] of points) {
    if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) continue;
    const el = document.elementFromPoint(x, y);
    if (el && isInteractiveEl(el)) return true;
  }
  return false;
}

// Find the X% that has the least overlap with interactive elements
function findSafeX() {
  const vw       = window.innerWidth;
  const vh       = window.innerHeight;
  const sampleY1 = vh - 80;
  const sampleY2 = vh - 140;

  const candidates = [];

  for (let xPct = 3; xPct <= 87; xPct += 5) {
    const xPx  = vw * xPct / 100;
    let score  = 0;

    const xs = [xPx - 25, xPx, xPx + 25];
    for (const sx of xs) {
      if (sx < 0 || sx > vw) continue;
      for (const sy of [sampleY1, sampleY2]) {
        const el = document.elementFromPoint(sx, sy);
        if (el && isInteractiveEl(el)) score += 4;
      }
    }

    // Small penalty for distance (prefer nearby spots when score is equal)
    score += Math.abs(xPct - mascot.x) * 0.04;

    candidates.push({ xPct, score });
  }

  candidates.sort((a, b) => a.score - b.score);
  return candidates[0] ? candidates[0].xPct : mascot.x;
}

function checkAndAvoid() {
  if (mascot.physicsActive || mascot.isDragging) return;
  if (mascot.isWalking || mascot.isJumping) return;
  if (mascot.isScrollActive && mascot.avoidUsedThisScroll) return;
  if (!sampleMascotOverlap()) return;

  const safeX = findSafeX();
  const dist  = Math.abs(safeX - mascot.x);
  if (dist < 5) return; // already in a clear enough spot

  mascot.facingRight = safeX > mascot.x;
  mascot.targetX     = safeX;
  mascot.avoidUsedThisScroll = true;
  // Bigger jump for longer distances, but capped
  triggerJump(42 + Math.min(dist * 0.45, 28));
}

function initAvoidance() {
  // Check for overlap every 2 seconds
  setInterval(checkAndAvoid, 2000);

  // Periodic idle hops just for personality
  function scheduleIdleJump() {
    const delay = 8000 + Math.random() * 9000;
    mascot.jumpTimer = setTimeout(() => {
      if (!mascot.isWalking && !mascot.isJumping) {
        triggerJump(28 + Math.random() * 24);
      }
      scheduleIdleJump();
    }, delay);
  }
  scheduleIdleJump();
}

function initMascotDrag() {
  const wrapper = document.getElementById('mascot-wrapper');
  const svg = document.getElementById('blindspot-mascot');
  if (!wrapper || !svg) return;

  wrapper.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;

    const rect = wrapper.getBoundingClientRect();
    mascot.isDragging = true;
    mascot.physicsActive = true;
    mascot.dragPointerId = e.pointerId;
    mascot.dragOffsetX = e.clientX - rect.left;
    mascot.dragOffsetY = e.clientY - rect.top;
    mascot.physicsX = rect.left;
    mascot.physicsY = rect.top;
    mascot.physicsVx = 0;
    mascot.physicsVy = 0;
    mascot.isWalking = false;
    mascot.isJumping = false;
    mascot.skidStartTime = 0;
    mascot.lastDragX = e.clientX;
    mascot.lastDragY = e.clientY;
    mascot.lastDragTime = performance.now();
    wrapper.classList.add('dragging');
    wrapper.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  wrapper.addEventListener('pointermove', e => {
    if (!mascot.isDragging || e.pointerId !== mascot.dragPointerId) return;

    const now = performance.now();
    const nextX = e.clientX - mascot.dragOffsetX;
    const nextY = e.clientY - mascot.dragOffsetY;
    const elapsed = Math.max(now - mascot.lastDragTime, 16);
    mascot.physicsVx = (e.clientX - mascot.lastDragX) / elapsed;
    mascot.physicsVy = (e.clientY - mascot.lastDragY) / elapsed;
    mascot.physicsX = Math.max(0, Math.min(window.innerWidth - 88, nextX));
    mascot.physicsY = Math.max(0, Math.min(window.innerHeight - 148, nextY));
    mascot.lastDragX = e.clientX;
    mascot.lastDragY = e.clientY;
    mascot.lastDragTime = now;
    mascot.facingRight = mascot.physicsVx >= 0;
  });

  const releaseDrag = e => {
    if (!mascot.isDragging || e.pointerId !== mascot.dragPointerId) return;
    mascot.isDragging = false;
    wrapper.classList.remove('dragging');
    wrapper.releasePointerCapture(e.pointerId);
    mascot.dragPointerId = null;
    mascot.physicsVx *= 14;
    mascot.physicsVy *= 14;
  };

  wrapper.addEventListener('pointerup', releaseDrag);
  wrapper.addEventListener('pointercancel', releaseDrag);
}

// =============================================
// Mascot Bubble Tips
// =============================================

function startBubbleCycle() {
  function showBubble() {
    if (mascot.isWalking) {
      mascot.bubbleTimer = setTimeout(showBubble, 6000);
      return;
    }

    const bubble = document.getElementById('mascot-bubble');
    if (!bubble) return;

    const tips = mascot.tips;
    bubble.textContent = tips[Math.floor(Math.random() * tips.length)];
    bubble.classList.add('visible');

    setTimeout(() => {
      bubble.classList.remove('visible');
      mascot.bubbleTimer = setTimeout(showBubble, 9000 + Math.random() * 5000);
    }, 2800);
  }

  mascot.bubbleTimer = setTimeout(showBubble, 3500);
}

// =============================================
// Scroll Handler
// =============================================

function initMascotScroll() {
  let lastScrollY = window.scrollY;
  let lastScrollTime = performance.now();
  let lastFastJumpTime = 0;

  window.addEventListener('scroll', () => {
    const now = performance.now();
    const scrollY   = window.scrollY;
    const scrollMax = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const progress  = scrollY / scrollMax;

    const bar = document.getElementById('scroll-progress');
    if (bar) bar.style.width = (progress * 100).toFixed(2) + '%';

    mascot.targetX = 4 + progress * 84;

    const delta = scrollY - lastScrollY;
    const elapsed = Math.max(now - lastScrollTime, 16);
    const speed = Math.abs(delta) / elapsed;
    if (Math.abs(delta) > 0.8) {
      if (!mascot.isScrollActive) {
        mascot.isScrollActive = true;
        mascot.avoidUsedThisScroll = false;
      }
      mascot.facingRight = delta > 0;
      mascot.isWalking   = true;

      clearTimeout(mascot.stopTimer);
      mascot.stopTimer = setTimeout(() => {
        mascot.isWalking = false;
        mascot.isScrollActive = false;
      }, 280);
    }

    if (
      speed > 1.4 &&
      Math.abs(delta) > 24 &&
      !mascot.isJumping &&
      now - lastFastJumpTime > 900
    ) {
      triggerJump(30 + Math.min(speed * 12, 24));
      lastFastJumpTime = now;
    }

    lastScrollY = scrollY;
    lastScrollTime = now;

    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.toggle('scrolled', scrollY > 60);

  }, { passive: true });

  const navbar = document.querySelector('.navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
}

// =============================================
// Number Counters
// =============================================

function initCounters() {
  const statEls = document.querySelectorAll('.stat-number[data-target]');
  if (!statEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      animateCounter(entry.target);
    });
  }, { threshold: 0.6 });

  statEls.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target    = parseFloat(el.dataset.target);
  const prefix    = el.dataset.prefix  || '';
  const suffix    = el.dataset.suffix  || '';
  const duration  = 1800;
  const startTime = performance.now();

  el.classList.add('counting');

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(eased * target);

    el.textContent = prefix + current + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = prefix + target + suffix;
      el.classList.remove('counting');
    }
  }

  requestAnimationFrame(tick);
}

// =============================================
// Heading Underline Reveal
// =============================================

function initHeadingReveals() {
  const headings = document.querySelectorAll('.section-heading, .page-hero-heading');
  if (!headings.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('underline-reveal');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  headings.forEach(h => observer.observe(h));
}

// =============================================
// Card 3D Tilt on Hover
// =============================================

function initCardTilt() {
  const cards = document.querySelectorAll('.pricing-card, .team-card, .value-card');

  cards.forEach(card => {
    card.classList.add('tilt-card');

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      const cx   = rect.width  / 2;
      const cy   = rect.height / 2;
      const rotX = ((y - cy) / cy) * -4;
      const rotY = ((x - cx) / cx) *  4;

      card.style.transform = `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(6px)`;
      card.style.boxShadow = `0 ${12 + rotX}px ${32 + Math.abs(rotY) * 3}px rgba(0,0,0,0.25)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

// =============================================
// Button Ripple Effect
// =============================================

function initButtonRipples() {
  document.querySelectorAll('.btn-primary, .btn-outline, .btn-book, .btn-gold-outline').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      const ripple       = document.createElement('span');
      ripple.className   = 'btn-ripple';
      ripple.style.width  = size + 'px';
      ripple.style.height = size + 'px';
      ripple.style.left   = x + 'px';
      ripple.style.top    = y + 'px';

      this.appendChild(ripple);
      setTimeout(() => { if (ripple.parentNode) ripple.remove(); }, 600);
    });
  });
}

// =============================================
// Hero Parallax
// =============================================

function initHeroParallax() {
  const heroBg = document.querySelector('.hero-bg-icon');
  if (!heroBg) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    heroBg.style.transform = `translateY(calc(-50% + ${(scrolled * 0.28).toFixed(1)}px))`;
  }, { passive: true });
}

// =============================================
// Enhanced Scroll Reveal
// =============================================

function initEnhancedScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el    = entry.target;
      const delay = el.dataset.delay || 0;

      setTimeout(() => {
        el.classList.add('visible');
      }, delay * 130);

      observer.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in').forEach(el => {
    observer.observe(el);
  });
}

// =============================================
// Init Everything on DOMContentLoaded
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  injectMascot();
  initMascotDrag();
  initMascotScroll();

  if (!prefersReduced) {
    requestAnimationFrame(mascotLoop);
    startBubbleCycle();
    initAvoidance();
  }

  initCounters();
  initHeadingReveals();
  initCardTilt();
  initButtonRipples();
  initHeroParallax();
  initEnhancedScrollReveal();
});
