"use client";

import ReactDOM from "react-dom";

/**
 * Preconnect to the render-critical YouTube origins: i.ytimg.com (the featured
 * thumbnail grid) and www.youtube-nocookie.com (the embed iframe). Overlapping the
 * cold DNS+TLS handshakes with page load matters on the Tesla browser's
 * high-latency cellular/tunnel link. Raw <link rel="preconnect"> is flagged as
 * unsupported metadata in this Next version, so we use the ReactDOM hint API.
 */
export function ResourceHints() {
  ReactDOM.preconnect("https://i.ytimg.com");
  ReactDOM.preconnect("https://www.youtube-nocookie.com");
  return null;
}
