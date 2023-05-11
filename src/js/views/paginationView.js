'use strict';

import View from './view.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  //Initializing parent element for current view.
  _parentElement = document.querySelector('.pagination');

  /**
   * Generates markup for current view.
   * @returns {String} HTML code that consists of buttons "previous" and "next". Current page number is also displayed.
   */
  _generateMarkup() {
    //calculating the number of pages - we need to round it up to the next closest integer
    const numPages = Math.ceil(
      this._data.results.length / this._data.resPerPage
    );
    //Variable that sores markup of displaying info about current page.
    const total = `<div class="btn--inline btn--page"> ${this._data.currPage} of ${numPages} </div>`;
    //When there is only one page, only info about current page is displayed.
    if (numPages === 1) return total;
    //when current page is the first one, only "next" button is displayed besides current page info.
    if (this._data.currPage === 1 && numPages > 1) {
      return this._generateButtonMarkup('next') + total;
    }
    //when current page is the last one, only "previous" button is displayed besides current page info.
    if (this._data.currPage === numPages && this._data.currPage > 1) {
      return this._generateButtonMarkup('prev') + total;
    }
    //a page in between the first and last is the current.
    return (
      this._generateButtonMarkup('prev') +
      this._generateButtonMarkup('next') +
      total
    );
  }

  /**
   * Used to generate markup for button in pagination view.
   * @param {String} direction
   * @returns {String} generated markup for corresponding buttons.
   */
  _generateButtonMarkup(direction) {
    //the number that needs to be displayed on the button itself
    const number =
      direction === 'next' ? this._data.currPage + 1 : this._data.currPage - 1;

    //button element markup
    const markup = `<button data-page='${number}' class="btn--inline pagination__btn--${direction}">`;

    //button text
    const span = `<span>Page ${number}</span>`;

    //icon element. The arrow has different direction depending on the direction argument. It points to the right when the direction is "next" and to the left if the direction is "previous".
    const icon = `<svg class="search__icon">
    <use href="${icons}#icon-arrow-${
      direction === 'next' ? 'right' : 'left'
    }"></use>
  </svg>`;

    //depending on the direction the page number is shown first or the icon is shown first. If direction is next the page number is shown first and if direction is previous the icon is shown first.
    return `${markup}${
      direction === 'next' ? span + icon : icon + span
    }</button>`;
  }

  //publisher method
  addButtonHandler(handler) {
    //we add the event listener to the whole pagination div and then we delegate it
    this._parentElement.addEventListener('click', function (e) {
      //element that was clicked
      const btn = e.target.closest('.btn--inline');
      //guard clause so we avoid the null error
      if (!btn) return;
      //we look for the closest parent containing the btn--inline class and in that element we select the dataset attribute. We pass this argument to the controller.
      handler(+btn.dataset.page);
    });
  }
}
export default new PaginationView();
