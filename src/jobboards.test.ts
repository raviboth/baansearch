import { describe, it, expect } from 'vitest';
import { JOB_BOARDS, getBoardsByCategory, BOARD_CATEGORIES, generateAllUrls } from './jobboards';
import { DEFAULT_FILTER_STATE } from './types';
import type { FilterState } from './types';

describe('JOB_BOARDS', () => {
  it('should have at least 50 job boards', () => {
    expect(JOB_BOARDS.length).toBeGreaterThanOrEqual(50);
  });

  it('should have unique IDs for all boards', () => {
    const ids = JOB_BOARDS.map(b => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have required properties for each board', () => {
    for (const board of JOB_BOARDS) {
      expect(board.id).toBeDefined();
      expect(board.name).toBeDefined();
      expect(board.category).toBeDefined();
      expect(board.baseUrl).toBeDefined();
      expect(typeof board.buildUrl).toBe('function');
      expect(typeof board.supportsDateSort).toBe('boolean');
      expect(typeof board.supportsRemote).toBe('boolean');
    }
  });

  it('should have valid categories for all boards', () => {
    const validCategories = BOARD_CATEGORIES.map(c => c.value);
    for (const board of JOB_BOARDS) {
      expect(validCategories).toContain(board.category);
    }
  });
});

describe('BOARD_CATEGORIES', () => {
  it('should have 5 categories', () => {
    expect(BOARD_CATEGORIES).toHaveLength(5);
  });

  it('should include expected categories', () => {
    const values = BOARD_CATEGORIES.map(c => c.value);
    expect(values).toContain('ats');
    expect(values).toContain('major');
    expect(values).toContain('tech-focused');
    expect(values).toContain('niche');
    expect(values).toContain('career-subdomains');
  });
});

describe('getBoardsByCategory', () => {
  it('should return ATS boards', () => {
    const atsBoards = getBoardsByCategory('ats');
    expect(atsBoards.length).toBeGreaterThan(0);
    expect(atsBoards.every(b => b.category === 'ats')).toBe(true);
  });

  it('should return major platform boards', () => {
    const majorBoards = getBoardsByCategory('major');
    expect(majorBoards.length).toBeGreaterThan(0);

    const names = majorBoards.map(b => b.name.toLowerCase());
    expect(names.some(n => n.includes('linkedin'))).toBe(true);
    expect(names.some(n => n.includes('indeed'))).toBe(true);
  });

  it('should return tech-focused boards', () => {
    const techBoards = getBoardsByCategory('tech-focused');
    expect(techBoards.length).toBeGreaterThan(0);
  });

  it('should return niche boards', () => {
    const nicheBoards = getBoardsByCategory('niche');
    expect(nicheBoards.length).toBeGreaterThan(0);
  });

  it('should return career subdomain boards', () => {
    const careerBoards = getBoardsByCategory('career-subdomains');
    expect(careerBoards.length).toBeGreaterThan(0);
  });
});

describe('generateAllUrls', () => {
  it('should generate URLs for all boards', () => {
    const urls = generateAllUrls(DEFAULT_FILTER_STATE);

    expect(urls.size).toBe(JOB_BOARDS.length);

    for (const board of JOB_BOARDS) {
      expect(urls.has(board.id)).toBe(true);
      expect(urls.get(board.id)).toBeDefined();
    }
  });

  it('should generate valid URLs', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      role: 'Frontend Engineer',
      location: 'San Francisco',
    };

    const urls = generateAllUrls(filters);

    for (const [_id, url] of urls) {
      expect(url).toMatch(/^https?:\/\//);
    }
  });
});

describe('URL Generation - LinkedIn', () => {
  const linkedin = JOB_BOARDS.find(b => b.id === 'linkedin')!;

  it('should include sort by date parameter', () => {
    const url = linkedin.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('sortBy=DD');
  });

  it('should include search keywords', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, role: 'Frontend Engineer' };
    const url = linkedin.buildUrl(filters);
    // Role is now quoted and includes variations
    expect(url).toContain('keywords=');
    expect(url).toContain('Frontend');
  });

  it('should include location', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, location: 'San Francisco' };
    const url = linkedin.buildUrl(filters);
    expect(url).toContain('location=San+Francisco');
  });

  it('should include time filter for past-24h', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, timePosted: 'past-24h' };
    const url = linkedin.buildUrl(filters);
    expect(url).toContain('f_TPR=r86400');
  });

  it('should include time filter for past-week', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, timePosted: 'past-week' };
    const url = linkedin.buildUrl(filters);
    expect(url).toContain('f_TPR=r604800');
  });

  it('should include remote filter', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, remote: 'remote' };
    const url = linkedin.buildUrl(filters);
    expect(url).toContain('f_WT=2');
  });

  it('should include experience filter for senior (Mid-Senior level)', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, experience: ['senior'] };
    const url = linkedin.buildUrl(filters);
    expect(url).toContain('f_E=4'); // 4 = Mid-Senior level
  });

  it('should include experience filter for director/executive', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, experience: ['director'] };
    const url = linkedin.buildUrl(filters);
    expect(url).toContain('f_E=5'); // 5,6 = Director, Executive
  });

  it('should include company size filter for small companies', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, companySize: ['small'] };
    const url = linkedin.buildUrl(filters);
    expect(url).toContain('f_CS=');
    // Small = B,C (1-10, 11-50)
    expect(url).toMatch(/f_CS=[BC,]+/);
  });

  it('should include company size filter for enterprise', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, companySize: ['enterprise'] };
    const url = linkedin.buildUrl(filters);
    expect(url).toContain('f_CS=');
    // Enterprise = G,H,I (1000+)
    expect(url).toMatch(/f_CS=[GHI,]+/);
  });

  it('should include company size filter for FAANG', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, companySize: ['faang'] };
    const url = linkedin.buildUrl(filters);
    expect(url).toContain('f_CS=I'); // 10001+
  });

  it('should combine multiple company sizes', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, companySize: ['small', 'large'] };
    const url = linkedin.buildUrl(filters);
    expect(url).toContain('f_CS=');
    // Should include B,C (small) and E,F (large)
    expect(url).toMatch(/B/);
    expect(url).toMatch(/E|F/);
  });
});

describe('URL Generation - Indeed', () => {
  const indeed = JOB_BOARDS.find(b => b.id === 'indeed')!;

  it('should include sort by date', () => {
    const url = indeed.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('sort=date');
  });

  it('should include search query', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, role: 'Backend Engineer' };
    const url = indeed.buildUrl(filters);
    // Role is now quoted and includes variations
    expect(url).toContain('q=');
    expect(url).toContain('Backend');
  });

  it('should include location', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, location: 'New York' };
    const url = indeed.buildUrl(filters);
    expect(url).toContain('l=New+York');
  });

  it('should include time filter', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, timePosted: 'past-week' };
    const url = indeed.buildUrl(filters);
    expect(url).toContain('fromage=7');
  });

  it('should include remote filter', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, remote: 'remote' };
    const url = indeed.buildUrl(filters);
    expect(url).toContain('remotejob=1');
  });
});

describe('URL Generation - Glassdoor', () => {
  const glassdoor = JOB_BOARDS.find(b => b.id === 'glassdoor')!;

  it('should include sort by date', () => {
    const url = glassdoor.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('sortBy=date');
  });

  it('should include search keyword', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, role: 'Data Scientist' };
    const url = glassdoor.buildUrl(filters);
    // Role is now quoted
    expect(url).toContain('sc.keyword=');
    expect(url).toContain('Data');
  });
});

describe('URL Generation - ATS Systems', () => {
  it('should use Google site search for Greenhouse', () => {
    const greenhouse = JOB_BOARDS.find(b => b.id === 'greenhouse')!;
    const url = greenhouse.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('google.com/search');
    expect(url).toContain('site%3Aboards.greenhouse.io');
  });

  it('should use Google site search for Lever', () => {
    const lever = JOB_BOARDS.find(b => b.id === 'lever')!;
    const url = lever.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('google.com/search');
    expect(url).toContain('site%3Ajobs.lever.co');
  });

  it('should use Google site search for Ashby', () => {
    const ashby = JOB_BOARDS.find(b => b.id === 'ashby')!;
    const url = ashby.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('google.com/search');
    expect(url).toContain('site%3Ajobs.ashbyhq.com');
  });

  it('should use Google site search for Workday', () => {
    const workday = JOB_BOARDS.find(b => b.id === 'workday')!;
    const url = workday.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('google.com/search');
    expect(url).toContain('site%3Amyworkdayjobs.com');
  });

  it('should include search terms in ATS queries', () => {
    const greenhouse = JOB_BOARDS.find(b => b.id === 'greenhouse')!;
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, role: 'Frontend Engineer', location: 'Remote' };
    const url = greenhouse.buildUrl(filters);
    expect(url).toContain('Frontend');
    expect(url).toContain('Remote');
  });

  it('should include date filter for ATS searches', () => {
    const greenhouse = JOB_BOARDS.find(b => b.id === 'greenhouse')!;
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, timePosted: 'past-week' };
    const url = greenhouse.buildUrl(filters);
    expect(url).toContain('tbs=');
  });
});

describe('URL Generation - Tech-Focused Boards', () => {
  it('should generate Wellfound URL', () => {
    const wellfound = JOB_BOARDS.find(b => b.id === 'wellfound')!;
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, role: 'Full Stack Engineer', remote: 'remote' };
    const url = wellfound.buildUrl(filters);
    expect(url).toContain('wellfound.com/jobs');
    expect(url).toContain('remote=true');
  });

  it('should generate Wellfound URL with company size filter', () => {
    const wellfound = JOB_BOARDS.find(b => b.id === 'wellfound')!;
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, companySize: ['small'] };
    const url = wellfound.buildUrl(filters);
    expect(url).toContain('company_sizes');
  });

  it('should generate Y Combinator URL', () => {
    const yc = JOB_BOARDS.find(b => b.id === 'ycombinator')!;
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, role: 'Startup Engineer' };
    const url = yc.buildUrl(filters);
    expect(url).toContain('workatastartup.com');
  });

  it('should generate Built In URL', () => {
    const builtin = JOB_BOARDS.find(b => b.id === 'builtin')!;
    const url = builtin.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('builtin.com/jobs');
  });

  it('should generate Dice URL with date sort', () => {
    const dice = JOB_BOARDS.find(b => b.id === 'dice')!;
    const url = dice.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('dice.com/jobs');
    expect(url).toContain('sort=date');
  });
});

describe('URL Generation - Remote Job Boards', () => {
  it('should generate RemoteOK URL with date order', () => {
    const remoteok = JOB_BOARDS.find(b => b.id === 'remoteok')!;
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, role: 'Developer' };
    const url = remoteok.buildUrl(filters);
    expect(url).toContain('remoteok.com');
    expect(url).toContain('order=date');
  });

  it('should generate We Work Remotely URL', () => {
    const wwr = JOB_BOARDS.find(b => b.id === 'weworkremotely')!;
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, role: 'Engineer' };
    const url = wwr.buildUrl(filters);
    expect(url).toContain('weworkremotely.com');
  });

  it('should generate Remotive URL', () => {
    const remotive = JOB_BOARDS.find(b => b.id === 'remotive')!;
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, role: 'Python Developer' };
    const url = remotive.buildUrl(filters);
    expect(url).toContain('remotive.com');
  });
});

describe('URL Generation - Company Career Pages', () => {
  it('should generate Google Careers URL', () => {
    const google = JOB_BOARDS.find(b => b.id === 'careers-google')!;
    const url = google.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('careers.google.com');
  });

  it('should generate Amazon Jobs URL with sort', () => {
    const amazon = JOB_BOARDS.find(b => b.id === 'careers-amazon')!;
    const url = amazon.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('amazon.jobs');
    expect(url).toContain('sort=recent');
  });

  it('should generate Meta Careers URL', () => {
    const meta = JOB_BOARDS.find(b => b.id === 'careers-meta')!;
    const url = meta.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('metacareers.com');
  });

  it('should generate OpenAI Careers URL', () => {
    const openai = JOB_BOARDS.find(b => b.id === 'careers-openai')!;
    const url = openai.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('openai.com/careers');
  });

  it('should generate Anthropic Careers URL', () => {
    const anthropic = JOB_BOARDS.find(b => b.id === 'careers-anthropic')!;
    const url = anthropic.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('anthropic.com/careers');
  });
});

describe('URL Generation - Niche Boards', () => {
  it('should generate Climatebase URL', () => {
    const climatebase = JOB_BOARDS.find(b => b.id === 'climatebase')!;
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, role: 'Climate Engineer' };
    const url = climatebase.buildUrl(filters);
    expect(url).toContain('climatebase.org');
  });

  it('should generate AI Jobs URL', () => {
    const aijobs = JOB_BOARDS.find(b => b.id === 'ai-jobs')!;
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, role: 'ML Engineer' };
    const url = aijobs.buildUrl(filters);
    expect(url).toContain('aijobs.net');
  });

  it('should generate CryptoJobsList URL', () => {
    const crypto = JOB_BOARDS.find(b => b.id === 'crypto-jobs')!;
    const url = crypto.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('cryptojobslist.com');
  });

  it('should generate GameDevJobs URL', () => {
    const gamedev = JOB_BOARDS.find(b => b.id === 'gamedevjobs')!;
    const url = gamedev.buildUrl(DEFAULT_FILTER_STATE);
    expect(url).toContain('gamejobs.co');
  });
});

describe('URL Generation - Language Filters', () => {
  it('should include programming languages in search query', () => {
    const linkedin = JOB_BOARDS.find(b => b.id === 'linkedin')!;
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      languages: ['python', 'javascript'],
    };
    const url = linkedin.buildUrl(filters);
    expect(url.toLowerCase()).toContain('python');
    expect(url.toLowerCase()).toContain('javascript');
  });

  it('should exclude languages with - prefix in search query', () => {
    const linkedin = JOB_BOARDS.find(b => b.id === 'linkedin')!;
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      languages: ['python'],
      excludeLanguages: ['php', 'ruby'],
    };
    const url = linkedin.buildUrl(filters);
    const decodedUrl = decodeURIComponent(url).toLowerCase();
    expect(decodedUrl).toContain('python');
    expect(decodedUrl).toContain('-php');
    expect(decodedUrl).toContain('-ruby');
  });
});

describe('URL Generation - Industry Filters', () => {
  it('should include industry terms in search query', () => {
    const indeed = JOB_BOARDS.find(b => b.id === 'indeed')!;
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      industry: ['ai-ml', 'fintech'],
    };
    const url = indeed.buildUrl(filters);
    const decodedUrl = decodeURIComponent(url).toLowerCase();
    expect(decodedUrl).toMatch(/ai|ml/);
    expect(decodedUrl).toMatch(/fintech/);
  });

  it('should exclude industries with - prefix in search query', () => {
    const indeed = JOB_BOARDS.find(b => b.id === 'indeed')!;
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      industry: ['fintech'],
      excludeIndustries: ['web3', 'gaming'],
    };
    const url = indeed.buildUrl(filters);
    const decodedUrl = decodeURIComponent(url).toLowerCase().replace(/\+/g, ' ');
    expect(decodedUrl).toMatch(/fintech/);
    expect(decodedUrl).toContain('-"blockchain web3"');
    expect(decodedUrl).toContain('-"gaming"');
  });
});
