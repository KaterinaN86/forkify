'use strict';

import View from './view.js';
import previewView from './previewView.js';

class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = 'No recipe was found! Please try again...';
  _message = '';

  //in this function we use am instance of the previewView class. When the render method is called by this instance the second argument is set to false so that the render method returns the generated markup as a string and it doesn't insert it in the HTML
  _generateMarkup() {
    //returns a string containing the markup for all of the previews of the recipes in the results from the query
    //the actuall rendering of this string happens when the render method is called by a resultsView instance (in the controller)
    return this._data.reduce(
      (str, rec) => str + previewView.render(rec, false),
      ''
    );
  }
}

export default new ResultsView();
