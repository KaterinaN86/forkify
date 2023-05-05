'use strict';
import View from './view.js';

import { MODAL_DATA } from '../config.js';

//this view is a bit different because the markup is already present in our page but we just need to show it
class addRecipeView extends View {
  //the parent element is an upload form that is already a part of the HTML but it is hidden
  //we choose this element as a parent because we can later use the submit event on the form element
  _parentElement = document.querySelector('.upload');

  //in this view we also need some other DOM elements

  //the overlay is displayed over all of the elements except the form
  _overlay = document.querySelector('.overlay');
  //the modal
  _window = document.querySelector('.add-recipe-window');

  //open and close buttons
  _closeModalBtn = document.querySelector('.btn--close-modal');
  _openModalBtn = document.querySelector('.nav__btn--add-recipe');
  _errorMessage = 'Wrong input. Please try again!';
  _message = 'Your recipe was uploaded! :)';

  //an array in which we store the data for multiple ingredients
  _textAreaArr = [];

  //the constructor is called as soon as the instance is imported in the controller
  constructor() {
    //we write this because of inheritance. Only after we call super we can use the this keyword
    super();

    //listeners for open and close
    this._addHandlerCloseRecipe();
    this._addHandlerAddRecipe();

    //listener for the submit button for the ingredients
    this._addHandlerSubmitIng();
  }

  //hides the modal when shown and vice versa
  _toggleAddRecipe() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');

    //this adds the markup after an error or success message has been shown
    if (!this._window.classList.contains('hidden'))
      this._parentElement.innerHTML = MODAL_DATA;
  }

  //we use bind because the this keyword inside the callback function points to the element on which the listener is attached
  _addHandlerAddRecipe = function () {
    // //this text area contains our ingredient list
    // this._textAreaArr = [];

    this._openModalBtn.addEventListener(
      'click',
      this._toggleAddRecipe.bind(this)
    );
  };

  //the modal is closed on the 'x' button as well as when the user clicks on the overlay put on the background
  _addHandlerCloseRecipe = function () {
    //the bind method returns the toggleAddRecipe function with the this keyword set to the object
    this._overlay.addEventListener('click', this._toggleAddRecipe.bind(this));

    this._closeModalBtn.addEventListener(
      'click',
      this._toggleAddRecipe.bind(this)
    );
  };

  //uploads our data if it is correctly formatted
  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      //prevents page reload
      e.preventDefault();
      //form data is a modern browser API that we can use to retrieve data from the DOM. When we call the constructor we need to pass in a form element
      const entries = [...new FormData(this)]; //we can spread the object into an array in order to access the data
      // console.log(entries);
      if (!entries) this.renderError(_errorMessage);

      //the list of ingredients is located in a text area
      const textArea = this.querySelector('.label--ingredients');
      //we create an array from the ingredients String
      const ingArray = textArea.value.split(';');
      //we add each ingredient to the entries array so we can later create the recipe object with the correct format
      ingArray.forEach((element, i) => {
        entries.push([`ingredient${i + 1}`, element]);
      });

      //we can use Object.fromEntries since ES2019 in order to convert an array into an object
      const data = Object.fromEntries(entries);

      //we clear the ingredients textArea
      textArea.value = '';

      handler(data);
    });
  }

  //method that checks if the entered quantity is a number and if the user has entered a description
  _valdateIngInput(quantity, description) {
    if (!Number.isFinite(+quantity.value)) quantity.value = undefined;

    if (description.value === '') description.value = undefined;
  }

  /**
   *checks if the data entered by the user corresponds to the requirements
   * @param {Event} e event object and it represents the event being fired
   * @returns
   */
  _getIngredient(e) {
    const btn = e.target.closest('.btn--submit');
    //guard clause
    if (!btn) return;

    const quantity = document.getElementById('quantity');
    const unit = document.getElementById('unit');
    const description = document.getElementById('description');
    const textArea = document.querySelector('.label--ingredients');

    //resetting the ingredients array if there are no ingredients in the text area
    if (!textArea.value.includes(',')) this._textAreaArr = [];

    //we hide the label that notifies the user if the input is not valid
    const labelWrong = document.querySelector('.label--wrong');
    labelWrong.classList.add('hidden');
    //helper function that checks if there is a description and if quantity is a number
    this._valdateIngInput(quantity, description);

    //a string made up of the data entered by the user
    const ing = [quantity.value, unit.value, description.value].join(',');

    //if quantity is not a number and there is no description notValid wil be true
    const notValid = ing.includes('undefined');

    //adding the data for one ingredient to the ingredients array
    if (!notValid) this._textAreaArr.push(ing);
    //showing the label for wrong input
    else labelWrong.classList.remove('hidden');

    //showing the ingredients
    textArea.value = this._textAreaArr.join('; ');

    //resetting quantity, unit and description
    quantity.value = unit.value = description.value = '';
  }

  //checking if the data for the ingredient is valid
  _addHandlerSubmitIng() {
    this._window.addEventListener('click', this._getIngredient.bind(this));
  }
}
export default new addRecipeView();
