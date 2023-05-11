import icons from 'url:../img/icons.svg';
export const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes/'; //using uppercase because it is a constant.
export const TIMEOUT_SEC = 10; //used for the timer that races with the call to the API. Prevents taking too long to display results.
export const RES_PER_PAGE = 10; //number of results from the search query shown on each page using pagination.
export const KEY = 'c6d1f37c-9411-4f09-bef9-f6044dfea156'; //private user specific key.
export const MODAL_CLOSE_SEC = 2.5; //used for timer that delays the closing of the modal addRecipe window.
//HTML code for adding new recipe, displayed in modal window.
export const MODAL_DATA = `
<div class="upload__column">
  <h3 class="upload__heading">Recipe data</h3>
  <label>Title</label>
  <input placeholder="* Enter recipe title" required name="title" type="text" />
  <label>URL</label>
  <input
    placeholder="* Enter recipe URL"
    required
    name="sourceUrl"
    type="text"
  />
  <label>Image URL</label>
  <input placeholder="* Enter recipe image" required name="image" type="text" />
  <label>Publisher</label>
  <input
    placeholder="* Enter recipe publisher"
    required
    name="publisher"
    type="text"
  />
  <label>Prep time</label>
  <input
    placeholder="* Enter cooking time (enter number)"
    required
    name="cookingTime"
    type="number"
  />
  <label>Servings</label>
  <input
    placeholder="* Enter number of servings (enter number)"
    required
    name="servings"
    type="number"
  />
</div>
<!-- end of upload column -->
<!-- ingredients -->
<div class="upload__column">
  <h3 class="upload__heading">Ingredients</h3>
  <label>Quantity:</label>
  <input id="quantity" placeholder="Enter quantity (must be a number)" />
  <label>Unit:</label>
  <input id="unit" placeholder="Enter unit (eg. kg, cup, ml, gr...)" />
  <label>Description:</label>
  <input id="description" placeholder="Enter description" />
  <textarea class="label--ingredients"> </textarea>
  <!-- This label is shown if the validation regarding the ingredients has failed -->
  <label class="label--wrong hidden">Wrong input, please use specified format!</label>
  <button type="button" class="btn--submit">Submit</button>
</div>
<!-- end of second upload column -->
<div
  style="
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  "
>
  <button type="submit" class="btn upload__btn" style="position: absolute">
    <svg>
      <use href="${icons}#icon-upload-cloud"></use>
    </svg>
    <span>Upload</span>
  </button>
</div>
<!-- end of upload button div -->`;
//Array of weekdays strings.
export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
