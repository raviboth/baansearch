import type { JobBoard, FilterState, TimePosted, SearchEngine } from './types';

// Technology search terms mapping (value -> search terms to use)
const TECHNOLOGY_SEARCH_TERMS: Record<string, string[]> = {
  'dotnet': ['.NET', 'ASP.NET', 'dotnet', '.NET Core'],
  'csharp': ['C#', 'csharp'],
  'cpp': ['C++', 'C/C++'],
  'javascript': ['JavaScript', 'JS', 'TypeScript', 'ES6'],
  'react': ['React', 'ReactJS', 'React.js'],
  'react-native': ['React Native'],
  'nextjs': ['Next.js', 'NextJS', 'Next'],
  'vue': ['Vue', 'Vue.js', 'VueJS', 'Nuxt'],
  'angular': ['Angular', 'AngularJS'],
  'nodejs': ['Node.js', 'NodeJS', 'Node'],
  'spring': ['Spring Boot', 'Spring Framework', 'Spring'],
  'go': ['Golang', 'Go developer', 'Go programming'],
  'mobile': ['iOS', 'Android', 'mobile developer', 'mobile engineer'],
  'flutter': ['Flutter', 'Dart'],
  'django': ['Django', 'Python Django'],
  'aws': ['AWS', 'Amazon Web Services'],
  'azure': ['Azure', 'Microsoft Azure'],
  'gcp': ['GCP', 'Google Cloud'],
  'kubernetes': ['Kubernetes', 'K8s'],
  'docker': ['Docker', 'containers'],
  'graphql': ['GraphQL', 'Apollo'],
  'python': ['Python'],
  'java': ['Java'],
  'rust': ['Rust'],
  'ruby': ['Ruby', 'Ruby on Rails', 'Rails'],
  'php': ['PHP', 'Laravel'],
  'kotlin': ['Kotlin'],
  'swift': ['Swift', 'iOS'],
  'scala': ['Scala'],
};

// Industry labels mapping
const INDUSTRY_LABELS: Record<string, string> = {
  'ai-ml': 'AI ML',
  'fintech': 'fintech',
  'healthtech': 'healthcare',
  'cybersecurity': 'cybersecurity',
  'gaming': 'gaming',
  'saas': 'SaaS',
  'ecommerce': 'ecommerce',
  'edtech': 'edtech',
  'climate': 'climate tech',
  'web3': 'blockchain web3',
};

// Country/location alternatives mapping
const LOCATION_ALTERNATIVES: Record<string, string[]> = {
  'us': ['US', 'USA', 'United States', 'United States of America'],
  'usa': ['US', 'USA', 'United States', 'United States of America'],
  'united states': ['US', 'USA', 'United States', 'United States of America'],
  'uk': ['UK', 'United Kingdom', 'Great Britain', 'Britain'],
  'united kingdom': ['UK', 'United Kingdom', 'Great Britain'],
  'uae': ['UAE', 'United Arab Emirates', 'Dubai'],
  'nyc': ['NYC', 'New York City', 'New York, NY'],
  'sf': ['SF', 'San Francisco', 'San Francisco, CA'],
  'la': ['LA', 'Los Angeles', 'Los Angeles, CA'],
  'dc': ['DC', 'Washington DC', 'Washington, D.C.'],
};

// Experience level search terms
const EXPERIENCE_LEVEL_TERMS: Record<string, string[]> = {
  'entry': ['entry level', 'entry-level', 'junior', 'new grad', 'graduate', '0-2 years'],
  'mid': ['mid level', 'mid-level', 'intermediate', '3-5 years', '2-5 years'],
  'senior': ['senior', 'sr', 'lead', '5 years', 'experienced'],
  'director': ['director', 'principal', 'staff', 'architect', 'head of', 'VP'],
};

// Job title variations (handles hyphenation and common alternatives)
function getRoleVariations(role: string): string[] {
  const variations: string[] = [role];
  const lowerRole = role.toLowerCase();

  // Handle "full stack" / "full-stack" / "fullstack"
  if (lowerRole.includes('full stack') || lowerRole.includes('full-stack') || lowerRole.includes('fullstack')) {
    const base = role.replace(/full[\s-]?stack/gi, 'PLACEHOLDER');
    variations.push(base.replace('PLACEHOLDER', 'full stack'));
    variations.push(base.replace('PLACEHOLDER', 'full-stack'));
    variations.push(base.replace('PLACEHOLDER', 'fullstack'));
  }

  // Handle "front end" / "front-end" / "frontend"
  if (lowerRole.includes('front end') || lowerRole.includes('front-end') || lowerRole.includes('frontend')) {
    const base = role.replace(/front[\s-]?end/gi, 'PLACEHOLDER');
    variations.push(base.replace('PLACEHOLDER', 'front end'));
    variations.push(base.replace('PLACEHOLDER', 'front-end'));
    variations.push(base.replace('PLACEHOLDER', 'frontend'));
  }

  // Handle "back end" / "back-end" / "backend"
  if (lowerRole.includes('back end') || lowerRole.includes('back-end') || lowerRole.includes('backend')) {
    const base = role.replace(/back[\s-]?end/gi, 'PLACEHOLDER');
    variations.push(base.replace('PLACEHOLDER', 'back end'));
    variations.push(base.replace('PLACEHOLDER', 'back-end'));
    variations.push(base.replace('PLACEHOLDER', 'backend'));
  }

  // Handle "dev ops" / "devops"
  if (lowerRole.includes('devops') || lowerRole.includes('dev ops')) {
    const base = role.replace(/dev[\s]?ops/gi, 'PLACEHOLDER');
    variations.push(base.replace('PLACEHOLDER', 'DevOps'));
    variations.push(base.replace('PLACEHOLDER', 'Dev Ops'));
  }

  // Handle "software engineer" / "software developer" / "SWE"
  if (lowerRole.includes('software engineer')) {
    variations.push(role.replace(/software engineer/gi, 'software developer'));
    variations.push(role.replace(/software engineer/gi, 'SWE'));
  } else if (lowerRole.includes('software developer')) {
    variations.push(role.replace(/software developer/gi, 'software engineer'));
    variations.push(role.replace(/software developer/gi, 'SWE'));
  }

  // Handle "ML" / "machine learning"
  if (lowerRole.includes('machine learning')) {
    variations.push(role.replace(/machine learning/gi, 'ML'));
  } else if (lowerRole.includes(' ml ') || lowerRole.startsWith('ml ') || lowerRole.endsWith(' ml')) {
    variations.push(role.replace(/\bml\b/gi, 'machine learning'));
  }

  // Handle "AI" / "artificial intelligence"
  if (lowerRole.includes('artificial intelligence')) {
    variations.push(role.replace(/artificial intelligence/gi, 'AI'));
  }

  // Remove duplicates
  return [...new Set(variations)];
}

// Get location search terms with alternatives
function getLocationTerms(location: string): string[] {
  const lowerLocation = location.toLowerCase().trim();

  // Check for known alternatives
  for (const [key, alternatives] of Object.entries(LOCATION_ALTERNATIVES)) {
    if (lowerLocation === key || lowerLocation.includes(key)) {
      return alternatives;
    }
  }

  // Return quoted location as-is if no alternatives found
  return [location];
}

// Helper to get search terms for a technology
function getTechSearchTerms(tech: string): string[] {
  return TECHNOLOGY_SEARCH_TERMS[tech] || [tech];
}

// Helper to build search query from filters
function buildSearchQuery(filters: FilterState): string {
  const parts: string[] = [];

  // Role/job title with variations (quoted, with OR for alternatives)
  if (filters.role) {
    const roleVariations = getRoleVariations(filters.role);
    const quotedRoles = roleVariations.map(r => `"${r}"`);
    if (quotedRoles.length > 1) {
      parts.push(`(${quotedRoles.join(' OR ')})`);
    } else {
      parts.push(quotedRoles[0]);
    }
  }

  // Experience level with alternatives
  if (filters.experience.length > 0) {
    const allExpTerms: string[] = [];
    for (const exp of filters.experience) {
      const terms = EXPERIENCE_LEVEL_TERMS[exp] || [exp];
      allExpTerms.push(...terms);
    }
    const quotedExp = allExpTerms.map(e => `"${e}"`);
    parts.push(`(${quotedExp.join(' OR ')})`);
  }

  // Technologies: include with OR (expand to alternate terms)
  if (filters.languages.length > 0) {
    const allTerms: string[] = [];
    for (const lang of filters.languages) {
      const terms = getTechSearchTerms(lang);
      allTerms.push(...terms);
    }
    // Quote terms with special characters
    const quotedTerms = allTerms.map(t => t.includes(' ') || t.includes('#') || t.includes('+') || t.includes('.') ? `"${t}"` : t);
    parts.push(`(${quotedTerms.join(' OR ')})`);
  }

  // Excluded technologies: prefix with - (expand to alternate terms)
  if (filters.excludeLanguages.length > 0) {
    const excludeTerms: string[] = [];
    for (const lang of filters.excludeLanguages) {
      const terms = getTechSearchTerms(lang);
      for (const t of terms) {
        // Quote terms with special characters
        const quoted = t.includes(' ') || t.includes('#') || t.includes('+') || t.includes('.') ? `"${t}"` : t;
        excludeTerms.push(`-${quoted}`);
      }
    }
    parts.push(excludeTerms.join(' '));
  }

  // Industries: include with OR
  if (filters.industry.length > 0) {
    const industryTerms = filters.industry.map(i => `"${INDUSTRY_LABELS[i] || i}"`);
    parts.push(`(${industryTerms.join(' OR ')})`);
  }

  // Excluded industries: prefix with -
  if (filters.excludeIndustries.length > 0) {
    parts.push(filters.excludeIndustries.map(i => `-"${INDUSTRY_LABELS[i] || i}"`).join(' '));
  }

  // Remote filter
  if (filters.remote === 'remote' || filters.remote === 'remote-first') {
    parts.push('remote');
  }

  return parts.join(' ');
}

// Helper to build location query with alternatives
function buildLocationQuery(location: string): string {
  if (!location) return '';

  const locationTerms = getLocationTerms(location);
  const quotedLocations = locationTerms.map(l => `"${l}"`);

  if (quotedLocations.length > 1) {
    return `(${quotedLocations.join(' OR ')})`;
  }
  return quotedLocations[0];
}

// Time filter conversions for different platforms
function getLinkedInTimeFilter(timePosted: TimePosted): string {
  const map: Record<TimePosted, string> = {
    'past-hour': 'r3600',
    'past-24h': 'r86400',
    'past-week': 'r604800',
    'past-month': 'r2592000',
    'any': '',
  };
  return map[timePosted];
}

function getIndeedTimeFilter(timePosted: TimePosted): string {
  const map: Record<TimePosted, string> = {
    'past-hour': '1',
    'past-24h': '1',
    'past-week': '7',
    'past-month': '30',
    'any': '',
  };
  return map[timePosted];
}

function getGlassdoorTimeFilter(timePosted: TimePosted): string {
  const map: Record<TimePosted, string> = {
    'past-hour': '1',
    'past-24h': '1',
    'past-week': '7',
    'past-month': '30',
    'any': '',
  };
  return map[timePosted];
}

// Simplified search query without quotes (avoids &quot; display issue on sites using URLSearchParams)
// Use this for job boards that display the query in a search field
function buildSimpleQuery(filters: FilterState, includeRemote = false): string {
  const parts: string[] = [];

  if (filters.role) {
    parts.push(filters.role);
  }

  if (filters.experience.length > 0) {
    const expParts: string[] = [];
    for (const exp of filters.experience) {
      const expMap: Record<string, string> = {
        'entry': 'entry level junior',
        'mid': 'mid level',
        'senior': 'senior lead',
        'director': 'director principal staff',
      };
      expParts.push(expMap[exp] || exp);
    }
    parts.push(expParts.join(' '));
  }

  if (filters.languages.length > 0) {
    const allTerms: string[] = [];
    for (const lang of filters.languages) {
      const terms = getTechSearchTerms(lang);
      allTerms.push(...terms);
    }
    parts.push(allTerms.join(' '));
  }

  if (includeRemote && (filters.remote === 'remote' || filters.remote === 'remote-first')) {
    parts.push('remote');
  }

  return parts.join(' ');
}

// Google time filter map for site searches
const googleTimeFilterMap: Record<TimePosted, string> = {
  'past-hour': 'h',
  'past-24h': 'd',
  'past-week': 'w',
  'past-month': 'm',
  'any': '',
};

// Current search engine preference (will be set by app.ts)
let currentSearchEngine: SearchEngine = 'google';

export function setSearchEngine(engine: SearchEngine): void {
  currentSearchEngine = engine;
}

export function getCurrentSearchEngine(): SearchEngine {
  return currentSearchEngine;
}

// Helper function for site searches that supports multiple engines
function buildSiteSearchUrl(site: string, query: string, timePosted: TimePosted): string {
  if (currentSearchEngine === 'duckduckgo') {
    return `https://duckduckgo.com/?q=site%3A${encodeURIComponent(site)}+${encodeURIComponent(query)}`;
  }
  // Default to Google
  let url = `https://www.google.com/search?q=site%3A${encodeURIComponent(site)}+${encodeURIComponent(query)}`;
  if (timePosted !== 'any') {
    url += '&tbs=sbd:1,qdr:' + googleTimeFilterMap[timePosted];
  }
  return url;
}

// Experience level conversions
// LinkedIn experience levels: 1=Internship, 2=Entry, 3=Associate, 4=Mid-Senior, 5=Director, 6=Executive
function getLinkedInExperience(exp: string): string {
  const map: Record<string, string> = {
    'entry': '1,2',      // Internship + Entry level
    'mid': '3',          // Associate
    'senior': '4',       // Mid-Senior level
    'director': '5,6',   // Director + Executive
  };
  return map[exp] || '';
}

function getIndeedExperience(exp: string): string {
  const map: Record<string, string> = {
    'entry': 'entry_level',
    'mid': 'mid_level',
    'senior': 'senior_level',
    'director': 'senior_level', // Indeed doesn't have director level, use senior
  };
  return map[exp] || '';
}

// Remote filter conversions
function getLinkedInRemote(remote: string): string {
  const map: Record<string, string> = {
    'remote': '2',
    'hybrid': '3',
    'onsite': '1',
    'remote-first': '2',
  };
  return map[remote] || '';
}

// Company size conversions
// LinkedIn f_CS parameter: B(1-10), C(11-50), D(51-200), E(201-500), F(501-1000), G(1001-5000), H(5001-10000), I(10001+)
function getLinkedInCompanySize(sizes: string[]): string {
  if (sizes.length === 0) return '';

  const sizeMap: Record<string, string[]> = {
    'small': ['B', 'C'],           // 1-50
    'medium': ['D'],               // 51-200
    'large': ['E', 'F'],           // 201-1000
    'enterprise': ['G', 'H', 'I'], // 1000+
    'faang': ['I'],                // 10001+ (Big Tech)
  };

  const codes = new Set<string>();
  for (const size of sizes) {
    const mapped = sizeMap[size];
    if (mapped) {
      mapped.forEach(code => codes.add(code));
    }
  }

  return Array.from(codes).join(',');
}

// Wellfound company size (uses employee count ranges)
function getWellfoundCompanySize(sizes: string[]): string[] {
  if (sizes.length === 0) return [];

  const sizeMap: Record<string, string[]> = {
    'small': ['1-10', '11-50'],
    'medium': ['51-200'],
    'large': ['201-500', '501-1000'],
    'enterprise': ['1001-5000', '5001+'],
    'faang': ['5001+'],
  };

  const ranges = new Set<string>();
  for (const size of sizes) {
    const mapped = sizeMap[size];
    if (mapped) {
      mapped.forEach(range => ranges.add(range));
    }
  }

  return Array.from(ranges);
}

// Job board definitions
export const JOB_BOARDS: JobBoard[] = [
  // ATS Systems (Top Priority)
  {
    id: 'greenhouse',
    name: 'Greenhouse Jobs',
    category: 'ats',
    baseUrl: 'https://www.google.com/search',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Search Greenhouse ATS job boards',
    faviconDomain: 'boards.greenhouse.io',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const location = buildLocationQuery(filters.location);
      const searchTerms = `${query} ${location}`.trim();
      return buildSiteSearchUrl('boards.greenhouse.io', searchTerms, filters.timePosted);
    },
  },
  {
    id: 'lever',
    name: 'Lever Jobs',
    category: 'ats',
    baseUrl: 'https://www.google.com/search',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Search Lever ATS job boards',
    faviconDomain: 'jobs.lever.co',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const location = buildLocationQuery(filters.location);
      const searchTerms = `${query} ${location}`.trim();
      return buildSiteSearchUrl('jobs.lever.co', searchTerms, filters.timePosted);
    },
  },
  {
    id: 'ashby',
    name: 'Ashby Jobs',
    category: 'ats',
    baseUrl: 'https://www.google.com/search',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Search Ashby ATS job boards',
    faviconDomain: 'jobs.ashbyhq.com',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const location = buildLocationQuery(filters.location);
      const searchTerms = `${query} ${location}`.trim();
      return buildSiteSearchUrl('jobs.ashbyhq.com', searchTerms, filters.timePosted);
    },
  },
  {
    id: 'workday',
    name: 'Workday Jobs',
    category: 'ats',
    baseUrl: 'https://www.google.com/search',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Search Workday ATS job boards',
    faviconDomain: 'myworkdayjobs.com',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const location = buildLocationQuery(filters.location);
      const searchTerms = `${query} ${location}`.trim();
      return buildSiteSearchUrl('myworkdayjobs.com', searchTerms, filters.timePosted);
    },
  },
  {
    id: 'bamboohr',
    name: 'BambooHR Jobs',
    category: 'ats',
    baseUrl: 'https://www.google.com/search',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Search BambooHR ATS job boards',
    faviconDomain: 'bamboohr.com',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const location = buildLocationQuery(filters.location);
      const searchTerms = `${query} ${location}`.trim();
      return buildSiteSearchUrl('bamboohr.com/careers', searchTerms, filters.timePosted);
    },
  },
  {
    id: 'icims',
    name: 'iCIMS Jobs',
    category: 'ats',
    baseUrl: 'https://www.google.com/search',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Search iCIMS ATS job boards',
    faviconDomain: 'icims.com',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const location = buildLocationQuery(filters.location);
      const searchTerms = `${query} ${location}`.trim();
      return buildSiteSearchUrl('icims.com', searchTerms, filters.timePosted);
    },
  },
  {
    id: 'smartrecruiters',
    name: 'SmartRecruiters',
    category: 'ats',
    baseUrl: 'https://www.google.com/search',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Search SmartRecruiters ATS',
    faviconDomain: 'jobs.smartrecruiters.com',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const location = buildLocationQuery(filters.location);
      const searchTerms = `${query} ${location}`.trim();
      return buildSiteSearchUrl('jobs.smartrecruiters.com', searchTerms, filters.timePosted);
    },
  },
  {
    id: 'jobvite',
    name: 'Jobvite',
    category: 'ats',
    baseUrl: 'https://www.google.com/search',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Search Jobvite ATS',
    faviconDomain: 'jobs.jobvite.com',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const location = buildLocationQuery(filters.location);
      const searchTerms = `${query} ${location}`.trim();
      return buildSiteSearchUrl('jobs.jobvite.com', searchTerms, filters.timePosted);
    },
  },

  // Major Platforms
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'major',
    baseUrl: 'https://www.linkedin.com/jobs/search/',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Professional network job board',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const params = new URLSearchParams();
      params.set('keywords', query);
      params.set('sortBy', 'DD'); // Date descending

      if (filters.location) {
        params.set('location', filters.location);
      }

      const timeFilter = getLinkedInTimeFilter(filters.timePosted);
      if (timeFilter) {
        params.set('f_TPR', timeFilter);
      }

      if (filters.experience.length > 0) {
        const expCodes = filters.experience.map(e => getLinkedInExperience(e)).filter(Boolean);
        if (expCodes.length > 0) {
          params.set('f_E', expCodes.join(','));
        }
      }

      const remoteFilter = getLinkedInRemote(filters.remote);
      if (remoteFilter) {
        params.set('f_WT', remoteFilter);
      }

      const sizeFilter = getLinkedInCompanySize(filters.companySize);
      if (sizeFilter) {
        params.set('f_CS', sizeFilter);
      }

      return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
    },
  },
  {
    id: 'indeed',
    name: 'Indeed',
    category: 'major',
    baseUrl: 'https://www.indeed.com/jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Largest job aggregator',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const params = new URLSearchParams();
      params.set('q', query);
      params.set('sort', 'date');

      if (filters.location) {
        params.set('l', filters.location);
      }

      const timeFilter = getIndeedTimeFilter(filters.timePosted);
      if (timeFilter) {
        params.set('fromage', timeFilter);
      }

      if (filters.remote === 'remote' || filters.remote === 'remote-first') {
        params.set('remotejob', '1');
      }

      if (filters.experience.length > 0) {
        const expFilter = getIndeedExperience(filters.experience[0]);
        if (expFilter) {
          params.set('explvl', expFilter);
        }
      }

      return `https://www.indeed.com/jobs?${params.toString()}`;
    },
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    category: 'major',
    baseUrl: 'https://www.glassdoor.com/Job/jobs.htm',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Jobs with company reviews',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      const params = new URLSearchParams();
      params.set('sc.keyword', query);
      params.set('sortBy', 'date');

      if (filters.location) {
        params.set('locT', 'C');
        params.set('locKeyword', filters.location);
      }

      const timeFilter = getGlassdoorTimeFilter(filters.timePosted);
      if (timeFilter) {
        params.set('fromAge', timeFilter);
      }

      if (filters.remote === 'remote' || filters.remote === 'remote-first') {
        params.set('remoteWorkType', '1');
      }

      return `https://www.glassdoor.com/Job/jobs.htm?${params.toString()}`;
    },
  },
  {
    id: 'ziprecruiter',
    name: 'ZipRecruiter',
    category: 'major',
    baseUrl: 'https://www.ziprecruiter.com/jobs-search',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'AI-powered job matching',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      const params = new URLSearchParams();
      params.set('search', query);
      params.set('refine_by_posted', '1'); // Sort by date

      if (filters.location) {
        params.set('location', filters.location);
      }

      if (filters.timePosted === 'past-24h') {
        params.set('days', '1');
      } else if (filters.timePosted === 'past-week') {
        params.set('days', '7');
      } else if (filters.timePosted === 'past-month') {
        params.set('days', '30');
      }

      if (filters.remote === 'remote' || filters.remote === 'remote-first') {
        params.set('refine_by_location_type', 'only_remote');
      }

      return `https://www.ziprecruiter.com/jobs-search?${params.toString()}`;
    },
  },
  {
    id: 'google-jobs',
    name: 'Google Jobs',
    category: 'major',
    baseUrl: 'https://www.google.com/search',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Google job search aggregator',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const location = filters.location ? ` in ${filters.location}` : '';
      // Note: buildSearchQuery already adds "remote" when applicable, so no need to add it again
      const searchQuery = `${query} jobs${location}`;
      return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&ibp=htl;jobs`;
    },
  },

  // Tech-Focused
  {
    id: 'wellfound',
    name: 'Wellfound (AngelList)',
    category: 'tech-focused',
    baseUrl: 'https://wellfound.com/jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Startup jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      const params = new URLSearchParams();

      if (query) {
        params.set('q', query);
      }

      if (filters.location) {
        params.set('locations[]', filters.location);
      }

      if (filters.remote === 'remote' || filters.remote === 'remote-first') {
        params.set('remote', 'true');
      }

      const sizeRanges = getWellfoundCompanySize(filters.companySize);
      for (const range of sizeRanges) {
        params.append('company_sizes[]', range);
      }

      return `https://wellfound.com/jobs?${params.toString()}`;
    },
  },
  {
    id: 'ycombinator',
    name: 'Y Combinator',
    category: 'tech-focused',
    baseUrl: 'https://www.workatastartup.com/jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'YC startup jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      const params = new URLSearchParams();

      if (query) {
        params.set('query', query);
      }

      if (filters.location) {
        params.set('locations', filters.location);
      }

      if (filters.remote === 'remote' || filters.remote === 'remote-first') {
        params.set('remote', 'true');
      }

      return `https://www.workatastartup.com/jobs?${params.toString()}`;
    },
  },
  {
    id: 'stackoverflow',
    name: 'Stack Overflow Jobs',
    category: 'tech-focused',
    baseUrl: 'https://stackoverflow.com/jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Developer-focused jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      const params = new URLSearchParams();

      if (query) {
        params.set('q', query);
      }

      if (filters.location) {
        params.set('l', filters.location);
      }

      if (filters.remote === 'remote' || filters.remote === 'remote-first') {
        params.set('r', 'true');
      }

      params.set('sort', 'p'); // Sort by date posted

      return `https://stackoverflow.com/jobs?${params.toString()}`;
    },
  },
  {
    id: 'hn-whoishiring',
    name: 'HN Who\'s Hiring',
    category: 'tech-focused',
    baseUrl: 'https://hnhiring.com',
    supportsDateSort: false,
    supportsRemote: true,
    description: 'Hacker News job posts',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      const params = new URLSearchParams();

      if (query) {
        params.set('q', query);
      }

      if (filters.location) {
        params.set('l', filters.location);
      }

      if (filters.remote === 'remote' || filters.remote === 'remote-first') {
        params.set('remote', 'true');
      }

      return `https://hnhiring.com/?${params.toString()}`;
    },
  },
  {
    id: 'builtin',
    name: 'Built In',
    category: 'tech-focused',
    baseUrl: 'https://builtin.com/jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Tech company jobs by city',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      let url = 'https://builtin.com/jobs';

      const params = new URLSearchParams();
      if (query) {
        params.set('search', query);
      }

      if (filters.remote === 'remote' || filters.remote === 'remote-first') {
        url = 'https://builtin.com/jobs/remote';
      }

      return params.toString() ? `${url}?${params.toString()}` : url;
    },
  },
  {
    id: 'dice',
    name: 'Dice',
    category: 'tech-focused',
    baseUrl: 'https://www.dice.com/jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Tech-focused job board',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      const params = new URLSearchParams();

      if (query) {
        params.set('q', query);
      }

      if (filters.location) {
        params.set('location', filters.location);
      }

      params.set('sort', 'date');

      if (filters.timePosted === 'past-24h') {
        params.set('filters.postedDate', 'ONE');
      } else if (filters.timePosted === 'past-week') {
        params.set('filters.postedDate', 'SEVEN');
      } else if (filters.timePosted === 'past-month') {
        params.set('filters.postedDate', 'THIRTY');
      }

      if (filters.remote === 'remote' || filters.remote === 'remote-first') {
        params.set('filters.isRemote', 'true');
      }

      return `https://www.dice.com/jobs?${params.toString()}`;
    },
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch Jobs',
    category: 'tech-focused',
    baseUrl: 'https://www.google.com/search',
    supportsDateSort: true,
    supportsRemote: false,
    description: 'TechCrunch job listings',
    faviconDomain: 'techcrunch.com',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const location = buildLocationQuery(filters.location);
      const searchTerms = `jobs ${query} ${location}`.trim();
      return buildSiteSearchUrl('techcrunch.com', searchTerms, filters.timePosted);
    },
  },
  {
    id: 'hackernews-jobs',
    name: 'HN Jobs (Algolia)',
    category: 'tech-focused',
    baseUrl: 'https://hn.algolia.com/',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Search HN job posts via Algolia',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const remote = (filters.remote === 'remote' || filters.remote === 'remote-first') ? ' remote' : '';
      const location = filters.location ? ` ${filters.location}` : '';
      const searchQuery = `${query}${remote}${location}`.trim();
      return `https://hn.algolia.com/?dateRange=all&page=0&prefix=true&query=${encodeURIComponent(searchQuery)}&sort=byDate&type=job`;
    },
  },

  // Niche Job Boards
  {
    id: 'remoteok',
    name: 'RemoteOK',
    category: 'niche',
    baseUrl: 'https://remoteok.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Remote-first jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      const tags = query.toLowerCase().replace(/\s+/g, '-');
      return `https://remoteok.com/remote-${tags}-jobs?order=date`;
    },
  },
  {
    id: 'remoterocketship',
    name: 'Remote Rocketship',
    category: 'niche',
    baseUrl: 'https://www.remoterocketship.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Curated remote jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      const params = new URLSearchParams();
      if (query) {
        params.set('q', query);
      }
      return `https://www.remoterocketship.com/jobs?${params.toString()}`;
    },
  },
  {
    id: 'hired',
    name: 'Hired',
    category: 'niche',
    baseUrl: 'https://hired.com/search',
    supportsDateSort: false,
    supportsRemote: true,
    description: 'Tech talent marketplace',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      const params = new URLSearchParams();
      if (query) {
        params.set('q', query);
      }
      if (filters.location) {
        params.set('location', filters.location);
      }
      return `https://hired.com/search?${params.toString()}`;
    },
  },
  {
    id: 'triplebyte',
    name: 'Triplebyte',
    category: 'niche',
    baseUrl: 'https://triplebyte.com/jobs',
    supportsDateSort: false,
    supportsRemote: true,
    description: 'Skills-based hiring',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      const params = new URLSearchParams();
      if (query) {
        params.set('q', query);
      }
      return `https://triplebyte.com/jobs?${params.toString()}`;
    },
  },
  {
    id: 'otta',
    name: 'Otta',
    category: 'niche',
    baseUrl: 'https://otta.com/jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Curated tech jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      const params = new URLSearchParams();
      if (query) {
        params.set('search', query);
      }
      if (filters.location) {
        params.set('location', filters.location);
      }
      return `https://otta.com/jobs?${params.toString()}`;
    },
  },
  {
    id: 'flexjobs',
    name: 'FlexJobs',
    category: 'niche',
    baseUrl: 'https://www.flexjobs.com/search',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Flexible & remote jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      const params = new URLSearchParams();
      if (query) {
        params.set('search', query);
      }
      if (filters.location) {
        params.set('location', filters.location);
      }
      return `https://www.flexjobs.com/search?${params.toString()}`;
    },
  },
  {
    id: 'weworkremotely',
    name: 'We Work Remotely',
    category: 'niche',
    baseUrl: 'https://weworkremotely.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Remote jobs community',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      if (query) {
        return `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(query)}`;
      }
      return 'https://weworkremotely.com/remote-jobs';
    },
  },
  {
    id: 'remotive',
    name: 'Remotive',
    category: 'niche',
    baseUrl: 'https://remotive.com/remote-jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Remote job listings',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      if (query) {
        return `https://remotive.com/remote-jobs?query=${encodeURIComponent(query)}`;
      }
      return 'https://remotive.com/remote-jobs';
    },
  },
  {
    id: 'justremote',
    name: 'JustRemote',
    category: 'niche',
    baseUrl: 'https://justremote.co/remote-jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Remote jobs globally',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      if (query) {
        return `https://justremote.co/remote-jobs?search=${encodeURIComponent(query)}`;
      }
      return 'https://justremote.co/remote-jobs';
    },
  },
  {
    id: 'remoteco',
    name: 'Remote.co',
    category: 'niche',
    baseUrl: 'https://remote.co/remote-jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Remote job resources',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      if (query) {
        return `https://remote.co/remote-jobs/search/?search_keywords=${encodeURIComponent(query)}`;
      }
      return 'https://remote.co/remote-jobs';
    },
  },
  {
    id: 'arc',
    name: 'Arc.dev',
    category: 'niche',
    baseUrl: 'https://arc.dev/remote-jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Remote developer jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      if (query) {
        return `https://arc.dev/remote-jobs?q=${encodeURIComponent(query)}`;
      }
      return 'https://arc.dev/remote-jobs';
    },
  },
  {
    id: 'toptal',
    name: 'Toptal Jobs',
    category: 'niche',
    baseUrl: 'https://www.toptal.com/careers',
    supportsDateSort: false,
    supportsRemote: true,
    description: 'Top 3% freelance talent',
    buildUrl: () => {
      return 'https://www.toptal.com/careers';
    },
  },
  {
    id: 'powertofly',
    name: 'PowerToFly',
    category: 'niche',
    baseUrl: 'https://powertofly.com/jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Diverse & inclusive jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      const params = new URLSearchParams();
      if (query) {
        params.set('q', query);
      }
      if (filters.location) {
        params.set('location', filters.location);
      }
      if (filters.remote === 'remote' || filters.remote === 'remote-first') {
        params.set('remote', 'true');
      }
      return `https://powertofly.com/jobs?${params.toString()}`;
    },
  },
  {
    id: 'diversitytech',
    name: 'Diversity Tech',
    category: 'niche',
    baseUrl: 'https://www.diversifytech.co/job-board',
    supportsDateSort: false,
    supportsRemote: true,
    description: 'Jobs for underrepresented groups',
    buildUrl: () => {
      return 'https://www.diversifytech.co/job-board';
    },
  },
  {
    id: 'techjobsforgood',
    name: 'Tech Jobs for Good',
    category: 'niche',
    baseUrl: 'https://techjobsforgood.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Social impact tech jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      if (query) {
        return `https://techjobsforgood.com/?q=${encodeURIComponent(query)}`;
      }
      return 'https://techjobsforgood.com';
    },
  },
  {
    id: 'climatebase',
    name: 'Climatebase',
    category: 'niche',
    baseUrl: 'https://climatebase.org/jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Climate tech jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters);
      const params = new URLSearchParams();
      if (query) {
        params.set('q', query);
      }
      if (filters.location) {
        params.set('l', filters.location);
      }
      if (filters.remote === 'remote' || filters.remote === 'remote-first') {
        params.set('remote', 'true');
      }
      return `https://climatebase.org/jobs?${params.toString()}`;
    },
  },
  {
    id: 'crypto-jobs',
    name: 'CryptoJobsList',
    category: 'niche',
    baseUrl: 'https://cryptojobslist.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Web3 & crypto jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      if (query) {
        return `https://cryptojobslist.com/search?q=${encodeURIComponent(query)}`;
      }
      return 'https://cryptojobslist.com';
    },
  },
  {
    id: 'web3-careers',
    name: 'Web3 Careers',
    category: 'niche',
    baseUrl: 'https://web3.career',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Blockchain jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      if (query) {
        return `https://web3.career/search?q=${encodeURIComponent(query)}`;
      }
      return 'https://web3.career';
    },
  },
  {
    id: 'ai-jobs',
    name: 'AI Jobs',
    category: 'niche',
    baseUrl: 'https://aijobs.net',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'AI & ML jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      if (query) {
        return `https://aijobs.net/?q=${encodeURIComponent(query)}`;
      }
      return 'https://aijobs.net';
    },
  },
  {
    id: 'healthtechjobs',
    name: 'HealthTech Jobs',
    category: 'niche',
    baseUrl: 'https://www.google.com/search',
    supportsDateSort: true,
    supportsRemote: false,
    description: 'Healthcare tech positions',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const location = buildLocationQuery(filters.location);
      const searchTerms = `healthcare tech jobs ${query} ${location}`.trim();
      if (currentSearchEngine === 'duckduckgo') {
        return `https://duckduckgo.com/?q=${encodeURIComponent(searchTerms)}`;
      }
      return `https://www.google.com/search?q=${encodeURIComponent(searchTerms)}&ibp=htl;jobs`;
    },
  },
  {
    id: 'fintech-jobs',
    name: 'Fintech Jobs',
    category: 'niche',
    baseUrl: 'https://www.google.com/search',
    supportsDateSort: true,
    supportsRemote: false,
    description: 'Financial technology jobs',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const location = buildLocationQuery(filters.location);
      const searchTerms = `fintech jobs ${query} ${location}`.trim();
      if (currentSearchEngine === 'duckduckgo') {
        return `https://duckduckgo.com/?q=${encodeURIComponent(searchTerms)}`;
      }
      return `https://www.google.com/search?q=${encodeURIComponent(searchTerms)}&ibp=htl;jobs`;
    },
  },
  {
    id: 'gamedevjobs',
    name: 'Game Dev Jobs',
    category: 'niche',
    baseUrl: 'https://gamejobs.co',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Gaming industry jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      if (query) {
        return `https://gamejobs.co/search?q=${encodeURIComponent(query)}`;
      }
      return 'https://gamejobs.co';
    },
  },
  {
    id: 'securityjobs',
    name: 'Cybersecurity Jobs',
    category: 'niche',
    baseUrl: 'https://www.cybersecurityjobs.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'InfoSec positions',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      const params = new URLSearchParams();
      if (query) {
        params.set('q', query);
      }
      if (filters.location) {
        params.set('l', filters.location);
      }
      return `https://www.cybersecurityjobs.com/jobs?${params.toString()}`;
    },
  },

  // Career Subdomains (Company Direct)
  {
    id: 'careers-google',
    name: 'Google Careers',
    category: 'career-subdomains',
    baseUrl: 'https://www.google.com/search',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Google job listings',
    faviconDomain: 'careers.google.com',
    buildUrl: (filters) => {
      const query = buildSearchQuery(filters);
      const location = buildLocationQuery(filters.location);
      const searchTerms = `${query} ${location}`.trim();
      return buildSiteSearchUrl('careers.google.com', searchTerms, filters.timePosted);
    },
  },
  {
    id: 'careers-apple',
    name: 'Apple Jobs',
    category: 'career-subdomains',
    baseUrl: 'https://jobs.apple.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Apple job listings',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      const params = new URLSearchParams();
      if (query) {
        params.set('search', query);
      }
      if (filters.location) {
        params.set('location', filters.location);
      }
      return `https://jobs.apple.com/en-us/search?${params.toString()}`;
    },
  },
  {
    id: 'careers-amazon',
    name: 'Amazon Jobs',
    category: 'career-subdomains',
    baseUrl: 'https://www.amazon.jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Amazon job listings',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      const params = new URLSearchParams();
      if (query) {
        params.set('keywords', query);
      }
      if (filters.location) {
        params.set('location', filters.location);
      }
      params.set('sort', 'recent');
      return `https://www.amazon.jobs/en/search?${params.toString()}`;
    },
  },
  {
    id: 'careers-meta',
    name: 'Meta Careers',
    category: 'career-subdomains',
    baseUrl: 'https://www.metacareers.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Meta/Facebook job listings',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      const params = new URLSearchParams();
      if (query) {
        params.set('q', query);
      }
      if (filters.location) {
        params.set('locations', filters.location);
      }
      return `https://www.metacareers.com/jobs?${params.toString()}`;
    },
  },
  {
    id: 'careers-microsoft',
    name: 'Microsoft Careers',
    category: 'career-subdomains',
    baseUrl: 'https://careers.microsoft.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Microsoft job listings',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      const params = new URLSearchParams();
      if (query) {
        params.set('q', query);
      }
      if (filters.location) {
        params.set('l', filters.location);
      }
      return `https://careers.microsoft.com/us/en/search-results?${params.toString()}`;
    },
  },
  {
    id: 'careers-netflix',
    name: 'Netflix Jobs',
    category: 'career-subdomains',
    baseUrl: 'https://explore.jobs.netflix.net/careers',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Netflix job listings',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      const params = new URLSearchParams();
      if (query) {
        params.set('query', query);
      }
      if (filters.location) {
        params.set('location', filters.location);
      }
      return `https://explore.jobs.netflix.net/careers?${params.toString()}`;
    },
  },
  {
    id: 'careers-spotify',
    name: 'Spotify Jobs',
    category: 'career-subdomains',
    baseUrl: 'https://www.lifeatspotify.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Spotify job listings',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      if (query) {
        return `https://www.lifeatspotify.com/jobs?query=${encodeURIComponent(query)}`;
      }
      return 'https://www.lifeatspotify.com/jobs';
    },
  },
  {
    id: 'careers-stripe',
    name: 'Stripe Jobs',
    category: 'career-subdomains',
    baseUrl: 'https://stripe.com/jobs',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Stripe job listings',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      if (query) {
        return `https://stripe.com/jobs/search?query=${encodeURIComponent(query)}`;
      }
      return 'https://stripe.com/jobs/search';
    },
  },
  {
    id: 'careers-airbnb',
    name: 'Airbnb Careers',
    category: 'career-subdomains',
    baseUrl: 'https://careers.airbnb.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Airbnb job listings',
    buildUrl: () => {
      return 'https://careers.airbnb.com/positions/';
    },
  },
  {
    id: 'careers-uber',
    name: 'Uber Careers',
    category: 'career-subdomains',
    baseUrl: 'https://www.uber.com/us/en/careers',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Uber job listings',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      if (query) {
        return `https://www.uber.com/us/en/careers/list/?query=${encodeURIComponent(query)}`;
      }
      return 'https://www.uber.com/us/en/careers/list/';
    },
  },
  {
    id: 'careers-salesforce',
    name: 'Salesforce Careers',
    category: 'career-subdomains',
    baseUrl: 'https://salesforce.wd12.myworkdayjobs.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Salesforce job listings',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      if (query) {
        return `https://salesforce.wd12.myworkdayjobs.com/en-US/External_Career_Site?q=${encodeURIComponent(query)}`;
      }
      return 'https://salesforce.wd12.myworkdayjobs.com/en-US/External_Career_Site';
    },
  },
  {
    id: 'careers-adobe',
    name: 'Adobe Careers',
    category: 'career-subdomains',
    baseUrl: 'https://www.adobe.com/careers.html',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Adobe job listings',
    buildUrl: () => {
      return 'https://www.adobe.com/careers.html';
    },
  },
  {
    id: 'careers-twitter',
    name: 'X (Twitter) Careers',
    category: 'career-subdomains',
    baseUrl: 'https://careers.x.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'X/Twitter job listings',
    buildUrl: () => {
      return 'https://careers.x.com/';
    },
  },
  {
    id: 'careers-linkedin',
    name: 'LinkedIn Careers',
    category: 'career-subdomains',
    baseUrl: 'https://careers.linkedin.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'LinkedIn internal jobs',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      if (query) {
        return `https://careers.linkedin.com/search?keywords=${encodeURIComponent(query)}`;
      }
      return 'https://careers.linkedin.com/search';
    },
  },
  {
    id: 'careers-oracle',
    name: 'Oracle Careers',
    category: 'career-subdomains',
    baseUrl: 'https://www.oracle.com/careers',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Oracle job listings',
    buildUrl: () => {
      return 'https://www.oracle.com/careers/';
    },
  },
  {
    id: 'careers-nvidia',
    name: 'NVIDIA Careers',
    category: 'career-subdomains',
    baseUrl: 'https://nvidia.wd5.myworkdayjobs.com',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'NVIDIA job listings',
    buildUrl: (filters) => {
      const query = buildSimpleQuery(filters, true);
      if (query) {
        return `https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite?q=${encodeURIComponent(query)}`;
      }
      return 'https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite';
    },
  },
  {
    id: 'careers-openai',
    name: 'OpenAI Careers',
    category: 'career-subdomains',
    baseUrl: 'https://openai.com/careers',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'OpenAI job listings',
    buildUrl: () => {
      return 'https://openai.com/careers/search';
    },
  },
  {
    id: 'careers-anthropic',
    name: 'Anthropic Careers',
    category: 'career-subdomains',
    baseUrl: 'https://www.anthropic.com/careers',
    supportsDateSort: true,
    supportsRemote: true,
    description: 'Anthropic job listings',
    buildUrl: () => {
      return 'https://www.anthropic.com/careers#open-roles';
    },
  },
];

// Get boards by category
export function getBoardsByCategory(category: JobBoard['category']): JobBoard[] {
  return JOB_BOARDS.filter(board => board.category === category);
}

// Get all board categories with labels
export const BOARD_CATEGORIES: { value: JobBoard['category']; label: string }[] = [
  { value: 'ats', label: 'ATS Systems' },
  { value: 'major', label: 'Major Platforms' },
  { value: 'tech-focused', label: 'Tech-Focused' },
  { value: 'niche', label: 'Niche & Specialized' },
  { value: 'career-subdomains', label: 'Company Careers' },
];

// Generate URLs for all boards
export function generateAllUrls(filters: FilterState): Map<string, string> {
  const urls = new Map<string, string>();
  for (const board of JOB_BOARDS) {
    urls.set(board.id, board.buildUrl(filters));
  }
  return urls;
}
