'use strict';

import icons from 'url:../../img/icons.svg';

//we export the entire class because we are never creating an instance, we are simply using it as a parent class
//the methods in this class are in common for all of the views but the results are different thanks to the parent element and the different data recieved from the controller
export default class View {
  //data that needs to be displayed
  _data;

  //external function for adding the spinner
  //this method is public so that the controller can call it
  renderSpinner() {
    const markup = `
  <div class="spinner">
    <svg>
      <use href="${icons}#icon-loader"></use>
    </svg>
  </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * this method together with the two properties will be present in all the view classes. It is public and we use it to pass in the data from the controller
   * @param {Object} data that needs to be rendered (a recipe object, a result object, bookmarks, week schedule, shoppingList)
   * @param {boolean} render clears parent content and inserts markup when true, returns markup as string when false
   * @return {String, undefined} String when it is called by a PreviewView instance or undefined otherwise
   */
  render(data, render = true) {
    //we need to check if there is data and if that data is an empty array because in that case we need to handle this error by rendering the error message in the parent element
    if (
      !data ||
      //checking if the data  is an empty array (for example no results from performed search)
      (Array.isArray(data) && data.length === 0) ||
      //checking if data is a week array (this points to a scheduleView object which contains the schedule property) and if there are any scheduled recipes
      (this._schedule && !data.some(el => el.length > 1))
    )
      return this.renderError();

    //the data property is initialized to the data passed in by the controller
    this._data = data;

    //the specific markup depending on the view instance type is generated
    const markup = this._generateMarkup();

    //when render is called by a PreviewView instance this parameter is false because the render method needs to return a string and not actually render the markup
    if (!render) return markup;

    this._clear();
    //displaying the markup
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  //removes content form parent element
  _clear() {
    this._parentElement.innerHTML = '';
  }

  /**
   * displaying an error message in the parentElement
   * @param {String} message default value is set in every child class depending on the type of the view
   */
  renderError(message = this._errorMessage) {
    this._clear();
    const markup = `
  <div class="error">
      <div>
        <svg>
        <use href="${icons}#icon-alert-triangle"></use>
        </svg>
      </div>
      <p id="error-message-p-element">${message}</p>
  </div>`;
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  //displaying a success message in the parentElement
  renderMessage(message = this._message) {
    this._clear();

    const markup = `   <div class="message">
    <div>
      <svg>
        <use href="${icons}#icon-smile" id="smile-message-img"></use>
      </svg>
    </div>
    <p>${message}</p>
  </div>`;
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  //this method can be used instead of the render method whenever we want to update only a part of the interface. That part is the text and the attributes, like for example when we want to highlight the active recipe or change the quantity in ingredients based on the change in servings
  update(data) {
    this._data = data;

    //based on the data received by the controller new markup is generated
    const newMarkup = this._generateMarkup();

    //creating a virtual DOM object so that we can compare it to the actual DOM object living on our page
    const newElements = Array.from(
      document
        .createRange()
        .createContextualFragment(newMarkup)
        .querySelectorAll('*')
    ); //with query selector all we can get all of the new elements of our virtual DOM object

    const currElements = Array.from(this._parentElement.querySelectorAll('*')); //all of the elements in our current parent element

    //looping over the two arrays at the same time
    newElements.forEach((newElement, i) => {
      const currElement = currElements[i];
      //we use the isEqualNode method to compare the content of the both elements. We also use the nodeVale property that is a String equal to the text content if the Element contains text otherwise it is null. We also use the property called firstChild that returns the node's first child in the DOM tree if there is any. White space interferes with the result of first child and that is why the result from firstChild is often a text node '#text'

      if (
        !newElement.isEqualNode(currElement) &&
        //if the first child exists (optional chaining) and it is a node that contains an element instead text than the nodeValue will be null
        newElement.firstChild?.nodeValue.trim() !== ''
      )
        //we need to be careful when using this property because setting textContent on a node removes all of the node's children and replaces them with a single text node with the given string value
        currElement.textContent = newElement.textContent;

      if (!newElement.isEqualNode(currElement)) {
        //we create an array of all the attributes of the elements that are different (for example [class] or [data-new-servings, class]). We use the forEach method to loop over that array and set the attribute of the corresponding element of our current DOM
        Array.from(newElement.attributes).forEach(attribute =>
          currElement.setAttribute(attribute.name, attribute.value)
        ); //each attribute is an object that contains the name and value properties
      }
    });
  }
}
