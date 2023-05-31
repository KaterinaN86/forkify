'use strict';

//setting the path to the images after parcel has performed transpiling and polyfilling
import icons from 'url:../../img/icons.svg'; //new path to the icons(http://localhost:1234/icons.dfd7a6db.svg?1656793914508) we write url: for every static asset that is not a programing file

//the view part is typically bigger and that is why we often separate it into different files
//we use a class because there will be a parent class View that will contain methods and properties that all the other view classes inherit. This also enables encapsulating properties and methods we want to keep private

//importing from npm libraries doesn't require specifying a path
import fracty from 'fracty';

import View from './view.js';

class RecipeView extends View {
  _parentElement = document.querySelector('.recipe');
  _errorMessage = `We couldn't find the recipe! Please try another.`;
  _message = ``;

  //in this view we generate markup that shows the bookmark icon (empty or filled) the schedule dropdown and also a delete recipe icon. If the recipe has an unique user key it means it has been uploaded by the user and only the user can see it and delete it from database.
  _generateMarkup() {
    return `
    <figure class="recipe__fig">
    <img src= "${this._data.image}" alt="${
      this._data.title
    }" class="recipe__img" />
    <h1 class="recipe__title">
      <span>${this._data.title}</span>
    </h1>
  </figure>

  <div class="recipe__details">
    <div class="recipe__info">
      <svg class="recipe__info-icon">
        <use href="${icons}#icon-clock"></use>
      </svg>
      <span class="recipe__info-data recipe__info-data--minutes">${
        this._data.cookingTime
      }</span>
      <span class="recipe__info-text">minutes</span>
    </div>
    <div class="recipe__info">
      <svg class="recipe__info-icon">
        <use href="${icons}#icon-users"></use>
      </svg>
      <span class="recipe__info-data recipe__info-data--people">${
        this._data.servings
      }</span>
      <span class="recipe__info-text">servings</span>

      <!-- The new servings button have data that is equal to the current servings plus or minus 1, depending on which button we use. This is how we define the value of the new servings -->
      <div class="recipe__info-buttons">
        <button data-new-servings="${
          this._data.servings - 1
        }" class="btn--tiny btn--update-servings">
          <svg>
            <use href="${icons}#icon-minus-circle"></use>
          </svg>
        </button>
        <button data-new-servings="${
          this._data.servings + 1
        }" class="btn--tiny btn--update-servings">
          <svg>
            <use href="${icons}#icon-plus-circle"></use>
          </svg>
        </button>
      </div>
    </div>
<!-- Each of the days has an id that we can use to determine what day was selected -->
    <div class="dropdown">  
    <button class="btn dropbtn"><svg>
    <use href="${icons}#icon-calendar"></use>
  </svg>
  <span>Schedule</span></button>
    <div class="dropdown-content">
      <a id='0' >Monday</a>
      <a id='1'>Tuesday</a>
      <a id='2' >Wednesday</a>
      <a id='3' >Thursday</a>
      <a id='4' >Friday</a>
      <a id='5' >Saturday</a>
      <a id='6' >Sunday</a>     
    </div>
    <div>&nbsp; &nbsp;</div>
  </div> 
    <button class="btn--round btn--bookmark tooltip">
      <svg class="">
        <use href="${icons}#icon-bookmark${
      this._data.bookmarked === true ? '-fill' : ''
    }"></use>
      </svg>
      <!-- on hover this text is shown as a tooltip -->
    <span class="tooltiptext">Bookmark recipe</span>
    </button>
  
    <button class="btn--round btn--shopping tooltip">
    <svg class="">
      <use href="${icons}#icon-checklist"></use>
    </svg>
    <!-- on hover this text is shown as a tooltip -->
    <span class="tooltiptext">Add to shopping list</span>
  </button>
  <!-- This user icon gets shown only if the recipe was uploaded by the user. On hover a tooltip is shown warning that when clicked the recipe will be deleted from the database -->
    <button class="btn--round btn--shopping recipe__delete tooltip ${
      this._data.key ? '' : 'hidden'
    }">
    <svg>
    <use href="${icons}#icon-squared-cross"></use>
  </svg>
  <span class="tooltiptext">Remove user recipe</span>
    </button>

</div>
  </div>

  <div class="recipe__ingredients">
    <h2 class="heading--2">Recipe ingredients</h2>
    <ul class="recipe__ingredient-list">
    <!-- adding generated HTML for list of ingredients. Join method is used to convert array to String. -->
    ${this._data.ingredients
      .map(this._generateMarkupIngredient)
      .join('')}          
</ul>
  <div class="recipe__directions">
    <h2 class="heading--2">How to cook it</h2>
    <p class="recipe__directions-text">
      This recipe was carefully designed and tested by
      <span class="recipe__publisher">${
        this._data.publisher
      }</span>. Please check out
      directions at their website.
    </p>
    <a
      class="btn--small recipe__btn"
      href="${this._data.sourceUrl}"
      target="_blank"
    >
      <span>Directions</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </a>
  </div>`;
  }

  //refactoring to make the generate markup method smaller
  _generateMarkupIngredient(ing) {
    return `<li class="recipe__ingredient">

    <svg class="recipe__icon">
      <use href="${icons}#icon-check"></use>
    </svg>
    <div class="recipe__quantity">${
      ing.quantity ? fracty(ing.quantity) : ''
    }</div>
    <div class="recipe__description">
      <span class="recipe__unit">${ing.unit}</span>
      ${ing.description}
    </div>
  </li>`;
  }

  //whenever the hash changes in the url the recipe with that id wil be rendered. This method just fires the event when the change happens
  addHandlerRender(handler) {
    //simulating a page load with a recipe id and a user search of a recipe
    //running the same handler for multiple events
    ['load', 'hashchange'].forEach(ev => window.addEventListener(ev, handler));
  }

  //whenever the user clicks the + or - button the fired event is caught by this listener
  addHandlerUpdateServings(handler) {
    //we add the eventListener on the parent element and than we use event delegation
    this._parentElement.addEventListener('click', function (e) {
      //we find the closest parent with a certain class
      const btn = e.target.closest('.btn--update-servings');
      if (!btn) return;
      //with every click of the buttons we get the current servings number increased or decreased by 1
      const { newServings } = btn.dataset; //using destructuring because the dataset is also called newServings

      //dataset is always a string so with the + we convert it to a number. With this condition we make sure there are no negative values for the servings
      if (+newServings > 0) handler(+newServings);
    });
  }

  //this methods handles both bookmarking and un-bookmarking. What action will take place depends od the  data from the model state (weather the recipe is currently bookmarked or not)
  addHandlerAddBookmark(handler) {
    //again we use event delegation because the element that is the event target does not exist when the application is first loaded
    this._parentElement.addEventListener('click', function (e) {
      //we use the closest method because the target needs to be the button and the user could click the icon for example
      const btn = e.target.closest('.btn--bookmark');

      //guard clause
      if (!btn) return;

      handler();
    });
  }

  //if the user clicks on the user icon the recipe will be deleted
  addHandlerDeleteRecipe(handler) {
    this._parentElement.addEventListener('click', function (e) {
      //we check if the user icon was clicked
      const btn = e.target.closest('.recipe__delete');
      //guard clause
      if (!btn) return;
      handler();
    });
  }

  addHandlerDay(handler) {
    this._parentElement.addEventListener('click', function (e) {
      //we use the closest method because the target needs to be the button and the user could click the icon for example
      const dropdown = e.target.closest('.dropdown-content');

      //guard clause
      if (!dropdown) return;

      // e.target.classList.add('selected');

      handler(e.target.id);
    });
  }

  //updates the dropdown containing the days of the week. Depending on the recipe.scheduled property]
  updateDropdown(days = []) {
    const dropdownEL = this._parentElement.querySelector('.dropdown-content');

    //first we deselect all of the days
    Array.from(dropdownEL.children).forEach(child =>
      child.classList.remove('selected')
    );

    //the ids of the weekdays in the dropdown correspond to the values of the days array. So if the element's id is in the array this means that the weekday needs to be marked as selected
    days.forEach(day => document.getElementById(day).classList.add('selected'));
  }

  addHandlerAddToList(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--shopping');
      if (!btn) return;
      handler();
    });
  }
}

//we export an instance of the class becase if we export the whole class than multiple recipeView objects can be created and that is not what we want and that would add unnecessary work to the controller that we want to keep as simple as possible
export default new RecipeView();
