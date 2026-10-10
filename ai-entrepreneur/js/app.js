/* ============================================================
   AI Fortune Wheel - App Logic
   ============================================================ */

// AI Leaders Database
const AI_LEADERS = [
  {
    id: 1,
    name: 'Sam Altman',
    company: 'OpenAI',
    role: 'CEO',
    zodiac: '金牛',
    constellation: 'Taurus',
    tags: ['AI Leader', 'Y Combinator']
  },
  {
    id: 2,
    name: 'Elon Musk',
    company: 'Tesla/SpaceX/xAI',
    role: 'CEO',
    zodiac: '巨蟹',
    constellation: 'Cancer',
    tags: ['Tech Visionary', 'Mars Mission']
  },
  {
    id: 3,
    name: 'Jensen Huang',
    company: 'NVIDIA',
    role: 'CEO',
    zodiac: '水瓶',
    constellation: 'Aquarius',
    tags: ['GPU King', 'AI Infrastructure']
  },
  {
    id: 4,
    name: 'Satya Nadella',
    company: 'Microsoft',
    role: 'CEO',
    zodiac: '巨蟹',
    constellation: 'Cancer',
    tags: ['Cloud Computing', 'AI Transformation']
  },
  {
    id: 5,
    name: 'Dario Amodei',
    company: 'Anthropic',
    role: 'CEO',
    zodiac: '射手',
    constellation: 'Sagittarius',
    tags: ['AI Safety', 'Claude']
  },
  {
    id: 6,
    name: 'Demis Hassabis',
    company: 'Google DeepMind',
    role: 'CEO',
    zodiac: '狮子',
    constellation: 'Leo',
    tags: ['AlphaGo', 'Nobel Prize']
  },
  {
    id: 7,
    name: 'Mira Murati',
    company: 'OpenAI',
    role: 'CTO',
    zodiac: '射手',
    constellation: 'Sagittarius',
    tags: ['Tech Genius', 'Female Leader']
  },
  {
    id: 8,
    name: 'Andrej Karpathy',
    company: 'Tesla/OpenAI',
    role: 'Former AI Director',
    zodiac: '狮子',
    constellation: 'Leo',
    tags: ['Deep Learning', 'Education']
  },
  {
    id: 9,
    name: 'Andrew Ng',
    company: 'DeepLearning.AI',
    role: 'Founder',
    zodiac: '白羊',
    constellation: 'Aries',
    tags: ['AI Education', 'Coursera']
  },
  {
    id: 10,
    name: 'Fei-Fei Li',
    company: 'Stanford',
    role: 'Professor',
    zodiac: '巨蟹',
    constellation: 'Cancer',
    tags: ['AI Mother', 'ImageNet']
  }
];

// AI Companies Database
const AI_COMPANIES = [
  {
    id: 1,
    name: 'OpenAI',
    country: 'USA',
    founded: 2015,
    valuation: '$150B',
    products: ['GPT-4', 'ChatGPT'],
    industry: 'General AI'
  },
  {
    id: 2,
    name: 'Anthropic',
    country: 'USA',
    founded: 2021,
    valuation: '$60B',
    products: ['Claude'],
    industry: 'AI Safety'
  },
  {
    id: 3,
    name: 'NVIDIA',
    country: 'USA',
    founded: 1993,
    valuation: '$3T',
    products: ['GPU', 'CUDA'],
    industry: 'AI Chips'
  },
  {
    id: 4,
    name: 'Google DeepMind',
    country: 'UK',
    founded: 2010,
    valuation: 'N/A',
    products: ['Gemini', 'AlphaGo'],
    industry: 'Research'
  },
  {
    id: 5,
    name: 'Mistral AI',
    country: 'France',
    founded: 2023,
    valuation: '$6B',
    products: ['Mistral'],
    industry: 'European AI'
  },
  {
    id: 6,
    name: 'Midjourney',
    country: 'USA',
    founded: 2021,
    valuation: '$4B',
    products: ['AI Art'],
    industry: 'Creative AI'
  },
  {
    id: 7,
    name: 'Scale AI',
    country: 'USA',
    founded: 2016,
    valuation: '$14B',
    products: ['Data Labeling'],
    industry: 'AI Data'
  },
  {
    id: 8,
    name: 'Perplexity',
    country: 'USA',
    founded: 2022,
    valuation: '$3B',
    products: ['AI Search'],
    industry: 'Search Engine'
  }
];

// State Management
let currentTestType = 'person';
let selectedEntity1 = null;
let selectedEntity2 = null;
let testHistory = [];

// DOM Elements
const testTypeButtons = document.querySelectorAll('.test-type-btn');
const searchInputs = [
  document.getElementById('search1'),
  document.getElementById('search2')
];
const searchResults = [
  document.getElementById('results1'),
  document.getElementById('results2')
];
const selectedItems = [
  document.getElementById('selected1'),
  document.getElementById('selected2')
];
const startTestBtn = document.getElementById('startTest');
const randomTestBtn = document.getElementById('randomTest');
const resultDisplay = document.getElementById('resultDisplay');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeTestTypeSelector();
  initializeSearchInputs();
  initializeActionButtons();
});

// Test Type Selector
function initializeTestTypeSelector() {
  testTypeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      testTypeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTestType = btn.dataset.type;

      // Update labels
      const labels = document.querySelectorAll('.selector label');
      if (currentTestType === 'person') {
        labels[0].textContent = 'Person 1';
        labels[1].textContent = 'Person 2';
      } else {
        labels[0].textContent = 'Company 1';
        labels[1].textContent = 'Company 2';
      }

      // Clear selections
      clearSelections();
    });
  });
}

// Search Inputs
function initializeSearchInputs() {
  searchInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length > 0) {
        showSearchResults(query, index);
      } else {
        hideSearchResults(index);
      }
    });

    input.addEventListener('focus', () => {
      if (input.value.trim().length > 0) {
        showSearchResults(input.value.trim(), index);
      }
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.selector')) {
        hideSearchResults(index);
      }
    });
  });
}

function showSearchResults(query, index) {
  const results = searchResults[index];
  const database = currentTestType === 'person' ? AI_LEADERS : AI_COMPANIES;

  const filtered = database.filter(item => {
    const searchText = currentTestType === 'person'
      ? `${item.name} ${item.company} ${item.tags.join(' ')}`
      : `${item.name} ${item.country} ${item.products.join(' ')} ${item.industry}`;
    return searchText.toLowerCase().includes(query.toLowerCase());
  });

  if (filtered.length === 0) {
    results.innerHTML = '<div class="search-item"><div class="search-item-name">No results found</div></div>';
  } else {
    results.innerHTML = filtered.map(item => {
      if (currentTestType === 'person') {
        return `
          <div class="search-item" data-id="${item.id}">
            <div class="search-item-name">${item.name}</div>
            <div class="search-item-info">${item.company} · ${item.role}</div>
          </div>
        `;
      } else {
        return `
          <div class="search-item" data-id="${item.id}">
            <div class="search-item-name">${item.name}</div>
            <div class="search-item-info">${item.country} · ${item.industry}</div>
          </div>
        `;
      }
    }).join('');
  }

  results.classList.add('active');

  // Bind click events
  results.querySelectorAll('.search-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      selectEntity(index, id);
      hideSearchResults(index);
    });
  });
}

function hideSearchResults(index) {
  searchResults[index].classList.remove('active');
}

function selectEntity(index, id) {
  const database = currentTestType === 'person' ? AI_LEADERS : AI_COMPANIES;
  const entity = database.find(item => item.id === id);

  if (index === 0) {
    selectedEntity1 = entity;
  } else {
    selectedEntity2 = entity;
  }

  // Show selected item
  const selectedItem = selectedItems[index];
  if (currentTestType === 'person') {
    selectedItem.innerHTML = `
      <div class="selected-item-name">${entity.name}</div>
      <div class="selected-item-meta">
        <span>${entity.company}</span>
        <span>${entity.role}</span>
        <span>${entity.zodiac} · ${entity.constellation}</span>
      </div>
    `;
  } else {
    selectedItem.innerHTML = `
      <div class="selected-item-name">${entity.name}</div>
      <div class="selected-item-meta">
        <span>${entity.country}</span>
        <span>${entity.industry}</span>
        <span>Founded: ${entity.founded}</span>
        <span>Valuation: ${entity.valuation}</span>
      </div>
    `;
  }

  selectedItem.classList.add('active');
  searchInputs[index].style.display = 'none';

  // Update button state
  updateStartButton();
}

function clearSelections() {
  selectedEntity1 = null;
  selectedEntity2 = null;
  searchInputs.forEach(input => {
    input.style.display = 'block';
    input.value = '';
  });
  selectedItems.forEach(item => {
    item.classList.remove('active');
    item.innerHTML = '';
  });
  updateStartButton();
  resultDisplay.style.display = 'none';
}

function updateStartButton() {
  startTestBtn.disabled = !(selectedEntity1 && selectedEntity2);
}

// Action Buttons
function initializeActionButtons() {
  startTestBtn.addEventListener('click', runTest);
  randomTestBtn.addEventListener('click', runRandomTest);

  // Result actions
  document.getElementById('shareResult').addEventListener('click', shareResult);
  document.getElementById('saveResult').addEventListener('click', saveResult);
}

// Run Test
function runTest() {
  if (!selectedEntity1 || !selectedEntity2) return;

  // Calculate compatibility score
  const result = calculateCompatibility(selectedEntity1, selectedEntity2);

  // Display result
  displayResult(result);
}

function runRandomTest() {
  const database = currentTestType === 'person' ? AI_LEADERS : AI_COMPANIES;
  const idx1 = Math.floor(Math.random() * database.length);
  let idx2 = Math.floor(Math.random() * database.length);
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * database.length);
  }

  selectEntity(0, database[idx1].id);
  selectEntity(1, database[idx2].id);

  setTimeout(runTest, 500);
}

// Calculate Compatibility
function calculateCompatibility(entity1, entity2) {
  // Simple compatibility algorithm
  let score = 50;
  const tags = [];

  // Zodiac compatibility (for persons)
  if (currentTestType === 'person') {
    const zodiac1 = entity1.zodiac;
    const zodiac2 = entity2.zodiac;

    // Simple compatibility matrix
    const compatiblePairs = [
      ['金牛', '处女'], ['金牛', '摩羯'],
      ['白羊', '狮子'], ['白羊', '射手'],
      ['双子', '天秤'], ['双子', '水瓶'],
      ['巨蟹', '天蝎'], ['巨蟹', '双鱼'],
      ['狮子', '射手'], ['狮子', '白羊'],
      ['处女', '摩羯'], ['处女', '金牛'],
      ['天秤', '水瓶'], ['天秤', '双子'],
      ['天蝎', '双鱼'], ['天蝎', '巨蟹'],
      ['射手', '白羊'], ['射手', '狮子'],
      ['摩羯', '金牛'], ['摩羯', '处女'],
      ['水瓶', '双子'], ['水瓶', '天秤'],
      ['双鱼', '巨蟹'], ['双鱼', '天蝎']
    ];

    const incompatiblePairs = [
      ['白羊', '天秤'], ['金牛', '天蝎'],
      ['双子', '射手'], ['巨蟹', '摩羯'],
      ['狮子', '水瓶'], ['处女', '双鱼']
    ];

    if (zodiac1 === zodiac2) {
      score += 20;
      tags.push('Same Zodiac');
    } else if (compatiblePairs.some(pair =>
      (pair[0] === zodiac1 && pair[1] === zodiac2) ||
      (pair[1] === zodiac1 && pair[0] === zodiac2)
    )) {
      score += 25;
      tags.push('Compatible');
    } else if (incompatiblePairs.some(pair =>
      (pair[0] === zodiac1 && pair[1] === zodiac2) ||
      (pair[1] === zodiac1 && pair[0] === zodiac2)
    )) {
      score -= 20;
      tags.push('Challenging');
    }

    // Industry synergy
    if (entity1.company === entity2.company) {
      score += 15;
      tags.push('Same Company');
    }
  } else {
    // Company compatibility
    if (entity1.industry === entity2.industry) {
      score += 15;
      tags.push('Same Industry');
    }

    if (entity1.country === entity2.country) {
      score += 10;
      tags.push('Same Country');
    }

    // Size compatibility
    const valuation1 = parseValuation(entity1.valuation);
    const valuation2 = parseValuation(entity2.valuation);

    if (valuation1 && valuation2) {
      const ratio = Math.max(valuation1, valuation2) / Math.min(valuation1, valuation2);
      if (ratio < 10) {
        score += 10;
        tags.push('Similar Size');
      }
    }
  }

  // Add some randomness
  score += Math.floor(Math.random() * 10) - 5;
  score = Math.max(0, Math.min(100, score));

  // Generate blurb
  const blurbs = {
    high: [
      'This combination shows exceptional potential for collaboration and mutual success.',
      'Strong synergy detected. This partnership could lead to groundbreaking innovations.',
      'Excellent compatibility. Both parties bring complementary strengths to the table.'
    ],
    medium: [
      'Good potential for collaboration with some effort required.',
      'Moderate compatibility. Success depends on clear communication and shared goals.',
      'Decent match with room for growth. Focus on leveraging complementary skills.'
    ],
    low: [
      'Challenging combination that requires significant effort to succeed.',
      'Low natural compatibility. Success would require overcoming substantial differences.',
      'Difficult match. Consider alternative partnerships for better results.'
    ]
  };

  let compatibility = 'medium';
  if (score >= 75) compatibility = 'high';
  else if (score < 50) compatibility = 'low';

  const blurb = blurbs[compatibility][Math.floor(Math.random() * blurbs[compatibility].length)];

  return {
    score,
    compatibility,
    tags,
    blurb,
    entity1,
    entity2,
    timestamp: new Date().toISOString()
  };
}

function parseValuation(valuation) {
  if (valuation === 'N/A') return null;
  const num = parseFloat(valuation.replace(/[$BTM]/g, ''));
  if (valuation.includes('T')) return num * 1000;
  if (valuation.includes('B')) return num;
  if (valuation.includes('M')) return num / 1000;
  return num;
}

// Display Result
function displayResult(result) {
  resultDisplay.style.display = 'block';

  // Update time
  const time = new Date(result.timestamp);
  document.getElementById('resultTime').textContent = time.toLocaleString();

  // Animate score
  animateScore(result.score);

  // Update CP text
  if (currentTestType === 'person') {
    document.getElementById('resultCp').textContent =
      `${result.entity1.name} × ${result.entity2.name}`;
  } else {
    document.getElementById('resultCp').textContent =
      `${result.entity1.name} × ${result.entity2.name}`;
  }

  // Update tags
  const tagsHtml = result.tags.map(tag =>
    `<span class="tag">${tag}</span>`
  ).join('');
  document.getElementById('resultTags').innerHTML = tagsHtml;

  // Update blurb
  document.getElementById('resultBlurb').textContent = result.blurb;

  // Save to history
  testHistory.push(result);

  // Scroll to result
  resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function animateScore(targetScore) {
  const scoreNumber = document.getElementById('scoreNumber');
  const scoreCircle = document.getElementById('scoreCircle');
  const circumference = 2 * Math.PI * 90; // r = 90

  let currentScore = 0;
  const increment = targetScore / 30;

  const interval = setInterval(() => {
    currentScore += increment;
    if (currentScore >= targetScore) {
      currentScore = targetScore;
      clearInterval(interval);
    }

    scoreNumber.textContent = Math.round(currentScore);

    // Update circle
    const offset = circumference - (currentScore / 100) * circumference;
    scoreCircle.style.strokeDashoffset = offset;
  }, 30);
}

// Share & Save
function shareResult() {
  const text = `AI Fortune Wheel Result:\n${document.getElementById('resultCp').textContent}\nCompatibility: ${document.getElementById('scoreNumber').textContent}%\n\nTry it yourself: ${window.location.href}`;

  if (navigator.share) {
    navigator.share({
      title: 'AI Fortune Wheel',
      text: text,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert('Result copied to clipboard!');
    });
  }
}

function saveResult() {
  alert('Result saved to history! (Pro feature)');
}
