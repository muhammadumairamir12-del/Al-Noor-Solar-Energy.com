
        // Mobile Accordion Toggle function
        window.toggleMobileSubmenu = function(event, accordionId) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            const acc = document.getElementById(accordionId);
            if (!acc) return;
            const wasOpen = acc.classList.contains('open');
            document.querySelectorAll('.mnp-accordion').forEach(a => a.classList.remove('open'));
            if (!wasOpen) {
                acc.classList.add('open');
            }
        };

        // Listen for admin changes in another tab and update products live
        window.addEventListener('storage', () => {
            refreshProductList();
            const currentHash = window.location.hash.substring(1) || 'home';
            renderPageFromHash(currentHash);
            updateCartUI();
        });

/* ── Particles ── */
(function(){
  const s=document.querySelector('.special-offer-section');
  if(!s)return;
  for(let i=0;i<18;i++){
    const p=document.createElement('div');
    p.className='particle';
    const sz=Math.random()*5+2;
    p.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;`+
      `animation-duration:${Math.random()*12+8}s;animation-delay:${Math.random()*8}s;opacity:0`;
    s.appendChild(p);
  }
})();

/* ── Promo Slider ── */
(function(){
  const IV=3000;
  const slides=document.querySelectorAll('#promoSlider .promo-slide');
  const dots=document.querySelectorAll('#promoDots .promo-dot');
  const bar=document.getElementById('promoProgress');
  if(!slides.length) return;
  let cur=0,tmr;
  function go(i){
    slides[cur].classList.remove('active');dots[cur].classList.remove('active');
    cur=(i+slides.length)%slides.length;
    slides[cur].classList.add('active');dots[cur].classList.add('active');
    if(bar){bar.style.transition='none';bar.style.width='0%';
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        bar.style.transition=`width ${IV}ms linear`;bar.style.width='100%';}));}
  }
  function run(){clearInterval(tmr);tmr=setInterval(()=>go(cur+1),IV);}
  dots.forEach(d=>d.addEventListener('click',e=>{e.preventDefault();go(+d.dataset.idx);run();}));
  go(0);run();
})();

/* ── 3-Card Rotating Carousels ──
   Auto-advances every 4s. Arrow + dot manual control also works.
── */
var _cc = {};

function ccInit(id) {
  var track  = document.getElementById('ct-' + id);
  var dotsEl = document.getElementById('cd-' + id);
  if (!track) return;
  var slides = track.querySelectorAll('.cards-slide');
  var dots   = dotsEl ? dotsEl.querySelectorAll('.cc-dot') : [];
  var cur = 0, total = slides.length, tmr;

  function go(i) {
    cur = (i + total) % total;
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    dots.forEach(function(d, idx){ d.classList.toggle('active', idx === cur); });
  }
  function run(){ clearInterval(tmr); tmr = setInterval(function(){ go(cur+1); }, 4000); }

  if (dots.length) {
    dots.forEach(function(d, idx){
      d.addEventListener('click', function(){ go(idx); run(); });
    });
  }

  _cc[id] = { go: go, run: run, cur: function(){ return cur; } };
  go(0); run();
}

function ccPrev(id){ if(_cc[id]){ _cc[id].go(_cc[id].cur()-1); _cc[id].run(); } }
function ccNext(id){ if(_cc[id]){ _cc[id].go(_cc[id].cur()+1); _cc[id].run(); } }

// Init all carousels
['panels','inverters','batteries','vfd'].forEach(ccInit);

/* ══════════════════════════════════════════════
   NAV-LINK HANDLER — Works with any SPA router
   Problem yeh tha: SPA ka router #hash change pe
   page render karta hai, lekin browser default
   behavior DOM scroll ya reload kar deta tha.
   Yeh handler:
   1. Default browser action rokta hai
   2. SPA ke known routers ko try karta hai
   3. Fallback: hashchange event dispatch karta hai
   4. popstate bhi fire karta hai taake Vue/React
      router bhi catch kar sake
══════════════════════════════════════════════ */
(function() {
  function handleNavClick(e) {
    var el = e.target;
    
    // YEH 3 LINES ADD KI HAIN: Agar button par click hua hai, toh link ko rok do aur button apna kaam karega
    if (el.tagName === 'BUTTON' || el.closest('button')) {
        return; 
    }

    // Find the closest anchor with nav-link class
    while (el && el !== document) {
      if (el.tagName === 'A' && el.classList.contains('nav-link')) break;
      el = el.parentElement;
    }
    if (!el || el === document) return;

    // Desktop dropdown parent links only open the menu (handled in addGlobalEventListeners)
    if (el.classList.contains('dropdown-toggle')) return;

    var href = el.getAttribute('href') || '';
    if (!href || !href.startsWith('#')) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    var route = href.slice(1); // e.g. "solar-panels" or "solar-panels?type=new"

    // ── Try all known SPA router patterns ──
    if (typeof navigateTo === 'function') {
      try { navigateTo(route); return; } catch(err){}
    }
    if (typeof handleNavLink === 'function') {
      try { handleNavLink(route); return; } catch(err){}
    }
    if (typeof navigate === 'function') {
      try { navigate(route); return; } catch(err){}
    }
    if (typeof app !== 'undefined' && typeof app.navigate === 'function') {
      try { app.navigate(route); return; } catch(err){}
    }
    if (typeof router !== 'undefined' && typeof router.push === 'function') {
      try { router.push('/' + route); return; } catch(err){}
    }
    if (typeof router !== 'undefined' && typeof router.navigate === 'function') {
      try { router.navigate(route); return; } catch(err){}
    }

    // ── Fallback: update hash + fire events ──
    // This triggers hashchange which most SPA routers listen to
    var oldHash = window.location.hash;
    var newHash = '#' + route;

    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    } else {
      // Same hash — force re-trigger
      window.location.hash = '';
      setTimeout(function(){ window.location.hash = newHash; }, 10);
    }
  }

  // Use capture:true so we intercept before any SPA handlers
  document.addEventListener('click', handleNavClick, true);
})();
/* ══════════════════════════════════════════════
   EXIT POPUP — Sirf browser Back button pe
   "Stay"  = popup band, user page pe rehta hai
   "Exit"  = actually page se nikalta hai
══════════════════════════════════════════════ */
(function(){
  if (!window.history || !window.history.pushState) return;

  // Push sentinel entry
  history.pushState({_alNoor:true}, '', window.location.href);

  window.addEventListener('popstate', function(e) {
    // Ignore if it's our own SPA navigation popping
    if (e.state && e.state._alNoor === false) return;

    var popup = document.getElementById('exitPopup');
    if (!popup) return;

    // Show popup
    popup.classList.add('show');

    // Re-push so user stays on current page while deciding
    history.pushState({_alNoor:true}, '', window.location.href);
  });
})();
function closeExitPopup() {
  var popup = document.getElementById('exitPopup');
  if (popup) popup.classList.remove('show');
}

function showExitPopup() {
  var popup = document.getElementById('exitPopup');
  if (popup) popup.classList.add('show');
}

function doExit() {
  var popup = document.getElementById('exitPopup');
  if (popup) popup.classList.remove('show');
  history.go(-2);
}




        // ====================================================================================================
        // GLOBAL DATA & UTILITIES
        // ====================================================================================================

        // Base URL for placeholder images
        const PLACEHOLDER_IMG_BASE = 'https://via.placeholder.com/';
        const HERO_IMAGES = [
            PLACEHOLDER_IMG_BASE + '1200x450/007bff/e7f4ff?text=Solar+Energy+Solution+1',
            PLACEHOLDER_IMG_BASE + '1200x450/0056b3/e7f4ff?text=Efficiency+and+Sustainability',
            PLACEHOLDER_IMG_BASE + '1200x450/007bff/e7f4ff?text=Power+Your+Future'
        ];
        const SPECIAL_OFFER_IMAGES = [
            PLACEHOLDER_IMG_BASE + '400x400/007bff/e7f4ff?text=Local+Inverter+Offer+1',
            PLACEHOLDER_IMG_BASE + '400x400/0056b3/e7f4ff?text=Local+Inverter+Offer+2',
            PLACEHOLDER_IMG_BASE + '400x400/007bff/e7f4ff?text=Local+Inverter+Offer+3'
        ];
        // Firebase Configuration (Aapki API keys)
        const firebaseConfig = {
            apiKey: "AIzaSyCsvVPVJNYL2946DqJHP3Aj3ag4GXZv2LE",
            authDomain: "alnoor-solar-c7326.firebaseapp.com",
            databaseURL: "https://alnoor-solar-c7326-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "alnoor-solar-c7326",
            storageBucket: "alnoor-solar-c7326.firebasestorage.app",
            messagingSenderId: "347399543862",
            appId: "1:347399543862:web:7337ea33fdf860879c4c97",
            measurementId: "G-EYG2H2E5X6"
        };

        // Initialize Firebase Realtime Database (safe — site still opens if Firebase CDN is blocked)
        let db = null;
        try {
            if (typeof firebase !== 'undefined') {
                firebase.initializeApp(firebaseConfig);
                db = firebase.database();
            } else {
                console.warn('Firebase SDK not loaded — products will load when connection is available.');
            }
        } catch (err) {
            console.error('Firebase initialization failed:', err);
        }

        // Catalog comes ONLY from Firebase — no mock/default/localStorage product fallbacks.
        let catalogStatus = 'loading'; // loading | ready | error
        let catalogErrorMessage = '';

        function normalizeStoreProduct(id, data) {
            data = data || {};
            const price = Number(data.price);
            const oldPrice = data.oldPrice === null || data.oldPrice === undefined || data.oldPrice === ''
                ? null
                : Number(data.oldPrice);
            const images = Array.isArray(data.images) && data.images.length
                ? data.images.filter(Boolean)
                : (data.image || data.imageUrl ? [data.image || data.imageUrl] : []);
            let availability = data.availability || 'In stock';
            if (data.stockQty === 0) availability = 'Out of stock';
            return {
                id: id || data.id,
                name: data.name || 'Unnamed Product',
                vendor: data.vendor || data.brand || 'Generic',
                price: Number.isFinite(price) ? price : 0,
                oldPrice: Number.isFinite(oldPrice) ? oldPrice : null,
                category: String(data.category || 'Other Accessories').trim(),
                type: data.type || '',
                image: images[0] || data.image || data.imageUrl || 'logo.png',
                images,
                description: data.description || 'Premium quality product.',
                availability,
                datasheetUrl: data.datasheetUrl || '',
                longDescription: data.longDescription || '',
                sku: data.sku || '',
                warranty: data.warranty || '',
                offerTag: data.offerTag || '',
                stockQty: (data.stockQty === 0 || data.stockQty) ? Number(data.stockQty) : null,
                isNew: !!data.isNew,
                isBestSeller: !!data.isBestSeller
            };
        }

        function emptyProductsMessage(title, detail) {
            return `
                <div class="catalog-empty" style="text-align:center;padding:40px 16px;color:var(--secondary-text-color);grid-column:1/-1;">
                    <i class="fas fa-box-open" style="font-size:36px;color:#ccd6e0;display:block;margin-bottom:12px;"></i>
                    <h3 style="color:var(--dark-blue);margin:0 0 8px;font-size:1.1rem;">${title}</h3>
                    <p style="margin:0;font-size:0.92rem;line-height:1.5;">${detail}</p>
                </div>
            `;
        }

        // Apply Firebase products only (empty array = empty storefront)
        function refreshProductList(firebaseProducts = []) {
            const map = new Map();
            (firebaseProducts || []).forEach(p => {
                const normalized = normalizeStoreProduct(p.id, p);
                if (normalized.id) map.set(normalized.id, normalized);
            });
            products = Array.from(map.values());
        }

        // Homepage special-offer section only (not part of the Firebase catalog)
        const specialOfferBase = {
            id: 'so_base', name: 'AL Noor Local Dasi Solar Inverter', vendor: '@AlNoor solar energy',
            price_10kw: 40000, oldPrice_10kw: 50000, price_7kw: 35000, oldPrice_7kw: 45000,
            category: 'Solar Inverters', type: 'Hybrid', image: 'https://kamalsolar.pk/cdn/shop/files/6KW_1066x.png?v=1753256037',
            description: 'Pakistan\'s No. 1 Pure Sine wave and Modified Sine wave Local Solar Inverter.',
            capacity: ['10KW', '7KW'], availability: 'In stock'
        };

        let products = [];

        // Cart state
        let cart = JSON.parse(localStorage.getItem('alnoorCart')) || [];
        const SHIPPING_COST = 1500; // Fixed shipping cost
        let selectedDeliveryMethod = localStorage.getItem('alnoorDeliveryMethod') || 'pickup';

        // Current page tracker for popstate
        let currentPage = 'home';
        let detailPageProductId = null; // Track current product on detail page

        // Utility functions
        function formatPrice(price) {
            return `Rs.${price.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }

        function getProductById(id) {
            // Homepage special-offer variants (static promo, not Firebase catalog)
            if (id === 'so1') return { ...specialOfferBase, id: 'so1', name: 'Al Noor Local Dasi Solar Inverter 10KW', price: specialOfferBase.price_10kw, oldPrice: specialOfferBase.oldPrice_10kw };
            if (id === 'so2') return { ...specialOfferBase, id: 'so2', name: 'Al Noor Local Dasi Solar Inverter 7KW', price: specialOfferBase.price_7kw, oldPrice: specialOfferBase.oldPrice_7kw };
            if (id === 'so_base') return specialOfferBase;
            return products.find(p => p.id === id);
        }

        function getProductsByCategory(categoryName) {
            return products.filter(p => p.category === categoryName);
        }

        // Helper to show toast messages
        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // ====================================================================================================
        // NAVIGATION & ROUTING
        // ====================================================================================================

        const appContent = document.getElementById('app-content');
        const miniCartSidebar = document.getElementById('miniCartSidebar');
        const overlay = document.getElementById('overlay');
        const cartCountSpan = document.querySelector('.cart-count');
        const desktopSearchInput = document.getElementById('desktopSearchInput');
        const mobileSearchInput = document.getElementById('searchInput');
        const searchWrap = document.getElementById('searchWrap');
        const exitPopup = document.getElementById('exitPopup');
        const bnavItems = document.querySelectorAll('.bnav-item');

        // Render functions for different pages
        const pageRenderers = {
            'home': renderHome,
            'products': renderAllProducts,
            'services': renderServicesPage,
            'about': renderAboutPage,
            'about-us': renderAboutPage,
            'contact': () => renderInfoPage('Contact Information', `
                <p>Have questions or need assistance? Our team is here to help!</p>
                <p><strong>Address:</strong> 155 A , Opposite Bank Alfalah Model Town Chowk Multan , Pakistan</p>
                <p><strong>Phone:</strong> <a href="tel:03006771013">03006771013</a> / <a href="tel:03026255188">03026255188</a></p>
                <p><strong>Email:</strong> <a href="mailto:alnoorse786@gmail.com">alnoorse786@gmail.com</a></p>
                <p><strong>Business Hours:</strong> Saturday - Thursday: 09:00 AM to 07:00 PM (Friday OFF)</p>
            `),
            'contact-us': () => renderInfoPage('Contact Information', `
                <p>Have questions or need assistance? Our team is here to help!</p>
                <p><strong>Address:</strong> 155 A , Opposite Bank Alfalah Model Town Chowk Multan , Pakistan</p>
                <p><strong>Phone:</strong> <a href="tel:03006771013">03006771013</a> / <a href="tel:03026255188">03026255188</a></p>
                <p><strong>Email:</strong> <a href="mailto:alnoorse786@gmail.com">alnoorse786@gmail.com</a></p>
                <p><strong>Business Hours:</strong> Saturday - Thursday: 09:00 AM to 07:00 PM (Friday OFF)</p>
            `),
            'solar-inverters': (params) => renderCategoryPage('Solar Inverters', params),
            'lithium-batteries': (params) => renderCategoryPage('Lithium Batteries', params),
            'vfd-inverters': (params) => renderCategoryPage('VFD Inverters', params),
            'other-accessories': (params) => renderCategoryPage('Other Accessories', params),
            'solar-panels': (params) => renderCategoryPage('Solar Panels', params),
            'module-authenticity': renderModuleAuthenticity,
            'cart': renderCartPage,
            'checkout': renderCheckoutPage,
            'product': renderProductDetail,
            'search': renderSearchPage,
            'about-us': () => renderInfoPage('About Us', `
                <p>Welcome to AL Noor Solar Energy, yo trusted partner for sustainable power solutions in Pakistan. We are committed to providing high-quality solar products and services to empower homes and businesses with clean, renewable energy.</p>
                <p>At AL Noor Solar Energy (operated by Al Noor Solar House), we believe in a greener future. Our extensive range of solar inverters, lithium batteries, solar panels, and accessories are sourced from leading global brands and backed by official warranties. With a focus on affordability and reliability, we strive to make solar energy accessible to everyone.</p>
                <p>Our team of experts is dedicated to delivering excellence in every aspect, from product selection to customer support. Join us in illuminating Pakistan with the power of the sun!</p>
            `),
            'contact-us': () => renderInfoPage('Contact Information', `
                <p>Have questions or need assistance? Our team is here to help!</p>
                <p><strong>Address:</strong>  MA Jinah road near Hascol Pump Multan , Pakistan</p>
                <p><strong>Phone:</strong> <a href="tel:03006771013">03006771013</a></p>
                <p><strong>Email:</strong> <a href="mailto:Al Noorgroup.pk@gmail.com">Al Noorgroup.pk@gmail.com</a></p>
                <p><strong>Business Hours:</strong> Saturday - Thursday: 09:00 AM to 07:00 PM (Friday OFF)</p>
                <p>Feel free to reach out to us through phone, email, or visit our office during business hours. We look forward to serving you!</p>
            `),
            'privacy-policy': () => renderInfoPage('Privacy Policy', `
                <h2>Privacy Policy for AL Noor Solar Energy</h2>
                <p>Your privacy is important to us. This Privacy Policy explains how AL Noor Solar Energy collects, uses, and discloses information about you.</p>
                <h3>Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include your name, email address, phone number, shipping address, and payment information.</p>
                <h3>How We Use Your Information</h3>
                <p>We use the information we collect to process your orders, provide customer support, improve our services, and send you marketing communications if you have opted in.</p>
                <h3>Sharing Your Information</h3>
                <p>We do not share your personal information with third parties except as necessary to fulfill your order (e.g., shipping carriers) or as required by law.</p>
                <h3>Security</h3>
                <p>We take reasonable measures to protect your information from unauthorized access, use, or disclosure.</p>
                <p>By using our website, you agree to the collection and use of information in accordance with this policy.</p>
            `),
            'refund-policy': () => renderInfoPage('Refund and Replacement Policy', `
                <h2>Refund and Replacement Policy</h2>
                <p>At AL Noor Solar Energy, we strive for your complete satisfaction. If you are not entirely happy with your purchase, we're here to help.</p>
                <h3>Returns & Refunds</h3>
                <p>You have 15 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging. Your item needs to have the receipt or proof of purchase.</p>
                <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item. If your return is approved, we will initiate a refund to your original method of payment. You will receive the credit within a certain amount of days, depending on your card issuer's policies.</p>
                <h3>Replacements</h3>
                <p>If an item is defective or damaged upon arrival, please contact us immediately to arrange for a replacement. We may require photographic evidence of the damage.</p>
                <h3>Shipping Costs</h3>
                <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
                <p>For more details, please contact our customer service.</p>
            `),
            'terms-of-service': () => renderInfoPage('Terms of Service', `
                <h2>Terms of Service</h2>
                <p>Welcome to AL Noor Solar Energy. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our website, you agree to be bound by these Terms.</p>
                <h3>Use of Our Website</h3>
                <p>You may use our website for lawful purposes only. You agree not to use our website for any illegal or unauthorized purpose.</p>
                <h3>Product Information</h3>
                <p>We strive to provide accurate product descriptions and pricing information. However, we do not guarantee that all information is error-free. We reserve the right to correct any errors and to change product information or pricing at any time without prior notice.</p>
                <h3>Orders and Payments</h3>
                <p>All orders placed through our website are subject to acceptance by us. We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase, inaccuracies in product or pricing information, or problems identified by our credit and fraud avoidance department.</p>
                <p>Payment for all products must be by credit card, debit card, or other payment methods specified on the website. You agree to pay all charges incurred by you or on your behalf through the website, at the prices in effect when such charges are incurred.</p>
                <h3>Intellectual Property</h3>
                <p>All content on this website, including text, graphics, logos, images, and software, is the property of AL Noor Solar Energy or its content suppliers and is protected by international copyright laws.</p>
                <h3>Limitation of Liability</h3>
                <p>AL Noor Solar Energy shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your use of, or inability to use, our website or services.</p>
                <h3>Changes to Terms</h3>
                <p>We reserve the right to modify these Terms at any time. Your continued use of the website after any such changes constitutes your acceptance of the new Terms.</p>
                <p>If you have any questions about these Terms, please contact us.</p>
            `),
            'warranty-policy': () => renderInfoPage('Warranty Policy', `
                <h2>Warranty Policy</h2>
                <p>All products sold by AL Noor Solar Energy (Al Noor Solar House) come with the official manufacturer's warranty. The specific warranty period and terms vary by product and manufacturer.</p>
                <h3>Manufacturer's Warranty</h3>
                <p>Each product listed on our website includes details about its warranty, if applicable. Please refer to the product description or the manufacturer's documentation for precise warranty information.</p>
                <h3>Claim Process</h3>
                <p>In the event of a warranty claim, please contact our customer service team. We will guide you through the process, which typically involves:</p>
                <ol>
                    <li>Providing proof of purchase (invoice or receipt).</li>
                    <li>Describing the issue with the product.</li>
                    <li>Following manufacturer-specific troubleshooting steps.</li>
                    <li>If necessary, arranging for the product to be inspected or returned to the manufacturer/service center.</li>
                </ol>
                <h3>Exclusions</h3>
                <p>Warranties typically do not cover damage caused by:</p>
                <ul>
                    <li>Improper installation or misuse.</li>
                    <li>Accidental damage or neglect.</li>
                    <li>Natural disasters or power surges.</li>
                    <li>Unauthorized repairs or modifications.</li>
                </ul>
                <p>Our team is here to assist you with all warranty-related inquiries and ensure you receive the support you need from the manufacturers.</p>
            `),
            'account': () => {
    const page = document.getElementById('page-account');
    if (!page) return;
    page.innerHTML = `
    

    <div class="acc-wrap">

        <!-- HERO -->
        <div class="acc-hero">
            <img class="acc-logo"
                src="logo.png"
                alt="AL Noor Solar Energy"
                onerror="this.style.display='none'">
            <h1>AL Noor Solar Energy</h1>
            <p>South Punjab's Most Trusted Solar Company</p>
            <span class="acc-badge">✦ Official Authorized Dealer · Multan</span>
        </div>

        <!-- STATS -->
        <div class="acc-section-title">Our Achievements</div>
        <div class="acc-stats">
            <div class="acc-stat" style="background:linear-gradient(135deg,#1565c0,#0a2040);color:white;">
                <div class="num">500+</div><div class="lbl">Happy Clients</div>
            </div>
            <div class="acc-stat" style="background:linear-gradient(135deg,#28a745,#1e7e34);color:white;">
                <div class="num">7+</div><div class="lbl">Years Experience</div>
            </div>
            <div class="acc-stat" style="background:linear-gradient(135deg,#ff6b35,#dc3545);color:white;">
                <div class="num">100%</div><div class="lbl">Genuine Products</div>
            </div>
            <div class="acc-stat" style="background:linear-gradient(135deg,#ffd740,#f59e0b);color:#333;">
                <div class="num">4</div><div class="lbl">Office Branches</div>
            </div>
        </div>

        <!-- FACILITIES -->
        <div class="acc-section-title">What We Offer</div>
        <div class="acc-facilities">
            <div class="acc-fac">
                <div class="acc-fac-icon" style="background:#e7f4ff;">⚡</div>
                <div>
                    <h4>Solar Inverters</h4>
                    <p>Hybrid, On-Grid & Off-Grid. Knox, Goodwe, Solis, Huawei and more.</p>
                </div>
            </div>
            <div class="acc-fac">
                <div class="acc-fac-icon" style="background:#fff8e1;">☀️</div>
                <div>
                    <h4>Solar Panels</h4>
                    <p>Tier-1 N-Type & Bifacial panels from Jinko, Longi, Canadian Solar.</p>
                </div>
            </div>
            <div class="acc-fac">
                <div class="acc-fac-icon" style="background:#f0fff4;">🔋</div>
                <div>
                    <h4>Lithium Batteries</h4>
                    <p>Deep cycle LFP batteries. BYD, Pylontech, CATL, Huawei LUNA.</p>
                </div>
            </div>
            <div class="acc-fac">
                <div class="acc-fac-icon" style="background:#fdf4ff;">🔧</div>
                <div>
                    <h4>VFD Solutions</h4>
                    <p>Variable Frequency Drives for motors & agricultural pump systems.</p>
                </div>
            </div>
            <div class="acc-fac">
                <div class="acc-fac-icon" style="background:#fff0f0;">🛠️</div>
                <div>
                    <h4>Installation Service</h4>
                    <p>Professional installation by certified engineers. Residential & commercial.</p>
                </div>
            </div>
            <div class="acc-fac">
                <div class="acc-fac-icon" style="background:#e8f5e9;">📋</div>
                <div>
                    <h4>Net Metering</h4>
                    <p>Complete NEPRA net metering approval process handled by our team.</p>
                </div>
            </div>
            <div class="acc-fac">
                <div class="acc-fac-icon" style="background:#e3f2fd;">🛡️</div>
                <div>
                    <h4>Official Warranty</h4>
                    <p>Every product comes with manufacturer's official warranty card.</p>
                </div>
            </div>
            <div class="acc-fac">
                <div class="acc-fac-icon" style="background:#fce4ec;">💰</div>
                <div>
                    <h4>Best Price</h4>
                    <p>Direct wholesale rates. Price match guarantee against any local dealer.</p>
                </div>
            </div>
        </div>

        <!-- CONTACT -->
        <div class="acc-section-title">Get In Touch</div>
        <div class="acc-contact">
            <a href="tel:03006771013" class="acc-btn" style="background:linear-gradient(135deg,#1565c0,#0a2040);" aria-label="Call Now">
                <div class="acc-btn-icon">📞</div>
                <div class="acc-btn-text"><div class="t1">0300-6771013</div><div class="t2">Call Now — Always Available</div></div>
                <div class="acc-btn-arr">→</div>
            </a>
            <a href="https://wa.me/923006771013?text=Hello!%20I%20visited%20AL%20Noor%20Solar%20Energy%20website%20and%20need%20assistance." target="_blank" rel="noopener" class="acc-btn" style="background:linear-gradient(135deg,#25D366,#128C7E);" aria-label="WhatsApp Us">
                <div class="acc-btn-icon">💬</div>
                <div class="acc-btn-text"><div class="t1">WhatsApp Us</div><div class="t2">Fast reply — usually within minutes</div></div>
                <div class="acc-btn-arr">→</div>
            </a>
            <a href="https://web.facebook.com/Solarinmultan" target="_blank" rel="noopener" class="acc-btn" style="background:linear-gradient(135deg,#1877f2,#0d5dbf);" aria-label="Facebook Page">
                <div class="acc-btn-icon">👍</div>
                <div class="acc-btn-text"><div class="t1">Facebook Page</div><div class="t2">Follow for latest updates & offers</div></div>
                <div class="acc-btn-arr">→</div>
            </a>
            <a href="mailto:alnoorse786@gmail.com" class="acc-btn" style="background:linear-gradient(135deg,#ea4335,#c5221f);" aria-label="Email Us">
                <div class="acc-btn-icon">✉️</div>
                <div class="acc-btn-text"><div class="t1">Email Us</div><div class="t2">alnoorse786@gmail.com</div></div>
                <div class="acc-btn-arr">→</div>
            </a>
        </div>
        <!-- TERMS & CONDITIONS -->
        <div class="acc-section-title" style="animation: fadeIn 0.6s ease backwards; animation-delay: 0.2s;">Terms & Conditions</div>
        <div class="acc-terms" style="animation: fadeInUp 0.6s ease backwards; animation-delay: 0.3s;">
            <h3>📄 AL Noor Solar Energy — Customer Agreement</h3>
            <ul class="acc-terms-list">
                <li>
                    <span class="ti">1</span>
                    <span><strong>Product Authenticity:</strong> All products sold are 100% genuine and sourced directly from authorized manufacturers or official distributors. Counterfeit products are strictly not dealt with.</span>
                </li>
                <li>
                    <span class="ti">2</span>
                    <span><strong>Warranty Policy:</strong> Every product carries the official manufacturer's warranty. Warranty claims are processed directly through the manufacturer's service center. AL Noor Solar Energy assists customers throughout the claim process.</span>
                </li>
                <li>
                    <span class="ti">3</span>
                    <span><strong>Payment Terms:</strong> Full advance payment is required for all solar products before dispatch or installation. Bank transfer or cash payment is accepted. COD may be available on a case-by-case basis.</span>
                </li>
                <li>
                    <span class="ti">4</span>
                    <span><strong>Delivery & Shipping:</strong> Standard delivery charges apply (Rs. 1,500). Delivery timelines vary by location. Large or fragile items may require special handling at additional cost.</span>
                </li>
                <li>
                    <span class="ti">5</span>
                    <span><strong>Returns & Refunds:</strong> Returns accepted within 15 days of delivery if the product is unused, in original packaging, and accompanied by proof of purchase. Refunds are processed within 7 business days after inspection.</span>
                </li>
                <li>
                    <span class="ti">6</span>
                    <span><strong>Installation Liability:</strong> AL Noor Solar Energy is not responsible for damage caused by improper installation carried out by third parties. Our certified engineers must perform the installation to maintain warranty validity.</span>
                </li>
                <li>
                    <span class="ti">7</span>
                    <span><strong>Price Validity:</strong> Prices listed are subject to change without prior notice due to market fluctuations. The confirmed order price is locked at the time of payment.</span>
                </li>
                <li>
                    <span class="ti">8</span>
                    <span><strong>Data Privacy:</strong> Customer information (name, phone, address) is collected solely for order processing and is never shared with third parties for marketing purposes.</span>
                </li>
                <li>
                    <span class="ti">9</span>
                    <span><strong>Dispute Resolution:</strong> Any disputes shall be resolved amicably. In case of unresolved issues, matters will be referred to the competent courts of Multan, Pakistan.</span>
                </li>
                <li>
                    <span class="ti">10</span>
                    <span><strong>Governing Law:</strong> These terms are governed by the laws of the Islamic Republic of Pakistan. By placing an order, the customer agrees to abide by all applicable laws and these terms.</span>
                </li>
            </ul>
        </div>

        <!-- CUSTOMER AGREEMENT -->
        <div class="acc-agree" style="animation: fadeInUp 0.6s ease backwards; animation-delay: 0.4s;">
            <p>By using AL Noor Solar Energy's website and placing an order, you confirm that you have read, understood, and agreed to all the Terms & Conditions stated above. This agreement is binding upon both parties.</p>
            <label for="accAgreeCheck">
                <input type="checkbox" id="accAgreeCheck" aria-label="Agree to terms and conditions" onchange="
                    document.getElementById('accAgreeBtn').style.opacity = this.checked ? '1' : '0.5';
                    document.getElementById('accAgreeBtn').disabled = !this.checked;
                ">
                <span>I have read and agree to the Terms & Conditions of AL Noor Solar Energy. I understand that my order is subject to the policies stated above.</span>
            </label>
            <button class="acc-agree-btn" id="accAgreeBtn" disabled style="opacity:0.5;" aria-label="Confirm Agreement" onclick="
                if(document.getElementById('accAgreeCheck').checked){
                    this.textContent = '✅ Agreement Confirmed — Thank You!';
                    this.style.background = '#e7f4ff';
                    this.disabled = true;
                }
            ">Confirm My Agreement</button>
        </div>

        <!-- ADDRESS -->
        <div class="acc-section-title" style="animation: fadeIn 0.6s ease backwards; animation-delay: 0.5s;">Our Locations</div>
        <div class="acc-address" style="animation: fadeInUp 0.6s ease backwards; animation-delay: 0.6s;">
            <h4>📍 Visit Us</h4>
            <div class="acc-addr-row">
                <div class="acc-addr-icon" style="background:#e7f4ff;">🏢</div>
                <div><strong>Branch 1:</strong> 155-A, Opposite Bank Alfalah, Model Town Chowk, Multan</div>
            </div>
            <div class="acc-addr-row">
                <div class="acc-addr-icon" style="background:#e7f4ff;">🏢</div>
                <div><strong>Branch 2:</strong> MA Jinnah Road, Near Hascol Pump, Multan</div>
            </div>
            <div class="acc-addr-row">
                <div class="acc-addr-icon" style="background:#fff8e1;">🕐</div>
                <div><strong>Hours:</strong> Saturday – Thursday: 9:00 AM to 7:00 PM &nbsp;|&nbsp; <span style="color:#dc3545;font-weight:700;">Friday: Closed</span></div>
            </div>
            <div class="acc-addr-row">
                <div class="acc-addr-icon" style="background:#f0fff4;">📞</div>
                <div><a href="tel:03006771013" style="color:#1565c0;font-weight:800;" aria-label="Call Branch">0300-6771013</a></div>
            </div>
        </div>

        <p style="text-align:center;color:#bbb;font-size:0.72em;margin-top:16px; animation: fadeIn 1s ease backwards; animation-delay: 0.8s;">
            © 2025 AL Noor Solar Energy · Powered by <strong>SkyEagle Digital Agency</strong>
        </p>

    </div>
    `;
    page.classList.add('active');
},
        };

        function navigate(targetHash, pushState = true) {
            closeMiniCart(); 
            closeSearch();

            const hash = targetHash.startsWith('#') ? targetHash.substring(1) : targetHash;
            const url = new URL(window.location.href);
            url.hash = hash;

            if (pushState) {
                history.pushState({ page: hash }, '', url.href);
            } else {
                history.replaceState({ page: hash }, '', url.href);
            }
            renderPageFromHash(hash);
        }
        
        function toggleMobileMenu() {
            const panel   = document.getElementById('mobileNavPanel');
            const overlay = document.getElementById('mobOverlay');
            const btn     = document.getElementById('hamburgerBtn');
            const isOpen  = panel.classList.contains('open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                panel.classList.add('open');
                overlay.classList.add('open');
                btn.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        }
 
        function closeMobileMenu() {
            document.getElementById('mobileNavPanel').classList.remove('open');
            document.getElementById('mobOverlay').classList.remove('open');
            const btn = document.getElementById('hamburgerBtn');
            if (btn) btn.classList.remove('open');
            document.body.style.overflow = '';
        }


        function getPageElementId(pageId) {
            const pageMap = {
                'home': 'page-home',
                'products': 'page-products',
                'product': 'page-product',
                'cart': 'page-cart',
                'checkout': 'page-checkout',
                'search': 'page-search',
                'services': 'page-services',
                'about': 'page-about',
                'account': 'page-account',
                'module-authenticity': 'page-module-authenticity',
                'about-us': 'page-about-us',
                'contact-us': 'page-contact-us',
                'privacy-policy': 'page-privacy-policy',
                'refund-policy': 'page-refund-policy',
                'terms-of-service': 'page-terms-of-service',
                'warranty-policy': 'page-warranty-policy',
                'not-found': 'page-not-found'
            };
            if (pageMap[pageId]) return pageMap[pageId];
            if (pageId.startsWith('solar-') || pageId.startsWith('lithium-') || pageId.startsWith('vfd-') || pageId.startsWith('other-')) {
                return 'page-products';
            }
            return 'page-' + pageId;
        }

        function renderPageFromHash(hash, options) {
            options = options || {};
            let pageId = hash.split('?')[0];
            const params = new URLSearchParams(hash.split('?')[1]);

            if (!pageId || !pageRenderers[pageId]) {
                pageId = 'not-found'; // Fallback to 404
            }
            
            currentPage = pageId;
            detailPageProductId = (pageId === 'product') ? params.get('id') : null;

            // Hide all pages, then show the active one
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            const activePageElement = document.getElementById(getPageElementId(pageId));
            if (activePageElement) {
                activePageElement.classList.add('active');
            } else {
                const notFound = document.getElementById('page-not-found');
                if (notFound) notFound.classList.add('active');
            }
            
            // Execute the renderer function
            if (pageRenderers[pageId]) {
                pageRenderers[pageId](params);
            } else {
                 renderNotFound();
            }

            updateBottomNavActiveState(pageId);
            if (options.scroll !== false) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        let catalogOfflineNoticeShown = false;
        function reportCatalogError(error) {
            const code = (error && error.code) || '';
            console.error('Product catalog sync failed:', code || error);
            catalogStatus = 'error';
            catalogErrorMessage = code === 'PERMISSION_DENIED' || code === 'permission-denied'
                ? 'Unable to load products (permission denied). Check Realtime Database rules / Firebase authorized domains.'
                : (typeof navigator !== 'undefined' && navigator.onLine === false)
                    ? 'You appear to be offline. Check your internet connection.'
                    : 'Unable to load products from Firebase. Please refresh the page.';
            refreshProductList([]);
            applyCatalogToCurrentPage();
            const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
            const isNetwork = offline || code === 'unavailable' || code === 'deadline-exceeded';
            if (!catalogOfflineNoticeShown) {
                catalogOfflineNoticeShown = true;
                showToast(isNetwork ? 'Please check your internet connection.' : 'Could not load products from Firebase.');
            }
        }

        function applyCatalogToCurrentPage() {
            updateCartUI();
            if (currentPage === 'home') {
                if (typeof populateHomeCategoryCarousels === 'function') populateHomeCategoryCarousels();
                return;
            }
            const hash = window.location.hash.substring(1) || currentPage || 'home';
            renderPageFromHash(hash, { scroll: false });
        }

        let productsUnsubscribe = null;
        function loadProductsFromFirebase() {
            catalogStatus = 'loading';
            catalogErrorMessage = '';
            refreshProductList([]);
            applyCatalogToCurrentPage();

            if (!db) {
                reportCatalogError({ code: 'unavailable', message: 'Firebase SDK not initialized' });
                return;
            }
            if (productsUnsubscribe) {
                try { db.ref('products').off('value', productsUnsubscribe); } catch (e) {}
            }
            productsUnsubscribe = db.ref('products').on('value', (snap) => {
                const val = snap.val() || {};
                const fetchedProducts = Object.keys(val).map((id) => normalizeStoreProduct(id, val[id]));
                catalogStatus = 'ready';
                catalogErrorMessage = '';
                refreshProductList(fetchedProducts);
                applyCatalogToCurrentPage();
            }, reportCatalogError);
        }
        
        window.addEventListener('DOMContentLoaded', () => {
            const initialHash = window.location.hash.substring(1);
            navigate(initialHash || 'home', false);
            updateCartUI();
            addGlobalEventListeners();
            startCountdownTimer();
            loadProductsFromFirebase();
        });

        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1) || 'home';
            renderPageFromHash(hash);
        });

        // Popstate event for browser back/forward buttons
        window.addEventListener('popstate', () => {
            const hash = window.location.hash.substring(1) || 'home';
            renderPageFromHash(hash);
        });

        function addGlobalEventListeners() {
            // Event listener for all navigation links with dropdown & event.target.closest('a') bug fix
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (event) => {
                    const linkEl = event.currentTarget || event.target.closest('a');
                    const targetHash = linkEl ? linkEl.getAttribute('href') : null;

                    // If it's a desktop dropdown toggle, toggle .open on parent
                    if (linkEl && linkEl.classList.contains('dropdown-toggle')) {
                        event.preventDefault();
                        event.stopPropagation();
                        const parent = linkEl.closest('.nav-item.dropdown');
                        if (parent) {
                            const wasOpen = parent.classList.contains('open');
                            document.querySelectorAll('.nav-item.dropdown').forEach(d => d.classList.remove('open'));
                            if (!wasOpen) parent.classList.add('open');
                        }
                        return;
                    }

                    if (targetHash) {
                        event.preventDefault();
                        // Close any open desktop dropdowns
                        document.querySelectorAll('.nav-item.dropdown').forEach(d => d.classList.remove('open'));
                        closeMobileMenu();
                        navigate(targetHash);
                    }
                });
            });

            // Close desktop dropdowns when clicking anywhere outside
            document.addEventListener('click', (event) => {
                if (!event.target.closest('.nav-item.dropdown')) {
                    document.querySelectorAll('.nav-item.dropdown').forEach(d => d.classList.remove('open'));
                }
            });

            // Close desktop dropdowns on Escape key
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    document.querySelectorAll('.nav-item.dropdown').forEach(d => d.classList.remove('open'));
                }
            });

            // Event listener for desktop search input (if exists)
            if (desktopSearchInput) {
                desktopSearchInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        doSearch(desktopSearchInput.value);
                        desktopSearchInput.value = ''; // Clear after search
                    }
                });
            }

            // Event listeners for bottom nav
            bnavItems.forEach(item => {
                item.addEventListener('click', (event) => {
                    const targetPage = item.dataset.target;
                    if (targetPage === 'search') {
                        toggleSearch();
                    } else if (targetPage === 'cart') {
                        openMiniCart();
                    } else {
                        navigate(targetPage);
                    }
                });
            });

            // Event listener for closing mini cart
            const closeMiniCartBtn = document.getElementById('closeMiniCart');
            const overlayEl = document.getElementById('overlay');
            if (closeMiniCartBtn) closeMiniCartBtn.addEventListener('click', closeMiniCart);
            if (overlayEl) overlayEl.addEventListener('click', closeMiniCart);
        }

        function updateBottomNavActiveState(pageId) {
            let basePageId = pageId.split('?')[0];
            if (basePageId.startsWith('solar-') || basePageId.startsWith('lithium-') || basePageId.startsWith('vfd-') || basePageId.startsWith('other-') || basePageId.startsWith('product')) {
                basePageId = 'products'; // Group categories and product detail under "Collection"
            } else if (basePageId === 'search') {
                 // No change, search is distinct
            } else if (basePageId === 'cart' || basePageId === 'checkout') {
                basePageId = 'cart';
            }
            
            bnavItems.forEach(item => {
                item.classList.remove('active');
                if (item.dataset.target === basePageId) {
                    item.classList.add('active');
                }
            });
        }

        // ====================================================================================================
        // CART FUNCTIONS
        // ====================================================================================================

        function addToCart(productId, quantity = 1, options = {}) {
            const product = getProductById(productId);
            if (!product) {
                console.error('Product not found:', productId);
                showToast('Product not found!');
                return;
            }

            const existingItemIndex = cart.findIndex(item => item.product.id === productId && JSON.stringify(item.options) === JSON.stringify(options));

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += quantity;
            } else {
                cart.push({
                    product: product,
                    quantity: quantity,
                    options: options
                });
            }

            saveCart();
            updateCartUI();
            openMiniCart();
            showToast(`${product.name} added to cart!`);
        }

        function updateCartItemQuantity(productId, newQuantity, options = {}) {
            const itemIndex = cart.findIndex(item => item.product.id === productId && JSON.stringify(item.options) === JSON.stringify(options));
            if (itemIndex > -1) {
                if (newQuantity <= 0) {
                    cart.splice(itemIndex, 1);
                } else {
                    cart[itemIndex].quantity = newQuantity;
                }
                saveCart();
                updateCartUI();
                if (currentPage === 'cart') {
                    renderCartPage(); // Re-render full cart page
                }
            }
        }

        function removeCartItem(productId, options = {}) {
            cart = cart.filter(item => !(item.product.id === productId && JSON.stringify(item.options) === JSON.stringify(options)));
            saveCart();
            updateCartUI();
            if (currentPage === 'cart') {
                renderCartPage(); // Re-render full cart page
            }
            showToast('Item removed from cart.');
        }

        function saveCart() {
            localStorage.setItem('alnoorCart', JSON.stringify(cart));
        }

        function getCartTotal() {
            return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
        }
        
        function getCartShipping() {
            return selectedDeliveryMethod === 'home' ? SHIPPING_COST : 0;
        }

        function updateCartUI() {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            
            // Update all cart count displays
            document.querySelectorAll('.cart-count, .cart-badge, #miniCartItemCount, #cartCountHdr, #bnavCartBadge').forEach(el => {
                el.textContent = totalItems;
            });

            // Mini Cart (Sidebar)
            const miniCartItemsContainer = document.getElementById('miniCartItems');
            const miniCartSubtotalSpan = document.getElementById('miniCartSubtotal');
            const miniCartTotalSpan = document.getElementById('miniCartTotal');
            const miniCartFooter = document.getElementById('miniCartFooter');
            const cartAlsoLike = document.getElementById('cartAlsoLike');
            const cartAlsoScroll = document.getElementById('cartAlsoScroll');
            
            if (cart.length === 0) {
                miniCartItemsContainer.innerHTML = `
                    <div class="empty-cart" style="animation: fadeIn 0.4s ease;">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                    </div>
                `;
                miniCartFooter.style.display = 'none';
                cartAlsoLike.style.display = 'block'; // Show "You May Also Like" when cart is empty
                if(cartAlsoScroll) cartAlsoScroll.innerHTML = products.filter(p => p.category === 'Solar Inverters').slice(0, 5).map(productCardTemplate).join('');
            } else {
                miniCartItemsContainer.innerHTML = cart.map(item => `
                    <div class="mini-cart-item" style="animation: fadeIn 0.4s ease;">
                        <img src="${item.product.image}" alt="${item.product.name}">
                        <div class="mini-cart-item-details">
                            <h4>${item.product.name}</h4>
                            ${item.options.capacity ? `<p style="font-size:0.9em; color:#888;">Capacity: ${item.options.capacity}</p>` : ''}
                            <p class="price">${formatPrice(item.product.price)}</p>
                            <div class="quantity-controls">
                                <button aria-label="Decrease Quantity" onclick="updateCartItemQuantity('${item.product.id}', ${item.quantity - 1}, ${JSON.stringify(item.options)})">-</button>
                                <span>${item.quantity}</span>
                                <button aria-label="Increase Quantity" onclick="updateCartItemQuantity('${item.product.id}', ${item.quantity + 1}, ${JSON.stringify(item.options)})">+</button>
                            </div>
                            <a href="#" class="remove-item" aria-label="Remove Item" onclick="event.preventDefault(); removeCartItem('${item.product.id}', ${JSON.stringify(item.options)})">Remove</a>
                        </div>
                    </div>
                `).join('');
                miniCartFooter.style.display = 'block';
                cartAlsoLike.style.display = 'none'; // Hide "You May Also Like" when cart has items
            }
            
            miniCartSubtotalSpan.textContent = formatPrice(getCartTotal());
            miniCartTotalSpan.textContent = formatPrice(getCartTotal() + getCartShipping());
            
            // Update delivery method UI
            document.querySelectorAll('.del-opt').forEach(opt => opt.classList.remove('selected'));
            document.getElementById(`del${selectedDeliveryMethod.charAt(0).toUpperCase() + selectedDeliveryMethod.slice(1)}`).classList.add('selected');
        }

        function openMiniCart() {
            miniCartSidebar.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        }

        function closeMiniCart() {
            miniCartSidebar.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = ''; // Restore scrolling
        }

        function selectDelivery(method) {
            selectedDeliveryMethod = method;
            localStorage.setItem('alnoorDeliveryMethod', method);
            updateCartUI(); // Re-render to update total if shipping cost changes
            showToast(`Delivery method changed to ${method === 'home' ? 'Home Delivery' : 'Pickup'}`);
        }

        let countdownInterval;
        function startCountdownTimer() {
            const timerElement = document.getElementById('countdownTimer');
            if (!timerElement) return;

            let minutes = 39;
            let seconds = 59;

            function updateTimer() {
                timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                if (minutes === 0 && seconds === 0) {
                    clearInterval(countdownInterval);
                    timerElement.textContent = 'Expired!';
                    // Potentially, clear cart or mark items as no longer held
                } else if (seconds === 0) {
                    minutes--;
                    seconds = 59;
                } else {
                    seconds--;
                }
            }
            clearInterval(countdownInterval); // Clear any existing interval
            countdownInterval = setInterval(updateTimer, 1000);
        }

        // ====================================================================================================
        // PAGE RENDERERS
        // ====================================================================================================

        function productCardTemplate(product) {
            const inStock = product.availability === 'In stock';
            const hasOldPrice = product.oldPrice && product.oldPrice > product.price;
            const priceHtml = hasOldPrice ? 
                `<span class="price">${formatPrice(product.price)} <span class="old-price">${formatPrice(product.oldPrice)}</span></span>` :
                `<span class="price">${formatPrice(product.price)}</span>`;
            const addToCartBtn = inStock ?
                `<button class="primary" aria-label="Add ${product.name} to cart" onclick="event.preventDefault(); event.stopPropagation(); addToCart('${product.id}')">Add to cart</button>` :
                `<button class="secondary" disabled aria-label="Out of stock">Out of Stock</button>`;
            const badgeText = product.offerTag || (hasOldPrice ? 'Sale' : (product.isNew ? 'New' : (product.isBestSeller ? 'Best Seller' : '')));
            const badgeHtml = badgeText ? `<span class="offer-badge">${badgeText}</span>` : '';
            const stockNote = inStock ? '' : `<p class="vendor" style="color:#c62828;font-weight:700;">Out of Stock</p>`;

            return `
                <a href="#product?id=${product.id}" class="product-card nav-link" style="animation: fadeInUp 0.6s ease backwards;">
                    <div class="card-img-wrap">
                        ${badgeHtml}
                        <img src="${product.image || 'logo.png'}" alt="${product.name}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='logo.png';">
                    </div>
                    <div class="product-card-content">
                        <h3>${product.name}</h3>
                        <p class="vendor">${product.vendor || ''}</p>
                        ${stockNote}
                        ${priceHtml}
                        ${addToCartBtn}
                    </div>
                </a>
            `;
        }

        function populateHomeCategoryCarousels() {
            const categories = [
                { id: 'ct-panels', category: 'Solar Panels', grid: 'grid4' },
                { id: 'ct-inverters', category: 'Solar Inverters', grid: 'grid4' },
                { id: 'ct-batteries', category: 'Lithium Batteries', grid: 'grid3' },
                { id: 'ct-vfd', category: 'VFD Inverters', grid: 'grid3' }
            ];

            categories.forEach(cat => {
                const track = document.getElementById(cat.id);
                if (!track) return;
                const catProducts = products.filter(p => p.category === cat.category);

                if (catalogStatus === 'loading') {
                    track.innerHTML = `<div class="cards-slide ${cat.grid}">${emptyProductsMessage('Loading products…', 'Fetching the latest catalog from Firebase.')}</div>`;
                    return;
                }
                if (catalogStatus === 'error') {
                    track.innerHTML = `<div class="cards-slide ${cat.grid}">${emptyProductsMessage('Products unavailable', catalogErrorMessage || 'Could not connect to Firebase.')}</div>`;
                    return;
                }
                if (catProducts.length === 0) {
                    track.innerHTML = `<div class="cards-slide ${cat.grid}">${emptyProductsMessage('No products available', 'No items in this category yet. Check back soon.')}</div>`;
                    return;
                }

                const perSlide = cat.grid === 'grid3' ? 3 : 4;
                const slides = [];
                for (let i = 0; i < catProducts.length; i += perSlide) {
                    slides.push(catProducts.slice(i, i + perSlide));
                }

                track.innerHTML = slides.map(slide => `
                    <div class="cards-slide ${cat.grid}">
                        ${slide.map(p => productCardTemplate(p)).join('')}
                    </div>
                `).join('');
            });
        }

        function renderHome() {
            document.getElementById('page-home').classList.add('active');
            populateHomeCategoryCarousels();
            initHeroCarousel();
            initSpecialOfferCarousel();
            addHomeEventListeners();
        }

        let heroCarouselInterval = null;
        function initHeroCarousel() {
            const carousel = document.getElementById('heroCarousel');
            if (!carousel) return;

            if (heroCarouselInterval) {
                clearInterval(heroCarouselInterval);
                heroCarouselInterval = null;
            }

            const images = carousel.querySelectorAll('img');
            if (images.length <= 1) {
                if (images[0]) {
                    images[0].classList.add('active');
                    images[0].classList.remove('exit');
                }
                return; // Single image remains perfectly steady with zero jitter!
            }

            let currentIndex = 0;
            images.forEach((img, idx) => {
                if (idx === 0) {
                    img.classList.add('active');
                    img.classList.remove('exit');
                } else {
                    img.classList.remove('active');
                    img.classList.remove('exit');
                }
            });

            function nextImage() {
                const prev = currentIndex;
                currentIndex = (currentIndex + 1) % images.length;
                if (prev === currentIndex) return;

                images[prev].classList.remove('active');
                images[prev].classList.add('exit');
                images[currentIndex].classList.add('active');
                images[currentIndex].classList.remove('exit');

                setTimeout(() => {
                    if (images[prev]) images[prev].classList.remove('exit');
                }, 1000);
            }

            heroCarouselInterval = setInterval(nextImage, 6000);
        }

        function initSpecialOfferCarousel() {
            const carousel = document.getElementById('specialOfferCarousel');
            if (!carousel) return;

            let currentIndex = 0;
            const images = carousel.querySelectorAll('img');

            function showImage(index) {
                images.forEach((img, i) => {
                    img.classList.remove('active');
                    img.style.zIndex = 1; // Reset z-index
                    if (i === index) {
                        img.classList.add('active');
                        img.style.zIndex = 2; // Bring active image to front
                    }
                });
            }

            function nextImage() {
                currentIndex = (currentIndex + 1) % images.length;
                showImage(currentIndex);
            }

            showImage(currentIndex);
             // Clear previous interval if any
            if (carousel.dataset.intervalId) clearInterval(carousel.dataset.intervalId);
            carousel.dataset.intervalId = setInterval(nextImage, 4000); // Change image every 4 seconds
        }

        function addHomeEventListeners() {
            // Special offer section quantity controls
            const soQuantityInput = document.getElementById('soQuantity');
            const soDecreaseBtn = document.getElementById('soDecreaseQuantity');
            const soIncreaseBtn = document.getElementById('soIncreaseQuantity');
            const soCapacitySelector = document.getElementById('soCapacitySelector');
            const soAddToCartBtn = document.getElementById('soAddToCartBtn');
            const soAgreeTerms = document.getElementById('soAgreeTerms');
            const soCopyLink = document.getElementById('soCopyLink');

            if (soQuantityInput) {
                soDecreaseBtn.onclick = () => {
                    let currentVal = parseInt(soQuantityInput.value);
                    if (currentVal > 1) {
                        soQuantityInput.value = currentVal - 1;
                    }
                };
                soIncreaseBtn.onclick = () => {
                    let currentVal = parseInt(soQuantityInput.value);
                    soQuantityInput.value = currentVal + 1;
                };
            }

            if (soCapacitySelector) {
                soCapacitySelector.onclick = (event) => {
                    if (event.target.tagName === 'BUTTON') {
                        soCapacitySelector.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
                        event.target.classList.add('selected');
                    }
                };
            }

            if (soAddToCartBtn) {
                soAddToCartBtn.onclick = () => {
                    if (!soAgreeTerms.checked) {
                        alert('Please agree with Terms & Conditions to add to cart.');
                        return;
                    }
                    const selectedCapacity = soCapacitySelector.querySelector('.selected').dataset.capacity;
                    const quantity = parseInt(soQuantityInput.value);
                    const productId = selectedCapacity === '10KW' ? 'so1' : 'so2'; // Assuming so1 for 10KW, so2 for 7KW
                    addToCart(productId, quantity, { capacity: selectedCapacity });
                };
            }

            if (soCopyLink) {
                soCopyLink.onclick = () => {
                    const link = soCopyLink.dataset.link;
                    navigator.clipboard.writeText(link).then(() => {
                        showToast('Link copied to clipboard!');
                    }).catch(err => {
                        console.error('Failed to copy link: ', err);
                    });
                };
            }
        }

        function productsGridHtml(list) {
            if (catalogStatus === 'loading') {
                return emptyProductsMessage('Loading products…', 'Fetching the latest catalog from Firebase.');
            }
            if (catalogStatus === 'error') {
                return emptyProductsMessage('Products unavailable', catalogErrorMessage || 'Could not connect to Firebase.');
            }
            if (!list.length) {
                return emptyProductsMessage('No products available', 'There are no products in the catalog right now.');
            }
            return list.map(productCardTemplate).join('');
        }

        function renderAllProducts(params) {
            let filteredProducts = products.slice();
            
            const categoryFilter = params.get('category');
            if (categoryFilter) {
                filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
            }

            const inStockOnly = params.get('availability') === 'in_stock';
            if (inStockOnly) {
                filteredProducts = filteredProducts.filter(p => p.availability === 'In stock');
            }

            const minPrice = parseInt(params.get('min_price')) || 0;
            const maxPrice = parseInt(params.get('max_price')) || 1335000;
            filteredProducts = filteredProducts.filter(p => p.price >= minPrice && p.price <= maxPrice);

            const sortBy = params.get('sort_by') || 'Alphabetically, A-Z';
            if (sortBy === 'Alphabetically, A-Z') {
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortBy === 'Price, low to high') {
                filteredProducts.sort((a, b) => a.price - b.price);
            } else if (sortBy === 'Price, high to low') {
                filteredProducts.sort((a, b) => b.price - a.price);
            } else if (sortBy === 'Best selling') {
                 filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            }

            const featuredHtml = products.filter(p => (p.isBestSeller || p.price > 200000) && p.availability === 'In stock').slice(0,3).map(productCardTemplate).join('')
                || '<p style="font-size:12px;color:var(--secondary-text-color);">No featured products yet.</p>';

            document.getElementById('page-products').innerHTML = `
                <div class="page-header" style="animation: fadeIn 0.6s ease;">
                    <div class="container">
                        <h1>All Products</h1>
                        <div class="breadcrumbs">
                            <a href="#home" class="nav-link">Home</a> <span>/</span> Products
                        </div>
                    </div>
                </div>

                <div class="container products-page-layout" style="animation: fadeInUp 0.8s ease;">
                    <aside class="sidebar">
                        <div class="sidebar-section">
                            <h4>Categories</h4>
                            <ul>
                                <li><a href="#products" class="nav-link">All Products</a></li>
                                <li><a href="#solar-inverters" class="nav-link">Solar Inverters</a></li>
                                <li><a href="#lithium-batteries" class="nav-link">Lithium Batteries</a></li>
                                <li><a href="#vfd-inverters" class="nav-link">VFD Inverters</a></li>
                                <li><a href="#other-accessories" class="nav-link">Other Accessories</a></li>
                                <li><a href="#solar-panels" class="nav-link">Solar Panels</a></li>
                                <li><a href="#module-authenticity" class="nav-link">Module Authenticity</a></li>
                            </ul>
                        </div>
                        <div class="sidebar-section">
                            <h4>Availability</h4>
                            <div class="filter-group">
                                <label>
                                    <input type="checkbox" id="filterInStock" aria-label="In Stock Filter" ${inStockOnly ? 'checked' : ''}> In stock (${products.filter(p => p.availability === 'In stock').length})
                                </label>
                                <label>
                                    <input type="checkbox" id="filterOutOfStock" aria-label="Out of Stock Filter" ${!inStockOnly && params.get('availability') !== null ? 'checked' : ''} disabled> Out of stock (${products.filter(p => p.availability === 'Out of stock').length})
                                </label>
                            </div>
                        </div>
                        <div class="sidebar-section">
                            <h4>Price</h4>
                            <div class="price-range">
                                <input type="number" id="minPriceInput" aria-label="Minimum Price" value="${minPrice}" placeholder="Min">
                                <span>to</span>
                                <input type="number" id="maxPriceInput" aria-label="Maximum Price" value="${maxPrice}" placeholder="Max">
                                <button class="primary" id="applyPriceFilter" aria-label="Apply Price Filter">Apply</button>
                            </div>
                        </div>
                        <div class="sidebar-section">
                            <h4>Featured Products</h4>
                            <div class="product-grid" style="grid-template-columns: 1fr; gap: 15px;">
                                ${featuredHtml}
                            </div>
                        </div>
                    </aside>

                    <div class="main-content">
                        <div class="product-controls">
                            <div class="view-as">
                                <label>View as:</label>
                                <button class="active" aria-label="Grid View"><i class="fas fa-th-large"></i></button>
                                <button aria-label="List View"><i class="fas fa-list"></i></button>
                            </div>
                            <div class="items-per-page">
                                <label for="itemsPerPage">Items per page:</label>
                                <select id="itemsPerPage">
                                    <option value="20" ${params.get('items_per_page') === '20' ? 'selected' : ''}>20</option>
                                    <option value="40" ${params.get('items_per_page') === '40' ? 'selected' : ''}>40</option>
                                    <option value="60" ${params.get('items_per_page') === '60' ? 'selected' : ''}>60</option>
                                </select>
                            </div>
                            <div class="sort-by">
                                <label for="sortBy">Sort by:</label>
                                <select id="sortBy">
                                    <option value="Alphabetically, A-Z" ${sortBy === 'Alphabetically, A-Z' ? 'selected' : ''}>Alphabetically, A-Z</option>
                                    <option value="Price, low to high" ${sortBy === 'Price, low to high' ? 'selected' : ''}>Price, low to high</option>
                                    <option value="Price, high to low" ${sortBy === 'Price, high to low' ? 'selected' : ''}>Price, high to low</option>
                                    <option value="Best selling" ${sortBy === 'Best selling' ? 'selected' : ''}>Best selling</option>
                                </select>
                            </div>
                        </div>

                        <div class="product-grid">
                            ${productsGridHtml(filteredProducts)}
                        </div>

                        <p style="text-align: center; margin-top: 30px; font-size: 0.9em; color: var(--secondary-text-color);">
                            Showing ${filteredProducts.length ? '1' : '0'} -${Math.min(parseInt(params.get('items_per_page') || 20), filteredProducts.length)} of ${filteredProducts.length} total
                        </p>
                        ${filteredProducts.length ? '<button class="primary show-more-btn" id="showMoreProductsBtn">Show more</button>' : ''}
                    </div>
                </div>
            `;
            addProductsPageEventListeners(params);
            document.getElementById('page-products').classList.add('active');
        }

        function addProductsPageEventListeners(currentParams) {
            const itemsPerPageSelect = document.getElementById('itemsPerPage');
            const sortBySelect = document.getElementById('sortBy');
            const filterInStock = document.getElementById('filterInStock');
            const applyPriceFilterBtn = document.getElementById('applyPriceFilter');
            const minPriceInput = document.getElementById('minPriceInput');
            const maxPriceInput = document.getElementById('maxPriceInput');
            const showMoreProductsBtn = document.getElementById('showMoreProductsBtn');

            const updateUrlAndRender = () => {
                const newParams = new URLSearchParams(window.location.hash.split('?')[1]);
                const pageName = window.location.hash.split('?')[0].substring(1);
                
                newParams.set('sort_by', sortBySelect.value);
                newParams.set('items_per_page', itemsPerPageSelect.value);

                if (filterInStock.checked) {
                    newParams.set('availability', 'in_stock');
                } else {
                    newParams.delete('availability');
                }

                newParams.set('min_price', minPriceInput.value);
                newParams.set('max_price', maxPriceInput.value);

                const newHash = `${window.location.hash.split('?')[0]}?${newParams.toString()}`;
                navigate(newHash, true); // Use true to push state
            };

            if(itemsPerPageSelect) itemsPerPageSelect.addEventListener('change', updateUrlAndRender);
            if(sortBySelect) sortBySelect.addEventListener('change', updateUrlAndRender);
            if(filterInStock) filterInStock.addEventListener('change', updateUrlAndRender);
            if(applyPriceFilterBtn) applyPriceFilterBtn.addEventListener('click', updateUrlAndRender);

            if (showMoreProductsBtn) {
                showMoreProductsBtn.addEventListener('click', () => {
                    alert('Showing more products (functionality not fully implemented for this frontend-only demo).');
                });
            }
        }

        function renderCategoryPage(categoryName, params) {
            let filteredProducts = products.filter(p => p.category === categoryName);
            
            const brandFilter = params.get('brand');
            if (brandFilter) {
                filteredProducts = filteredProducts.filter(p => (p.vendor || '').toLowerCase().includes(brandFilter.toLowerCase()));
            }

            const typeFilter = params.get('type');
            if (typeFilter === 'new') {
                filteredProducts = filteredProducts.filter(p => p.isNew);
            } else if (typeFilter === 'best-selling') {
                filteredProducts = filteredProducts.filter(p => p.isBestSeller);
            } else if (typeFilter) {
                filteredProducts = filteredProducts.filter(p =>
                    String(p.type || '').toLowerCase() === typeFilter.toLowerCase() ||
                    String(p.type || '').toLowerCase().includes(typeFilter.toLowerCase())
                );
            }

            const inStockOnly = params.get('availability') === 'in_stock';
            if (inStockOnly) {
                filteredProducts = filteredProducts.filter(p => p.availability === 'In stock');
            }

            const minPrice = parseInt(params.get('min_price')) || 0;
            const maxPrice = parseInt(params.get('max_price')) || 1335000;
            filteredProducts = filteredProducts.filter(p => p.price >= minPrice && p.price <= maxPrice);

            const sortBy = params.get('sort_by') || 'Best selling'; // Default for category pages
            if (sortBy === 'Alphabetically, A-Z') {
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortBy === 'Price, low to high') {
                filteredProducts.sort((a, b) => a.price - b.price);
            } else if (sortBy === 'Price, high to low') {
                filteredProducts.sort((a, b) => b.price - a.price);
            } else if (sortBy === 'Best selling') {
                 filteredProducts.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller) || a.name.localeCompare(b.name));
            }

            const featuredHtml = products.filter(p => (p.isBestSeller || p.price > 200000) && p.availability === 'In stock').slice(0,3).map(productCardTemplate).join('')
                || '<p style="font-size:12px;color:var(--secondary-text-color);">No featured products yet.</p>';
            
            document.getElementById('page-products').innerHTML = `
                <div class="page-header" style="animation: fadeIn 0.6s ease;">
                    <div class="container">
                        <h1>${categoryName}</h1>
                        <div class="breadcrumbs">
                            <a href="#home" class="nav-link">Home</a> <span>/</span> <a href="#products" class="nav-link">Products</a> <span>/</span> ${categoryName}
                        </div>
                    </div>
                </div>

                <div class="container products-page-layout" style="animation: fadeInUp 0.8s ease;">
                    <aside class="sidebar">
                        <div class="sidebar-section">
                            <h4>Categories</h4>
                            <ul>
                                <li><a href="#products" class="nav-link">All Products</a></li>
                                <li><a href="#solar-inverters" class="nav-link">Solar Inverters</a></li>
                                <li><a href="#lithium-batteries" class="nav-link">Lithium Batteries</a></li>
                                <li><a href="#vfd-inverters" class="nav-link">VFD Inverters</a></li>
                                <li><a href="#other-accessories" class="nav-link">Other Accessories</a></li>
                                <li><a href="#solar-panels" class="nav-link">Solar Panels</a></li>
                                <li><a href="#module-authenticity" class="nav-link">Module Authenticity</a></li>
                            </ul>
                        </div>
                        <div class="sidebar-section">
                            <h4>Availability</h4>
                            <div class="filter-group">
                                <label>
                                    <input type="checkbox" id="filterInStock" aria-label="In Stock Filter" ${inStockOnly ? 'checked' : ''}> In stock (${filteredProducts.filter(p => p.availability === 'In stock').length})
                                </label>
                                <label>
                                    <input type="checkbox" id="filterOutOfStock" disabled> Out of stock (${filteredProducts.filter(p => p.availability === 'Out of stock').length})
                                </label>
                            </div>
                        </div>
                        <div class="sidebar-section">
                            <h4>Price</h4>
                            <div class="price-range">
                                <input type="number" id="minPriceInput" aria-label="Minimum Price" value="${minPrice}" placeholder="Min">
                                <span>to</span>
                                <input type="number" id="maxPriceInput" aria-label="Maximum Price" value="${maxPrice}" placeholder="Max">
                                <button class="primary" id="applyPriceFilter" aria-label="Apply Price Filter">Apply</button>
                            </div>
                        </div>
                        <div class="sidebar-section">
                            <h4>Featured Products</h4>
                            <div class="product-grid" style="grid-template-columns: 1fr; gap: 15px;">
                                ${featuredHtml}
                            </div>
                        </div>
                    </aside>

                    <div class="main-content">
                        <p>${categoryName} description goes here. Upgrade your power with high-performance ${categoryName.toLowerCase()} built for durability, speed, and efficiency.</p>
                        <div class="product-controls">
                            <div class="view-as">
                                <label>View as:</label>
                                <button class="active" aria-label="Grid View"><i class="fas fa-th-large"></i></button>
                                <button aria-label="List View"><i class="fas fa-list"></i></button>
                            </div>
                            <div class="items-per-page">
                                <label for="itemsPerPage">Items per page:</label>
                                <select id="itemsPerPage">
                                    <option value="20" ${params.get('items_per_page') === '20' ? 'selected' : ''}>20</option>
                                    <option value="40" ${params.get('items_per_page') === '40' ? 'selected' : ''}>40</option>
                                    <option value="60" ${params.get('items_per_page') === '60' ? 'selected' : ''}>60</option>
                                </select>
                            </div>
                            <div class="sort-by">
                                <label for="sortBy">Sort by:</label>
                                <select id="sortBy">
                                    <option value="Best selling" ${sortBy === 'Best selling' ? 'selected' : ''}>Best selling</option>
                                    <option value="Alphabetically, A-Z" ${sortBy === 'Alphabetically, A-Z' ? 'selected' : ''}>Alphabetically, A-Z</option>
                                    <option value="Price, low to high" ${sortBy === 'Price, low to high' ? 'selected' : ''}>Price, low to high</option>
                                    <option value="Price, high to low" ${sortBy === 'Price, high to low' ? 'selected' : ''}>Price, high to low</option>
                                </select>
                            </div>
                        </div>

                        <div class="product-grid">
                            ${productsGridHtml(filteredProducts)}
                        </div>
                        <p style="text-align: center; margin-top: 30px; font-size: 0.9em; color: var(--secondary-text-color);">
                            Showing ${filteredProducts.length ? '1' : '0'} -${Math.min(parseInt(params.get('items_per_page') || 20), filteredProducts.length)} of ${filteredProducts.length} total
                        </p>
                        ${filteredProducts.length ? '<button class="primary show-more-btn" id="showMoreProductsBtn">Show more</button>' : ''}
                    </div>
                </div>
            `;
            addProductsPageEventListeners(params);
            document.getElementById('page-products').classList.add('active'); // Activate products page for category rendering
        }

        let currentDetailQuantity = 1;
        function changeDetailQty(amount) {
            currentDetailQuantity = Math.max(1, currentDetailQuantity + amount);
            document.getElementById('detailQty').textContent = currentDetailQuantity;
        }

        function addDetailToCart() {
            if (detailPageProductId) {
                const product = getProductById(detailPageProductId);
                if (product.availability === 'Out of stock') {
                    showToast('This product is out of stock!');
                    return;
                }
                addToCart(detailPageProductId, currentDetailQuantity);
                currentDetailQuantity = 1; // Reset quantity after adding
                document.getElementById('detailQty').textContent = 1;
            }
        }

        function shareProduct() {
            if (detailPageProductId) {
                const product = getProductById(detailPageProductId);
                const shareText = `Check out this product: ${product.name} - ${window.location.href}`;
                navigator.clipboard.writeText(shareText).then(() => {
                    showToast('Product link copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy product link: ', err);
                    showToast('Failed to copy link.');
                });
            }
        }

        function renderProductDetail(params) {
            detailPageProductId = params.get('id');
            const product = getProductById(detailPageProductId);

            if (!product) {
                renderNotFound();
                return;
            }

              const pageDetail = document.getElementById('page-product');
            pageDetail.classList.add('active'); // Show product detail page

            // Update breadcrumbs
            document.getElementById('detailBreadcrumb').textContent = product.name;

            // Populate main image, vendor, name, prices, description
            const pdImgEl = document.getElementById('pdImg');
            const gallery = (product.images && product.images.length) ? product.images : [product.image || 'logo.png'];
            if (pdImgEl) {
                pdImgEl.innerHTML = `
                    <img id="pdMainImg" src="${gallery[0]}" alt="${product.name}" onerror="this.onerror=null;this.src='logo.png';" loading="eager">
                    ${gallery.length > 1 ? `<div class="pd-thumbs">${gallery.map((src, i) => `
                        <button type="button" class="pd-thumb${i===0?' active':''}" onclick="document.getElementById('pdMainImg').src='${src}';this.parentElement.querySelectorAll('.pd-thumb').forEach(b=>b.classList.remove('active'));this.classList.add('active');">
                            <img src="${src}" alt="Thumbnail ${i+1}" onerror="this.onerror=null;this.src='logo.png';">
                        </button>`).join('')}</div>` : ''}
                `;
                pdImgEl.style.backgroundImage = 'none';
            }
            document.getElementById('pdVendor').textContent = product.vendor || '';
            document.getElementById('pdName').textContent = product.name;
            document.getElementById('pdPrice').textContent = formatPrice(product.price);

            const saleTag = document.getElementById('pdSaleTag');
            const badgeText = product.offerTag || (product.oldPrice && product.oldPrice > product.price ? 'Sale' : '');
            if (badgeText) {
                saleTag.textContent = badgeText;
                saleTag.style.display = 'inline-block';
            } else {
                saleTag.textContent = '';
                saleTag.style.display = 'none';
            }
            if (product.oldPrice && product.oldPrice > product.price) {
                document.getElementById('pdOld').textContent = formatPrice(product.oldPrice);
            } else {
                document.getElementById('pdOld').textContent = '';
            }
            document.getElementById('pdDesc').textContent = product.description;

            // Extra meta: stock / SKU / warranty (reuse existing typography)
            let metaEl = document.getElementById('pdMetaExtra');
            if (!metaEl) {
                metaEl = document.createElement('div');
                metaEl.id = 'pdMetaExtra';
                metaEl.className = 'pd-desc';
                const descEl = document.getElementById('pdDesc');
                descEl.parentNode.insertBefore(metaEl, descEl.nextSibling);
            }
            const stockLabel = product.availability === 'In stock'
                ? `<span style="color:#15803D;font-weight:700;">● In Stock</span>`
                : `<span style="color:#B91C1C;font-weight:700;">● Out of Stock</span>`;
            metaEl.innerHTML = `
                <div style="margin-top:8px;font-size:0.92em;line-height:1.7;">
                    ${stockLabel}
                    ${product.sku ? `<br><strong>SKU:</strong> ${product.sku}` : ''}
                    ${product.warranty ? `<br><strong>Warranty:</strong> ${product.warranty}` : ''}
                </div>
            `;

            // --- Datasheet Button Logic ---
            const datasheetBtn = document.getElementById('pdDatasheetBtn');
            if (product.datasheetUrl && product.datasheetUrl.trim() !== '') {
                datasheetBtn.style.display = 'flex';
                datasheetBtn.href = product.datasheetUrl;
                datasheetBtn.onclick = null;
            } else {
                datasheetBtn.style.display = 'none';
                datasheetBtn.href = "#";
                datasheetBtn.onclick = null;
            }

            // --- Long Description / Table Logic ---
            const longDescDiv = document.getElementById('pdLongDesc');
            if (product.longDescription && product.longDescription.trim() !== '') {
                longDescDiv.innerHTML = product.longDescription;
                longDescDiv.style.display = 'block';
            } else {
                longDescDiv.style.display = 'none';
            }
            currentDetailQuantity = 1;
            document.getElementById('detailQty').textContent = currentDetailQuantity;

            // Handle add to cart button / out of stock
            const addToCartButton = pageDetail.querySelector('.pd-add-btn');
            if (product.availability === 'Out of stock') {
                addToCartButton.textContent = 'Out of Stock';
                addToCartButton.classList.remove('primary');
                addToCartButton.classList.add('secondary');
                addToCartButton.disabled = true;
                addToCartButton.onclick = null;
            } else {
                addToCartButton.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
                addToCartButton.classList.remove('secondary');
                addToCartButton.classList.add('primary');
                addToCartButton.disabled = false;
                addToCartButton.onclick = addDetailToCart;
            }

            // Populate "You May Also Like"
            const alsoLikeScroll = document.getElementById('alsoLikeScroll');
            if (alsoLikeScroll) {
                const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);
                if (relatedProducts.length === 0) {
                    alsoLikeScroll.innerHTML = `<p style="text-align:center;color:var(--secondary-text-color);">No similar products found.</p>`;
                } else {
                    alsoLikeScroll.innerHTML = relatedProducts.map(productCardTemplate).join('');
                }
            }
        }

        function renderCartPage() {
            const hasItems = cart.length > 0;
            const cartFullItems = document.getElementById('cartFullItems');
            const cartFullSubtotal = document.getElementById('cartFullSubtotal');
            const cartFullTotal = document.getElementById('cartFullTotal');
            const bestSellersScroll = document.getElementById('bestSellersScroll');
            const cartFullProceedBtn = document.getElementById('cartFullProceedBtn');
            const cartFullAgreeTerms = document.getElementById('cartFullAgreeTerms');

            if (!hasItems) {
                cartFullItems.innerHTML = `
                    <tr class="empty-cart-row" style="animation: fadeIn 0.4s ease;">
                        <td colspan="5" style="text-align: center; padding: 40px;">
                            <p style="font-size: 1.2em; color: var(--secondary-text-color);">Your cart is empty.</p>
                            <a href="#products" class="primary nav-link" style="display:inline-block; padding:10px 20px; text-decoration:none;">Continue Shopping</a>
                        </td>
                    </tr>
                `;
                cartFullProceedBtn.disabled = true;
            } else {
                cartFullItems.innerHTML = cart.map(item => `
                    <tr style="animation: fadeIn 0.4s ease;">
                        <td>
                            <div class="cart-item-info">
                                <img src="${item.product.image}" alt="${item.product.name} Preview">
                                <div class="details">
                                    <h4>${item.product.name}</h4>
                                    <p class="vendor">${item.product.vendor}</p>
                                    ${item.options.capacity ? `<p style="font-size:0.9em; color:#888;">Capacity: ${item.options.capacity}</p>` : ''}
                                </div>
                            </div>
                        </td>
                        <td class="item-price">${formatPrice(item.product.price)}</td>
                        <td>
                            <div class="quantity-controls">
                                <button aria-label="Decrease" onclick="updateCartItemQuantity('${item.product.id}', ${item.quantity - 1}, ${JSON.stringify(item.options)})">-</button>
                                <span>${item.quantity}</span>
                                <button aria-label="Increase" onclick="updateCartItemQuantity('${item.product.id}', ${item.quantity + 1}, ${JSON.stringify(item.options)})">+</button>
                            </div>
                        </td>
                        <td class="item-total">${formatPrice(item.product.price * item.quantity)}</td>
                        <td>
                            <button class="remove-item-btn" aria-label="Remove Item" onclick="removeCartItem('${item.product.id}', ${JSON.stringify(item.options)})"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('');
                cartFullProceedBtn.disabled = false;
            }

            const currentSubtotal = getCartTotal();
            const currentTotal = currentSubtotal + SHIPPING_COST; // Full cart page always shows home delivery cost

            cartFullSubtotal.textContent = formatPrice(currentSubtotal);
            cartFullTotal.textContent = formatPrice(currentTotal);

            // Populate best sellers
            if (bestSellersScroll) {
                bestSellersScroll.innerHTML = products.filter(p => p.isBestSeller || p.price > 100000).slice(0, 10).map(productCardTemplate).join('')
                    || emptyProductsMessage('No products available', 'Best sellers will appear here once products are added.');
            }
            
            // Add event listener for proceed button (after content is rendered)
            if(cartFullProceedBtn) {
                cartFullProceedBtn.onclick = () => {
                    if (cartFullAgreeTerms.checked) {
                        navigate('checkout');
                    } else {
                        alert('Please agree with Terms & Conditions to proceed to checkout.');
                    }
                };
            }
            document.getElementById('page-cart').classList.add('active');
            startCountdownTimer(); // Re-start timer if user navigates to cart page
        }

        function copyText(text) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                showToast('Failed to copy.');
            });
        }

        function previewScreenshot(input) {
            const preview = document.getElementById('screenshotPreview');
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(input.files[0]);
            } else {
                preview.src = '';
                preview.style.display = 'none';
            }
        }

        function renderCheckoutPage() {
            if (cart.length === 0) {
                document.getElementById('page-checkout').innerHTML = `
                    <section class="container" style="text-align: center; padding: 50px; animation: fadeIn 0.6s ease;">
                        <h1>Your cart is empty!</h1>
                        <p>Please add some items to your cart before proceeding to checkout.</p>
                        <a href="#products" class="primary nav-link" style="display:inline-block; padding:10px 20px; text-decoration:none;">Go to Products</a>
                    </section>
                `;
                document.getElementById('page-checkout').classList.add('active');
                return;
            }

            const cartTotal = getCartTotal();
            const shippingCost = SHIPPING_COST; // Fixed 1500 for checkout
            const finalTotal = cartTotal + shippingCost;

            const checkoutSummaryDiv = document.getElementById('checkoutSummary');
            checkoutSummaryDiv.innerHTML = cart.map(item => `
                <div class="prod-item" style="animation: fadeIn 0.4s ease;">
                    <img src="${item.product.image}" alt="${item.product.name} image">
                    <div class="prod-item-info">
                        <h4>${item.product.name}</h4>
                        <p>Qty: ${item.quantity}</p>
                        ${item.options.capacity ? `<p>Capacity: ${item.options.capacity}</p>` : ''}
                    </div>
                    <span class="prod-item-price">${formatPrice(item.product.price * item.quantity)}</span>
                </div>
            `).join('');

            document.getElementById('chkSubtotal').textContent = formatPrice(cartTotal);
            document.getElementById('chkTotal').textContent = formatPrice(finalTotal);

            // Pre-fill phone if available from previous input (very basic for demo)
            const chkPhone = document.getElementById('chkPhone');
            const chkPhone2 = document.getElementById('chkPhone2');
            if(chkPhone) chkPhone.value = localStorage.getItem('checkoutPhone') || '';
            if(chkPhone2) chkPhone2.value = localStorage.getItem('checkoutPhone') || '';

            document.getElementById('page-checkout').classList.add('active');
        }

        function submitOrder() {
            const chkPhone = document.getElementById('chkPhone');
            const chkEmail = document.getElementById('chkEmail');
            const chkFname = document.getElementById('chkFname');
            const chkLname = document.getElementById('chkLname');
            const chkAddress = document.getElementById('chkAddress');
            const chkApt = document.getElementById('chkApt');
            const chkCity = document.getElementById('chkCity');
            const chkPostal = document.getElementById('chkPostal');
            const chkPhone2 = document.getElementById('chkPhone2');
            const screenshotInput = document.getElementById('screenshotInput');
            const checkoutAgreeTerms = document.getElementById('checkoutAgreeTerms');

            // Simple validation
            if (!chkPhone.value || !chkLname.value || !chkAddress.value || !chkCity.value || !chkPhone2.value) {
                alert('Please fill in all required fields (marked with *).');
                return;
            }
            if (!checkoutAgreeTerms.checked) {
                alert('Please agree with Terms & Conditions to complete your order.');
                return;
            }

            // Save phone for next time (demo purpose)
            localStorage.setItem('checkoutPhone', chkPhone.value);

            let orderDetails = `*New Order from AL Noor Solar Energy*%0A%0A`;
            orderDetails += `*Contact Info:*%0A`;
            orderDetails += `Phone: ${chkPhone.value}%0A`;
            if (chkEmail.value) orderDetails += `Email: ${chkEmail.value}%0A`;
            orderDetails += `%0A*Delivery Address:*%0A`;
            if (chkFname.value) orderDetails += `First Name: ${chkFname.value}%0A`;
            orderDetails += `Last Name: ${chkLname.value}%0A`;
            orderDetails += `Address: ${chkAddress.value}${chkApt.value ? ', ' + chkApt.value : ''}%0A`;
            orderDetails += `City: ${chkCity.value}%0A`;
            if (chkPostal.value) orderDetails += `Postal Code: ${chkPostal.value}%0A`;
            orderDetails += `Contact Phone (Delivery): ${chkPhone2.value}%0A%0A`;
            
            orderDetails += `*Order Items:*%0A`;
            cart.forEach(item => {
                orderDetails += `- ${item.product.name} (Vendor: ${item.product.vendor})${item.options.capacity ? ` Capacity: ${item.options.capacity}` : ''}%0A  Quantity: ${item.quantity}, Price: ${formatPrice(item.product.price)} each, Total: ${formatPrice(item.product.price * item.quantity)}%0A`;
            });

            const cartTotal = getCartTotal();
            const finalTotal = cartTotal + SHIPPING_COST;

            orderDetails += `%0A*Order Summary:*%0ASubtotal: ${formatPrice(cartTotal)}%0AShipping: ${formatPrice(SHIPPING_COST)}%0A*Total: ${formatPrice(finalTotal)}*%0A%0A`;
            orderDetails += `*Payment Method:*%0ACash on Delivery / Bank Transfer (Advance Payment Required)%0A%0A`;
            if (screenshotInput.files.length > 0) {
                orderDetails += `_Customer has indicated a payment screenshot will be sent. Please confirm with them._`;
            } else {
                orderDetails += `_No payment screenshot uploaded. Please instruct customer for advance payment proof._`;
            }

            const whatsappNumber = '923006771013';
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${orderDetails}`;

            window.open(whatsappUrl, '_blank', 'noopener');

            showToast('Order details sent to WhatsApp! Please also send your payment screenshot.');
            
            // Clear cart after simulated order
            cart = [];
            saveCart();
            updateCartUI();
            navigate('home'); // Go to home after order
        }


        function renderModuleAuthenticity() {
            document.getElementById('page-module-authenticity').classList.add('active');
        }

        function renderNotFound() {
            document.getElementById('page-not-found').classList.add('active');
        }

        function renderInfoPage(title, contentHtml) {
            const pageId = title.toLowerCase().replace(/\s/g, '-');
            const pageElement = document.getElementById(`page-${pageId}`);
            if (pageElement) {
                pageElement.innerHTML = `
                    <div class="page-header" style="animation: fadeIn 0.5s ease;">
                        <div class="container">
                            <h1>${title}</h1>
                            <div class="breadcrumbs">
                                <a href="#home" class="nav-link">Home</a> <span>/</span> ${title}
                            </div>
                        </div>
                    </div>
                    <div class="container" style="padding-bottom: 60px; animation: fadeInUp 0.7s ease;">
                        ${contentHtml}
                    </div>
                `;
                pageElement.classList.add('active');
            } else {
                renderNotFound(); // Fallback if info page element not found
            }
        }
        
        // Search functionality
        function toggleSearch() {
            if (searchWrap.classList.contains('active')) {
                closeSearch();
            } else {
                searchWrap.style.display = 'block';
                setTimeout(() => searchWrap.classList.add('active'), 10);
                mobileSearchInput.focus();
                overlay.classList.add('open');
            }
        }

        function closeSearch() {
            searchWrap.classList.remove('active');
            overlay.classList.remove('open');
            setTimeout(() => { searchWrap.style.display = 'none'; }, 400); // Wait for transition
            mobileSearchInput.value = ''; // Clear search input on close
        }

        function doSearch(searchTerm) {
            if (!searchTerm.trim()) {
                navigate('home'); // Go back to home if search is empty
                return;
            }
            navigate(`search?q=${encodeURIComponent(searchTerm)}`);
        }

        function renderSearchPage(params) {
            const searchTerm = params.get('q') || '';
            const searchGrid = document.getElementById('searchGrid');
            const noResults = document.getElementById('noResults');
            const searchTermDisplay = document.getElementById('searchTermDisplay');

            searchTermDisplay.textContent = searchTerm;

            const results = products.filter(p =>
                                                (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                p.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                p.category.toLowerCase().includes(searchTerm.toLowerCase())));

            if (results.length > 0) {
                searchGrid.innerHTML = results.map(productCardTemplate).join('');
                searchGrid.style.display = 'grid';
                noResults.style.display = 'none';
            } else {
                searchGrid.innerHTML = '';
                searchGrid.style.display = 'none';
                noResults.style.display = 'block';
            }
            document.getElementById('page-search').classList.add('active');
        }
        
        function renderServicesPage() {
            const page = document.getElementById('page-services');
            page.innerHTML = `
                <div class="page-header" style="animation: fadeIn 0.6s ease;">
                    <div class="container">
                        <h1>Our Completed Projects</h1>
                        <p>Delivering excellence across Pakistan with sustainable and high-efficiency solar installations.</p>
                    </div>
                </div>
                <div class="container services-container" style="animation: fadeInUp 0.8s ease;">
                    <!-- Project 1 -->
                    <div class="project-horizontal-card">
                        <img src="assets/images/services/residential.png" alt="Residential Solar Installation Multan">
                        <div class="project-horizontal-info">
                            <span class="tag">Residential</span>
                            <h3>10kW Premium Home Solution</h3>
                            <p>Successfully installed in Model Town, Multan. This project features Tier-1 Jinko N-Type solar panels paired with a Knox Hybrid Smart Inverter, ensuring 24/7 uninterrupted power supply and maximum energy savings for the household.</p>
                        </div>
                    </div>

                    <!-- Project 2 -->
                    <div class="project-horizontal-card">
                        <img src="assets/images/services/industrial.png" alt="Industrial Solar Project Pakistan">
                        <div class="project-horizontal-info">
                            <span class="tag">Industrial</span>
                            <h3>50kW Grid-Tied System</h3>
                            <p>A massive industrial installation at the Multan Industrial Estate. By implementing high-capacity on-grid technology, we helped the client reduce their monthly electricity expenditure by over 80%, providing a rapid return on investment.</p>
                        </div>
                    </div>

                    <!-- Project 3 -->
                    <div class="project-horizontal-card">
                        <img src="assets/images/services/agricultural.png" alt="Agricultural Solar Tube Well">
                        <div class="project-horizontal-info">
                            <span class="tag">Agricultural</span>
                            <h3>Solar Water Pumping System</h3>
                            <p>Empowering local farmers with robust VFD solar pumping solutions. This project eliminates fuel costs and provides a reliable water supply for irrigation using pure solar energy, significantly increasing crop productivity.</p>
                        </div>
                    </div>

                    <!-- Project 4 -->
                    <div class="project-horizontal-card">
                        <img src="assets/images/services/commercial.webp" alt="Commercial Solar Installation Backup">
                        <div class="project-horizontal-info">
                            <span class="tag">Commercial</span>
                            <h3>Corporate Backup Infrastructure</h3>
                            <p>Designed and deployed for a Bank Alfalah branch. This specialized backup infrastructure ensures that critical banking operations remain functional during grid failures, maintaining seamless service for customers.</p>
                        </div>
                    </div>
                </div>
            `;
            page.classList.add('active');
        }

function renderAboutPage() {
            const page = document.getElementById('page-about');
            page.innerHTML = `
                <div class="page-header" style="animation: fadeIn 0.6s ease;">
                    <div class="container">
                        <h1>About AL Noor Solar Energy</h1>
                        <p>Leading the transition to clean, renewable energy in Pakistan.</p>
                    </div>
                </div>

                <div class="container" style="animation: fadeInUp 0.8s ease;">

                    <!-- ══════════════════════════════════════
                         CEO PROFILE CARD
                    ══════════════════════════════════════ -->
                    <div style="
                        background: linear-gradient(145deg, #071E4A 0%, #0A3080 55%, #1565C0 100%);
                        border-radius: 28px;
                        padding: 36px 28px 32px;
                        margin-bottom: 28px;
                        position: relative;
                        overflow: hidden;
                        box-shadow: 0 24px 64px rgba(7,30,74,0.35);
                    ">
                        <!-- Background decorations -->
                        <div style="position:absolute;width:340px;height:340px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.05);top:-100px;right:-100px;pointer-events:none;"></div>
                        <div style="position:absolute;width:200px;height:200px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.04);bottom:-60px;left:10px;pointer-events:none;"></div>
                        <div style="position:absolute;width:90px;height:90px;background:rgba(255,184,0,0.07);border-radius:50%;top:24px;right:50px;pointer-events:none;"></div>
                        <div style="position:absolute;width:50px;height:50px;background:rgba(77,163,255,0.1);border-radius:50%;bottom:40px;right:30px;pointer-events:none;"></div>

                        <!-- SECTION 1: Photo + Basic Info -->
                        <div style="display:flex;align-items:flex-start;gap:24px;margin-bottom:28px;flex-wrap:wrap;">

                            <!-- Photo -->
                            <div style="position:relative;flex-shrink:0; margin: 0 auto;">
                                <div style="
                                    width:130px;height:130px;border-radius:20px;
                                    border:3px solid rgba(77,163,255,0.5);
                                    overflow:hidden;
                                    box-shadow:0 12px 36px rgba(0,0,0,0.4), 0 0 0 6px rgba(77,163,255,0.1);
                                    background:#0A3080;
                                ">
                                    <img
                                        src="assets/images/ceo-hamid.png"
                                        alt="Engr. Muhammad Hamid CEO"
                                        style="width:100%;height:100%;object-fit:cover;display:block;"
                                        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 80%22><rect width=%2280%22 height=%2280%22 fill=%22%231565C0%22/><text x=%2240%22 y=%2248%22 text-anchor=%22middle%22 font-size=%2228%22 fill=%22white%22>👤</text></svg>'"
                                    >
                                </div>
                                <!-- Verified badge -->
                                <div style="
                                    position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);
                                    background:linear-gradient(135deg,#FFB800,#FF8A00);
                                    color:#fff;font-size:10px;font-weight:800;
                                    padding:3px 10px;border-radius:20px;white-space:nowrap;
                                    box-shadow:0 4px 10px rgba(255,138,0,0.4);
                                    letter-spacing:.5px;
                                ">✦ CEO & Founder</div>
                            </div>

                            <!-- Name + Tags -->
                            <div style="flex:1;min-width:160px;padding-top:4px;">
                                <h2 style="color:#ffffff;font-size:21px;font-weight:800;margin:0 0 4px;line-height:1.2;">
                                    Engr. Muhammad Hamid
                                </h2>
                                <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0 0 14px;font-weight:500;">
                                    Al Noor Solar Energy (ASE) &amp; Al Noor Solar Traders, Multan
                                </p>
                                <div style="display:flex;gap:7px;flex-wrap:wrap;">
                                    <span style="background:rgba(77,163,255,0.15);color:#7DC8FF;border:1px solid rgba(77,163,255,0.25);border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700;">⚡ MSc Electrical Power</span>
                                    <span style="background:rgba(0,217,126,0.12);color:#4DFFA8;border:1px solid rgba(0,217,126,0.22);border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700;">🏆 400+ Projects</span>
                                    <span style="background:rgba(255,184,0,0.12);color:#FFD45C;border:1px solid rgba(255,184,0,0.22);border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700;">🏢 4 Offices S.Punjab</span>
                                </div>
                            </div>
                        </div>

                        <!-- SECTION 2: About / Profile Info -->
                        <div style="
                            background:rgba(255,255,255,0.05);
                            border:1px solid rgba(255,255,255,0.1);
                            border-radius:16px;
                            padding:20px 18px;
                            margin-bottom:20px;
                        ">
                            <div style="color:rgba(255,255,255,0.45);font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">
                                👤 Profile
                            </div>
                            <p style="color:rgba(255,255,255,0.82);font-size:14px;line-height:1.85;margin:0 0 12px;">
                                <strong style="color:white;">Engineer Muhammad Hamid</strong> is the CEO and Founder of
                                <strong style="color:#7DC8FF;">Al Noor Solar Energy (ASE)</strong> and
                                <strong style="color:#7DC8FF;">Al Noor Solar Traders</strong> — the biggest Solar Company
                                of South Punjab, operating <strong style="color:#FFD45C;">four offices</strong> across the region
                                and dealing in all types of solar products in Pakistan.
                            </p>
                            <p style="color:rgba(255,255,255,0.72);font-size:14px;line-height:1.85;margin:0 0 12px;">
                                He holds an <strong style="color:white;">MSc in Electrical Power Engineering (2017)</strong> and
                                began his career at <strong style="color:white;">NTDC Multan in 2015</strong> as an Electrical Engineer.
                                He then joined <strong style="color:white;">Jaffer Brothers Group</strong> as Regional Manager Operations
                                for South Punjab in 2017, where he successfully completed
                                <strong style="color:#4DFFA8;">400+ Agricultural Solar Projects</strong> under the Punjab Agriculture Department's
                                high-efficiency irrigation solarization program.
                            </p>
                            <p style="color:rgba(255,255,255,0.72);font-size:14px;line-height:1.85;margin:0;">
                                He has also served as <strong style="color:white;">Assistant Manager at Punjab Energy Department</strong>,
                                <strong style="color:white;">General Manager at Zonergy Multan</strong>, Trainee Engineer at Wajedo Inspection,
                                and former Engineer at <strong style="color:white;">NFC Institute of Engineering &amp; Technology</strong>.
                            </p>
                        </div>

                        <!-- SECTION 3: CEO Message -->
                        <div style="
                            background:rgba(255,255,255,0.06);
                            backdrop-filter:blur(12px);
                            border:1px solid rgba(255,255,255,0.12);
                            border-radius:16px;
                            padding:22px 18px 18px;
                            position:relative;
                            margin-bottom:24px;
                        ">
                            <div style="
                                position:absolute;top:-14px;left:20px;
                                width:30px;height:30px;border-radius:50%;
                                background:linear-gradient(135deg,#FFB800,#FF6A00);
                                display:flex;align-items:center;justify-content:center;
                                font-size:14px;box-shadow:0 4px 12px rgba(255,184,0,0.45);
                            ">💬</div>

                            <div style="color:rgba(255,255,255,0.42);font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">
                                Message from the CEO
                            </div>
                            <p style="
                                color:rgba(255,255,255,0.9);
                                font-size:15px;
                                line-height:1.85;
                                font-style:italic;
                                margin:0 0 18px;
                            ">
                                "My vision is to promote Solar &amp; Renewable Energy across Pakistan and to facilitate every
                                citizen — whether in a home, office, or industry — to break free from rising electricity bills
                                while reducing carbon emissions. At Al Noor Solar Energy, we don't just sell products;
                                we deliver high-quality, reliable solar solutions that are affordable for every Pakistani family.
                                Together, we are building a cleaner, brighter, and more energy-independent future — one
                                installation at a time."
                            </p>
                            <div style="display:flex;align-items:center;gap:10px;border-top:1px solid rgba(255,255,255,0.1);padding-top:14px;">
                                <div style="width:34px;height:34px;border-radius:10px;background:rgba(77,163,255,0.18);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;">✍️</div>
                                <div>
                                    <div style="color:white;font-weight:800;font-size:14px;">Engr. Muhammad Hamid</div>
                                    <div style="color:rgba(255,255,255,0.45);font-size:11px;margin-top:1px;">CEO &amp; Founder — Al Noor Solar Energy (ASE)</div>
                                </div>
                            </div>
                        </div>

                        <!-- SECTION 4: Career Timeline -->
                        <div>
                            <div style="color:rgba(255,255,255,0.42);font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:13px;">
                                📅 Career Highlights
                            </div>
                            <div style="display:flex;flex-direction:column;gap:9px;">
                                ${[
                                    { icon:'🎓', year:'2015',    title:'NTDC Multan',                    role:'Electrical Engineer — Started His Professional Journey' },
                                    { icon:'🔧', year:'',        title:'Wajedo Inspection',              role:'Trainee Engineer' },
                                    { icon:'🏫', year:'',        title:'NFC Institute of Engg & Tech',   role:'Former Engineer' },
                                    { icon:'⚙️', year:'',        title:'Punjab Energy Department',       role:'Assistant Manager — Government Energy Sector' },
                                    { icon:'🌞', year:'',        title:'Zonergy Multan',                 role:'General Manager' },
                                    { icon:'🏭', year:'2017',    title:'Jaffer Brothers Group',          role:'Regional Manager Operations, South Punjab' },
                                    { icon:'🌱', year:'2017–20', title:'Punjab Agriculture Dept.',       role:'Completed 400+ Agricultural Solar Solarization Projects' },
                                    { icon:'🏆', year:'Now',     title:'Al Noor Solar Energy (ASE)',     role:'CEO & Founder — Biggest Solar Company of South Punjab' },
                                ].map((item, i) => `
                                <div style="
                                    display:flex;align-items:flex-start;gap:11px;
                                    background:${i === 7 ? 'rgba(255,184,0,0.07)' : 'rgba(255,255,255,0.04)'};
                                    border:1px solid ${i === 7 ? 'rgba(255,184,0,0.3)' : 'rgba(255,255,255,0.07)'};
                                    border-radius:12px;padding:10px 13px;
                                ">
                                    <div style="font-size:17px;flex-shrink:0;margin-top:1px;">${item.icon}</div>
                                    <div style="flex:1;min-width:0;">
                                        <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
                                            <span style="color:white;font-weight:700;font-size:13px;">${item.title}</span>
                                            ${item.year ? `<span style="background:rgba(77,163,255,0.18);color:#7DC8FF;border-radius:6px;padding:1px 7px;font-size:10px;font-weight:700;">${item.year}</span>` : ''}
                                        </div>
                                        <div style="color:rgba(255,255,255,0.48);font-size:12px;margin-top:2px;">${item.role}</div>
                                    </div>
                                </div>`).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- ══════════════════════════════════════
                         LIVE CONTACT + MAP
                    ══════════════════════════════════════ -->
                    <div class="contact-map-box">
                        <div style="background:#fff;padding:32px 24px;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #eef2ff;">
                            <h3 style="color:var(--dark-blue);margin:0 0 20px;font-size:18px;font-weight:800;">📍 Contact Us</h3>
                            <div style="display:flex;flex-direction:column;gap:12px;">

                                <!-- Address -->
                                <div style="display:flex;align-items:flex-start;gap:12px;padding:14px;background:#FFF7F7;border-radius:14px;border:1px solid #FFE4E4;">
                                    <div style="width:38px;height:38px;border-radius:11px;background:#FEE2E2;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:17px;">📍</div>
                                    <div>
                                        <div style="font-size:10px;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;">Address</div>
                                        <div style="font-size:13.5px;color:#333;line-height:1.55;">155-A, Opposite Bank Alfalah,<br>Model Town Chowk, Multan, Pakistan</div>
                                        <a href="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3447.4686612912637!2d71.51273697556067!3d30.223709074833838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e0!3m2!1sen!2s!4v1774426713494!5m2!1sen!2s" target="_blank" rel="noopener"
                                           aria-label="Open location in Google Maps"
                                           style="display:inline-flex;align-items:center;gap:5px;margin-top:7px;font-size:12px;font-weight:700;color:var(--primary-blue);text-decoration:none;background:#EFF6FF;padding:4px 10px;border-radius:8px;">
                                            🗺️ Open in Maps
                                        </a>
                                    </div>
                                </div>

                                <!-- Phone -->
                                <a href="tel:03006771013" style="text-decoration:none;" aria-label="Call Al Noor Solar Energy">
                                    <div style="display:flex;align-items:center;gap:12px;padding:14px;background:#F0F7FF;border-radius:14px;border:1px solid #DBEAFE;cursor:pointer;transition:background .2s;">
                                        <div style="width:38px;height:38px;border-radius:11px;background:#DBEAFE;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:17px;">📞</div>
                                        <div style="flex:1;">
                                            <div style="font-size:10px;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;">Call Now</div>
                                            <div style="font-size:16px;color:#1D4ED8;font-weight:800;">0300-6771013</div>
                                        </div>
                                        <div style="font-size:20px;color:#1D4ED8;">→</div>
                                    </div>
                                </a>

                                <!-- WhatsApp -->
                                <a href="https://wa.me/923006771013" target="_blank" rel="noopener" style="text-decoration:none;" aria-label="Chat on WhatsApp">
                                    <div style="display:flex;align-items:center;gap:12px;padding:14px;background:#F0FDF4;border-radius:14px;border:1px solid #BBF7D0;cursor:pointer;transition:background .2s;">
                                        <div style="width:38px;height:38px;border-radius:11px;background:#DCFCE7;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:17px;">💬</div>
                                        <div style="flex:1;">
                                            <div style="font-size:10px;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;">WhatsApp</div>
                                            <div style="font-size:15px;color:#15803D;font-weight:800;">Chat on WhatsApp</div>
                                        </div>
                                        <div style="font-size:20px;color:#15803D;">→</div>
                                    </div>
                                </a>

                                <!-- Email -->
                                <a href="mailto:alnoorse786@gmail.com" style="text-decoration:none;" aria-label="Email Al Noor Solar Energy">
                                    <div style="display:flex;align-items:center;gap:12px;padding:14px;background:#F5F3FF;border-radius:14px;border:1px solid #DDD6FE;cursor:pointer;transition:background .2s;">
                                        <div style="width:38px;height:38px;border-radius:11px;background:#EDE9FE;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:17px;">✉️</div>
                                        <div style="flex:1;">
                                            <div style="font-size:10px;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;">Email</div>
                                            <div style="font-size:13px;color:#6D28D9;font-weight:700;">alnoorse786@gmail.com</div>
                                        </div>
                                        <div style="font-size:20px;color:#6D28D9;">→</div>
                                    </div>
                                </a>

                                <!-- Business Hours -->
                                <div style="display:flex;align-items:center;gap:12px;padding:14px;background:#FFFBEB;border-radius:14px;border:1px solid #FDE68A;">
                                    <div style="width:38px;height:38px;border-radius:11px;background:#FEF3C7;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:17px;">🕐</div>
                                    <div>
                                        <div style="font-size:10px;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;">Business Hours</div>
                                        <div style="font-size:14px;color:#92400E;font-weight:700;">Mon–Thu, Sat–Sun: 09:00 AM – 07:00 PM</div>
                                        <div style="font-size:12px;color:#DC2626;font-weight:700;margin-top:2px;">❌ Friday: Closed</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        
                        <!-- Branch 1 Section -->
                        <div style="margin-top: 40px; margin-bottom: 40px;">
                            <h3 style="color: #0056b3; font-family: sans-serif; margin-bottom: 10px;">
                                Branch 1: 155 A Model Town Multan
                            </h3>
                            <div class="map-container" style="width: 100%;">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.2435423851084!2d71.4820!3d30.2012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDEyJzA0LjMiTiA3McKwMjgnNTUuMiJF!5e0!3m2!1sen!2spk!4v1620000000000!5m2!1sen!2spk"
                                    width="100%" height="350" title="Branch 1 Location Map"
                                    style="border:0; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.1); width: 100%; max-width: 100%; display: block;"
                                    allowfullscreen="" loading="lazy">
                                </iframe>
                            </div>
                        </div>

                        <!-- Branch 2 Section -->
                        <div style="margin-bottom: 40px;">
                            <h3 style="color: #0056b3; font-family: sans-serif; margin-bottom: 10px;">
                                Branch 2: MA Jinah road near Hascol Pump Multan
                            </h3>
                            <div class="map-container" style="width: 100%;">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3447.4686612912637!2d71.51273697556067!3d30.223709074833838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e0!3m2!1sen!2s!4v1774426713494!5m2!1sen!2s"
                                    width="100%" height="350" title="Branch 2 Location Map"
                                    style="border:0; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.1); width: 100%; max-width: 100%; display: block;"
                                    allowfullscreen="" loading="lazy">
                                </iframe>
                            </div>
                        </div>
                    </div>

                </div>
            `;
            page.classList.add('active');
        }