// ✅ content.js
chrome.storage.sync.get(['whitelist', 'mode', 'jsWhitelist', 'jsMode'], ({ whitelist = [], mode = 'whitelist', jsWhitelist = [], jsMode = false }) => {
  const hostname = location.hostname.replace(/^www\./, '').toLowerCase();
  const isEnabled = mode === 'global' || whitelist.some(site => hostname.endsWith(site));
  const jsShouldBeDisabled = jsMode || jsWhitelist.some(site => hostname.endsWith(site));
  const allowTextCopy = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null, false);
    while (walker.nextNode()) {
      const el = walker.currentNode;
      if (el.innerText && el.innerText.trim().length > 0) {
        el.style.userSelect = isEnabled ? 'auto' : '';
        el.style.webkitUserSelect = isEnabled ? 'auto' : '';
        el.style.pointerEvents = isEnabled ? 'auto' : '';
        el.style.setProperty('user-select', 'auto', 'important');
        el.style.setProperty('-webkit-user-select', 'auto', 'important');
        el.style.setProperty('pointer-events', 'auto', 'important');

        if (isEnabled) {
          el.onselectstart = null;
          el.oncopy = null;
          el.oncontextmenu = null;
          el.ondragstart = null;
          el.onmousedown = null;
          el.onmouseup = null;
        }
      }
    }
  };

  const disableJSHandlers = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null, false);
    while (walker.nextNode()) {
      const el = walker.currentNode;
      el.onclick = null;
      el.onmousedown = null;
      el.onmouseup = null;
      el.oncontextmenu = null;
      el.ondblclick = null;
      el.onkeydown = null;
      el.onkeyup = null;
    }

    window.onbeforeunload = null;
    window.onunload = null;
    window.onpopstate = null;

    // ✅ 스크립트 제거 및 차단
    const removeScripts = () => {
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => script.remove());
    };

    removeScripts();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach(node => {
          if (node.tagName === 'SCRIPT') {
            node.remove();
          }
        });
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    window.eval = () => { throw new Error("eval is blocked"); };
    window.Function = () => { throw new Error("Function constructor is blocked"); };

    const blockExec = (name) => {
      const original = window[name];
      window[name] = function (fn, delay, ...args) {
        if (typeof fn === 'string') {
          throw new Error(`${name} with string code is blocked`);
        }
        return original.call(this, fn, delay, ...args);
      };
    };
    blockExec('setTimeout');
    blockExec('setInterval');
  };

const run = () => {
  if (!document.body) return requestAnimationFrame(run);

  if (isEnabled) allowTextCopy();
  if (jsShouldBeDisabled) disableJSHandlers();

  // ✅ 네이버 블로그 이미지 블러 제거
  const fixBlurredImages = () => {
    if (!location.hostname.includes("blog.naver.com")) return;
    const images = document.querySelectorAll("img");
    images.forEach(img => {
      // src 수정
      if (img.src) {
        try {
          const url = new URL(img.src);
          const typeParam = url.searchParams.get("type");
          if (typeParam?.includes("_blur")) {
            url.searchParams.set("type", typeParam.replace("_blur", ""));
            img.src = url.toString();
          }
        } catch (e) {}
      }
      // data-lazy-src 수정
      const lazySrc = img.getAttribute("data-lazy-src");
      if (lazySrc) {
        try {
          const lazyUrl = new URL(lazySrc, location.href);
          const lazyType = lazyUrl.searchParams.get("type");
          if (lazyType?.includes("_blur")) {
            lazyUrl.searchParams.set("type", lazyType.replace("_blur", ""));
            img.setAttribute("data-lazy-src", lazyUrl.toString());
          }
        } catch (e) {}
      }
    });
  };

  fixBlurredImages(); // 최초 실행

  const observer = new MutationObserver(() => {
    if (isEnabled) allowTextCopy();
    if (jsShouldBeDisabled) disableJSHandlers();
    if (jsShouldBeDisabled) fixBlurredImages();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (isEnabled) {
    document.addEventListener('copy', (e) => e.stopPropagation(), true);
  }
};

run();
});
// document.addEventListener("DOMContentLoaded", () => {
//   if (jsMode) {
//     if (window.location.href.includes("blog.naver.com")) {
//       const image = document.querySelectorAll("img");
//       image.forEach(img => {
//         img.src = img.src.slice("_blur")[0]
//       });
//     }
//   }
// })
// ✅ content.js with iframe-safe image reload + helper
// ✅ content.js with iframe-safe image reload + helper
// chrome.storage.sync.get(['whitelist', 'mode', 'jsWhitelist', 'jsMode'], ({ whitelist = [], mode = 'whitelist', jsWhitelist = [], jsMode = false }) => {
//   const hostname = location.hostname.replace(/^www\./, '').toLowerCase();
//   const isEnabled = mode === 'global' || whitelist.some(site => hostname.endsWith(site));
//   const jsShouldBeDisabled = jsMode || jsWhitelist.some(site => hostname.endsWith(site));
// // ✅ content.js with iframe-safe image reload + pre-block capture
// chrome.storage.sync.get(['whitelist', 'mode', 'jsWhitelist', 'jsMode'], ({ whitelist = [], mode = 'whitelist', jsWhitelist = [], jsMode = false }) => {
//   const hostname = location.hostname.replace(/^www\./, '').toLowerCase();
//   const isEnabled = mode === 'global' || whitelist.some(site => hostname.endsWith(site));
//   const jsShouldBeDisabled = jsMode || jsWhitelist.some(site => hostname.endsWith(site));
//   const isIframe = window.top !== window.self;

//   // ✅ 이미지 src 저장용 배열 (iframe 대비 선처리)
//   let savedImageSrcs = [];

//   // ✅ DOM이 준비되면 이미지 src 먼저 저장
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//       const images = document.querySelectorAll('img');
//       savedImageSrcs = Array.from(images).map(img => img.getAttribute('src') || img.getAttribute('data-src') || img.src || img.getAttribute('data-lazy-src') || '');
//     });
//   } else {
//     const images = document.querySelectorAll('img');
//     savedImageSrcs = Array.from(images).map(img => img.getAttribute('src') || img.getAttribute('data-src') || img.src || img.getAttribute('data-lazy-src') || '');
//   }

//   // ✅ iframe 내부이고 JS 차단 설정이 되어 있으면 저장된 이미지 src로 재로드 시도
//   if (isIframe && jsShouldBeDisabled) {
//     const images = document.querySelectorAll('img');
//     images.forEach((img, i) => {
//       const src = savedImageSrcs[i] || '';
//       if (src && typeof src === 'string') {
//         const absSrc = new URL(src, location.href).href;
//         const newImg = new Image();
//         newImg.src = absSrc;
//         newImg.alt = img.alt || '';
//         newImg.style.maxWidth = '100%';
//         newImg.style.display = 'inline-block';
//         img.replaceWith(newImg);
//       }
//     });
//   }

//   // ✅ 드래그/복사 해제 기능이 꺼져 있으면 중단
//   if (!isEnabled) return;

//   const allowTextCopy = () => {
//     const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null, false);
//     while (walker.nextNode()) {
//       const el = walker.currentNode;
//       if (el.innerText && el.innerText.trim().length > 0) {
//         el.style.setProperty('user-select', 'auto', 'important');
//         el.style.setProperty('-webkit-user-select', 'auto', 'important');
//         el.style.setProperty('pointer-events', 'auto', 'important');

//         el.onselectstart = null;
//         el.oncopy = null;
//         el.oncontextmenu = null;
//         el.ondragstart = null;
//         el.onmousedown = null;
//         el.onmouseup = null;
//       }
//     }
//   };

//   const disableJSHandlers = () => {
//     const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null, false);
//     while (walker.nextNode()) {
//       const el = walker.currentNode;
//       el.onclick = null;
//       el.onmousedown = null;
//       el.onmouseup = null;
//       el.oncontextmenu = null;
//       el.ondblclick = null;
//       el.onkeydown = null;
//       el.onkeyup = null;
//     }

//     window.onbeforeunload = null;
//     window.onunload = null;
//     window.onpopstate = null;

//     // ✅ 스크립트 제거 및 차단
//     const removeScripts = () => {
//       const scripts = document.querySelectorAll('script');
//       scripts.forEach(script => script.remove());
//     };

//     removeScripts();

//     const observer = new MutationObserver((mutations) => {
//       for (const m of mutations) {
//         m.addedNodes.forEach(node => {
//           if (node.tagName === 'SCRIPT') {
//             node.remove();
//           }
//         });
//       }
//     });

//     observer.observe(document.documentElement, {
//       childList: true,
//       subtree: true
//     });

//     window.eval = () => { throw new Error("eval is blocked"); };
//     window.Function = () => { throw new Error("Function constructor is blocked"); };

//     const blockExec = (name) => {
//       const original = window[name];
//       window[name] = function (fn, delay, ...args) {
//         if (typeof fn === 'string') {
//           throw new Error(`${name} with string code is blocked`);
//         }
//         return original.call(this, fn, delay, ...args);
//       };
//     };
//     blockExec('setTimeout');
//     blockExec('setInterval');
//   };

//   const run = () => {
//     if (!document.body) return requestAnimationFrame(run);

//     allowTextCopy();
//     if (jsShouldBeDisabled) disableJSHandlers();

//     const observer = new MutationObserver(() => {
//       allowTextCopy();
//       if (jsShouldBeDisabled) disableJSHandlers();
//     });
//     observer.observe(document.body, { childList: true, subtree: true });

//     document.addEventListener('copy', (e) => e.stopPropagation(), true);
//   };

//   run();
// });


//   // ✅ 드래그/복사 해제 기능이 꺼져 있으면 중단
//   if (!isEnabled) return;

//   const allowTextCopy = () => {
//     const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null, false);
//     while (walker.nextNode()) {
//       const el = walker.currentNode;
//       if (el.innerText && el.innerText.trim().length > 0) {
//         el.style.setProperty('user-select', 'auto', 'important');
//         el.style.setProperty('-webkit-user-select', 'auto', 'important');
//         el.style.setProperty('pointer-events', 'auto', 'important');

//         el.onselectstart = null;
//         el.oncopy = null;
//         el.oncontextmenu = null;
//         el.ondragstart = null;
//         el.onmousedown = null;
//         el.onmouseup = null;
//       }
//     }
//   };

//   const disableJSHandlers = () => {
//     const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null, false);
//     while (walker.nextNode()) {
//       const el = walker.currentNode;
//       el.onclick = null;
//       el.onmousedown = null;
//       el.onmouseup = null;
//       el.oncontextmenu = null;
//       el.ondblclick = null;
//       el.onkeydown = null;
//       el.onkeyup = null;
//     }

//     window.onbeforeunload = null;
//     window.onunload = null;
//     window.onpopstate = null;

//     // ✅ 스크립트 제거 및 차단
//     const removeScripts = () => {
//       const scripts = document.querySelectorAll('script');
//       scripts.forEach(script => script.remove());
//     };

//     removeScripts();

//     const observer = new MutationObserver((mutations) => {
//       for (const m of mutations) {
//         m.addedNodes.forEach(node => {
//           if (node.tagName === 'SCRIPT') {
//             node.remove();
//           }
//         });
//       }
//     });

//     observer.observe(document.documentElement, {
//       childList: true,
//       subtree: true
//     });

//     window.eval = () => { throw new Error("eval is blocked"); };
//     window.Function = () => { throw new Error("Function constructor is blocked"); };

//     const blockExec = (name) => {
//       const original = window[name];
//       window[name] = function (fn, delay, ...args) {
//         if (typeof fn === 'string') {
//           throw new Error(`${name} with string code is blocked`);
//         }
//         return original.call(this, fn, delay, ...args);
//       };
//     };
//     blockExec('setTimeout');
//     blockExec('setInterval');
//   };

//   const run = () => {
//     if (!document.body) return requestAnimationFrame(run);

//     allowTextCopy();
//     if (jsShouldBeDisabled) disableJSHandlers();

//     const observer = new MutationObserver(() => {
//       allowTextCopy();
//       if (jsShouldBeDisabled) disableJSHandlers();
//     });
//     observer.observe(document.body, { childList: true, subtree: true });

//     document.addEventListener('copy', (e) => e.stopPropagation(), true);
//   };

//   run();
// });