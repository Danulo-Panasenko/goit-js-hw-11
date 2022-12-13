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
var lightbox = new SimpleLightbox('.gallery a', lightBoxOptions);

async function onFormSubmit(e) {
  e.preventDefault();
  const {
    elements: { searchQuery },
  } = e.currentTarget;
  const searchValue = searchQuery.value.trim().toLowerCase();
  try {
    const collection = await getImagesByQuery();

    console.log(collection);
  } catch (error) {
    console.log(error.message);
  }
  refs.form.reset();
}
refs.form.addEventListener('sumbit', onFormSubmit);

const BASE_URL = 'https://pixabay.com/api/';
const searchOptions = {
  key: '24406319-bf3b8b8cf58844aea35169848',
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
function createGallery(images) {
  return images
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
}
refs.galleryContainer.insertAdjacentHTML('beforeend', createGallery);
