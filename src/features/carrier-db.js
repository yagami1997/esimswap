/**
 * Carrier identification database.
 * Maps SM-DP+ server domains to carrier names and regions.
 * Sources: public eSIM documentation and carrier announcements.
 * Extend this list as new carriers are confirmed.
 */

/** @typedef {{ name: string, region: string }} CarrierInfo */

/**
 * Exact domain matches take priority over suffix patterns.
 * @type {Record<string, CarrierInfo>}
 */
const EXACT = {
  // United States
  'lpa.fi.google.com': { name: 'Google Fi', region: 'US' },
  'consumer.idemia.io': { name: 'T-Mobile US', region: 'US' },
  'lpa.truphone.com': { name: 'Truphone', region: 'Global' },
  'als.esim.mobi': { name: 'Airalo', region: 'Global' },
  'lpa.airalo.com': { name: 'Airalo', region: 'Global' },
  'smdp.io': { name: 'GigSky', region: 'Global' },
  'uicc.gds.apple.com': { name: 'Apple (test)', region: 'Global' },

  // China
  'esim.chinatelecom.cn': { name: '中国电信', region: 'CN' },
  'esim.10010.com': { name: '中国联通', region: 'CN' },
  'esim.10086.cn': { name: '中国移动', region: 'CN' },

  // Japan
  'lpa.esim.docomo.ne.jp': { name: 'NTT Docomo', region: 'JP' },
  'lpa.esim.softbank.jp': { name: 'SoftBank', region: 'JP' },
  'lpa.esim.kddi.com': { name: 'KDDI (au)', region: 'JP' },
  'lpa.esim.rakuten.co.jp': { name: 'Rakuten Mobile', region: 'JP' },

  // South Korea
  'lpa.sktelecom.com': { name: 'SK Telecom', region: 'KR' },
  'lpa.kt.com': { name: 'KT Corporation', region: 'KR' },
  'lpa.lguplus.com': { name: 'LG U+', region: 'KR' },

  // UK
  'lpa.ee.co.uk': { name: 'EE UK', region: 'GB' },
  'lpa.o2.co.uk': { name: 'O2 UK', region: 'GB' },
  'lpa.three.co.uk': { name: 'Three UK', region: 'GB' },
  'lpa.vodafone.co.uk': { name: 'Vodafone UK', region: 'GB' },

  // Germany
  'lpa.telekom.de': { name: 'Telekom DE', region: 'DE' },
  'lpa.o2online.de': { name: 'O2 DE', region: 'DE' },
  'lpa.vodafone.de': { name: 'Vodafone DE', region: 'DE' },

  // Australia
  'lpa.telstra.com': { name: 'Telstra', region: 'AU' },
  'lpa.optus.com.au': { name: 'Optus', region: 'AU' },

  // Canada
  'lpa.bell.ca': { name: 'Bell Canada', region: 'CA' },
  'lpa.rogers.com': { name: 'Rogers', region: 'CA' },
  'lpa.telus.com': { name: 'Telus', region: 'CA' },

  // Singapore
  'lpa.singtel.com': { name: 'Singtel', region: 'SG' },
  'lpa.starhub.com': { name: 'StarHub', region: 'SG' },
  'lpa.circles.life': { name: 'Circles.Life', region: 'SG' },

  // Hong Kong
  'lpa.hkt.com': { name: 'HKT (PCCW)', region: 'HK' },
  '3hk.lpa.io': { name: '3 Hong Kong', region: 'HK' },
  'lpa.smartone.com': { name: 'SmarTone', region: 'HK' },

  // Taiwan
  'lpa.cht.com.tw': { name: 'Chunghwa Telecom', region: 'TW' },
  'lpa.taiwanmobile.com': { name: 'Taiwan Mobile', region: 'TW' },
  'lpa.fareastone.com.tw': { name: 'Far EasTone', region: 'TW' },

  // UAE
  'lpa.etisalat.ae': { name: 'Etisalat (e&)', region: 'AE' },
  'lpa.du.ae': { name: 'du', region: 'AE' },

  // Saudi Arabia
  'lpa.stc.com.sa': { name: 'STC', region: 'SA' },
  'lpa.mobily.com.sa': { name: 'Mobily', region: 'SA' },

  // France
  'lpa.orange.fr': { name: 'Orange FR', region: 'FR' },
  'lpa.sfr.fr': { name: 'SFR', region: 'FR' },
  'lpa.bouyguestelecom.fr': { name: 'Bouygues Telecom', region: 'FR' },
};

/**
 * Suffix patterns: match any subdomain of a known eSIM provider.
 * Listed in priority order (most specific first).
 * @type {Array<[string, CarrierInfo]>}
 */
const SUFFIX_PATTERNS = [
  ['.idemia.io', { name: 'T-Mobile (Idemia)', region: 'US' }],
  ['.gdsb.net', { name: 'Thales/Gemalto carrier', region: 'Global' }],
  ['.gemalto.com', { name: 'Thales/Gemalto carrier', region: 'Global' }],
  ['.gi-de.com', { name: 'G+D carrier', region: 'Global' }],
  ['.valid.com', { name: 'Valid carrier', region: 'Global' }],
  ['.truphone.com', { name: 'Truphone', region: 'Global' }],
  ['.airalo.com', { name: 'Airalo', region: 'Global' }],
];

/**
 * Look up a carrier by SM-DP+ address.
 * @param {string} smdpAddress
 * @returns {CarrierInfo | null}
 */
export function lookup(smdpAddress) {
  if (!smdpAddress || typeof smdpAddress !== 'string') return null;
  const domain = smdpAddress.trim().toLowerCase();
  if (!domain) return null;

  // 1. Exact match
  if (EXACT[domain]) return EXACT[domain];

  // 2. Suffix pattern match
  for (const [suffix, carrier] of SUFFIX_PATTERNS) {
    if (domain.endsWith(suffix)) return carrier;
  }

  return null;
}
