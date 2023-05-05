'use strict';
import View from './view.js';
import icons from 'url:../../img/icons.svg';

//this view is a bit different because the markup is already present in our page but we just need to show it
class shoppingListView extends View {
  //the parent element is an upload form that is already a part of the HTML but it is hidden
  //we choose this element as a parent because we can later use the submit event on the form element
  _parentElement = document.querySelector('.shopping__list');
  _errorMessage =
    'Shopping list is empty! Choose a recipe and add ingredients :)';

  //in this view we also need some other DOM elements

  //the overlay is displayed over all of the elements except the form
  _overlay = document.querySelector('.overlay-list');

  //the modal
  _window = document.querySelector('.add-list-window');

  //open and close buttons
  _closeModalBtn = document.querySelector('.btn--close-list-modal');
  _openModalBtn = document.querySelector('.nav__btn--shopping');

  //the constructor is called as soon as the instance is imported in the controller
  constructor() {
    //we write this because of inheritance. Only after we call super we can use the this keyword
    super();

    //listeners for open and close
    this._addHandlerCloseList();
    this._addHandlerShowList();

    // this._addHandlerSubmitIng();
  }

  //hides the modal when shown and vice versa
  _toggleAddList() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  //we use bind because the this keyword points to the element on which the listener is attached
  _addHandlerShowList = function () {
    this._openModalBtn.addEventListener(
      'click',
      this._toggleAddList.bind(this)
    );
  };

  //the modal is closed on the 'x' button as well as when the user clicks on the overlay put on the background
  _addHandlerCloseList = function () {
    //the bind method returns the toggleAddRecipe function with the this keyword set to the object
    this._overlay.addEventListener('click', this._toggleAddList.bind(this));

    this._closeModalBtn.addEventListener(
      'click',
      this._toggleAddList.bind(this)
    );
  };

  _generateMarkup() {
    return this._data
      .map(
        ing =>
          `<li class="shopping__item" data-id="${ing.id}">
      <div class="shopping__count">
        <input type="number" value="${
          ing.quantity ? ing.quantity : ''
        }" step="1" />
        <p>${ing.unit}</p>
      </div>
      <p class="shopping__description">${ing.description}</p>
      <button class="shopping__delete btn--tiny tooltip">
      <span class="tooltiptext">Remove ingredient</span>
        <svg>
          <use href="${icons}#icon-circle-with-cross"></use>
        </svg>
      </button>
    </li>`
      )
      .join('');
  }

  addHandlerUpdateQuantity(handler) {
    this._parentElement.addEventListener('change', function (e) {
      const btn = e.target.closest('.shopping__count');
      if (!btn) return;

      const itemId = e.target.closest('.shopping__item').dataset.id;

      const quantity = +e.target.value;

      handler(itemId, quantity);
    });
  }

  addHandlerDeleteIng(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const delBtn = e.target.closest('.shopping__delete');
      const id = e.target.closest('.shopping__item').dataset.id;
      if (!delBtn) return;
      handler(id);
    });
  }

  //publisher method, it calls the argument function passed by the controller
  addHandlerLoadShopping = function (handler) {
    window.addEventListener('load', handler);
  };
}

export default new shoppingListView();
