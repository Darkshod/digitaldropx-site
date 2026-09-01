/**
 * DigitalDropX Analytics
 * Simple, privacy-friendly analytics without Google Analytics
 * Tracks page views, clicks, and conversions
 */

(function() {
  'use strict';
  
  const ANALYTICS_KEY = 'digitaldropx_analytics';
  const API_ENDPOINT = 'https://api.github.com'; // Using GitHub as simple storage
  
  // Track page view
  function trackPageView() {
    const data = getStoredData();
    const page = window.location.pathname;
    const timestamp = new Date().toISOString();
    
    if (!data.pageViews[page]) {
      data.pageViews[page] = [];
    }
    
    data.pageViews[page].push({
      timestamp: timestamp,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`
    });
    
    // Keep only last 1000 views per page
    if (data.pageViews[page].length > 1000) {
      data.pageViews[page] = data.pageViews[page].slice(-1000);
    }
    
    storeData(data);
    
    // Log for debugging
    console.log('[Analytics] Page view:', page);
  }
  
  // Track click event
  function trackClick(category, label) {
    const data = getStoredData();
    const timestamp = new Date().toISOString();
    
    if (!data.clicks) {
      data.clicks = [];
    }
    
    data.clicks.push({
      timestamp: timestamp,
      category: category,
      label: label,
      page: window.location.pathname
    });
    
    // Keep only last 500 clicks
    if (data.clicks.length > 500) {
      data.clicks = data.clicks.slice(-500);
    }
    
    storeData(data);
    
    // Log for debugging
    console.log('[Analytics] Click:', category, label);
  }
  
  // Track conversion (purchase)
  function trackConversion(product, amount) {
    const data = getStoredData();
    const timestamp = new Date().toISOString();
    
    if (!data.conversions) {
      data.conversions = [];
    }
    
    data.conversions.push({
      timestamp: timestamp,
      product: product,
      amount: amount,
      page: window.location.pathname
    });
    
    storeData(data);
    
    // Log for debugging
    console.log('[Analytics] Conversion:', product, amount);
  }
  
  // Get stored data
  function getStoredData() {
    try {
      const stored = localStorage.getItem(ANALYTICS_KEY);
      return stored ? JSON.parse(stored) : {
        pageViews: {},
        clicks: [],
        conversions: [],
        firstVisit: new Date().toISOString()
      };
    } catch (e) {
      return {
        pageViews: {},
        clicks: [],
        conversions: [],
        firstVisit: new Date().toISOString()
      };
    }
  }
  
  // Store data
  function storeData(data) {
    try {
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[Analytics] Could not store data:', e);
    }
  }
  
  // Get analytics summary
  function getSummary() {
    const data = getStoredData();
    const summary = {
      totalPageViews: 0,
      uniquePages: Object.keys(data.pageViews).length,
      totalClicks: data.clicks ? data.clicks.length : 0,
      totalConversions: data.conversions ? data.conversions.length : 0,
      topPages: [],
      recentClicks: [],
      recentConversions: []
    };
    
    // Calculate page views
    for (const page in data.pageViews) {
      summary.totalPageViews += data.pageViews[page].length;
      summary.topPages.push({
        page: page,
        views: data.pageViews[page].length
      });
    }
    
    // Sort pages by views
    summary.topPages.sort((a, b) => b.views - a.views);
    
    // Get recent activity
    if (data.clicks) {
      summary.recentClicks = data.clicks.slice(-10);
    }
    if (data.conversions) {
      summary.recentConversions = data.conversions.slice(-10);
    }
    
    return summary;
  }
  
  // Auto-track page view
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }
  
  // Add click tracking to CTA buttons
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a, button');
    if (!target) return;
    
    // Track product purchases
    if (target.href && target.href.includes('paypal.me')) {
      const productCard = target.closest('.product, .pricing-card, .hero');
      const productName = productCard ? 
        (productCard.querySelector('h3') || productCard.querySelector('h1') || {}).textContent || 'Unknown' : 
        'Unknown';
      trackClick('purchase', productName);
    }
    
    // Track navigation
    if (target.classList.contains('nav-link') || target.closest('.nav-links')) {
      trackClick('navigation', target.textContent.trim());
    }
    
    // Track email signup
    if (target.classList.contains('email-btn') || target.closest('.email-form')) {
      trackClick('email', 'signup');
    }
  });
  
  // Expose analytics functions
  window.DigitalDropXAnalytics = {
    trackPageView: trackPageView,
    trackClick: trackClick,
    trackConversion: trackConversion,
    getSummary: getSummary
  };
  
})();
