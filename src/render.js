// ### DOCUMENTATION
// read text file: https://www.geeksforgeeks.org/file-upload-in-electronjs/
// generate the table: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces
// save and load user data: https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e

// ###############

// DEFINITIONS

// ###############

const electron = require('electron');
const path = require('path');
const dialog = electron.remote.dialog;
const app = electron.remote.app;
const fs = require('fs');
// store user data: read store.js
const Store = require('./store.js');
// store user data: First instantiate the class
const store = new Store({
  // we'll call our data file 'user-preferences'
  configName: 'user-preferences',
  defaults: {
    // users home directory as default
    pathToFile: app.getPath('home')
  }
});
const btnLoadTodoFile = document.getElementById('btnLoadTodoFile');
const btnApplyFilter = document.getElementsByClassName('btnApplyFilter');
const filterCategories = ["contexts", "projects"];

// defining a Global file path Variable to store user-selected file
global.filepath = undefined;

// set variables
let pathToFile = store.get('pathToFile');

// ###############

// READ THE FILE AND GENERATE DATA

// ###############

// read contents of todo.txt file and trigger further action
function readTodoFile(pathToFile) {
  fs.readFile(pathToFile, {encoding: 'utf-8'}, function(err,data) {
    if (!err) {
      //let dataArray = data.split("\n");

      if(generateTodoData(data) == true) {
        console.log('Received data successfully');
      }

      // call function to generate the project filters and supply the categories as an array
      if(generateTodoFilters(data, filterCategories) == true) {
        console.log('Filters successfully loaded');
      };

    } else {
      console.log(err);
    }
  });
}

// ###############

// BUILD THE FILTER SECTION

// ###############

// read passed filters, count them and build selection buttons
function generateTodoFilters(data, filterCategories) {

  let superArray = new Array();

  // get the reference for the filter container
  let todoFilterContainer = document.getElementById("todoFilters");
  todoFilterContainer.innerHTML = "";

  // parse the data
  items = TodoTxt.parse( data, [ new DueExtension() ] );

  for (let i = 0; i < filterCategories.length; i++) {
    category = filterCategories[i];

    let allFilters = [];

    for (let j = 0; j < items.length; j++) {
      item = items[j];
      if(item[category]) {
        allFilters = allFilters.concat(item[category]);
      }
    }

    // use the string to count how often contexts occur and generate an object to work with
    let allFiltersCounted = [];
    allFiltersCounted = allFilters.join(',').split(',').reduce(function (allFilters, filter) {
      if (filter in allFilters) {
        allFilters[filter]++;
      } else {
        allFilters[filter] = 1;
      }
      if(allFilters!=null) {
        return allFilters;
      }
    }, {});

    // only generate contexts filters if there are any
    if(allFilters.length > 0) {
      // creates a div for the specific filter section
      let todoFilterContainerSub = document.createElement("div");
      todoFilterContainerSub.setAttribute("class", category);

      // empty the container before reading fresh data
      todoFilterContainerSub.innerHTML = "";

      // build one button each
      for (let filter in allFiltersCounted) {
        let todoFiltersItem = document.createElement("button");
        todoFiltersItem.setAttribute("class", "btnApplyFilter button");
        todoFiltersItem.setAttribute("name", filter);
        todoFiltersItem.setAttribute("title", category);
        todoFiltersItem.innerHTML = filter + " (" + allFiltersCounted[filter] + ")";
        todoFilterContainerSub.appendChild(todoFiltersItem);
      }
      // add contexts to the specific filter container
      todoFilterContainer.appendChild(todoFilterContainerSub);
    }

    // configure filter buttons
    let listOfFilterButtons = document.querySelectorAll("div." + category + " button.btnApplyFilter");

    for(let l = 0; l < listOfFilterButtons.length; l++) {

      let btnApplyFilter = listOfFilterButtons[l];
      btnApplyFilter.addEventListener('click', () => {

        // add or remove css class for highlighting
        btnApplyFilter.classList.toggle("is-dark");

        // check if there is already one filter, otherwise initialize first push
        if(superArray.length > 0) {

          let filterFound;
          for(let z = 0; z < superArray.length; z++) {
             if(superArray[z][0] == btnApplyFilter.name) {
               // if filter is already present in 1 dimension of array, then delete array entry
               superArray.splice(z,1);
               filterFound = true;
             }
          }

          // if filter is not already present in first dimension of the array, then push the value
          if(filterFound!=true) {
            superArray.push([btnApplyFilter.name, btnApplyFilter.title]);
          }

        } else {
          // push for the first time
          superArray.push([btnApplyFilter.name, btnApplyFilter.title]);
        }

        generateTodoData(data, superArray);
      });
    }
  }
  return true;
}

// ###############

// COMPARE ARRAYS

// ###############

// https://stackoverflow.com/a/25926600
// TODO: how does it work?
function checkAvailability(items, filter) {
  if(filter && items) {
    return filter.some(function (v) {
        return items.indexOf(v) >= 0;
    });
  }
};

// ###############

// BUILD THE TABLE

// ###############

function generateTodoTable(itemsFiltered) {
  // get the reference for the table container
  let todoTableContainer = document.getElementById("todoTableContainer");

  // empty the table before reading fresh data
  todoTableContainer.innerHTML = "";

  // creates a div for the table itself
  let todoTable = document.createElement("div");

  // create all rows
  for (let i = 0; i < itemsFiltered.length; i++) {
    item = itemsFiltered[i];

    //format items
    switch (item.priority) {
      case "NULL":
        itemPriority = '';
        break;
      case "A":
        itemPriority = '<span class="tag is-danger is-medium">'+item.priority+'</span>';
        break;
      case "B":
        itemPriority = '<span class="tag is-warning is-medium">'+item.priority+'</span>';
        break;
      case "C":
        itemPriority = '<span class="tag is-success is-medium">'+item.priority+'</span>';
        break;
      case "D":
        itemPriority = '<span class="tag is-info is-medium">'+item.priority+'</span>';
        break;
      default:
        itemPriority = '<span class="tag is-dark is-medium">'+item.priority+'</span>';
    }

    // creates a table row
    let todoTableBodyRow = document.createElement("div");
    todoTableBodyRow.setAttribute("class", "flex-table");
    todoTableBodyRow.setAttribute("role", "rowgroup");

    // creates cell for priority tag
    let todoTableBodyCell_priority = document.createElement("div");
    todoTableBodyCell_priority.setAttribute("class", "flex-row");
    todoTableBodyCell_priority.setAttribute("role", "cell");
    if(item.priority!=null) {
      todoTableBodyCell_priority.innerHTML = itemPriority;
    }
    todoTableBodyRow.appendChild(todoTableBodyCell_priority);

    // creates cell for the text
    let todoTableBodyCell_text = document.createElement("div");
    todoTableBodyCell_text.setAttribute("class", "flex-row");
    todoTableBodyCell_text.setAttribute("role", "cell");
    if(item.text) {
        todoTableBodyCell_text.innerHTML = item.text;
    }
    todoTableBodyRow.appendChild(todoTableBodyCell_text);

    // add the row to the end of the table body
    todoTable.appendChild(todoTableBodyRow);

  }

  // add the actual table with data to the placeholder
  todoTableContainer.appendChild(todoTable);

  // add attributes
  todoTable.setAttribute("class", "table-container");
  todoTable.setAttribute("role", "table");
  todoTable.setAttribute("aria-label", "Todos");
}

// ###############

// SORT ARRAY THEN DELETE DUPLICATES
// https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array

// ###############
function uniq(a) {
  return a.sort().filter(function(item, pos, ary) {
      return !pos || item != ary[pos - 1];
  });
}

// ###############

// GENERATE THE DATA BEFORE TABLE IS BUILT

// ###############
// TODO: Remove filterArray if not needed anymore
function generateTodoData(data, superArray) {

  //console.log(superArray);

  // https://github.com/jmhobbs/jsTodoTxt
  // parse raw data
  items = TodoTxt.parse( data, [ new DueExtension() ] );

  // new variable for items, filtered or not filtered
  let itemsFiltered = [];

  // check if a filter has been passed
  if(superArray!=undefined && superArray!='') {


    // erst die kategorien, dann jeweils de item und gucken ob kategorie werte hat
    for (let i = 0; i < superArray.length; i++) {

      let category = superArray[i][1];
      let filter = superArray[i][0];

      // TODO: Not sure if this works well
      for (let l = 0; l < items.length; l++) {
        if(items[l][category] != null && items[l][category].includes(filter)==true) {
          itemsFiltered.push(items[l]);
        }
      }
    }

  // if no filter has been passed
  } else {
    for (let i = 0; i < items.length; i++) {
      // no filters so every item is passed to new "filtered" array
      item = items[i];
      itemsFiltered.push(item);
    }
  }

  // pass filtered data to functio to build the table
  generateTodoTable(uniq(itemsFiltered));
  return true;
}

// ###############

// OPEN FILE AND PASS DATA TO FUNCTIONS

// ###############

btnLoadTodoFile.addEventListener('click', () => {

  // Resolves to a Promise<Object>
  dialog.showOpenDialog({
      title: 'Select yout todo.txt file',
      defaultPath: path.join(app.getPath('home')),
      buttonLabel: 'Open',

      // Restricting the user to only Text Files.
      filters: [
          {
              name: 'Text Files',
              extensions: ['txt']
          }, ],

      // Specifying the File Selector Property
      //if (process.platform !== 'darwin') {
        // If the platform is 'win32' or 'Linux'
        properties: ['openFile']
      //} else {
        // If the platform is 'darwin' (macOS)
        //properties: ['openFile', 'openDirectory']
      //}
  }).then(file => {
      // Stating whether dialog operation was
      // cancelled or not.
      //console.log(file.canceled);
      if (!file.canceled) {
        // Updating the GLOBAL filepath variable
        // to user-selected file.
        global.filepath = file.filePaths[0].toString();

        // read contents of todo.txt file
        if (global.filepath && !file.canceled) {
          fs.readFile(global.filepath, {encoding: 'utf-8'}, function(err,data) {
             if (!err) {
                  let dataArray = data.split("\n");
                  console.log('Received data successfully');
                  // Call function to generate or regenerate the table
                  generateTodoData(data);
                  // Call function to generate or regenerate the filter list
                  //let filterCategories = ["contexts", "projects", "test"];
                  generateTodoFilters(data, filterCategories);
                  store.set('pathToFile', global.filepath);
                  console.log('Saved path in user preferences: ' + global.filepath);
             } else {
                  console.log(err);
              }
           });
         }
      }
  }).catch(err => {
      console.log(err)
  });
});

// ###############

// read previously stored todo.txt file

// ###############

if(pathToFile) {
  readTodoFile(pathToFile);
  console.log('Previous file loaded: ' + pathToFile);
}