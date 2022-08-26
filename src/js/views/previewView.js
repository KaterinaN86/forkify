'use strict';
import View from './view.js';

import icons from 'url:../../img/icons.svg';

class previewView extends View {

  //parent element depends on the instance that will use this class (BookmarksView or ResultsView)
  
  _parentElement = '';

  //we need to remove the active class in order to avoid all the recipes being highlighted
  //we also remove the preview-user_generated div because we don't need it for now
  _generateMarkup() {
    const currentId = window.location.hash.slice(1); //with this we get the id of the current recipe from the hash in the url

    //next we need to check if the currentId is equal to the one in the recipe from the results
    //href="#${this._data.id}" in the <a> element sets the hash value to the id of the selected recipe so it's data will be rendered bbecause there is an event listener on the 'hashchange' event
    return `<li class="preview">
    <a class="preview__link ${
      currentId === this._data.id ? 'preview__link--active' : ''
    }" href="#${this._data.id}">
      <figure class="preview__fig">
        <img src="${this._data.image}" alt="Test" />
      </figure>
      <div class="preview__data">
    
        <h4 class="preview__title">${this._data.title}</h4>
        <p class="preview__publisher">${this._data.publisher}</p>
        <div class="preview__user-generated ${this._data.key ? '' : 'hidden'}">
        <svg>
          <use href="${icons}#icon-user"></use>
        </svg>
      </div>
      </div>
    </a>
  </li>`;
  }
}

export default new previewView();
