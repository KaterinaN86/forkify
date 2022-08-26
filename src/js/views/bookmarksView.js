'use strict';

import View from './view.js';
import previewView from './previewView.js';

class bookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = 'No bookmarks yet. Find a nice recipe and bookmark it :)';
  _message = '';

  _generateMarkup() {
    return this._data.reduce(
      (str, rec) => str + previewView.render(rec, false),
      ''
    );
  }

  //calling the render method using the bookmarksView instance in the controller. We pass in the bookmarks data in the handler
  addHandlerLoadBookmarks(handler) {
    window.addEventListener('load', handler);
  }
}

export default new bookmarksView();
