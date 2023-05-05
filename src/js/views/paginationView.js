'use strict';

import View from './view.js';

import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  _generateMarkup() {
    //calculating the number of pages - we need to round it up to the next closest integer
    const numPages = Math.ceil(
      this._data.results.length / this._data.resPerPage
    );

    //here we define the text that will show the use what the current page is
    const total = `<div class="btn--inline btn--page"> ${this._data.currPage} of ${numPages} </div>`;

    //only one page
    if (numPages === 1) return total;

    //on the first page
    if (this._data.currPage === 1 && numPages > 1) {
      return this._generateButtonMarkup('next') + total;
    }
    //on the last page
    if (this._data.currPage === numPages && this._data.currPage > 1) {
      return this._generateButtonMarkup('prev') + total;
    }

    //a page in between
    return (
      this._generateButtonMarkup('prev') +
      this._generateButtonMarkup('next') +
      total
    );
  }

  _generateButtonMarkup(direction) {
    //the number that needs to be displayed on the button itself
    const number =
      direction === 'next' ? this._data.currPage + 1 : this._data.currPage - 1;

    //button element
    const markup = `<button data-page='${number}' class="btn--inline pagination__btn--${direction}">`;

    //button text
    const span = `<span>Page ${number}</span>`;

    //icon element. The arrow has different direction depending on the direction argument. It points to the right when the direction is next and to the left if the direction is previous
    const icon = `<svg class="search__icon">
    <use href="${icons}#icon-arrow-${
      direction === 'next' ? 'right' : 'left'
    }"></use>
  </svg>`;

    //depending on the direction the page number is shown first or the icon is shown first
    return `${markup}${
      direction === 'next' ? span + icon : icon + span
    }</button>`;
    //if direction is next the page number is shown first and if direction is previous the icon is shown first
  }

  //publisher method
  addButtonHandler(handler) {
    //we add the event listener to the whole pagination div and then we delegate it
    this._parentElement.addEventListener('click', function (e) {
      //element that was clicked
      const btn = e.target.closest('.btn--inline');
      //guard clause so we avoid the null error
      if (!btn) return;

      //we look for the closest parent containing the btn--inline class and in that element we select the dataset attribute. We pass this argument to the controller
      handler(+btn.dataset.page);
    });
  }
}

export default new PaginationView();
