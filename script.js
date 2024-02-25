let btnContainer = document.querySelector(".buttonContainer");

let topValue = "";
let bottomValue = "";

let cursorIndex = 0;

let Graph;


// Delete one element
findBtnByValue('DEL').onclick = () => {
  bottomValue = '';

  topValue = topValue.split('');

  topValue = topValue.slice(0, cursorIndex - 1).concat(topValue.slice(cursorIndex)).join("");

  displayCalcTop();
  displayCalcBottom();

  cursorIndex <= 0 ? cursorIndex = 0: cursorIndex--;
  updateCursor();
}

// Reset entry
findBtnByValue('AC').onclick = () => {
  topValue = "";
  bottomValue = '';

  displayCalcTop();
  displayCalcBottom();

  cursorIndex = 0;
  updateCursor();
}

// execute operation
findBtnByValue('=').onclick = () => {

  try {
    bottomValue = evalExp(topValue);
  }

  catch(e) {
    bottomValue = e.message;
  }

  displayCalcBottom();
}

// Dark mode
document.querySelector('.darkBtn').onclick = () => {
  document.querySelector('body').classList.toggle("darkMode");
}

function updateCursor() {
  document.querySelector('.topBar').style.left = (cursorIndex * 15 - 1) + 'px';
}

function displayCalcTop() {
  document.querySelector(".top").textContent = topValue;
}

function displayCalcBottom(value) {
  document.querySelector(".bottom").textContent = value || bottomValue;
}

function insertValue(char) {
  topValue = topValue.split("");
  let t1 = topValue.slice(0, cursorIndex - 1);
  t1.push(char)
  let t2 = topValue.slice(cursorIndex - 1)
  topValue = t1.concat(t2).join("");

  displayCalcTop();
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

  if(e.key == 'Delete') {
    findBtnByValue("AC").click();
  }

  else if(e.key == 'Backspace') {
    findBtnByValue("DEL").click();
  }

  else if(e.key == 'Enter' || e.key == '=') {
    bottomValue = "";
    displayCalcBottom();

    findBtnByValue("=").click();
  }

  else if(e.key.length == 1 && e.key != " ") {
    bottomValue = "";
    displayCalcBottom();
    cursorIndex++;

    insertValue(e.key);
    displayCalcTop()
  }

  else if(e.code == 'ArrowLeft' || e.code == 'ArrowRight') {
    if(e.code == 'ArrowLeft') {
      cursorIndex <= 0 ? cursorIndex = topValue.length : cursorIndex--;
    }
    else {
      cursorIndex >= topValue.length ? cursorIndex = 0 : cursorIndex++;
    }
  }
  
  updateCursor();
  
})


document.querySelectorAll('.calcBtn').forEach(elem => {

  if(elem.classList.contains('fct') || elem.classList.contains('num')) {
    elem.onclick = () => {
      insertValue(elem.textContent);
      displayCalcTop();
    }
  }
  
  else if(elem.classList.contains('rest') && elem.textContent != 'DEL' && elem.textContent != 'AC') {
    elem.onclick = () => {
      insertValue(elem.textContent);
      displayCalcTop();
    }
  }

  else if(elem.textContent == "Draw") {
    elem.onclick = () => {
      document.querySelector(".calcDis").classList.add("hidden");
      document.querySelector(".graphDis").classList.remove("hidden");

      updateGraph()
    }
  
  }

  else if(elem.textContent == "Calc") {
    elem.onclick = () => {
      document.querySelector(".calcDis").classList.remove("hidden");
      document.querySelector(".graphDis").classList.add("hidden");
    }
  }
})







// Graphing
var ctx = document.getElementById("functionGraph");

function updateGraph() {


  labelss = [];
  datas = [];

  let interval = 0.1
  for(let x = -10; x <= 10; x += 0.1) {

    x = Math.round(x * 10) / 10;

    let cur;
    let next;

    try {
      cur = evalExp(topValue, x);
    }
    catch(e) {};
    
    x = Math.round((x + interval) * 10) / 10;

    try {
      next = evalExp(topValue, x);
    }
    catch(e) {};
    
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

  let data = {
    labels: labelss,
    datasets: [{
      label: 'f(x) = ' + topValue,
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

  if(Graph == undefined) {
    Graph = new Chart(ctx, config);
  }
  else {
    Graph.config = config;
    Graph.update()
  }
}