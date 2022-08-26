import { TIMEOUT_SEC } from './config';

//the goal of this module is to have functions we can reuse in our project

//promisified timer function that will return a rejected promise if the AJAX call takes more than 10 seconds
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

//function that performs all the requests to the API
export const AJAX = async function (url, uploadData = undefined) {
  try {
    //promise returned by the fetch method
    let fetchPro;

    //if there is something to upload or delete
    if (uploadData) {
      //we added the delete property to the recipe object so that here we can determain if the method needs to be DELETE or POST
      fetchPro = uploadData.delete //the fetch method can optionally accept a second parameter as an init object that we can use to controll a number of settings
        ? fetch(url, {
            method: 'DELETE',
            headers: {
              //snippets of text that are like infomation about the text itself. With ths standard header we specify that the data we send to the API will be in the JSON format so the data can be accepted and a new recipe will be created in the database
              'Content-Type': 'application/json',
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
        : fetch(url, {
            //if the delete property is false that means that there is data to be uploaded
            method: 'POST', //GET is the default, PUT, DELETE etc...
            headers: {
              //snippets of text that are like infomation about the text itself. With ths standard header we specify that the data we send to the API will be in the JSON format so the data can be accepted and a new recipe will be created in the database
              'Content-Type': 'application/json',
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(uploadData), //the data we want to uplod using the API
          });
    } // 'https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bce89'
    else fetchPro = fetch(url); //if there is no uploadData parameter that means the we need the GET method

    //the first settled (it can be resolved or rejected) promise wins the race
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]); //what ever occurs first wins the race

    //the DELETE method gives a result with the 204 status and in order to avoid the 'unexpected end of JSON input' error we end the execution here
    if (res.status === 204) return;

    //because the result from the race method is also a promise we need to handle the promise using await and the json method
    const data = await res.json();

    if (!res.ok) throw new Error(`${res.status} ${data.message}`);

    return data;
  } catch (err) {
    //we rethrow the error becase even if there is an error the result from this function will still be a successful promise in the model where we call it
    throw err; //this propagates the error down to the model module so we can handle it there
  }
};
