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

const lightBoxOptions = {
  captionsData: 'alt',
  captionDelay: 250,
  captionPosition: 'bottom',
  showCounter: true,
};
let gallery = new Simplelightbox('.gallery a', lightBoxOptions);

const searchOptions = {
  BASE_URL: 'https://pixabay.com/api/',
  key: '31991088-557b1f719244b12b6790ca772',
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 40,
  page: 1,

  async getImagesByQuery(page) {
    const { data } = await axios.get(
      `${searchOptions.BASE_URL}?key=${searchOptions.key}&q=${searchOptions.q}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${searchOptions.page}`
    );

    return data;
  },
};

refs.form.addEventListener('sumbit', onFormSubmit);
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
    console.log(error);
  }
  refs.form.reset();
}
