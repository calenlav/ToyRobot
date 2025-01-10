"use strict";

let errorText, infoText, actionField, infoElement;
let robot = {
  x: 2,
  y: 3,
  dir: "NORTH",
};

let grid = {
  width: 4,
  height: 6,
  data: [],
};

for (let y = 0; y < grid.height; y++) {
  grid.data[y] = [];
  for (let x = 0; x < grid.width; x++) {
    grid.data[y][x] = 0;
  }
}

let directions = ["NORTH", "EAST", "SOUTH", "WEST"];

let actions = [
  "PLACE x,y,dir",
  "MOVE",
  "ROTATE LEFT",
  "ROTATE RIGHT",
  "REPORT",
];

//when page is loaded, set some variables, set event listeners, draw grid
document.addEventListener("DOMContentLoaded", function () {
  actionField = document.querySelector(".actionField");
  infoElement = document.querySelector(".infoText");

  document.querySelector(".promptText").innerHTML += "<p>Options:</br>";
  actions.forEach((element) => {
    document.querySelector(".promptText").innerHTML +=
      "<span class='clickableKeyword' onclick='setActionText(this.innerHTML)'>" +
      element +
      "</span>";
  });

  drawGrid();
});

//draw grid; happens every time a change happens
function drawGrid(collided) {
  let tableHtml = "<table>";

  let classlist = [];
  collided === true ? classlist.push("collided") : null;
  classlist.push(robot.dir + "arrow");
  classlist.push("targetLocation");

  for (let y = 0; y < grid.height; y++) {
    grid.data[y];
    tableHtml += "<tr>";
    for (let x = 0; x < grid.width; x++) {
      robot.y == y + 1 && robot.x == x + 1
        ? (tableHtml += "<td class='" + classlist.join(" ") + "'></td>")
        : (tableHtml +=
            "<td onclick='place(" +
            (x + 1) +
            "," +
            (grid.height - y + 1 - 1) +
            "," +
            ")'></td>");
    }
    tableHtml += "</tr>";
  }
  tableHtml += "</table>";
  document.querySelector(".tableDisplay").innerHTML = tableHtml;
}

//handler for displaying any warning
function showWarning(text) {
  document.querySelector(".warningMessage").innerHTML = text;
  document.querySelector(".warningMessage").style.display = "block";
}

//hide warnings when a new action is submitted
function hideWarning() {
  document.querySelector(".warningMessage").style.display = "none";
}

//handler for displaying any error
function showError(errorText, errorArea) {
  document.querySelector(errorArea + " > .errorText").innerHTML =
    errorText.join("</br>");
  document.querySelector(errorArea + " > .errorText").style.display = "block";
}

//hide errors - called when functions are successful to hide any previously displayed errors
function hideError(errorArea) {
  document.querySelector(errorArea + " > .errorText").style.display = "none";
}

//allow user to change grid size
function setGridDimensions() {
  const newGridWidth = document.querySelector(".gridWidth").value;
  const newGridHeight = document.querySelector(".gridHeight").value;

  //error checking
  let errors = [];
  !newGridWidth ? errors.push("Width must be greater than 0") : null;
  !newGridHeight ? errors.push("Height must be greater than 0") : null;

  if (errors.length <= 0) {
    grid.width = newGridWidth;
    grid.height = newGridHeight;
    hideError(".settingsArea");
    hideWarning();
    drawGrid();
  } else {
    showError(errors, ".settingsArea");
  }
}

//put the robot in a specific spot
function place(x, y, dir = robot.dir) {
  //error checking
  let errors = [];
  isNaN(x) || !x ? errors.push("X-coordinate must be a number") : null;
  isNaN(y) || !y ? errors.push("Y-coordinate must be a number") : null;
  x === 0 ? errors.push("X-coordinate must be greater than 0") : null;
  y === 0 ? errors.push("Y-coordinate must be greater than 0") : null;
  directions.indexOf(dir.toUpperCase(), 0) < 0
    ? errors.push("Direction must be in allowed list")
    : null;

  if (errors.length > 0) {
    showError(errors, ".textImplementationArea");
  } else {
    robot.x = Number(x);
    robot.y = grid.height - Number(y) + 1;
    robot.dir = dir.toUpperCase();
    drawGrid();
    report(`</br>Placed</br></br>`);
  }
}

//move the toy foward
function move() {
  let newXPos, newYPos, result, collision;
  //no error checking needed

  //calculate new position
  if (robot.dir == "SOUTH") {
    newYPos = robot.y + 1;
    robot.y = Math.min(newYPos, grid.height);
  } else if (robot.dir == "EAST") {
    newXPos = robot.x + 1;
    robot.x = Math.min(newXPos, grid.width);
  } else if (robot.dir == "NORTH") {
    newYPos = robot.y - 1;
    robot.y = Math.max(newYPos, 1);
  } else if (robot.dir == "WEST") {
    newXPos = robot.x - 1;
    robot.x = Math.max(newXPos, 1);
  }

  //check for wall collision
  if (
    newXPos > grid.width ||
    newYPos > grid.height ||
    newXPos < 1 ||
    newYPos < 1
  ) {
    showWarning(
      `Attempted to move forward - collided with  ${capitalise(robot.dir)} wall`
    );
    collision = true;
  }
  result = `</br>Moved forward</br></br>`;

  drawGrid(collision);
  report(result);
}

//rotate
function rotate(dir) {
  dir = dir.toUpperCase();
  let newDirectionIndex, rotation, result;

  //error checking
  let errors = [];
  dir != "LEFT" && dir != "RIGHT"
    ? errors.push("Rotation must be LEFT or RIGHT")
    : null;

  if (errors.length > 0) {
    showError(errors, ".textImplementationArea");
  } else {
    rotation = dir == "LEFT" ? -1 : dir == "RIGHT" ? 1 : 0;
    newDirectionIndex = (directions.indexOf(robot.dir, 0) + rotation + 4) % 4;
    robot.dir = directions[newDirectionIndex];
    result = `</br>Rotated ${dir.toLowerCase()}</br></br>`;
    drawGrid();
    report(result);
  }
}

//simple function for returning capitalised words
function capitalise(str) {
  return (
    str.slice(0, 1).toUpperCase() + str.slice(1, robot.dir.length).toLowerCase()
  );
}

//show information about current position; accepts some specific texts from calling function
function report(preMessage) {
  infoElement.innerHTML = `${
    preMessage != undefined && preMessage != null
      ? "<b>Action</b>" + preMessage
      : ""
  }<b>Current Position</b></br>X-position: ${robot.x}</br>Y-position: ${
    grid.height - robot.y + 1
  }</br>Facing: ${capitalise(robot.dir)}`;
  infoElement.style.display = "block";
}

//deals with text input; extract action keywords and args then calls appropriate functions
function processAction(action) {
  const [keyword, ...rest] = action.trim().split(/\s+/);
  const args = rest.join(" ").split(/\s*,\s*/);
  hideWarning();
  hideError(".textImplementationArea");

  switch (keyword) {
    case "PLACE":
      place(...args);
      break;

    case "ROTATE":
      rotate(...args);
      break;

    case "MOVE":
      move();
      break;

    case "REPORT":
      report();
      break;

    //no matching keyword
    default:
      showError(["Action not valid, try again."], ".textImplementationArea");
      drawGrid();
      break;
  }
  actionField.value = null;
}

//support for clicking on function option to pre-populate text box
const setActionText = function (text) {
  actionField.value = text;
};

//hidding submit hides the error box and sets the text focus back onto the text input field
function submit() {
  document.querySelector(".textImplementationArea > .errorText").style.display =
    "none";
  document.getElementById("actionInput").focus();
  processAction(actionField.value);
}
