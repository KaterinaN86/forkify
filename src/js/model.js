'use strict';

//numbers that just appear out of nowhere are stored like constants in a config file
import {
  API_URL,
  RES_PER_PAGE,
  KEY,
  WEEK_DAYS,
  MODAL_CLOSE_SEC,
} from './config';

//ajax calls to the forkify API are made using one method
import { AJAX } from './helper';

//for generating unique id
import uniqid from 'uniqid';

//for polyfilling of async functions
import { async } from 'regenerator-runtime/runtime';

//this object contains all the application data. It is exported so in can be used in the controller
export const state = {
  //recipe whose current id is in the hash
  recipe: {},

  //search query and the search results data
  search: {
    query: '', //keyword entered by the user
    results: [], //the results from the API call based on the query
    currPage: 1, //the page the user is currently on while viewing the results
    resPerPage: RES_PER_PAGE, //a constant number defined in the config file
  },

  //an array of recipes that have the bookmark property set to true
  bookmarks: [],

  //an a arrat of objects where the first element is the day of the week and the others are the recipes scheduled for that day
  week: [],

  //am array of ingredients placed in the shopping list
  listItems: [],
};

//create recipe object
const createRecipeObject = function (data) {
  const { recipe } = data.data;

  return {
    id: recipe.id,
    publisher: recipe.publisher,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    servings: recipe.servings,
    title: recipe.title,
    image: recipe.image_url,
    sourceUrl: recipe.source_url,
    //by using conditional operators, more specifically && which short circuits if one of the expressions is false, we can assing a value to a property and check if that property exists
    ...(recipe.key && { key: recipe.key }), //we use the spread operator to destructure the object from the second expression which is the result from this operation
    scheduled: [],
  };
};

// /**
//  * function used to create an array of arrays where the first element is the weekday and the rest are the scheduled recipes
//  *
//  * @return
//  *
//  *
//  */

const createWeekArray = function () {
  state.week = WEEK_DAYS.map(day => [day]);
};

//(7) [Array(1), Array(1), Array(1), Array(1), Array(1), Array(1), Array(1)]
// 0: ['Monday']
// 1: ['Tuesday']
// 2: ['Wednesday']
// 3: ['Thursday']
// 4: ['Friday']
// 5: ['Saturday']
// 6: ['Sunday']

/**
 * we use this method to highlight the days the recipe has been scheduled for
 * @param  {Object} rec the recipe object we are looking for in the state.week Array
 * @return {Array}      an array on index numbers corresponding to the WEEK_DAYS array (0->Monday and so on)
 */
export const checkWeekSchedule = function (rec) {
  const days = [];
  //we check if the recipe is in the weekly plan and if it is we add the index to the days array. This way we know which days the recipe is scheduled to bee cooked (days names are in the WEEK_DAYS constant array)
  state.week.forEach((day, i) => {
    //we check if any of the array elements contain the recipe id
    if (day.some(el => el?.id === rec.id)) days.push(i); //if that is the case, the index is added to the days array
  });
  return days;
};

export const loadRecipe = async function (id) {
  //we get the id from the controller
  //this function will be called by controllRecipe that is a part of the controller

  //we call getJSON which is imported from the helper file

  try {
    //if the recipe is one of our own it will contain our key in the url. When we get the recipe from the API we also send a query with our key.
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    //we call the function that creates an object from the API data
    state.recipe = createRecipeObject(data);

    //checking if the current selected recipe is in the bookmarks array
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    //checking if the current selected recipe is in the week array
    state.recipe.scheduled = checkWeekSchedule(state.recipe);

    //there is a live connection between the exports and imporst so when the sate data is recieved it will also be updated in the controller.
  } catch (error) {
    //in the heplper file we rethrow the error we get if a url doesn't return any data and that is why that error can be handled here

    // console.error(`${error}✨✨✨✨`); //catching the error we throw in the try block
    //in order to get access to this error inside the controller we need to rethrow it
    throw error;
  }
};

//loading recipes based on a search query
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    //a common way of sending values of variables via an url is a search query like this
    // https://forkify-api.herokuapp.com/api/v2/recipes?search=pizza (search is set to pizza)
    // in our case we use a query from the UI and with the '&' symbol we also send our unique user key so that we can also see the recipes added by the user
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    //in the search results we display a simpler version of the recipe object. Using the data we got from the API call we create this object for each result
    state.search.results = data.data.recipes.map(recipe => {
      return {
        id: recipe.id,
        publisher: recipe.publisher,

        title: recipe.title,
        image: recipe.image_url,
        //first we need to check if the recipe has a key. If it does than the created object will be destructured and so we get our new property
        ...(recipe.key && { key: recipe.key }),
      };
    });

    //there is a live connection between the exports and imporst so when the sate data is recieved it will also be updated in the controller.
  } catch (error) {
    //in the heplper file we rethrow the error we get if a url doesn't return any data and that is why that error can be handled here
    //we need to propagate the error because the result from an async function is allways a fullfilled promise.
    //All sync functions return a promise and we can handle that promise. The fulfilled value from the received promise is the return value of the async function. In the then handler the result that we pass is the returned value from the promise. If there was an error while getting data in the whereAmI function the log where we handle the promise returned from that function will still run. That is why we need to rethrow the error at the end of the promise chain. Even though there is an error in the async function the promise that the async function returns is still fulfilled not rejected. Rethrowing the error will propagate It down the promise chain and so we will manually reject the promise from the async function.

    // console.error(`${error}✨✨✨✨`); //catching the error we thow in the try block
    //in order to get access to this error inside the controller we need to rethrow it
    throw error;
  }
};

//this method returns only a part of the results, depending on the page
export const getSearchResultsPage = function (page = state.search.currPage) {
  //the deafult vaule is the current page
  state.search.currPage = page;
  //when page is 1 start is 0 and end is 9
  const start = (page - 1) * state.search.resPerPage;
  const end = page * state.search.resPerPage;

  return state.search.results.slice(start, end); //slice doesn't include the last value
};

//updates the servings in the active recipe
export const updateServings = function (newServings) {
  //we reach into the state and change the quantity of all of our ingredients
  state.recipe.ingredients.forEach(ingredient => {
    ingredient.quantity =
      (ingredient.quantity * newServings) / state.recipe.servings; //using proportions to determain the new quantity
  });
  state.recipe.servings = newServings;
};

//storing bookmarks data in local storage
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  //if the id of the recipe we want to bookmark is equal to the id of the current recipe we set the bookmarked property to true
  if (state.recipe.id === recipe.id) state.recipe.bookmarked = true;

  //adding the recipe to bookmarks
  state.bookmarks.push(recipe);

  //everytime we add a bookmark there has been a change in the state so we need to persist the data
  persistBookmarks();
};

export const deleteBookmark = function (id) {
  //we calculate the index of the bookmarked recipe
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  //removing the recipe from the bookmarks array
  state.bookmarks.splice(index, 1);

  //marking the current recipe as NOT bookmarked
  if (state.recipe.id === id) state.recipe.bookmarked = false;

  //synchronizing the changes made with the local storage
  persistBookmarks();
};

//clear the bookmarks in local storage
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

//we make this an async function because it makes a call to the API
export const newRecipe = async function (newRecipe) {
  //we put everything in a try block because we need to send data to our API
  try {
    //the newRecipe we get is not structured the same as our state. First we need to put the ingredients in an array and define quantity, unit and description for each ingredient
    // console.log('Form data: ', newRecipe);

    //we loop over the entries of the recipe object and we put only the ones whose key starts with 'ing' and have a value that is not an epmty string
    const ingArray = Object.entries(newRecipe).filter(
      entry => entry[0].startsWith('ing') && entry[1] !== ''
    );

    //now that we have the ingredients array we need to split every element. The elements in the ingredients array are strings made up of the quantity, unit and description separated by a coma
    const ingredients = ingArray.map(ingredient => {
      //every string that from the UI is trimmed and split into an array

      //the temp array contains 3 elements (quantity, unit and description)
      const temp = ingredient[1].split(',');

      //we loop over each element of the ingredient array in order to get rid of trailling spaces
      temp.forEach(ing => (ing = ing.trim()));

      //if the correct format was not used an error is thrown
      if (temp.length !== 3)
        throw new Error(
          'Wrong ingredient format! Please use the correct format :)'
        );
      //destructuring the array
      const [quantity, unit, description] = temp;
      //creating an object for every ingredient (quantity is a number or null)
      return { quantity: quantity ? +quantity : null, unit, description };
    });

    //this object needs to be in exactly the right format that API can recieve (reverse from the one we create in the state)
    const recipe = {
      cooking_time: +newRecipe.cookingTime, //needs to be a number
      servings: +newRecipe.servings, //needs to be a number
      title: newRecipe.title,
      image_url: newRecipe.image,
      source_url: newRecipe.sourceUrl,
      publisher: newRecipe.publisher,
      ingredients,
    };
    console.log(`Recipe ID is: ${state.recipe.id}`);
    //in the url template literal the ? specifies parameters like the search parameter we used before
    //this way by sending the key the recipe will be marked as our own
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    //as a response we get the status success fron the server and our data that was uploaded
    // console.log(data);

    //     Object
    // data:
    // recipe:
    // cooking_time: 23
    // createdAt: "2022-07-26T11:57:10.536Z"
    // id: "62e12538a6420a0016920fb6"
    // image_url: "TESTk9"
    // ingredients: (3) [{…}, {…}, {…}]
    // key: "c6d1f37c-9411-4f09-bef9-f6044dfea156"
    // publisher: "TESTk9"
    // servings: 23
    // source_url: "TESTk9"
    // title: "TESTk9
    state.recipe = createRecipeObject(data);
    //every user recipe is automaticall added to the bookmarks
    addBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
};

//delete user recipe from database based on the id
export const deleteRecipe = async function () {
  //we use this property to determine which method we use in our API call
  state.recipe.delete = true;

  try {
    await AJAX(`${API_URL}${state.recipe.id}?key=${KEY}`, state.recipe);
  } catch (error) {
    throw error;
  }
};

export const deleteRecResults = function () {
  let index;
  //we look for the index of the current recipe
  state.search.results.forEach((res, i) => {
    if (res.id === state.recipe.id) index = i;
  });
  //if there is such index the element form the reuslts array with that index is removed
  if (index !== undefined) state.search.results.splice(index, 1);
};

//storing schedule data in local storage
const persistShedule = function () {
  localStorage.setItem('week', JSON.stringify(state.week));
};

//clear the bookmarks in local storage
const clearSchedule = function () {
  localStorage.clear('week');
};

//schedules recipe to the specified day of the week
export const scheduleRecipe = function (rec, day) {
  //we check if there is a corresponding day in the array with weekdays
  const dayName = WEEK_DAYS[day];

  //we check if the recipe we want to schedule is the currently active recipe
  if (state.recipe.id === rec.id) {
    //check if the id mathces to a recipe that has already been scheduled for that day (avoid duplicates)
    state.week.forEach(el => {
      //state.week has seven arrays as elements and the first element of every array is a weekday depending on the index (0 -> Monday, 1-> Tuesday ...)
      if (el[0] === dayName) {
        el.some(e => e.id === rec.id)
          ? console.log('recipe is here') //avoiding duplicates
          : el.push(state.recipe); //if the recipe hasn't already been scheduled for that day we add it to the week
      }
    });
  }

  //adding a property to the recipe object. This property is an array of the indexes of the day the recipe has been scheduled for.
  state.recipe.scheduled = checkWeekSchedule(rec);

  persistShedule();
};

/**
 * Removing a recipe from schedule
 * @param {String} id the id of the recipe that needs to be removed
 * @param {String} day the default vaule is all which means that the recipe has been deleted from the data base and needs to deleted from all the days it has been scheduled for. If a certain day is specified than the recipe is removed only from that day
 */
export const removeFromSchedule = function (id, day = 'all') {
  state.week.forEach(element => {
    //we check if the name of the day in the element of the week array corresponds to the one the recipe has been scheduled for (if day is 'all' the we remove the recipe for every day - this is the case when a user recipe is deleted from the database)
    if (element[0] === day || day === 'all') {
      const index = element.findIndex(r => r.id === id);
      //if index is -1 the recipe is not a part of the element array
      if (index !== -1)
        //splice modifies the array so if the recipe was a part of the array it will be deleted
        element.splice(index, 1);
    }
  });
  //we also update the data for the recipe object regarding the scheduled property
  state.recipe.scheduled = checkWeekSchedule(state.recipe);
  //writing the data in the local storage
  persistShedule();
};

//storing shopping list data in local storage
const persistShoppingList = function () {
  localStorage.setItem('shopping', JSON.stringify(state.listItems));
};

//API for adding items to the list, deleting an item and updating the item's count
export const fillShoppingList = function () {
  //we create an object for each ingredient
  state.recipe.ingredients.forEach(ing => {
    const item = {
      id: uniqid(), //we use an API to generate an unique id for each ingredient
      quantity: ing.quantity,
      unit: ing.unit,
      description: ing.description,
    };

    //we add the object to the listItems array
    state.listItems.push(item);
  });

  persistShoppingList();
};

//removing an ingredient from the shopping list
export const deleteListItem = function (id) {
  //this is the most effective way to remove an element from an array. First we find the index of the element and then we use the splice method (which is genious :)
  const index = state.listItems.findIndex(item => item.id === id);
  state.listItems.splice(index, 1);
  persistShoppingList();
};

//updating the quantity for a certain ingredient
export const updateItemCount = function (id, newQuantity) {
  //the find method will return a list item object and we can set its quantity to the new value
  state.listItems.find(item => item.id === id).quantity = newQuantity;
  persistShoppingList();
};

//clear the shopping list in local storage
const clearShoppingList = function () {
  localStorage.clear('shopping');
};

const newFeature = function () {
  console.log(`Welcome to the application`);
};

//loading the bookmarks data, schedule data and shopping list from local storage
const init = function () {
  //initiallizing the week property
  createWeekArray();

  //reading data from local storage
  const localStorageBookmarks = JSON.parse(localStorage.getItem('bookmarks'));
  if (localStorageBookmarks) state.bookmarks = localStorageBookmarks;

  const localStorageSchedule = JSON.parse(localStorage.getItem('week'));
  if (localStorageSchedule) state.week = localStorageSchedule;

  const localStorageList = JSON.parse(localStorage.getItem('shopping'));
  if (localStorageList) state.listItems = localStorageList;

  //testing
  newFeature();
};

init();
// clearBookmarks();
// clearSchedule();
// clearShoppingList();
