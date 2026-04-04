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

  // ── Global Travel eSIM Providers ──────────────────────────────────────────
  'lpa.airalo.com':        { name: 'Airalo',       region: 'Global' },
  'als.esim.mobi':         { name: 'Airalo',       region: 'Global' },
  'lpa.truphone.com':      { name: 'Truphone',     region: 'Global' },
  'smdp.io':               { name: 'GigSky',       region: 'Global' },
  'lpa.holafly.com':       { name: 'Holafly',      region: 'Global' },
  'lpa.ubigi.com':         { name: 'Ubigi',        region: 'Global' },
  'lpa.flexiroam.com':     { name: 'Flexiroam',    region: 'Global' },
  'lpa.saily.com':         { name: 'Saily',        region: 'Global' },
  'lpa.bnesim.com':        { name: 'BNESIM',       region: 'Global' },
  'lpa.yesim.app':         { name: 'Yesim',        region: 'Global' },
  'lpa.jetpac.io':         { name: 'Jetpac',       region: 'Global' },
  'lpa.getnomad.app':      { name: 'Nomad',        region: 'Global' },
  'lpa.roamless.com':      { name: 'Roamless',     region: 'Global' },
  'lpa.esimdb.com':        { name: 'eSIMdb',       region: 'Global' },
  'uicc.gds.apple.com':    { name: 'Apple (test)', region: 'Global' },

  // ── United States ─────────────────────────────────────────────────────────
  'lpa.fi.google.com':     { name: 'Google Fi',       region: 'US' },
  'consumer.idemia.io':    { name: 'T-Mobile US',     region: 'US' },
  'oasis.pod.att.com':     { name: 'AT&T',            region: 'US' },
  'smdp.vzwentp.com':      { name: 'Verizon',         region: 'US' },
  'lpa.dish.com':          { name: 'Boost Mobile',    region: 'US' },
  'lpa.xfinity.com':       { name: 'Xfinity Mobile',  region: 'US' },

  // ── Canada ────────────────────────────────────────────────────────────────
  'lpa.bell.ca':           { name: 'Bell Canada', region: 'CA' },
  'lpa.rogers.com':        { name: 'Rogers',      region: 'CA' },
  'lpa.telus.com':         { name: 'Telus',       region: 'CA' },
  'lpa.freedommobile.ca':  { name: 'Freedom Mobile', region: 'CA' },
  'lpa.videotron.com':     { name: 'Vidéotron',   region: 'CA' },

  // ── Mexico ────────────────────────────────────────────────────────────────
  'lpa.telcel.com':        { name: 'Telcel',           region: 'MX' },
  'lpa.att.com.mx':        { name: 'AT&T Mexico',      region: 'MX' },
  'lpa.movistar.com.mx':   { name: 'Movistar Mexico',  region: 'MX' },

  // ── Brazil ────────────────────────────────────────────────────────────────
  'lpa.claro.com.br':      { name: 'Claro Brazil', region: 'BR' },
  'lpa.tim.com.br':        { name: 'TIM Brazil',   region: 'BR' },
  'lpa.vivo.com.br':       { name: 'Vivo',         region: 'BR' },

  // ── Colombia / Chile / Argentina ──────────────────────────────────────────
  'lpa.claro.com.co':      { name: 'Claro Colombia',  region: 'CO' },
  'lpa.movistar.com.co':   { name: 'Movistar Colombia', region: 'CO' },
  'lpa.claro.cl':          { name: 'Claro Chile',     region: 'CL' },
  'lpa.movistar.cl':       { name: 'Movistar Chile',  region: 'CL' },
  'lpa.claro.com.ar':      { name: 'Claro Argentina', region: 'AR' },
  'lpa.movistar.com.ar':   { name: 'Movistar Argentina', region: 'AR' },

  // ── United Kingdom ────────────────────────────────────────────────────────
  'lpa.ee.co.uk':          { name: 'EE',              region: 'GB' },
  'lpa.o2.co.uk':          { name: 'O2 UK',           region: 'GB' },
  'lpa.three.co.uk':       { name: 'Three UK',        region: 'GB' },
  'lpa.vodafone.co.uk':    { name: 'Vodafone UK',     region: 'GB' },

  // ── Germany ───────────────────────────────────────────────────────────────
  'lpa.telekom.de':        { name: 'Telekom DE',      region: 'DE' },
  'lpa.o2online.de':       { name: 'O2 DE',           region: 'DE' },
  'lpa.vodafone.de':       { name: 'Vodafone DE',     region: 'DE' },

  // ── France ────────────────────────────────────────────────────────────────
  'lpa.orange.fr':         { name: 'Orange FR',       region: 'FR' },
  'lpa.sfr.fr':            { name: 'SFR',             region: 'FR' },
  'lpa.bouyguestelecom.fr': { name: 'Bouygues Telecom', region: 'FR' },
  'lpa.free.fr':           { name: 'Free Mobile',     region: 'FR' },

  // ── Spain ─────────────────────────────────────────────────────────────────
  'lpa.movistar.es':       { name: 'Movistar ES',     region: 'ES' },
  'lpa.orange.es':         { name: 'Orange ES',       region: 'ES' },
  'lpa.vodafone.es':       { name: 'Vodafone ES',     region: 'ES' },
  'lpa.yoigo.com':         { name: 'Yoigo',           region: 'ES' },

  // ── Italy ─────────────────────────────────────────────────────────────────
  'lpa.tim.it':            { name: 'TIM Italy',       region: 'IT' },
  'lpa.vodafone.it':       { name: 'Vodafone IT',     region: 'IT' },
  'lpa.windtre.it':        { name: 'WindTre',         region: 'IT' },
  'lpa.iliad.it':          { name: 'Iliad Italy',     region: 'IT' },

  // ── Netherlands ───────────────────────────────────────────────────────────
  'lpa.kpn.com':           { name: 'KPN',             region: 'NL' },
  'lpa.t-mobile.nl':       { name: 'T-Mobile NL',     region: 'NL' },
  'lpa.vodafone.nl':       { name: 'Vodafone NL',     region: 'NL' },

  // ── Switzerland ───────────────────────────────────────────────────────────
  'lpa.swisscom.ch':       { name: 'Swisscom',        region: 'CH' },
  'lpa.salt.ch':           { name: 'Salt Mobile',     region: 'CH' },
  'lpa.sunrise.ch':        { name: 'Sunrise',         region: 'CH' },

  // ── Austria ───────────────────────────────────────────────────────────────
  'lpa.a1.net':            { name: 'A1 Austria',      region: 'AT' },
  'lpa.t-mobile.at':       { name: 'T-Mobile AT',     region: 'AT' },

  // ── Belgium ───────────────────────────────────────────────────────────────
  'lpa.proximus.be':       { name: 'Proximus',        region: 'BE' },
  'lpa.base.be':           { name: 'Base',            region: 'BE' },

  // ── Portugal ──────────────────────────────────────────────────────────────
  'lpa.meo.pt':            { name: 'MEO',             region: 'PT' },
  'lpa.nos.pt':            { name: 'NOS',             region: 'PT' },

  // ── Ireland ───────────────────────────────────────────────────────────────
  'lpa.three.ie':          { name: 'Three IE',        region: 'IE' },
  'lpa.eir.ie':            { name: 'eir',             region: 'IE' },
  'lpa.vodafone.ie':       { name: 'Vodafone IE',     region: 'IE' },

  // ── Scandinavia ───────────────────────────────────────────────────────────
  'lpa.telia.se':          { name: 'Telia SE',        region: 'SE' },
  'lpa.tele2.se':          { name: 'Tele2 SE',        region: 'SE' },
  'lpa.telenor.no':        { name: 'Telenor NO',      region: 'NO' },
  'lpa.telia.no':          { name: 'Telia NO',        region: 'NO' },
  'lpa.tdc.dk':            { name: 'TDC DK',          region: 'DK' },
  'lpa.telenor.dk':        { name: 'Telenor DK',      region: 'DK' },
  'lpa.elisa.fi':          { name: 'Elisa FI',        region: 'FI' },
  'lpa.telia.fi':          { name: 'Telia FI',        region: 'FI' },

  // ── Poland / Czech Republic ───────────────────────────────────────────────
  'lpa.play.pl':           { name: 'Play',            region: 'PL' },
  'lpa.orange.pl':         { name: 'Orange PL',       region: 'PL' },
  'lpa.t-mobile.pl':       { name: 'T-Mobile PL',     region: 'PL' },
  'lpa.o2.cz':             { name: 'O2 CZ',           region: 'CZ' },
  'lpa.t-mobile.cz':       { name: 'T-Mobile CZ',     region: 'CZ' },

  // ── Turkey ────────────────────────────────────────────────────────────────
  'lpa.turkcell.com.tr':   { name: 'Turkcell',        region: 'TR' },
  'lpa.vodafone.com.tr':   { name: 'Vodafone TR',     region: 'TR' },
  'lpa.turktelekom.com.tr': { name: 'Türk Telekom',   region: 'TR' },

  // ── Greece ────────────────────────────────────────────────────────────────
  'lpa.cosmote.gr':        { name: 'Cosmote GR',      region: 'GR' },
  'lpa.vodafone.gr':       { name: 'Vodafone GR',     region: 'GR' },

  // ── China ─────────────────────────────────────────────────────────────────
  'esim.chinatelecom.cn':  { name: '中国电信',          region: 'CN' },
  'esim.10010.com':        { name: '中国联通',          region: 'CN' },
  'esim.10086.cn':         { name: '中国移动',          region: 'CN' },

  // ── Japan ─────────────────────────────────────────────────────────────────
  'lpa.esim.docomo.ne.jp': { name: 'NTT Docomo',      region: 'JP' },
  'lpa.esim.softbank.jp':  { name: 'SoftBank',        region: 'JP' },
  'lpa.esim.kddi.com':     { name: 'KDDI (au)',       region: 'JP' },
  'lpa.esim.rakuten.co.jp': { name: 'Rakuten Mobile', region: 'JP' },

  // ── South Korea ───────────────────────────────────────────────────────────
  'lpa.sktelecom.com':     { name: 'SK Telecom',      region: 'KR' },
  'lpa.kt.com':            { name: 'KT Corporation',  region: 'KR' },
  'lpa.lguplus.com':       { name: 'LG U+',           region: 'KR' },

  // ── India ─────────────────────────────────────────────────────────────────
  'lpa.jio.com':           { name: 'Jio',             region: 'IN' },
  'lpa.airtel.in':         { name: 'Airtel India',    region: 'IN' },
  'lpa.vi.in':             { name: 'Vi (Vodafone Idea)', region: 'IN' },

  // ── Southeast Asia ────────────────────────────────────────────────────────
  'lpa.ais.th':            { name: 'AIS Thailand',    region: 'TH' },
  'lpa.true.th':           { name: 'True Move H',     region: 'TH' },
  'lpa.dtac.co.th':        { name: 'DTAC Thailand',   region: 'TH' },
  'lpa.celcom.com.my':     { name: 'Celcom',          region: 'MY' },
  'lpa.maxis.com.my':      { name: 'Maxis',           region: 'MY' },
  'lpa.digi.com.my':       { name: 'Digi',            region: 'MY' },
  'lpa.telkomsel.com':     { name: 'Telkomsel',       region: 'ID' },
  'lpa.indosatooredoo.com': { name: 'Indosat Ooredoo', region: 'ID' },
  'lpa.globe.com.ph':      { name: 'Globe Philippines', region: 'PH' },
  'lpa.smart.com.ph':      { name: 'Smart PH',        region: 'PH' },
  'lpa.viettel.vn':        { name: 'Viettel',         region: 'VN' },
  'lpa.mobifone.vn':       { name: 'MobiFone',        region: 'VN' },
  'lpa.grameenphone.com':  { name: 'Grameenphone',    region: 'BD' },

  // ── Singapore ─────────────────────────────────────────────────────────────
  'lpa.singtel.com':       { name: 'Singtel',         region: 'SG' },
  'lpa.starhub.com':       { name: 'StarHub',         region: 'SG' },
  'lpa.circles.life':      { name: 'Circles.Life',    region: 'SG' },

  // ── Hong Kong ─────────────────────────────────────────────────────────────
  'lpa.hkt.com':           { name: 'HKT (PCCW)',           region: 'HK' },
  '3hk.lpa.io':            { name: '3 Hong Kong',          region: 'HK' },
  'lpa.smartone.com':      { name: 'SmarTone HK',          region: 'HK' },
  'lpa.cmhk.com':          { name: 'China Mobile HK',      region: 'HK' },
  'lpa.chinaunicom.com.hk': { name: 'China Unicom HK',    region: 'HK' },
  'lpa.csl.com.hk':        { name: 'CSL',                  region: 'HK' },
  'lpa.1010.com.hk':       { name: 'CITIC Telecom 1O1O',   region: 'HK' },

  // ── Macau ─────────────────────────────────────────────────────────────────
  'lpa.ctm.net':           { name: 'CTM Macau',            region: 'MO' },
  'smdp.ctm.net':          { name: 'CTM Macau',            region: 'MO' },
  'esim.ctm.net':          { name: 'CTM Macau',            region: 'MO' },
  'lpa.chinatelecom-mo.com':  { name: 'China Telecom Macau', region: 'MO' },
  'esim.chinatelecom-mo.com': { name: 'China Telecom Macau', region: 'MO' },
  'ecprsp.eastcompeace.com':  { name: 'China Telecom Macau', region: 'MO' },
  'lpa.smartone.mo':       { name: 'SmarTone Macau',       region: 'MO' },
  'lpa.three.com.mo':      { name: '3 Macau',              region: 'MO' },

  // ── Taiwan ────────────────────────────────────────────────────────────────
  'lpa.cht.com.tw':        { name: 'Chunghwa Telecom',     region: 'TW' },
  'lpa.taiwanmobile.com':  { name: 'Taiwan Mobile',        region: 'TW' },
  'lpa.fareastone.com.tw': { name: 'Far EasTone',          region: 'TW' },
  'lpa.aptg.com.tw':       { name: 'Asia Pacific Telecom', region: 'TW' },

  // ── Middle East ───────────────────────────────────────────────────────────
  'lpa.etisalat.ae':       { name: 'Etisalat (e&)',   region: 'AE' },
  'lpa.du.ae':             { name: 'du',              region: 'AE' },
  'lpa.stc.com.sa':        { name: 'STC',             region: 'SA' },
  'lpa.mobily.com.sa':     { name: 'Mobily',          region: 'SA' },
  'lpa.ooredoo.qa':        { name: 'Ooredoo Qatar',   region: 'QA' },
  'lpa.vodafone.com.qa':   { name: 'Vodafone QA',     region: 'QA' },
  'lpa.ooredoo.kw':        { name: 'Ooredoo Kuwait',  region: 'KW' },
  'lpa.zain.com.kw':       { name: 'Zain Kuwait',     region: 'KW' },
  'lpa.batelco.com':       { name: 'Batelco Bahrain', region: 'BH' },
  'lpa.zain.jo':           { name: 'Zain Jordan',     region: 'JO' },
  'lpa.cellcom.co.il':     { name: 'Cellcom Israel',  region: 'IL' },
  'lpa.partner.co.il':     { name: 'Partner IL',      region: 'IL' },
  'lpa.hot.net.il':        { name: 'Hot Mobile IL',   region: 'IL' },
  'lpa.vodafone.com.eg':   { name: 'Vodafone Egypt',  region: 'EG' },
  'lpa.orange.eg':         { name: 'Orange Egypt',    region: 'EG' },

  // ── Australia ─────────────────────────────────────────────────────────────
  'lpa.telstra.com':       { name: 'Telstra',         region: 'AU' },
  'lpa.optus.com.au':      { name: 'Optus',           region: 'AU' },
  'lpa.tpg.com.au':        { name: 'TPG',             region: 'AU' },
  'lpa.vodafone.com.au':   { name: 'Vodafone AU',     region: 'AU' },

  // ── New Zealand ───────────────────────────────────────────────────────────
  'lpa.spark.co.nz':       { name: 'Spark NZ',        region: 'NZ' },
  'lpa.one.nz':            { name: 'One NZ',          region: 'NZ' },
  'lpa.2degrees.nz':       { name: '2degrees',        region: 'NZ' },

  // ── Africa ────────────────────────────────────────────────────────────────
  'lpa.vodacom.co.za':     { name: 'Vodacom SA',      region: 'ZA' },
  'lpa.mtn.co.za':         { name: 'MTN South Africa', region: 'ZA' },
  'lpa.cell-c.co.za':      { name: 'Cell C',          region: 'ZA' },
  'lpa.safaricom.co.ke':   { name: 'Safaricom',       region: 'KE' },
  'lpa.mtn.com.ng':        { name: 'MTN Nigeria',     region: 'NG' },
  'lpa.airtel.com.ng':     { name: 'Airtel Nigeria',  region: 'NG' },
  'lpa.maroctelecom.ma':   { name: 'Maroc Telecom',   region: 'MA' },
  'lpa.orange.ma':         { name: 'Orange Morocco',  region: 'MA' },
};

/**
 * Suffix patterns: match any subdomain of a known eSIM infrastructure provider.
 * Listed in priority order (most specific first).
 * @type {Array<[string, CarrierInfo]>}
 */
const SUFFIX_PATTERNS = [
  // Infrastructure providers — catch carrier subdomains not in EXACT list
  ['.idemia.io',    { name: 'IDEMIA carrier',         region: 'Global' }],
  ['.gdsb.net',     { name: 'Thales carrier',         region: 'Global' }],
  ['.gemalto.com',  { name: 'Thales/Gemalto carrier', region: 'Global' }],
  ['.gi-de.com',    { name: 'G+D carrier',            region: 'Global' }],
  ['.valid.com',    { name: 'Valid carrier',           region: 'Global' }],
  ['.workz.com',    { name: 'Workz carrier',          region: 'Global' }],
  ['.bsim.cloud',        { name: 'BSIM carrier',             region: 'Global' }],
  ['.eastcompeace.com',  { name: 'East ComPeace carrier',    region: 'Global' }],
  // Retail global providers
  ['.truphone.com', { name: 'Truphone',               region: 'Global' }],
  ['.airalo.com',   { name: 'Airalo',                 region: 'Global' }],
  ['.holafly.com',  { name: 'Holafly',                region: 'Global' }],
  ['.ubigi.com',    { name: 'Ubigi',                  region: 'Global' }],
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
