// Get Elements From DOM
const quotesSection = document.getElementById('quotes')
const filterForm = document.getElementById('filters-form')
const countRange = document.getElementById('count')
const minTextInput = document.getElementById('text-min-length')
const maxTextInput = document.getElementById('text-max-length')
const tagSelect = document.getElementById('tag')

// Show Value Of Input Range
countRange.addEventListener('input', e => {
	document.getElementById('count-value').innerHTML = e.target.value
})

// Make Input Minimum Characters Work Normally
minTextInput.addEventListener('change', e => {
	if (e.target.value < 0) {
		e.target.value = 0
	} else if (
		e.target.value > document.getElementById('text-max-length').value &&
		document.getElementById('text-max-length').value
	) {
		e.target.value = document.getElementById('text-max-length').value
	}
})
// Make Input Maximum Characters Work Normally Maximum Characters
maxTextInput.addEventListener('change', e => {
	if (e.target.value < 0) {
		e.target.value = 0
	} else if (
		e.target.value < document.getElementById('text-min-length').value &&
		document.getElementById('text-min-length').value
	) {
		e.target.value = document.getElementById('text-min-length').value
	}
})

// Add Tags For Select
function addTags() {
	fetch('https://api.quotable.io/tags')
		.then(res => res.json())
		.then(data => {
			data.forEach(tag => {
				const option = document.createElement('option')
				option.value = tag.name
				option.innerHTML = tag.name
				tagSelect.appendChild(option)
			})
		})
}
addTags()

// Get Favorite Quotes From Local Storage
let favorites = localStorage.getItem('favorites')
	? JSON.parse(localStorage.getItem('favorites'))
	: []

// Remove Or Add Favorite Quote
function changeFavorite(id, favoriteButton) {
	if (favorites.find(favoriteId => favoriteId === id)) {
		favoriteButton.classList.remove('active')
		removeFavorite(id)
	} else {
		favoriteButton.classList.add('active')
		addFavorite(id)
	}
}
// Add Favorite Quote To LocalStorage
function addFavorite(id) {
	favorites = [...favorites, id]
	localStorage.setItem('favorites', JSON.stringify(favorites))
}
// Remove Favorite Quote To LocalStorage
function removeFavorite(id) {
	favorites = favorites.filter(favoriteId => favoriteId !== id)
	localStorage.setItem('favorites', JSON.stringify(favorites))
}

// Add Event Listener To Filter Form
filterForm.addEventListener('submit', e => {
	filter(e)
})

// Filter Function
function filter(e) {
	e.preventDefault()
	const tag = e.srcElement[0].value
	const author = e.srcElement[1].value
	const limit = e.srcElement[2].value
	const minTextLength = e.srcElement[3].value
	const maxTextLength = e.srcElement[4].value
	const onlyFavorites = e.srcElement[5].checked
	updateQuotes(tag, author, limit, minTextLength, maxTextLength, onlyFavorites)
}

// Call Funtion updateQuotes() To Show New Quotes
updateQuotes()

// Filter and Get Quotes From API
function getQuotes(tag, author, limit, minTextLength, maxTextLength) {
	// Quote API URL
	let fetchUrl = 'https://api.quotable.io/quotes'

	// Add Filters To URL
	let beforeRequest = '?'
	if (tag && tag !== 'none') {
		fetchUrl += beforeRequest + 'tags=' + tag
		beforeRequest = '&'
	}
	if (author) {
		fetchUrl += beforeRequest + 'author=' + author
		beforeRequest = '&'
	}
	if (limit) {
		fetchUrl += beforeRequest + 'limit=' + limit
		beforeRequest = '&'
	}
	if (minTextLength) {
		fetchUrl += beforeRequest + 'minLength=' + minTextLength
		beforeRequest = '&'
	}
	if (maxTextLength) {
		fetchUrl += beforeRequest + 'maxLength=' + maxTextLength
		beforeRequest = '&'
	}

	// Return Data From Api
	return fetch(fetchUrl)
		.then(res => res.json())
		.then(data => {
			return data.results
		})
}

// Delete Previous Quotes And Add New Ones
async function updateQuotes(
	tag,
	author,
	limit,
	minTextLength,
	maxTextLength,
	onlyFavorites
) {
	// Delete Previous Quotes
	while (quotesSection.lastChild) {
		quotesSection.removeChild(quotesSection.lastChild)
	}

	// Get Quotes From API
	const quotes = await getQuotes(
		tag,
		author,
		limit,
		minTextLength,
		maxTextLength,
		onlyFavorites
	)

	// Sort Randomly Quotes
	for (let i = quotes.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[quotes[i], quotes[j]] = [quotes[j], quotes[i]]
	}

	// Get Each Quote
	quotes?.forEach((quote, index) => {
		// Filter Favorites
		if (
			onlyFavorites &&
			!favorites.find(favoriteId => favoriteId === quote._id)
		)
			return

		// Create Elements For Creating Quote
		const quoteTag = document.createElement('div')
		const quoteAuthorTag = document.createElement('h3')
		const quoteTextTag = document.createElement('q')
		const quoteTagsTag = document.createElement('div')
		const favoriteButton = document.createElement('button')
		const favoriteImage = document.createElement('img')
		const favoriteActiveImage = document.createElement('img')
		const shareButton = document.createElement('a')

		// Change Properties Of Elements
		quoteTag.classList.add('quote')
		quoteTag.style.animationDuration = Math.random() * 0.7 + 0.3 + 's'
		quoteAuthorTag.innerHTML = quote.author
		quoteAuthorTag.classList.add('author')
		quoteTextTag.innerHTML = quote.content
		quoteTextTag.classList.add('text')
		favoriteButton.classList.add('favorite')
		favoriteButton.addEventListener(
			'click',
			changeFavorite.bind(window, quote._id, favoriteButton)
		)
		favorites.forEach(favoriteId => {
			if (favoriteId === quote._id) {
				favoriteButton.classList.add('active')
			}
		})
		favoriteImage.src = './images/heart.png'
		favoriteActiveImage.src = './images/heart-active.png'
		favoriteImage.id = 'heart-' + index
		favoriteActiveImage.id = 'heart-active-' + index
		shareButton.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
			quote.content
		)}`
		shareButton.innerHTML = '<img src="./images/share.png"/>'
		shareButton.classList.add('share-button')
		quote.tags.forEach(tag => {
			const tagSpan = document.createElement('span')
			tagSpan.innerHTML = tag
			quoteTagsTag.appendChild(tagSpan)
		})

		// Add Elements Into DOM
		quoteTag.appendChild(shareButton)
		quoteTag.appendChild(quoteAuthorTag)
		quoteTag.appendChild(quoteTextTag)
		favoriteButton.appendChild(favoriteImage)
		favoriteButton.appendChild(favoriteActiveImage)
		quoteTag.appendChild(favoriteButton)
		quotesSection.appendChild(quoteTag)
		quoteTag.appendChild(quoteTagsTag)
	})
}
