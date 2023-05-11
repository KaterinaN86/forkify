'use strict';

import View from './view.js';

import icons from 'url:../../img/icons.svg';

class scheduleView extends View {
  //Define parent element where content will be displayed for this view.
  _parentElement = document.querySelector('.schedule-list');
  //Message that will be displayed if no recipe has been added to schedule.
  _errorMessage = 'No scheduled recipes yet. Find a nice recipe and add it :)';
  _message = '';
  //we add this property so we can use it in the render method.
  _schedule = true;
  /**
   * Defines markup for displaying list of previews of scheduled recipes.
   * @returns {String} markup (generated markup string).
   */
  _generateMarkup() {
    const currentId = window.location.hash.slice(1); //with this we get the id of the current recipe from the hash in the url not including the # symbol because we start to slice from the second character.

    //Day of the week the recipe has been scheduled to be cooked.
    let weekday = '';
    //Initializing the generated string.
    let markup = '';
    //we loop over the week array
    this._data.forEach(element => {
      //we loop over each element of the week array
      element.forEach((rec, i) => {
        //the name of the day is always the first element
        if (i === 0) weekday = rec;
        //the other elements are recipes that we need markup for.
        if (i !== 0) markup += this._generateRecipe(rec, weekday, currentId);
      });
    });
    return markup;
  }

  /**
   * Generates markup for each scheduled recipe
   * @param {Object} rec the recipe object
   * @param {String} weekday name of the day of the week
   * @param {String} currentId the id in the hash, id of the active recipe
   * @returns a template literal containing the markup
   */

  _generateRecipe(rec, weekday, currentId) {
    //next we need to check if the currentId is equal to the one in the #hash
    return `<li class="preview">
        <a class="preview__link ${
          currentId === rec.id ? 'preview__link--active' : ''
        }"  href="#${rec.id}">
          <figure class="preview__fig">
            <img src="${rec.image}" alt="Test" />
          </figure>
          <div class="preview__data" >
          <!-- a squared cross icon is displayed. We can use this icon to remove recipe from schedule. Tooltip is also displayed -->
          <div class="preview__schedule-generated tooltip " data-weekday=${weekday} data-rec-id=${
      rec.id
    }>
          <svg>         
            <use  href="${icons}#icon-squared-cross"></use>            
          </svg>
          <span class="tooltiptext">Remove from schedule</span>
        </div> <!-- end of preview__schedule-generated -->
            <h4 class="preview__title" >
          ${weekday}
      </h4>
            <h4 class="preview__title">${rec.title}</h4>
            <p class="preview__publisher">${rec.publisher}</p>
            <!-- Displays user icon if recipe has an unique key -->
            <div class="preview__user-generated ${rec.key ? '' : 'hidden'}">
            <svg>
              <use href="${icons}#icon-user"></use>
            </svg>
          </div>         
          </div>
        </a>
      </li>`;
  }

  //calling the render method using the scheduleView instance in the controller. We pass in the week data in the handler
  addHandlerLoadSchedule(handler) {
    window.addEventListener('load', handler);
  }

  //removing recipe from schedule
  addHandlerDeleteRecipe(handler) {
    //adding a listener to the parent element
    this._parentElement.addEventListener('click', function (e) {
      //using event delegation, we check if the event was triggered by the calendar icon element
      const dataEl = e.target.closest('.preview__schedule-generated');
      //guard clause
      if (!dataEl) return;

      //we get this data from the HTML, depending on which recipe the user has clicked
      const id = dataEl.dataset.recId; //recipe id
      const day = dataEl.dataset.weekday; //name of the day of the week

      //calling the corresponding handler from the controller
      handler(day, id);
    });
  }
}

export default new scheduleView();
