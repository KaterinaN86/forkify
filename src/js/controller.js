'use strict';

//for polyfilling of all features
import 'core-js/stable';
//for polyfilling of async functions
import { async } from 'regenerator-runtime/runtime';
//importing all named exports from the model
import * as model from './model.js';
//views
import recipeView from './views/recipeView.js'; //this way we get access to the public methods  (API) in the recipeView class and all the other classes for the different views
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import scheduleView from './views/scheduleView.js';
import shoppingListView from './views/shoppingListView.js';
//constant for timer on close addRecipe modal
import { MODAL_CLOSE_SEC } from './config.js';
//saving the state
// if (module.hot) {
//   module.hot.accept();
// }

//Asynchronous function that controls what is rendered on load, defines the current id and loads corresponding recipe. Takes no parameters and doesn't return anything because any changes in data between model and controller are in sync thanks to the live connection. For loading the recipe an API call is made so this function is async.
const controlRecipes = async function () {
  try {
    //dynamically get the id.
    const id = window.location.hash.slice(1); //removing the first symbol
    //guard clause for when we have no id.
    if (!id) return;
    //1. Loading spinner
    recipeView.renderSpinner();
    //update results, bookmarks and schedule to highlight active recipe.
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    //When calling the update method in a scheduleView object, the data that is being passed on consists of the week array of attribute of the current state object.
    scheduleView.update(model.state.week);
    //there is a live connection between exported and imported modules. This is why whenever the state object is updated in the model it is also updated in the controller.
    await model.loadRecipe(id); //the data for the recipe object which is a state property is now defined
    //the result from an async function is always a promise, that is why we need to await the result.
    //2. Rendering recipe -> recipe data comes from the model, again, it is in sync because of the live connection between modules
    recipeView.render(model.state.recipe); //the name render is often used (also used in react) and it is very descriptive.
    //update dropdown
    recipeView.updateDropdown(model.state.recipe.scheduled);
  } catch (error) {
    //catching the error we throw in the try block of the loadRecipe() method.
    recipeView.renderError();
    //it's useful to see the actual error when debugging
    // console.log(error);
  }
};

//Method that renderers search results based on UI query. The query id retrieved from the corresponding view and we render the results based on the data we have received from the model.
const controlSearchResults = async function () {
  try {
    //while we wait for the results a spinner can be shown
    resultsView.renderSpinner();
    //to get the query we need to access the UI.
    const query = searchView.getQuery();
    //guard clause
    if (!query) return;
    //Method loadSearchResults()
    await model.loadSearchResults(query);
    //rendering only a part of the search results. This is important for better user experience. we also need to render the elements that enable pagination in order for the remaining results to be shown.
    resultsView.render(model.getSearchResultsPage(1)); //we render only a certain number of recipes per page
    //for rendering the pagination we need data from the search property in the state
    //here we have all of the results, the number of recipe shown on a page, the current page and the query
    paginationView.render(model.state.search);
  } catch (error) {
    resultsView.renderError();
  }
};

//handler for implementing the subscription part for the pagination
/**
 *
 * @param {Number} goToPage
 * @returns
 */
const controlPagination = function (goToPage) {
  if (!Number.isFinite(goToPage)) return;
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
};

//when changing servings we use update instead of render because we just need to update the text in the rendered recipe
const controlNewServings = function (newServings) {
  //update the recipe servings
  model.updateServings(newServings);
  //updating the UI (all changes are in the existing recipe view)
  recipeView.update(model.state.recipe);
};

//subscriber method that gets called by the handler in the recipe view whenever the user clicks on the bookmark icon
const controlAddBookmark = function () {
  //add or delete bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  //it is common practice that we use the id to delete an object
  else model.deleteBookmark(model.state.recipe.id);
  //update recipe view in order to show icon as filled
  recipeView.update(model.state.recipe);
  //render bookmarks panel
  bookmarksView.render(model.state.bookmarks);
};

//render the bookmarks on page load
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

//a function that adds a new recipe to the database. All the data comes from the UI
const controlAddRecipe = async function (data) {
  //this function is an async function because it calls the newRecipe function which makes an API call
  //the newRecipe function returns a promise that can be rejected when there is an error in the user's input
  try {
    //we need to show the user that an action is being performed
    addRecipeView.renderSpinner();
    //we use the await keyword because this function makes an API call and returns a promise
    await model.newRecipe(data);
    //show the recipe that was uploaded
    recipeView.render(model.state.recipe);
    //display success message
    addRecipeView.renderMessage();
    //render bookmarks to show our recipe
    bookmarksView.render(model.state.bookmarks);
    //for changing the id in the state we use the history API. here we can access the pushState method which takes three arguments: state (null),title ('') and the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //the modal needs to be hidden in order for the recipe to be visible. We use a timer because we want to display a success message before closing the modal

    setTimeout(function () {
      if (!addRecipeView._window.classList.contains('hidden'))
        addRecipeView._toggleAddRecipe(); //this method will make the window and overlay hidden
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    addRecipeView.renderError(error.message);
  }
};

//when we delete a recipe we handle the error thrown in the model.  This error is thrown every time a user recipe is deleted and that is why part of the code is in the catch block
const controlDeleteRecipe = async function () {
  try {
    await model.deleteRecipe();
    //when we try to render the recipe we get the error message that the recipe is deleted
    recipeView.renderError('Recipe is removed from database!');

    //this method removes the active recipe from the search results array
    model.deleteRecResults();

    //removing the id of the deleted recipe from hash
    window.location.hash = '';

    //deleting the recipe from bookmarks as well
    model.deleteBookmark(model.state.recipe.id);
    bookmarksView.render(model.state.bookmarks);

    //deleting the recipe from schedule as well
    if (model.state.recipe.scheduled.length > 0) {
      model.removeFromSchedule(model.state.recipe.id);
      scheduleView.render(model.state.week);
    }

    //rendering the results view if the deleted recipe was a part of the results array
    resultsView.render(model.getSearchResultsPage(1));
  } catch (error) {
    recipeView.renderError(error.message);
  }
};

/**
 *
 * @param {String} day index of the weekday selected from the dropbox
 */
const controlAddDay = function (day) {
  //adding the recipe to the week array and setting the scheduled property of the recipe
  model.scheduleRecipe(model.state.recipe, day);

  recipeView.updateDropdown(model.state.recipe.scheduled);

  // //updating the recipe view
  // recipeView.update(model.state.recipe);
  //rendering the schedule panel
  scheduleView.render(model.state.week);
};

//subscriber function that enables the scheduled to be rendered on load
const controlSchedule = function () {
  scheduleView.render(model.state.week);
};

//subscriber function that enables the shopping list to be rendered on load
const controlLoadShopping = function () {
  shoppingListView.render(model.state.listItems);
};

//this function is called when the user clicks on the add to shopping list button
const controlAddToList = function () {
  model.fillShoppingList();
  shoppingListView.render(model.state.listItems);
};

/**
 * Updates quantity for a certain ingredient in the shopping list modal
 * @param {String} id ingredient unique id
 * @param {String} quantity
 */
const controlUpdateQuantity = function (id, quantity) {
  model.updateItemCount(id, quantity);
};
/**
 *
 * @param {string} id id of the ingredient we want to delete from the shopping list
 */
const controlDeleteListItem = function (id) {
  //making the changes in the state property listItems
  model.deleteListItem(id);

  //rendering the shopping list with the new data
  shoppingListView.render(model.state.listItems);
};

/**
 *removes recipe from schedule panel
 * @param {String} day the name of the day of the selected option from the dropdown with the weekdays
 * @param {String} id the id of the recipe that needs to be removed from schedule
 */
const controlDeleteRecipeFromSchedule = function (day, id) {
  //we call this function so that the necessary changes in the state are made
  model.removeFromSchedule(id, day);

  //we update the dropdown in the recipe view so that the correct days are highlighted
  recipeView.updateDropdown(model.state.recipe.scheduled);

  //we render the schedule pane again with the new data from the state
  scheduleView.render(model.state.week);
};
//Called on site load.
const init = function () {
  bookmarksView.addHandlerLoadBookmarks(controlBookmarks);
  scheduleView.addHandlerLoadSchedule(controlSchedule);
  shoppingListView.addHandlerLoadShopping(controlLoadShopping);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlNewServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerAddToList(controlAddToList);
  recipeView.addHandlerDeleteRecipe(controlDeleteRecipe);
  recipeView.addHandlerDay(controlAddDay);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addButtonHandler(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  scheduleView.addHandlerDeleteRecipe(controlDeleteRecipeFromSchedule);
  shoppingListView.addHandlerUpdateQuantity(controlUpdateQuantity);
  shoppingListView.addHandlerDeleteIng(controlDeleteListItem);
};

init();
