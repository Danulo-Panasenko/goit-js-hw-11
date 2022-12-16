import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('.search-form__input'),
  loadMoreBtn: document.querySelector('.load-more'),
  galleryContainer: document.querySelector('.gallery'),
};

const lightBoxOptions = {
  captionsData: 'alt',
  captionDelay: 250,
  captionPosition: 'bottom',
  showCounter: true,
};
let lightbox = new SimpleLightbox('.gallery a', lightBoxOptions);

async function onFormSubmit(e) {
  e.preventDefault();
  clearPreviousRequest();
  searchOptions.page = 0;
  const {
    elements: { searchQuery },
  } = e.currentTarget;
  searchOptions.q = searchQuery.value.trim().toLowerCase();
  if (searchOptions.q === '') {
    showInfoNotification();
    clearPreviousRequest();

    return;
  }

  try {
    const collection = await getImagesByQuery();
    onSuccessfulExecution(collection);
  } catch (error) {
    console.log(error);
  }
  refs.form.reset();
}

function clearPreviousRequest() {
  refs.galleryContainer.innerHTML = '';
  refs.loadMoreBtn.classList.add('visually-hidden');
}
function onClick(evt) {
  evt.preventDefault();
  lightbox.open('.gallery');
}
function onSuccessfulExecution(answer) {
  renderMarkup(answer);

  refs.galleryContainer.addEventListener('click', onClick);
  showSuccessNotification(answer);
  lightbox.refresh();
}

const BASE_URL = 'https://pixabay.com/api/';
const searchOptions = {
  key: '31991088-557b1f719244b12b6790ca772',
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 40,
  page: 1,
};
async function getImagesByQuery() {
  searchOptions.page += 1;
  const searchParams = { params: searchOptions };
  const response = await axios.get(BASE_URL, searchParams);

  if (response.data.hits.length === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  return response;
}
async function onLoadMore(e) {
  const collection = await getImagesByQuery();
  onSuccessfulExecution(collection);
  lightbox.refresh();

  const markup = renderMarkup(data.hits);
  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
  page += 1;
  const totalPage = (await data.totalHits) / 40;
  if (page >= totalPage) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    refs.loadMoreBtn.setAttribute('disabled', true);
  }
  await smoothScroll();
}

async function smoothScroll() {
  const { height: cardHeight } =
    refs.galleryContainer.querySelector.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
function renderMarkup({ data }) {
  const markup = data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
   <a href="${largeImageURL}"><img class="preview-image" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
   <div class="info">
     <p class="info-item">
       <b>Likes: </b>${likes}
     </p>
     <p class="info-item">
       <b>Views: </b>${views}
     </p>
     <p class="info-item">
       <b>Comments: </b>${comments}
     </p>
     <p class="info-item">
      <b>Downloads: </b>${downloads}
     </p>
   </div>
 </div> `
    )
    .join('');
  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
  refs.loadMoreBtn.classList.remove('visually-hidden');
}
function showInfoNotification() {
  Notify.info("The search term couldn't be empty.");
}
function showSuccessNotification(answer) {
  Notify.success(`Hooray! We found ${answer.data.totalHits} images.`);
}

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);
