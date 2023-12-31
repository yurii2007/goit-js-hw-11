import { Notify } from "notiflix";
import { SearchPhoto } from "./pixabay-api";
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css'
import { renderImages, createMarkup } from "./helpers";
import { refs } from "./refs";
const {searchForm, galleryElem, btnLoadMore} = refs;

const searchPhoto = new SearchPhoto();
let userParams;
let modalBox;

searchForm.addEventListener('submit', onSubmit);

async function onSubmit(evt){
    evt.preventDefault();
    searchPhoto.page = 1;
    btnLoadMore.classList.add('visually-hidden')


    userParams = searchForm.elements.searchQuery.value.toLowerCase().trim().split(' ').join('+');
    if(!userParams) return Notify.failure('Please enter a valid key')

    galleryElem.innerHTML = '';
    const result = await searchPhoto.getPhoto(userParams)

    if(!result.hits.length) return Notify.failure("Sorry, there are no images matching your search query. Please try again.")
    Notify.success(`Hooray! We found ${result.totalHits} images.`)

    result.hits.map(data=>{
        renderImages(galleryElem, createMarkup(data));
    })
    if(result.totalHits > 40) btnLoadMore.classList.remove('visually-hidden')

    modalBox = new SimpleLightbox('.gallery a')
}

btnLoadMore.addEventListener('click', onClickLoadMore)

async function onClickLoadMore() {
    searchPhoto.page += 1;
    btnLoadMore.classList.add('visually-hidden')
    const result = await searchPhoto.getPhoto(userParams)
    
    if(!result.hits.length) return Notify.failure("We're sorry, but you've reached the end of search results.")

    result.hits.map(data=>{
        renderImages(galleryElem, createMarkup(data));
    })
    modalBox.refresh()
    if(result.totalHits <= (searchPhoto.page * searchPhoto.per_page)) return Notify.failure("We're sorry, but you've reached the end of search results.")
    btnLoadMore.classList.remove('visually-hidden')
}