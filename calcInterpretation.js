let mathFct = {
  "cos": Math.cos,
  "sin": Math.sin,
  "tan": Math.tan,

  "arccos": Math.acos,
  "arcsin": Math.asin,
  "arctan": Math.atan,

  "exp": Math.exp,
  "ln": Math.log,
  "log": Math.log10,

  "sqrt": Math.sqrt
}


function evalExp(expr, x) {

  expr = transformExp(expr);

  let queue = [];

  // Checking same number of closed and open parenthesis
  if(!checkParenthesis(expr)) throw new Error("Syntax Error");


  let number = [];
  let letter = [];

  let skipIndex = [];

  let parCount = 0;
  

  expr.split('').forEach((char, i) => {    

    if(i < skipIndex) return;


    // Writing a number
    if(!isNaN(char) || char == '.') {

      if(letter.length != 0) {
        queue.push(letter.join(""));
        letter = [];
      }

      number.push(char);
    }

    if((char == 'x' || char == 'π') && letter.length == 0) {

      if(number.length != 0) {
        queue.push(number.join(""));
        number = [];
      }

      if(!RegExp(/[+-\/\*\^\%]$/).test(queue[queue.length - 1]) && queue.length != 0) {
        queue.push('*');
      }
      queue.push(char);
    }

    // Writing a function name
    else if(RegExp('[a-z]').test(char)) {

      if(number.length != 0) {
        queue.push(number.join(""));
        number = [];
      }

      letter.push(char);
    }

    // Writing an operation
    if(RegExp(/[+\-\/\*\^\%]/).test(char)) {

      if(number.length != 0) {
        queue.push(number.join(""));
        number = [];
      }

      if(letter.length != 0) {
        queue.push(letter.join(""));
        letter = [];
      }

      queue.push(char);
    }


    if(char == '(') {

      if(i != 0 && i != expr.length && queue.length != 0 && !RegExp(/[+-\/\*\^]$/).test(queue[queue.length - 1])) {
        queue.push('*');
      }

      if(number.length != 0) {
        queue.push(number.join(""));
        number = [];
      }

      if(letter.length != 0) {
        queue.push(letter.join(""));
        letter = [];
      }

      if(!RegExp('[+-/*^|a-z]$').test(queue[queue.length - 1])) {
        queue.push('*');
      }

      let begIndexes = -1;
      let numPar = 0;

      let tempQueue = []

      expr.split("").forEach((char, i) => {
        if(char == '(') {
          if(begIndexes == -1 && numPar == 0) {
            begIndexes = i;
          }
          
          numPar++;
        }

        if(char == ')') {
          if(numPar == 1 && begIndexes != -1) {
            tempQueue.push(expr.split('').slice(begIndexes + 1, i).join(''));
            if(tempQueue.length == parCount + 1) skipIndex = i;
            begIndexes = -1;
          }

          numPar--;
        }

      });
      
      queue.push(evalExp(tempQueue[parCount], x));

      parCount++;
    }

    // Closing all expressions
    if(i == expr.length - 1) {
      if(number.length != 0) {
        queue.push(number.join(""));
        number = [];
      }

      if(letter.length != 0) {
        queue.push(letter.join(""));
        letter = [];
      }
    }
  })


  let result = treatQueue(queue, x);

  if(isNaN(result) || Math.abs(result) == Infinity) throw Error("Syntax Error");

  return result;
}

function transformExp(expr) {
  let plus = 0;

  expr.split('').forEach((char, i) => {
    
    if(char == '(') {
      if(i != 0 && i != expr.length - 1 && (!RegExp(/[\+\-\/\*\^]/).test(expr[i + plus - 1]) && expr[i + plus - 1] == 'x')) {
        let expr1 = expr.split('').slice(0, i + plus)
        expr1.push('*');
        expr = expr1.concat(expr.slice(i + plus)).join('')

        plus++;
      }
    }

    if(char == ')' || char == '%' || char == 'π') {

      if(i != 0 && i != expr.length - 1 && expr[i + plus + 1] != undefined && (!RegExp(/[\+\-\/\*\^\)\%\π]/).test(expr[i + plus + 1]) || expr[i + plus + 1] == 'x')) {
        let expr1 = expr.split('').slice(0, i + plus + 1);
        expr1.push('*')
        expr = expr1.concat(expr.slice(i + plus + 1)).join('')

        plus++;
      }
    }
  })

  return expr;
}

function treatQueue(queue, x) {

  while(queue.find(ele => ele == 'x')) {
    queue[queue.indexOf(queue.find(ele => ele == 'x'))] = x;
  }

  
  while(queue.find(ele => ele == 'π')) {
    queue[queue.indexOf(queue.find(ele => ele == 'π'))] = Math.PI;
  }

  while(queue.find(ele => ele == '%')) {
    let index = queue.indexOf(queue.find(ele => ele == '%'));

    let expr1 = queue.slice(0, index)
    let expr2 = queue.slice(index + 1)

    expr1.push('/', 100);
    queue = expr1.concat(expr2);
  }

  while(queue.find(ele => mathFct.hasOwnProperty(ele))) {

    let ele = queue.find(ele => mathFct.hasOwnProperty(ele));
    let index = queue.indexOf(ele);

    if(index == queue.length - 1) throw Error("Syntax Error");

    let leftQueue = queue.slice(0, index);
    let rightQueue = queue.slice(index + 2);

    let res = fctOperation(queue[index + 1], ele);

    if(rightQueue.length != 0 && !RegExp(/[\*\/+-\^]$/).test(rightQueue[0])) {
      rightQueue.unshift('*');
    }

    queue = leftQueue.concat(res).concat(rightQueue);
  }

  while(queue.find(ele => RegExp(/[\^]/).test(ele))) {
    let ele = queue.find(ele => RegExp(/[\^]/).test(ele));
    let index = queue.indexOf(ele);

    if(index == 0 || index == queue.length - 1) throw Error("Syntax Error");

    let leftQueue = queue.slice(0, index - 1);
    let rightQueue = queue.slice(index + 2);

    let res = calculation(queue[index - 1], queue[index + 1], ele);

    queue = leftQueue.concat(res).concat(rightQueue);
  }

  while(queue.find(ele => RegExp(/[\*\/]/).test(ele))) {

    let ele = queue.find(ele => RegExp(/[\*\/]/).test(ele));
    let index = queue.indexOf(ele);

    if(index == 0 || index == queue.length - 1) throw Error("Syntax Error");

    let leftQueue = queue.slice(0, index - 1);
    let rightQueue = queue.slice(index + 2);
    
    let res = calculation(queue[index - 1], queue[index + 1], ele);

    queue = leftQueue.concat(res).concat(rightQueue);
  }


  while(queue.find(ele => RegExp(/[\+\-]$/).test(ele) && isNaN(ele) && queue.indexOf(queue.find(ele => RegExp(/[\+\-]/).test(ele) && isNaN(ele))) != 0)) {
    let ele = queue.find(ele => RegExp(/[\+\-]$/).test(ele) && isNaN(ele));
    let index = queue.indexOf(ele);

    if((index == 0 && ele != '-') || index == queue.length - 1) throw Error("Syntax Error");

    let leftQueue = queue.slice(0, index - 1);
    let rightQueue = queue.slice(index + 2);

    let res = calculation(queue[index - 1], queue[index + 1], ele);

    queue = leftQueue.concat(res).concat(rightQueue);
  }
  

  if(queue.length == 0) return 0;

  return Math.round(Number(queue.join("")) * 10**10) / 10**10;
}


function checkParenthesis(expr) {

  let leftPar = 0;
  let rightPar = 0;

  let state = true;

  if(expr.length == 0) return true;

  expr.split("").forEach((char, i) => {
    if(char == '(') {
      leftPar++;
    }

    else if(char == ')') {
      rightPar++;
    }

    if(i == expr.length - 1 && leftPar != rightPar) return state = false;

    if(leftPar - rightPar < 0) return state = false;
  })
  
  return state;

}

function calculation(a, b, operator) {
  a = Number(a);
  b = Number(b);

  let tmp;

  switch(operator) {
    case '+':
      tmp = a + b;
      break;
    case '-':
      tmp = a - b;
      break;
    case '*':
      tmp = a * b;
      break;
    case '/':
      if(b == 0) throw Error("Error - Can't divide by 0");
      tmp = a / b;
      break;
    case '^':
      tmp = a ** b;
      break;
  }

  return tmp;
}

function fctOperation(a, fct) {
  return mathFct[fct](a);
}