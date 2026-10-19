/** Opt-in diagnostics. Append ?perf=1 in the address bar and inspect DevTools console.
 * Metrics are approximate diagnostic samples, not a Google Core Web Vitals assessment. */
if (new URLSearchParams(location.search).get('perf') === '1' && 'PerformanceObserver' in window) {
  const metrics = { lcp: 0, cls: 0, inpEstimate: 0 };
  const observe = (type, handler) => {
    try {
      const observer = new PerformanceObserver(list => list.getEntries().forEach(handler));
      observer.observe({type, buffered:true});
    } catch { /* Not available in this browser. */ }
  };
  observe('largest-contentful-paint', entry => { metrics.lcp = Math.round(entry.startTime); });
  observe('layout-shift', entry => { if (!entry.hadRecentInput) metrics.cls += entry.value; });
  observe('event', entry => { metrics.inpEstimate = Math.max(metrics.inpEstimate, Math.round(entry.duration)); });
  window.addEventListener('pagehide', () => console.info('[StudySpace diagnostic performance]', metrics), {once:true});
  // For quick developer checks without waiting for navigation:
  window.__studyspacePerf = () => ({...metrics});
}
