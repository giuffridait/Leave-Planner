// src/lib/analytics.ts

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// REPLACE THIS with your actual Google Analytics Measurement ID
const GA_MEASUREMENT_ID = 'G-CQ0E2Y8NQQ';

export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
    console.log('📊 Event tracked:', eventName, eventParams); // Remove this line in production
  }
};

export const trackPageView = (path: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
    });
    console.log('📊 Page view:', path); // Remove this line in production
  }
};

// Calculator-specific tracking events
export const analytics = {
  // Landing page
  landingViewed: () => {
    trackEvent('landing_page_viewed', {
      event_category: 'engagement',
    });
  },

  calculatorStarted: () => {
    trackEvent('calculator_started', {
      event_category: 'engagement',
    });
  },

  // Calculator steps
  step1Completed: (data: { salary: number; leaveWeeks: number; paidPercent: number }) => {
    trackEvent('step_1_completed', {
      event_category: 'calculator',
      leave_weeks: data.leaveWeeks,
      paid_percent: data.paidPercent,
      // Don't track exact salary for privacy
    });
  },

  step2Completed: (totalExpenses: number) => {
    trackEvent('step_2_completed', {
      event_category: 'calculator',
      expense_range: totalExpenses > 5000 ? 'high' : totalExpenses > 3000 ? 'medium' : 'low',
    });
  },

  step3Completed: (data: { childcareType: string; returnOption: string }) => {
    trackEvent('step_3_completed', {
      event_category: 'calculator',
      childcare_type: data.childcareType,
      return_option: data.returnOption,
    });
  },

  // Results
  resultsViewed: (savingsNeeded: number) => {
    trackEvent('results_viewed', {
      event_category: 'calculator',
      value: Math.round(savingsNeeded / 1000) * 1000, // Round to nearest $1K for privacy
    });
  },

  scenarioCompared: (scenario: string) => {
    trackEvent('scenario_compared', {
      event_category: 'engagement',
      scenario_type: scenario,
    });
  },

  // User actions
  startOver: () => {
    trackEvent('start_over_clicked', {
      event_category: 'engagement',
    });
  },

  shareClicked: () => {
    trackEvent('share_clicked', {
      event_category: 'engagement',
    });
  },

  // Drop-off tracking
  stepAbandoned: (step: number) => {
    trackEvent('step_abandoned', {
      event_category: 'drop_off',
      step_number: step,
    });
  },

  // AI features (if you add them later)
  aiEstimateUsed: () => {
    trackEvent('ai_estimate_used', {
      event_category: 'ai_features',
    });
  },

  aiRecommendationsViewed: () => {
    trackEvent('ai_recommendations_viewed', {
      event_category: 'ai_features',
    });
  },
};