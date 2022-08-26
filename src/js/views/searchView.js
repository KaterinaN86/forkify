'use strict';

class searchView {
  _parentElement = document.querySelector('.search');

  //adding the handler from the controller to the eventListener (piblisher subscriber pattern)
  addHandlerSearch(handler) {
    //we use the submit event because that way we can get the input on button click and with enter as well
    this._parentElement.addEventListener('submit', function (e) {
      //stops the page from reloading on submit
      e.preventDefault();
      //subscriber method
      handler();
    });
  }

  //we return the query from the UI
  getQuery() {
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
