async function detectRuntime() {
  if (window.latentDesktop?.getRuntimeInfo) {
    try {
      return await window.latentDesktop.getRuntimeInfo();
    } catch {
      return { runtime: 'electron', platform: 'unknown', appVersion: 'unknown' };
    }
  }
  return {
    runtime: 'web',
    platform: navigator.platform || 'browser',
    appVersion: '0.1.0-alpha.1'
  };
}

const runtime = await detectRuntime();
const card = document.getElementById('runtimeCard');
if (card) {
  card.textContent = runtime.runtime === 'electron'
    ? `Runtime : Electron ${runtime.electronVersion || ''} · ${runtime.platform}`
    : `Runtime : Web · ${runtime.platform}`;
}

const links = [...document.querySelectorAll('.sidebar nav a')];
const sections = links
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  }, { rootMargin: '-20% 0px -65% 0px', threshold: [0.05, 0.3] });
  sections.forEach((section) => observer.observe(section));
}
