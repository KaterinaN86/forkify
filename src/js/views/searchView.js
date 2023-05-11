'use strict';

class searchView {
  //Initializing parent element for this view. (form element in the DOM with class name "search").
  _parentElement = document.querySelector('.search');
  /**
   *adding the handler from the controller to the eventListener (publisher subscriber pattern)
   * @param {method "controlSearchResults"} handler
   */
  addHandlerSearch(handler) {
    //we use the submit event because that way we can get the input on button click and with enter key as well
    this._parentElement.addEventListener('submit', function (e) {
      //stops the page from reloading on submit.
      e.preventDefault();
      //subscriber method declared and written in the controller.
      handler();
    });
  }

  /**
   *Returns the query from the UI
   * @returns {String} query
   */
  getQuery() {
    //Getting user entered value from the DOM.
    const query = this._parentElement.querySelector('.search__field').value;
    //we clear the field so it is ready for the next search
    this._clearInput();
    return query;
  }

  //removes the query the user has entered once the search has started
  _clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }
}

export default new searchView();
