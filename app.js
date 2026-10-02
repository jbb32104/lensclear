'use strict';

const lensParts = [
  { name: 'Front optical element', start: 60, height: 338, closed: 0, open: 0 },
  { name: 'Ultrasonic actuator', start: 398, height: 255, closed: .24, open: .61 },
  { name: 'Precision lens housing', start: 653, height: 468, closed: .32, open: 1.08 },
  { name: 'Camera mount', start: 1121, height: 359, closed: .73, open: 1.89 }
];

document.querySelectorAll('.lens-scene').forEach(scene => {
  lensParts.forEach((part, index) => {
    const layer = document.createElement('div');
    layer.className = 'lens-part';
    layer.style.aspectRatio = `624 / ${part.height}`;
    layer.style.zIndex = String(4 - index);
    layer.style.top = `${part.closed / 1.26 * 100}%`;
    const img = document.createElement('img');
    img.src = 'assets/lens-exploded.png';
    img.alt = '';
    img.width = 1024;
    img.height = 1536;
    img.draggable = false;
    img.style.transform = `translateY(-${part.start / 1536 * 100}%)`;
    layer.append(img);
    scene.append(layer);
  });
});

const technology = document.querySelector('.technology');
const techLens = document.querySelector('.tech-lens');
const techLayers = [...techLens.querySelectorAll('.lens-part')];
const steps = [...document.querySelectorAll('.tech-step')];
const toggle = document.querySelector('.view-toggle');
const progressBar = document.querySelector('.progress-track > span');
const labels = document.querySelector('.part-labels');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let progress = 0;
let manualProgress = null;
let scheduled = false;
const clamp = value => Math.max(0, Math.min(1, value));

function renderLens() {
  scheduled = false;
  const bounds = technology.getBoundingClientRect();
  const travel = Math.max(1, technology.offsetHeight - window.innerHeight);
  progress = manualProgress ?? (reducedMotion.matches ? 1 : clamp(-bounds.top / travel));
  const opening = clamp((progress - .05) / .77);
  const eased = opening * opening * (3 - 2 * opening);
  const width = techLens.clientWidth;
  techLayers.forEach((layer, index) => {
    const part = lensParts[index];
    const centerOffset = (2.465 - 1.305) / 2 * (1 - eased);
    const y = (part.closed + (part.open - part.closed) * eased + centerOffset) * width;
    layer.style.top = '0';
    layer.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
  });
  const activeStep = Math.min(2, Math.floor(progress * 3));
  steps.forEach((step, index) => {
    step.classList.toggle('is-active', index === activeStep);
    step.setAttribute('aria-pressed', String(index === activeStep));
  });
  progressBar.style.transform = `scaleX(${progress})`;
  labels.style.opacity = String(clamp((eased - .7) / .3));
  const expanded = opening > .5;
  toggle.setAttribute('aria-pressed', String(expanded));
  toggle.innerHTML = `${expanded ? 'Assemble' : 'Expand'} lens <span aria-hidden="true">${expanded ? '−' : '+'}</span>`;
}

function queueRender() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(renderLens); }
}
function resumeScrollAnimation() {
  manualProgress = null;
  technology.classList.remove('manual');
  queueRender();
}
window.addEventListener('scroll', queueRender, { passive: true });
window.addEventListener('wheel', resumeScrollAnimation, { passive: true });
window.addEventListener('touchmove', resumeScrollAnimation, { passive: true });
window.addEventListener('keydown', event => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) resumeScrollAnimation();
});
window.addEventListener('resize', queueRender, { passive: true });
reducedMotion.addEventListener('change', queueRender);
toggle.addEventListener('click', () => {
  technology.classList.add('manual');
  manualProgress = progress > .5 ? 0 : 1;
  queueRender();
});
steps.forEach((step, index) => step.addEventListener('click', () => {
  if (reducedMotion.matches) {
    manualProgress = [0, .48, 1][index];
    renderLens();
    return;
  }
  const start = technology.getBoundingClientRect().top + window.scrollY;
  const travel = technology.offsetHeight - window.innerHeight;
  resumeScrollAnimation();
  window.scrollTo({ top: start + travel * [0, .48, 1][index], behavior: 'smooth' });
}));
renderLens();

// Replace the coming-soon dialog with a hosted checkout link when pre-orders open.
const preorderDialog = document.querySelector('#preorder-dialog');
document.querySelectorAll('[data-preorder]').forEach(button => {
  button.addEventListener('click', () => preorderDialog.showModal());
});
preorderDialog.addEventListener('click', event => {
  if (event.target !== preorderDialog) return;
  const bounds = preorderDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) preorderDialog.close();
});
