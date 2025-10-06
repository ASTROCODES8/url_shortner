// --- DOM Elements ---
const shortenForm = document.getElementById('shorten-form');
const urlInput = document.getElementById('url-input');
const errorMessage = document.getElementById('error-message');
const linksContainer = document.getElementById('links-container');
const submitButton = shortenForm.querySelector('.btn--primary');

let shortenedLinks = JSON.parse(localStorage.getItem('shortenedLinks')) || [];
document.addEventListener('DOMContentLoaded', () => {
  displayShortenedLinks();
  setupEventListeners();
});

function setupEventListeners() {
  shortenForm.addEventListener('submit', handleFormSubmit);
  urlInput.addEventListener('input', clearError);
  linksContainer.addEventListener('click', handleCopyClick);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const originalUrl = urlInput.value.trim();

  if (!originalUrl) {
    showError('Please add a link');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Shortening...';

  await shortenUrl(originalUrl);

  submitButton.disabled = false;
  submitButton.textContent = 'Shorten';
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  urlInput.classList.add('error');
}

function clearError() {
  errorMessage.classList.remove('show');
  urlInput.classList.remove('error');
}

async function shortenUrl(originalUrl) {
  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ longUrl: originalUrl })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to shorten link.');
    }

    const linkData = {
      id: Date.now(),
      original: originalUrl,
      shortened: data.shortUrl
    };

    shortenedLinks.unshift(linkData);
    localStorage.setItem('shortenedLinks', JSON.stringify(shortenedLinks));

    displayShortenedLinks();
    urlInput.value = '';

  } catch (error) {
    console.error('Shortening error:', error);
    showError(error.message);
  }
}

function displayShortenedLinks() {
  linksContainer.innerHTML = '';
  shortenedLinks.forEach(linkData => {
    const linkElement = createLinkElement(linkData);
    linksContainer.appendChild(linkElement);
  });
}

function createLinkElement(linkData) {
  const card = document.createElement('div');
  card.className = 'link-card';
  card.innerHTML = `
    <p class="link-card__original">${linkData.original}</p>
    <div class="link-card__actions">
        <a href="${linkData.shortened}" target="_blank" class="link-card__short">${linkData.shortened}</a>
        <button class="btn btn--copy">Copy</button>
    </div>
  `;
  return card;
}

function handleCopyClick(e) {
  const button = e.target;
  if (!button.classList.contains('btn--copy')) return;

  const shortUrl = button.previousElementSibling.href;

  navigator.clipboard.writeText(shortUrl).then(() => {
    button.textContent = 'Copied!';
    button.classList.add('copied');
    setTimeout(() => {
      button.textContent = 'Copy';
      button.classList.remove('copied');
    }, 2000);
  });
}

