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
refs.form.addEventListener('submit', onFormSubmit);
function clearPreviousRequest() {
  refs.galleryContainer.innerHTML = '';
}
function onClick(evt) {
  evt.preventDefault();
  lightbox.open('.gallery');
}
function onSuccessfulExecution(answer) {
  renderMarkup(answer);
  lightbox.refresh();
  refs.galleryContainer.addEventListener('click', onClick);
  showSuccessNotification(answer);
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
  //const searchValue = searchOptions.q;
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
}
function showInfoNotification() {
  Notify.info("The search term couldn't be empty.");
}
function showSuccessNotification(answer) {
  Notify.success(`Hooray! We found ${answer.data.totalHits} images.`);
}
