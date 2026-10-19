/**
 * Presentation-only enhancements. No authentication, chat, or API state touched.
 * The app owns navigation; the guide simply clicks the same existing controls.
 */
const themeButton = document.getElementById('theme-toggle');
const guideButton = document.getElementById('guide-toggle');
const guide = document.getElementById('study-guide');
const guideTitle = document.getElementById('guide-title');
const guideDescription = document.getElementById('guide-description');
const guideCounter = document.getElementById('guide-step-counter');
const guideDots = document.getElementById('guide-dots');
const guideGo = document.getElementById('guide-go');
const guidePrev = document.getElementById('guide-prev');
const guideNext = document.getElementById('guide-next');
const STORAGE_KEY = 'studyspace-appearance';

// Browser-only preference: safe when localStorage is blocked or unavailable.
function saveAppearance(value) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch { /* private browsing can block writes */ }
}
function syncAppearance() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.querySelector('.theme-icon').textContent = dark ? '☀' : '☾';
  themeButton.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  const meta = document.getElementById('browser-theme-color');
  if (meta) meta.content = dark ? '#111b18' : '#fcfcf9';
}
syncAppearance();
themeButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  saveAppearance(next);
  syncAppearance();
});

const steps = [
  { title: 'Start with a question', description: 'Ask for a summary, an explanation, or help understanding a topic. Your chats live here.', label: 'Open Chat', target: 'chat' },
  { title: 'Bring your materials', description: 'Upload PDFs, slides, spreadsheets or notes. You can ask questions about them afterward.', label: 'Open Documents', target: 'documents' },
  { title: 'Make learning stick', description: 'Turn ideas into flashcards, structured notes, and other study activities.', label: 'Open Study tools', target: 'study' },
  { title: 'Keep your creations organised', description: 'Your generated study material saves automatically. Find it in My Library, add media and organise everything with tags.', label: 'Open My Library', target: 'library' },
  { title: 'Explore trusted starting points', description: 'Browse useful learning resources, then bring a source into your conversation.', label: 'Open Resources', target: 'resources' },
  { title: 'See what your chat knows', description: 'Use Sources to see and manage the documents attached to your current conversation.', label: 'Show Sources', target: 'sources' },
  { title: 'Keep your space yours', description: 'Manage your account and saved chats from the menu. Your learning preferences are under Settings.', label: 'Open Settings', target: 'settings' },
];
let stepIndex = 0;
let guideVisible = false;

function renderGuide() {
  const step = steps[stepIndex];
  guideCounter.textContent = `${stepIndex + 1} of ${steps.length}`;
  guideTitle.textContent = step.title;
  guideDescription.textContent = step.description;
  guideGo.textContent = `${step.label} ↗`;
  guidePrev.disabled = stepIndex === 0;
  guideNext.textContent = stepIndex === steps.length - 1 ? 'Done ✓' : 'Next →';
  guideNext.setAttribute('aria-label', stepIndex === steps.length - 1 ? 'Finish guide' : 'Next guide step');
  guideDots.replaceChildren(...steps.map((_, index) => {
    const dot = document.createElement('span');
    dot.className = index === stepIndex ? 'active' : '';
    return dot;
  }));
}
function setGuideOpen(open, restoreFocus = false) {
  guideVisible = open;
  guide.hidden = !open;
  guideButton.setAttribute('aria-expanded', String(open));
  guideButton.classList.toggle('active', open);
  if (open) renderGuide();
  if (!open && restoreFocus) guideButton.focus();
}
function navigateGuide() {
  const target = steps[stepIndex].target;
  setGuideOpen(false);
  if (target === 'sources') {
    const sources = document.getElementById('context-panel');
    const toggle = document.getElementById('sources-toggle');
    const collapsed = document.querySelector('.app-shell')?.classList.contains('sources-collapsed');
    const docked = window.matchMedia('(min-width: 1201px)').matches;
    if ((docked && collapsed) || (!docked && !sources.classList.contains('mobile-open'))) toggle?.click();
    return;
  }
  if (target === 'settings') {
    document.getElementById('settings-open')?.click();
    return;
  }
  // The existing navigation handler updates both desktop and mobile tab state.
  const buttons = [...document.querySelectorAll(`[data-tab="${target}"]`)];
  const visible = buttons.find(button => button.getClientRects().length);
  (visible || buttons[0])?.click();
}
guideButton.addEventListener('click', () => setGuideOpen(!guideVisible));
document.getElementById('guide-close').addEventListener('click', () => setGuideOpen(false, true));
guidePrev.addEventListener('click', () => { if (stepIndex > 0) { stepIndex -= 1; renderGuide(); } });
guideNext.addEventListener('click', () => {
  if (stepIndex === steps.length - 1) { setGuideOpen(false, true); return; }
  stepIndex += 1;
  renderGuide();
});
guideGo.addEventListener('click', navigateGuide);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && guideVisible) {
    setGuideOpen(false, true);
  }
});
document.addEventListener('pointerdown', event => {
  if (guideVisible && !guide.contains(event.target) && !guideButton.contains(event.target)) {
    setGuideOpen(false);
  }
});
renderGuide();
