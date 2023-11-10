const BLOCK_SIZE = 50;
const QUEEN_IMG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAHdElNRQfjCwkRLTPUwk+pAAABoklEQVRIx8WTTygEURzHP7PUoiyJEkVbnLQn5eSkpHDDxWFvbkpJuTnJyWUPSjkiOctN5N9FUkSRFPI3ZVds1q7Z52C8eW9msrMUv7m89/19v595f2bgv6sgR78UA/On8DpWMEkzS1kuaz3NBF1r20VYz9x34RBLCAR3tGt6RMYFaYq0XphlklwySgCmpe2RKsXUqgAEFUqnmBOpj8CdYutTbEVcS31De3+nkjgNIJRWoTJO0csNAIdENUC1Mq6ESUl7oNxxPisIBPMONUxaZhYhyIwljDqMbZYpS4ujM2Z19qn5FIYQCEzGtU1sy/dsavE+4ggEU/ZnaF/ZOrWW1qXdQo+8gZjU2mymwa1yEp2AwY4GOCMINHEglTdK1GUtKOYsMfq1uEAwTJSkMt/Sj2XAYX93AUzHfEIHNLgCuZ4O5z9xnlc8Q+lnLCABa+RTezw7Aat5ATbcUk1eW+j2oh77jpuuv+bnZSjjwq+TzVmvpLzkiO8tDNqhgAJI+F53whsQ9w148ga8kPndCuDIVzzDhT0xtFaIRh+Ae658b/YP6gP0ij57mssMswAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOS0xMS0wOVQxNzo0NTo1MSswMDowMOP38vcAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTktMTEtMDlUMTc6NDU6NTErMDA6MDCSqkpLAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg==";
//dim
var display;
var queens;

//HTML Element
var canvas;
var setupBtn;
var resetBtn;
var sizeInput;
var speedSelect;
var lastResult;

var solveList;
var listbox;

window.onload = function () {
  //get element
  canvas = document.getElementById("chessboard");
  setupBtn = document.getElementById("setup");
  resetBtn = document.getElementById("reset");
  sizeInput = document.getElementById("size");
  speedSelect = document.getElementById("speed");
  lastResult = document.getElementById("lastResult");

  solveList = document.getElementById("solveList");
  listbox = document.getElementById("listbox");

  //init
  display = new Display(canvas, lastResult);
  display.setDOMItem(lastResult, solveList, listbox);

  //add event
  setupBtn.addEventListener("click", () => {
    settingBoard(display);
  });
  resetBtn.addEventListener("click", resetBoard);
  solveList.addEventListener("click", showHistory);
};

function resetBoard() {
  setupBtn.disabled = false;
  sizeInput.disabled = false;
  speedSelect.disabled = false;

  display.destroy();
  display = new Display(canvas);
  display.setDOMItem(lastResult, solveList, listbox);
  queens.breakTask();
}

function settingBoard(display) {
  let size = sizeInput.value;
  let speed = speedSelect.value;

  //setting display
  display.settingSize(size);

  //disable btn, input
  setupBtn.disabled = true;
  sizeInput.disabled = true;
  speedSelect.disabled = true;
  //start init
  display.initDisplay();
  queens = new Queens(size, speed, display.getAns);
  queens.task(0);
  display.initQueensDisplay(queens);
}

function showHistory(event) {
  let target = event.target;
  //console.log('showHistory', target.nodeName.toUpperCase());
  //排除非A
  if (target.nodeName.toUpperCase() != "A") {
    return;
  }

  let index = target.dataset.index;
  if (index === undefined) {
    return;
  }

  if (display === undefined) {
    return;
  }
  display.showSolves(index);
  display.setSelectIndex(parseInt(index));
  //console.log('click', index);
}

class Display {
  constructor(canv) {
    this.canv = canv;
    this.ctx = this.canv.getContext("2d");

    this.queens = new Array();
    this.pos = { row: 0, col: 0, display: true };
    this.queenIcon = new Image();
    this.queenIcon.src = QUEEN_IMG;
    this.playbooks = new Array();
    this.solveCount = 0;

    this.getAns = this.getAns.bind(this);
  }

  setDOMItem(lastResult, solveList, listbox) {
    this.lastResult = lastResult;
    this.solveList = solveList;
    this.listbox = listbox;
  }

  settingSize(size) {
    this.size = size;
    this.canv.style.width = this.size * BLOCK_SIZE + "px"; //外觀大小
    this.canv.style.height = this.size * BLOCK_SIZE + "px";
    this.canv.width = this.size * BLOCK_SIZE; //實際畫布大小
    this.canv.height = this.size * BLOCK_SIZE;
  }

  setSelectIndex(index) {
    this.listboxSelectIndex = index;
  }

  initDisplay() {
    let _this = this;
    this.displayTask = setInterval(function () {
      _this.draw();
    }, 1000 / 25);
  }

  initQueensDisplay(runtimeQueens) {
    this.runtimeQueens = runtimeQueens;
    let _this = this;
    this.updateTask = setInterval(function () {
      let runtime = _this.runtimeQueens.getQueens();
      let pos = _this.runtimeQueens.getNowPos();
      _this.updateDisplay(runtime);
      _this.updatePos(pos);
    }, 1000 / 10);
  }

  updatePos(pos) {
    this.pos = pos;
  }

  updateDisplay(queens) {
    this.queens = queens;
  }

  getAns(queens) {
    console.log("new ans", queens);
    this.updateDisplay(queens);
    this.draw(false);
    let src = this.canv.toDataURL("image/jpeg", 1.0);

    this.solveCount++; //計算解的數量
    let playbook = new PlayBook(this.solveCount, this.size);

    playbook.addQueens([...this.queens]);
    playbook.setQueenImg(src);

    let result = false;
    let index;
    let ret;
    for (index = 0; index < this.playbooks.length; index++) {
      ret = this.playbooks[index].isSimilars(playbook);
      if (ret.similars) {
        result = true;
        break;
      }
    }
    console.log("Similar solution", `${this.solveCount}－${result}`);
    this.setLastResult(this.solveCount, result, src);

    if (result) {
      this.playbooks[index].addSimilars(playbook, ret.type);

      console.log(
        "Similar solution list",
        this.playbooks[index].getSimilars().length
      );
      this.setSolveList();
      if (this.listboxSelectIndex === index) {
        this.showSolves(this.listboxSelectIndex);
      }
      return;
    }
    this.playbooks.push(playbook);
    this.setSolveList();
  }

  showSolves(index) {
    if (this.playbooks[index] === undefined) {
      console.log("showSolves", `${index} not exist`);
      return;
    }
    let addDiv = (id, type, pic) => {
      //console.log('adddiv', `${id} ${type}`);
      let typeText = "First solution";
      if (type === "m") {
        typeText = "Mirror solution";
      } else if (type === "r") {
        typeText = "Rotation solution";
      }
      return `<div class="box">
        <h6>#${id}－${typeText}</h6>
        <img src="${pic}">
      </div>`;
    };

    let id = this.playbooks[index].getId();
    let img = this.playbooks[index].getQueenImg();
    this.listbox.innerHTML = `<h5>#${id} Solution list</h5>`;

    this.listbox.innerHTML += addDiv(
      id,
      this.playbooks[index].getBookType(),
      img
    );

    if (!this.playbooks[index].hasSimilars()) {
      console.log("showSolves", `no similars`);
      return;
    }
    this.playbooks[index].getSimilars().forEach((playbook, id) => {
      let pid = playbook.getId();
      let pimg = playbook.getQueenImg();
      this.listbox.innerHTML += addDiv(pid, playbook.getBookType(), pimg);
    });
  }

  setLastResult(id, isSimilar, img) {
    let similar = isSimilar ? "True" : "False";
    this.lastResult.innerHTML = `<img src="${img}">
     <ul>
      <li>ID：#${id}</li>
      <li>Have similar: ${similar}</li>
     </ul>`;
  }

  setSolveList() {
    this.solveList.lastElementChild.innerHTML = "";
    this.playbooks.forEach((element, index) => {
      let formatId = (id, length) => {
        let len = String(id).length;
        if (len < length) {
          let rts = " ";
          for (let i = 0; i < length - len; i++) {
            rts += "&nbsp";
          }
          return rts + id;
        }
        return id;
      };
      let formatSolveNum = (num) => {
        if (num > 0) {
          let n = formatId(num, 1);
          return `(${n} more)`;
        } else {
          return "Don't have similar solutions";
        }
      };
      let similars = element.hasSimilars();

      let id = formatId(element.getId(), 3);
      let data = index;
      let solve = formatSolveNum(similars);
      this.solveList.lastElementChild.innerHTML += `<li><a href="#" data-index="${data}">#${id} - ${solve}</a></li>`;
    });
  }

  draw(showPos = true) {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        this.ctx.fillStyle = (y + x) % 2 == 0 ? "#edcfb5" : "#4f4f4f";
        this.ctx.fillRect(
          x * BLOCK_SIZE,
          y * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      }
    }

    //draw now Pos
    if (this.pos.display && showPos) {
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = "#87cdff";

      this.ctx.beginPath();
      this.ctx.moveTo(
        this.pos.col * BLOCK_SIZE + 10,
        this.pos.row * BLOCK_SIZE + 10
      );
      this.ctx.lineTo(
        this.pos.col * BLOCK_SIZE + 40,
        this.pos.row * BLOCK_SIZE + 40
      );
      this.ctx.moveTo(
        this.pos.col * BLOCK_SIZE + 10,
        this.pos.row * BLOCK_SIZE + 40
      );
      this.ctx.lineTo(
        this.pos.col * BLOCK_SIZE + 40,
        this.pos.row * BLOCK_SIZE + 10
      );
      this.ctx.stroke();
    }

    //draw Queens
    for (let row = 0; row < this.size; row++) {
      if (this.queens[row] === undefined) {
        continue;
      }
      this.ctx.drawImage(
        this.queenIcon,
        this.queens[row] * BLOCK_SIZE + 9,
        row * BLOCK_SIZE + 9
      );
    }
  }

  destroy() {
    clearInterval(this.updateTask);
    clearInterval(this.displayTask);
    this.pos.display = false;
    this.queens = [];
    this.draw();
    this.listbox.innerHTML = "";
    this.solveList.lastElementChild.innerHTML = "";
    this.lastResult.innerHTML = "";
  }
}

class PlayBook {
  constructor(id, size) {
    this.queens = new Array(size);
    this.similars = new Array();
    this.size = size;
    this.id = id;
    this.type = "f";
  }

  addQueen(y, x) {
    if (this.queens.length > this.size) {
      return false;
    }
    this.queens[y] = x;
    return true;
  }

  addQueens(data) {
    if (data.length != this.size) {
      return false;
    }
    this.queens = [...data];
  }

  setQueenImg(src) {
    this.picScr = src;
  }

  setBookType(type) {
    this.type = type;
  }

  getBookType() {
    return this.type;
  }

  getQueens() {
    return [...this.queens];
  }

  getSimilars() {
    return this.similars;
  }

  getQueenImg() {
    return this.picScr;
  }

  getId() {
    return this.id;
  }

  addSimilars(obj, type) {
    if (type) {
      obj.setBookType(type);
    }
    this.similars.push(obj);
  }

  isSimilars(obj) {
    let data = obj.getQueens();
    if (data.length != this.size) {
      return false;
    }

    //尚未翻轉 鏡像
    if (this.isSame(this.mirrorBook(), data)) {
      return { similars: true, type: "m" };
    }

    for (let times = 1; times <= 3; times++) {
      let rtQueens = this.rotateBook(times);
      let mrQueens = this.mirrorBook(rtQueens);
      console.log("rtQ", rtQueens);
      console.log("mrQ", rtQueens);
      console.log("data", data);
      let rtResult = this.isSame(rtQueens, data);
      let mrResult = this.isSame(mrQueens, data);

      if (times == 3 || rtResult || mrResult) {
        console.log(
          "Similar solutions",
          `rt:${rtResult} ,mr:${mrResult}, ${times} Second-rate`
        );
        if (rtResult || mrResult)
          return { similars: rtResult || mrResult, type: mrResult ? "m" : "r" };

        return { similars: rtResult || mrResult };
      }
    }
    return { similars: false };
  }

  hasSimilars() {
    return this.similars.length > 0 ? this.similars.length : false;
  }

  rotateBook(times = 1, queens) {
    if (queens === undefined) {
      queens = this.getQueens();
    }
    let result = this.getRotation(queens);
    return --times == 0 ? result : this.rotateBook(times, result);
  }

  mirrorBook(queens) {
    if (queens === undefined) {
      queens = this.getQueens();
    }
    return this.getMirror(queens);
  }

  isSame(srcData, tgtData) {
    let result = true;
    for (let index = 0; index < srcData.length; index++) {
      if (srcData[index] != tgtData[index]) {
        //console.log(`${srcData[index]} != ${tgtData[index]}`);
        result = false;
        break;
      }
    }
    return result;
  }

  //座標選轉90 Array Obj
  getRotation(data) {
    let rotation = new Array(data.length);

    for (let index = 0; index < data.length; index++) {
      let rtPos = this.positionRotation(index, data[index]);
      //console.log(`${rtPos.posY}, ${rtPos.posX}`);
      rotation[rtPos.posY] = rtPos.posX;
    }
    return rotation;
  }
  //座標mirror Array Obj
  getMirror(data) {
    let mirror = new Array(data.length);

    for (let index = 0; index < data.length; index++) {
      let mrPos = this.positionMirror(index, data[index]);
      mirror[mrPos.posY] = mrPos.posX;
    }
    return mirror;
  }

  //座標選轉90
  positionRotation(y, x) {
    let r = Math.PI / 2; //90
    let nx = Math.abs(Math.floor(Math.cos(r) * x - Math.sin(r) * y));
    let ny = Math.abs(
      Math.floor(Math.sin(r) * x + Math.cos(r) * y) - this.size + 1
    );
    return { posY: ny, posX: nx };
  }

  //座標mirror
  positionMirror(y, x) {
    let nx = this.size - 1 - x;
    return { posY: y, posX: nx };
  }
}

class Queens {
  constructor(size, speed, callback) {
    this.size = size;
    this.speed = speed;

    this.queens = new Array();
    this.column = new Array();
    this.slash = new Array();
    this.backSlash = new Array();
    this.status = { row: 0, col: 0, display: true };

    this.callback = callback;
    this.taskStatus = true;
  }

  getQueens() {
    return [...this.queens];
  }

  getNowPos() {
    return Object.assign({}, this.status);
  }

  async task(row) {
    if (!this.taskStatus) return;

    if (row >= this.size) {
      this.status.display = false;
      this.callback(this.getQueens());
      await this.delayControl(1000);
      this.status.display = true;
    } else {
      for (let col = 0; col < this.size; col++) {
        //display status
        this.status.display = true;
        this.status.row = row;
        this.status.col = col;
        //delay control need 'await', 先停在判斷
        await this.delayControl(this.speed);

        if (this.isSafe(row, col)) {
          //set queens pos
          this.queens[row] = col;
          //set reserved pos
          this.column[col] = true;
          this.slash[row + col] = true;
          this.backSlash[row - col + this.size - 1] = true;
          //console.log('runtime', `${row}, ${col}`);
          await this.delayControl(this.speed);
          //find next position
          await this.task(row + 1);
          //rollback to last row
          //console.log('rollback', `${row}, ${col}`);
          this.column[col] = false;
          this.slash[row + col] = false;
          this.backSlash[row - col + this.size - 1] = false;
          this.queens[row] = undefined;
        }
        if (row === 0 && col === this.size - 1) {
          this.status.display = false;
        }
      }
    }
  }

  breakTask() {
    this.taskStatus = false;
  }

  isSafe(y, x) {
    return !(
      this.column[x] ||
      this.slash[y + x] ||
      this.backSlash[y - x + this.size - 1]
    );
  }

  async delayControl(time = 0) {
    if (time == 0) return; //
    return new Promise((r) => setTimeout(r, time));
  }
}
