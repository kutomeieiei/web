//step 1: get DOM
let nextDom = document.getElementById('next');
let prevDom = document.getElementById('prev');
let thumbnails = document.querySelectorAll('.thumbnail .item');

let items = document.querySelectorAll('.slider .list .item');
let carouselDom = document.querySelector('.slider');
let SliderDom = carouselDom.querySelector('.list');
let thumbnailBorderDom = document.querySelector('.slider .thumbnail .items-wrapper');
let thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');
let timeDom = document.querySelector('.slider .time');

// Initialize the thumbnails
thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
// assign persistent data-index attributes so we can match slider items to thumbnails
document.querySelectorAll('.slider .list .item').forEach((el, i) => el.dataset.index = i);
document.querySelectorAll('.thumbnail .item').forEach((el, i) => el.dataset.index = i);
let timeRunning = 3000;
let timeAutoNext = 7000;

let countItem = items.length;
let itemActive = 0;
let isAnimating = false; // Prevent multiple clicks during animation

nextDom.onclick = function(){
    itemActive = itemActive + 1;
    if (itemActive >= countItem) {
        itemActive = 0;
    }
    showSlider('next');    
}

prevDom.onclick = function(){
    itemActive = itemActive - 1;
    if (itemActive < 0) {
        itemActive = countItem - 1;
    }
    showSlider('prev');    
}

function showSlider(type) {
    // Prevent rapid clicking
    if (isAnimating) return;
    isAnimating = true;

    // remove item active old
    let itemActiveOld = document.querySelector('.slider .list .item.active');
    let thumbnailActiveOld = document.querySelector('.thumbnail .item.active');
    if (itemActiveOld) itemActiveOld.classList.remove('active');
    if (thumbnailActiveOld) thumbnailActiveOld.classList.remove('active');

    // active new item (use data-index so order changes don't break mapping)
    const newSliderItem = document.querySelector('.slider .list .item[data-index="' + itemActive + '"]');
    const newThumbItem = document.querySelector('.thumbnail .item[data-index="' + itemActive + '"]');
    if (newSliderItem) newSliderItem.classList.add('active');
    if (newThumbItem) newThumbItem.classList.add('active');

    // refresh node lists
    let SliderItemsDom = SliderDom.querySelectorAll('.item');
    let thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');

    const gap = parseFloat(getComputedStyle(thumbnailBorderDom).gap || getComputedStyle(thumbnailBorderDom).columnGap || 10);
    const itemWidth = thumbnailItemsDom[0] ? thumbnailItemsDom[0].offsetWidth : 150;
    const shift = itemWidth + gap;

    if (type === 'next') {
        // get first item and animate it out (vanish)
        const first = thumbnailBorderDom.querySelector('.item');
        if (first) {
            first.classList.add('sliding-out');
            // first.remove();
        }

        // animate wrapper left by one item width
        thumbnailBorderDom.style.transition = '';
        thumbnailBorderDom.style.transform = 'translateX(0px)';
        // force style flush
        thumbnailBorderDom.getBoundingClientRect();
        // then animate
        thumbnailBorderDom.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        thumbnailBorderDom.style.transform = `translateX(-${shift}px)`;

        // when transition ends, move first child to end and reset transform
        const onEnd = (ev) => {
            if (ev.propertyName !== 'transform') return;
            thumbnailBorderDom.removeEventListener('transitionend', onEnd);

            // move first thumbnail to end
            const firstNow = thumbnailBorderDom.querySelector('.item');
            if (firstNow) {
                // remove sliding-out before moving so it doesn't carry over
                firstNow.classList.remove('sliding-out');
                thumbnailBorderDom.appendChild(firstNow);

                // make it animate in smoothly at the end
                firstNow.classList.add('sliding-in');
                // force reflow then remove class to trigger transition to normal
                firstNow.getBoundingClientRect();
                firstNow.classList.remove('sliding-in');
            }

            // disable transition and reset transform to 0 immediately
            thumbnailBorderDom.style.transition = 'none';
            thumbnailBorderDom.style.transform = 'translateX(0px)';
            // force reflow
            thumbnailBorderDom.getBoundingClientRect();

            // re-enable transition for next interactions
            setTimeout(() => {
                thumbnailBorderDom.style.transition = '';
                isAnimating = false;
            }, 20);

            // also rotate slider main items to keep in sync
            if (SliderItemsDom[0]) SliderDom.appendChild(SliderItemsDom[0]);
        };

        thumbnailBorderDom.addEventListener('transitionend', onEnd);
    } else {
        // PREPEND behavior with vanish: animate rightmost item out, slide wrapper right, then move node to front and animate in
        const all = thumbnailBorderDom.querySelectorAll('.item');
        const lastEl = all[all.length - 1];
        const firstChild = thumbnailBorderDom.firstChild;

        if (lastEl) {
            // vanish the rightmost item
            all[3].classList.add('sliding-out');
        }

        // animate wrapper right by one item width
        thumbnailBorderDom.style.transition = '';
        thumbnailBorderDom.style.transform = 'translateX(0px)';
        // force style flush
        thumbnailBorderDom.getBoundingClientRect();
        // then animate right
        thumbnailBorderDom.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        thumbnailBorderDom.style.transform = `translateX(${shift}px)`;

        const onEndPrev = (ev) => {
            if (ev.propertyName !== 'transform') return;
            thumbnailBorderDom.removeEventListener('transitionend', onEndPrev);

            // move last element to front
            if (lastEl) {
                all[3].classList.remove('sliding-out');
                thumbnailBorderDom.insertBefore(lastEl, firstChild);

                // animate it in smoothly
                lastEl.classList.add('sliding-in');
                lastEl.getBoundingClientRect();
                lastEl.classList.remove('sliding-in');
            }

            // disable transition and reset transform to 0 immediately
            thumbnailBorderDom.style.transition = 'none';
            thumbnailBorderDom.style.transform = 'translateX(0px)';
            // force reflow
            thumbnailBorderDom.getBoundingClientRect();

            // re-enable transition briefly then finish
            setTimeout(() => {
                thumbnailBorderDom.style.transition = '';
                isAnimating = false;
            }, 20);

            // also move slider item at same time (keep main slider in sync)
            if (SliderItemsDom.length) SliderDom.prepend(SliderItemsDom[SliderItemsDom.length - 1]);
        };

        thumbnailBorderDom.addEventListener('transitionend', onEndPrev);
    }
}


(function () {
const btn = document.getElementById('btn');

let originalParent = null;
let originalNextSibling = null;
let originalRect = null; // will hold the button's bounding rect before reparenting

function setExpanded(state) {
    if (state) {
        // preserve original location so we can restore later
        originalParent = btn.parentNode;
        originalNextSibling = btn.nextSibling;
        // record the button's on-screen position so we can animate back to it later
        originalRect = btn.getBoundingClientRect();
        // move to body so fixed positioning is not clipped by ancestors
        document.body.appendChild(btn);

        // Force a layout/read so the browser records the button's position
        // in its original state. Then add the class on the next animation
        // frame so the transition from original -> expanded can animate.
        btn.getBoundingClientRect();
        requestAnimationFrame(() => {
            // Before adding expanded we ensure the ready flag is cleared
            btn.classList.remove('expanded-ready');
            btn.classList.add('expanded');
            btn.setAttribute('aria-pressed', 'true');
        });

        // once the CSS transition for transform/opacity ends, mark expanded-ready
        const onExpandEnd = (ev) => {
            // only respond to transform or opacity transitions (ignore others)
            if (ev.propertyName !== 'transform' && ev.propertyName !== 'opacity') return;
            btn.classList.add('expanded-ready');
            btn.removeEventListener('transitionend', onExpandEnd);
        };
        btn.addEventListener('transitionend', onExpandEnd);
    } else {
        // For the new behavior: shrink/fade the expanded visual until it vanishes,
        // then restore the original button in its initial place.
        btn.setAttribute('aria-pressed', 'false');

        // defensive fallback: if we don't have originalParent, just remove expanded
        if (!originalParent) {
            btn.classList.remove('expanded');
            return;
        }

        // create a visual clone centered on viewport (starts as the expanded appearance)
        const clone = btn.cloneNode(true);
        btn.style.visibility = 'hidden'; // hide the original while clone animates

        clone.style.position = 'fixed';
        clone.style.left = '50%';
        clone.style.top = '50%';
        clone.style.transform = 'translate(-50%, -50%)';
        clone.style.zIndex = 9999;
        clone.style.pointerEvents = 'none';
        // ensure clone has expanded look
        if (!clone.classList.contains('expanded')) clone.classList.add('expanded');
        document.body.appendChild(clone);
        // flush styles
        clone.getBoundingClientRect();

        // get duration from CSS var
        let rootDur = getComputedStyle(document.documentElement).getPropertyValue('--dur') || '420ms';
        let ms = parseFloat(rootDur);
        if (isNaN(ms)) ms = 420;

        // animate clone to shrink + fade out
        clone.style.transition = `transform ${ms}ms cubic-bezier(.2,.9,.2,1), opacity ${ms}ms ease`;
        // compute starting scale to match expanded visual
        let scaleVal = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--expanded-scale')) || 3.5;
        clone.style.transform = `translate(-50%, -50%) scale(${scaleVal})`;
        clone.style.opacity = '1';
        // flush then animate to vanish
        clone.getBoundingClientRect();
        requestAnimationFrame(() => {
            clone.style.transform = `translate(-50%, -50%) scale(0)`;
            clone.style.opacity = '0';
        });

        // after animation, remove clone and put the real button back (non-expanded)
        setTimeout(() => {
            clone.remove();
            if (originalParent) {
                if (originalNextSibling) originalParent.insertBefore(btn, originalNextSibling);
                else originalParent.appendChild(btn);
            }
            btn.style.visibility = '';
            btn.classList.remove('expanded');
            // ensure expanded-ready flag is removed immediately on collapse
            btn.classList.remove('expanded-ready');
        }, ms + 40);
    }
}

// toggle on click (stop propagation so document click doesn't immediately close)
btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setExpanded(!btn.classList.contains('expanded'));
});

// --- Chat UI toggle (interface only) ---
const chatToggle = document.getElementById('chat-toggle');
const chatModal = document.getElementById('chat-modal');
const chatClose = document.getElementById('chat-close');
const chatForm = document.getElementById('chat-form');
const chatText = document.getElementById('chat-text');

function openChat() {
    if (!chatModal) return;
    chatModal.classList.add('open');
    chatModal.setAttribute('aria-hidden', 'false');
    chatToggle.setAttribute('aria-expanded', 'true');
    // focus the input after opening
    setTimeout(() => chatText && chatText.focus(), 120);
}

function closeChat() {
    if (!chatModal) return;
    chatModal.classList.remove('open');
    chatModal.setAttribute('aria-hidden', 'true');
    chatToggle.setAttribute('aria-expanded', 'false');
}

if (chatToggle) {
    chatToggle.addEventListener('click', (e) => { e.stopPropagation(); openChat(); });
    chatToggle.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChat(); } });
}
if (chatClose) chatClose.addEventListener('click', closeChat);
// close when clicking outside panel
if (chatModal) chatModal.addEventListener('click', (e) => { if (e.target === chatModal) closeChat(); });

if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = chatText.value.trim();
        if (!val) return;
        // interface-only: append a message bubble locally
        const messages = document.getElementById('chat-messages');
        const el = document.createElement('div');
        el.className = 'chat-msg user';
        el.textContent = val;
        messages.appendChild(el);
        chatText.value = '';
        messages.scrollTop = messages.scrollHeight;
    });
}

// keyboard accessibility (Space/Enter)
btn.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault(); // avoid scrolling on Space
        e.stopPropagation();
        setExpanded(!btn.classList.contains('expanded'));
    }
});

// optional: close when user clicks outside the expanded button
document.addEventListener('click', (e) => {
    if (!btn.classList.contains('expanded')) return;
    if (!btn.contains(e.target)) setExpanded(false);
});

// initialize
setExpanded(false);
})();

// Chat functionality
document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chat-toggle');
    const chatModal = document.getElementById('chat-modal');
    const chatClose = document.getElementById('chat-close');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-text');
    const chatMessages = document.getElementById('chat-messages');

    if (chatToggle) {
        chatToggle.addEventListener('click', () => {
            console.log('Chat toggle clicked');
            chatModal.classList.add('open');
            chatInput.focus();
        });
    }

    if (chatClose) {
        chatClose.addEventListener('click', () => {
            chatModal.classList.remove('open');
        });
    }

    // Close when clicking outside the chat panel
    if (chatModal) {
        chatModal.addEventListener('click', (e) => {
            if (e.target === chatModal) {
                chatModal.classList.remove('open');
            }
        });
    }

    // Handle chat form submission
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;
            
            // Add user message
            addMessage('user', message);
            chatInput.value = '';
            
            // Simulate bot response
            setTimeout(() => {
                addMessage('bot', 'Thanks for your message! This is a demo response.');
            }, 1000);
        });
    }

    // Function to add messages to the chat
    function addMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}-message`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Clear placeholder if it exists
        const placeholder = chatMessages.querySelector('.chat-empty');
        if (placeholder) {
            placeholder.remove();
        }
    }
});

