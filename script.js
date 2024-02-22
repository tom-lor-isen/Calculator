let btnContainer = document.querySelector(".buttonContainer");

let topValue = [];
let bottomValue = "";

let REP = "";


// MATH FUNCTIONS
let sin = Math.sin;
let cos = Math.cos;
let tan = Math.tan;

let arccos = Math.acos;
let arcsin = Math.asin;
let arctan = Math.atan;

let ln = Math.log;
let exp = Math.exp;

let pow = Math.pow;

let log10 = Math.log10;

let sqrt = Math.sqrt;

let functionList = [sin, cos, tan, arccos, arcsin, arctan, ln, log10, sqrt, exp, pow];

let specialBtn = ["REP", "", "DEL", "AC", "="]

let pressKeys = ['*', '/', '+', '-', '=', '.', '(', ')', 'x', '0', '^']





function displayCalcTop() {
  document.querySelector(".top").textContent = topValue.join('');
}

function displayCalcBottom(value) {
  document.querySelector(".bottom").textContent = value || bottomValue;
}

function findBtnByValue(content) {

  let findElem;

  document.querySelectorAll('.calcBtn').forEach(ele => {
    
    if(ele.textContent == content) {
      findElem = ele;
    }
    
  })

  return findElem;
}


document.addEventListener('keydown', (e) => {
  //e.preventDefault();

  if(Number(e.key) || pressKeys.includes(e.key)) {
    findBtnByValue(e.key).click();
  }

  else if(e.key == 'Delete') {
    findBtnByValue("AC").click();
  }

  else if(e.key == 'Backspace') {
    findBtnByValue("DEL").click();
  }

  else if(e.key == 'Enter') {
    findBtnByValue("=").click();
  }
  
})


function btnClick(event) {

  event.preventDefault();

  let elem = event.target;

  if(elem.classList.contains("darkk")) 
    return document.querySelector('body').classList.toggle("darkMode");

  

  displayCalcBottom(" ");

  if(elem.textContent == "AC") {
    topValue = [];
    bottomValue = "";

    displayCalcBottom();
    displayCalcTop();
  }

  if(elem.textContent == "Draw") {
    document.querySelector(".calcDis").classList.add("hidden");
    document.querySelector(".graphDis").classList.remove("hidden");
  
    updateGraph()
  }

  else if(elem.textContent == "Calc") {
    document.querySelector(".calcDis").classList.remove("hidden");
    document.querySelector(".graphDis").classList.add("hidden");
  }

  else if(!specialBtn.includes(elem.textContent)) {
    if(REP !== "" && bottomValue !== "") {
      bottomValue = "";
      topValue = ["REP"];
      displayCalcBottom();
    }

    topValue.push(elem.textContent);
    displayCalcTop();

  }

  else {
    if(elem.textContent == "=") {
      try {

        bottomValue = evalExp(topValue.join(""));

        if(bottomValue == Infinity || isNaN(bottomValue)) {
          bottomValue = "";
          throw new TypeError("Error");
        }

        else {
          REP = bottomValue;
        }

        displayCalcBottom();

      } catch(e) {
        displayCalcBottom(e.message);
      }
    }

    else if(elem.textContent == "REP") {
      topValue.push("REP")
      displayCalcTop();

      bottomValue = "";
      displayCalcBottom();
    }

    else if(elem.textContent == "DEL") {
      topValue.pop();
      displayCalcTop();

      bottomValue = "";
      displayCalcBottom();
    }
  }
}

document.querySelectorAll('.calcBtn').forEach(elem => {
  elem.addEventListener("click", btnClick);
})









// Graphing
var ctx = document.getElementById("functionGraph");

let Graph;

function updateGraph() {


  labelss = [];
  datas = [];

  let interval = 0.1
  for(let x = -10; x <= 10; x += 0.1) {

    x = Math.round(x * 10) / 10;

    let cur = evalExp(topValue.join(""), x);
    x = Math.round((x + interval) * 10) / 10;

    let next = evalExp(topValue.join(""), x);
    x = Math.round((x - interval) * 10) / 10;

    if(Number(cur) == cur && !isNaN(cur) && Math.abs(cur - next) < 10000) {
      
      if(Math.round(x * 10) / 10 % 2 == 0) {
        labelss.push(x);
      }
      else {
        labelss.push('');
      }

      datas.push(cur);
    }
  }

  data = {
    labels: labelss,
    datasets: [{
      label: 'f(x) = ' + topValue.join(""),
      data: datas,
      fill: false,
      borderColor: '#2095F3',
      tension: 0
    }]
  };

  let config = {
    data: data,
    type: 'line',
    options: {
      elements: {
        point:{
          radius: 0
        }
      }
    }
  }

  if(!Graph) {
    Graph = new Chart(ctx, config);
  }
  else {
    Graph.config = config;
    Graph.update()
  }
}

// Problem with x