const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const volumeslider = document.getElementById("volumeslider");

canvas.width = innerWidth - 17;
canvas.height = innerHeight;

const playerSpeed = 12;
const jumpspeed = 30;
const gravity = 0.9;
const attackTimer = 8;
const attackStr = 5;
const downarialstr = 10;
const downarialms = 50;
const jumpBufferTime = 3;
const coyoteTimer = 7;
const platw = canvas.width / 7;
const plath = canvas.height / 15;
const attackWindupTimer = 3;

let volume = 0.2;

let maxDeaths = 3;

let running = false;

let platforms = [];

let p1spawn = { x: 0, y: 0 };
let p2spawn = { x: 0, y: 0 };

let mapsopen = false;
let settingsopen = false;

let lastTime = 0;
const defaultControlScheme = {
  p1Left: "a",
  p1Jump: "w",
  p1Right: "d",
  p1Down: "s",
  p1Attack: " ",
  p2Left: "ArrowLeft",
  p2Jump: "ArrowUp",
  p2Right: "ArrowRight",
  p2Down: "ArrowDown",
  p2Attack: "0",
};
let controlscheme = {
  p1Left: "a",
  p1Jump: "w",
  p1Right: "d",
  p1Down: "s",
  p1Attack: " ",
  p2Left: "ArrowLeft",
  p2Jump: "ArrowUp",
  p2Right: "ArrowRight",
  p2Down: "ArrowDown",
  p2Attack: "0",
};
const keys = {
  ArrowUp: { pressed: false },
  ArrowLeft: { pressed: false },
  ArrowRight: { pressed: false },
  ArrowDown: { pressed: false },
  a: { pressed: false },
  b: { pressed: false },
  c: { pressed: false },
  d: { pressed: false },
  e: { pressed: false },
  f: { pressed: false },
  g: { pressed: false },
  h: { pressed: false },
  i: { pressed: false },
  j: { pressed: false },
  k: { pressed: false },
  l: { pressed: false },
  m: { pressed: false },
  n: { pressed: false },
  o: { pressed: false },
  p: { pressed: false },
  r: { pressed: false },
  s: { pressed: false },
  t: { pressed: false },
  u: { pressed: false },
  v: { pressed: false },
  z: { pressed: false },
  x: { pressed: false },
  y: { pressed: false },
  q: { pressed: false },
  w: { pressed: false },
  1: { pressed: false },
  2: { pressed: false },
  3: { pressed: false },
  4: { pressed: false },
  5: { pressed: false },
  6: { pressed: false },
  7: { pressed: false },
  8: { pressed: false },
  9: { pressed: false },
  0: { pressed: false },
  " ": { pressed: false },
};
document.addEventListener("keydown", (el) => {
  if (el.key in keys) {
    keys[el.key].pressed = true;
  }
});
document.addEventListener("keyup", (el) => {
  if (el.key in keys) {
    keys[el.key].pressed = false;
  }
});

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}
function drawUI() {
  let fontsize = 110;
  ctx.font = `${fontsize}px "Impact"`;
  ctx.fillStyle = "#f04324";
  ctx.fillText(`${p2.deaths}`, canvas.width / 4, fontsize * 1.1);
  ctx.fillStyle = "#249bf0";
  ctx.fillText(`${p1.deaths}`, (canvas.width / 4) * 3, fontsize * 1.1);

  ctx.font = `${canvas.height * 0.05}px "Impact"`;
  ctx.fillStyle = "#f04324";
  ctx.drawImage(
    p1.rightSprite,
    canvas.width / 10,
    canvas.height * 0.9,
    canvas.height * 0.1,
    canvas.height * 0.1
  );
  ctx.fillText(
    `${Math.trunc(p1.damaged * 100)}%`,
    canvas.width / 10,
    canvas.height * 0.97
  );

  ctx.fillStyle = "#249bf0";
  ctx.drawImage(
    p2.leftSprite,
    (canvas.width / 10) * 9,
    canvas.height * 0.9,
    canvas.height * 0.1,
    canvas.height * 0.1
  );
  ctx.fillText(
    `${Math.trunc(p2.damaged * 100)}%`,
    (canvas.width / 10) * 9,
    canvas.height * 0.97
  );
}
function addPlatform(x, y, w, h) {
  platforms.push({ x, y, w, h });
}
function renderPlatforms() {
  platforms.forEach((p) => {
    ctx.drawImage(platforma, p.x, p.y, p.w, p.h);
  });
}
function doPlatformCollision(plr) {
  platforms.forEach((p) => {
    let collision = false;
    if (plr.msy >= 0) {
      //zgori levo
      if (
        plr.x > p.x &&
        plr.x < p.x + p.w &&
        plr.y > p.y &&
        plr.y < p.y + p.h
      ) {
        collision = true;
      }
      //zgori desno
      else if (
        plr.x + plr.w > p.x &&
        plr.x + plr.w < p.x + p.w &&
        plr.y > p.y &&
        plr.y < p.y + p.h
      ) {
        collision = true;
      }
      //spodi levo
      else if (
        plr.x > p.x &&
        plr.x < p.x + p.w &&
        plr.y + plr.h > p.y &&
        plr.y + plr.h < p.y + p.h
      ) {
        collision = true;
      }
      //spodi desno
      else if (
        plr.x + plr.w > p.x &&
        plr.x + plr.w < p.x + p.w &&
        plr.y + plr.h > p.y &&
        plr.y + plr.h < p.y + p.h
      ) {
        collision = true;
      }

      if (collision) {
        plr.y = p.y - plr.h;
        plr.msy = 0;
        plr.onground = true;
        plr.coyotetime = coyoteTimer;
      }
    }
  });
}
function doPlayerCollision() {
  if (dist(p1.x, p1.y, p2.x, p2.y) < p2.w * 0.8) {
    p1.msx += -(p2.x - p1.x) / 20;
    p1.msy += -(p2.y - p1.y) / 20;
  }

  if (dist(p2.x, p2.y, p1.x, p1.y) < p1.w * 0.8) {
    p2.msx += -(p1.x - p2.x) / 20;
    p2.msy += -(p1.y - p2.y) / 20;
  }
}
function updatePlayer(plr) {
  plr.msx += (plr.tvelx - plr.msx) / 8;
  plr.attacktimer--;

  if (plr.attackwindup == 0) {
    attack(plr, plr.att);
    plr.attackwindup = -1;
  }
  plr.attackwindup--;
  if (plr.coyotetime <= 0) plr.onground = false;

  if (plr.jumptimer >= 0 && plr.onground) {
    plr.jumptimer = -1;
    plr.coyotetime = -1;
    plr.msy = -jumpspeed;
  }
  plr.jumptimer--;

  if (plr.msy > 0) {
    plr.msy += gravity * 1.6;
  } else {
    plr.msy += gravity;
  }
  plr.coyotetime--;

  plr.x += plr.msx;
  plr.y += plr.msy;

  if (plr.y > canvas.height * 5) die(plr);
}
function renderPlayer(plr) {
  ctx.save();
  if (plr.dir < 0) {
    ctx.drawImage(plr.leftSprite, plr.x, plr.y, plr.w, plr.h);
  } else ctx.drawImage(plr.rightSprite, plr.x, plr.y, plr.w, plr.h);
  ctx.restore();
}
function damagePlayer(plr, left, strength) {
  plr.damaged += 0.03;
  if (left) plr.msx = attackStr * plr.damaged * strength;
  else plr.msx = -attackStr * plr.damaged * strength;
}
function updateAtt(att, plr1, plr2) {
  att.timer--;
  if (att.timer < 0) {
    att.x = -12321;
    return;
  } else {
    if (att.down) {
      att.x = plr1.x + plr1.w / 2;
      att.y = plr1.y + plr1.h + att.h * 1.2;
    } else {
      if (plr1.dir < 0) {
        att.x = plr1.x - att.w * 1.4;
      } else {
        att.x = plr1.x + plr1.w + att.w * 0.6;
      }
      att.y = plr1.y + plr1.h / 2 - att.h / 2;
    }
  }

  if (
    dist(
      att.x + att.w / 2,
      att.y + att.h / 2,
      plr2.x + plr2.w / 2,
      plr2.y + plr2.h / 2
    ) <
    plr2.w * 0.7
  ) {
    if (plr2.x - plr1.x > 0) {
      damagePlayer(plr2, true, att.strength);
    } else {
      damagePlayer(plr2, false, att.strength);
    }
  }
}
function attack(plr, att) {
  if (plr.attacktimer > 0) return;
  plr.attaksound.play();
  plr.attacktimer = attackTimer * 3.5;
  att.timer = attackTimer;
  att.y = plr.y + plr.h / 2 - att.h / 2;
  if (plr.down && !plr.onground) {
    plr.msy = downarialms;
    att.down = true;
    att.strength = downarialstr;
    att.timer *= 1.2;
    plr.attacktimer *= 2;
    return;
  } else {
    att.down = false;
    att.strength = attackStr;
  }
}
function die(plr) {
  plr.msy = 0;
  plr.x = canvas.width / 2;
  plr.y = canvas.height * 0.2;
  plr.damaged = 0;
  plr.deaths++;
}
const p1 = {
  leftSprite: undefined,
  rightSprite: undefined,
  deaths: 0,
  x: 0,
  y: 0,
  w: canvas.height / 12,
  h: canvas.height / 12,
  msx: 0,
  msy: 0,
  tvelx: 0,
  down: false,
  coyotetime: 0,
  jumptimer: 0,
  dir: 1,
  nextattack: 0,
  attackwindup: 0,
  damaged: 0,
  onground: false,
  attaksound: undefined,
  att: {
    x: -12313,
    y: -12313,
    w: canvas.height / 30,
    h: canvas.height / 30,
    strength: 1,
    down: false,
    timer: 0,
    update: () => {
      updateAtt(p1.att, p1, p2);
    },
  },
  update: () => {
    updatePlayer(p1);
  },
  attack: () => {
    attack(p1, p1.att);
  },
  render: () => {
    renderPlayer(p1);
  },
};
const p2 = {
  leftSprite: undefined,
  rightSprite: undefined,
  deaths: 0,
  x: 0,
  y: 0,
  w: canvas.height / 12,
  h: canvas.height / 12,
  msx: 0,
  msy: 0,
  tvelx: 0,
  dir: 1,
  down: false,
  damaged: 0,
  nextattack: 0,
  coyotetime: 0,
  jumptimer: 0,
  onground: false,
  attaksound: undefined,
  att: {
    x: -12313,
    y: -12313,
    w: canvas.height / 30,
    h: canvas.height / 30,
    strength: 1,
    down: false,
    timer: 0,
    update: () => {
      updateAtt(p2.att, p1, p2);
    },
  },
  update: () => {
    updatePlayer(p2);
  },
  attack: () => {
    attack(p2, p2.att);
  },
  render: () => {
    renderPlayer(p2);
  },
};

function rendermap(blur) {
  ctx.drawImage(ozadje, 0, 0, canvas.width, canvas.height);
  renderPlatforms();
  if (blur == true) {
    ctx.globalAlpha = 0.5;
    canvas.style.webkitFilter = "blur(9px)";
  } else {
    ctx.globalAlpha = 1;
    canvas.style.webkitFilter = "blur(0px)";
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  rendermap(false);
  p1.render();
  p2.render();
  ctx.drawImage(slika3, p1.att.x, p1.att.y, p1.att.h, p1.att.w);
  ctx.drawImage(slika3, p2.att.x, p2.att.y, p2.att.h, p2.att.w);
  drawUI();
}
function update() {
  p1.update();
  p2.update();
  p1.att.update();
  p2.att.update();
  doPlayerCollision();
  doPlatformCollision(p1);
  doPlatformCollision(p2);
}
function handleinput() {
  if (keys[controlscheme.p1Jump].pressed) {
    p1.jumptimer = jumpBufferTime;
  }
  if (!keys[controlscheme.p1Jump].pressed && p1.msy < 0) {
    p1.msy /= 1.1;
  }
  if (keys[controlscheme.p1Left].pressed) {
    p1.dir = -1;

    p1.tvelx = -playerSpeed;
  }
  if (keys[controlscheme.p1Right].pressed) {
    p1.dir = 1;
    p1.tvelx = playerSpeed;
  }
  if (keys[controlscheme.p1Attack].pressed) {
    p1.attackwindup = attackWindupTimer;
  }
  if (keys[controlscheme.p1Down].pressed) {
    p1.down = true;
  } else {
    p1.down = false;
  }

  if (keys[controlscheme.p2Jump].pressed) {
    p2.jumptimer = jumpBufferTime;
  }
  if (!keys[controlscheme.p2Jump].pressed && p1.msy < 0) {
    p2.msy /= 1.1;
  }
  if (keys[controlscheme.p2Left].pressed) {
    p2.dir = -1;

    p2.tvelx = -playerSpeed;
  }
  if (keys[controlscheme.p2Right].pressed) {
    p2.dir = 1;
    p2.tvelx = playerSpeed;
  }
  if (keys[controlscheme.p2Attack].pressed) {
    p2.attackwindup = attackWindupTimer;
  }
  if (keys[controlscheme.p2Down].pressed) {
    p2.down = true;
  } else {
    p2.down = false;
  }
}
function gameloop() {
  let currentTime = new Date();
  let deltatime = currentTime - lastTime;
  if (deltatime > 1000 / 80) {
    if (p1.deaths == maxDeaths || p2.deaths == maxDeaths) {
      win();
    } else {
      p1.tvelx = 0;
      p2.tvelx = 0;
      handleinput();
      update();
      render();
    }
    lastTime = currentTime;
  }
  if (!running) exit();
  else window.requestAnimationFrame(gameloop);
}
function bgloop() {
  if (!running) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rendermap(true);
    window.requestAnimationFrame(bgloop);
  }
}

function start() {
  console.log(controlscheme);
  togglechoosemap(0);
  togglesettings(0);
  let buttons = document.getElementsByClassName("hideonstart");
  [...buttons].forEach((e, i) => {
    buttons[i].classList.remove("shown");
    buttons[i].classList.add("hidden");
  });

  buttons = document.getElementsByClassName("showonstart");
  [...buttons].forEach((e, i) => {
    buttons[i].classList.add("shown");
    buttons[i].classList.remove("hidden");
  });
  running = true;

  p1.x = p1spawn.x;
  p1.y = p1spawn.y;
  p1.msx = 0;
  p1.tvelx = 0;
  p1.msy = 0;
  p1.damaged = 1;
  p1.deaths = 0;
  p2.x = p2spawn.x;
  p2.y = p2spawn.y;
  p2.msx = 0;
  p2.tvelx = 0;
  p2.msy = 0;
  p2.damaged = 1;
  p2.deaths = 0;
  menutheme.pause();
  menutheme.currentTime = 0;
  battletheme.play();
  window.requestAnimationFrame(gameloop);
}
function exit() {
  battletheme.pause();
  battletheme.currentTime = 0;
  menutheme.play();
  let buttons = document.getElementsByClassName("hideonstart");
  [...buttons].forEach((e, i) => {
    buttons[i].classList.add("shown");
    buttons[i].classList.remove("hidden");
  });

  buttons = document.getElementsByClassName("showonstart");
  [...buttons].forEach((e, i) => {
    buttons[i].classList.remove("shown");
    buttons[i].classList.add("hidden");
  });
  bgloop();
}
function win() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (p2.deaths == maxDeaths) {
    ctx.drawImage(
      p2.rightSprite,
      canvas.width * 0.3,
      canvas.height * 0.5,
      canvas.height * 0.3,
      canvas.height * 0.3
    );
    ctx.drawImage(
      p1.rightSprite,
      canvas.width * 0.5,
      canvas.height * 0.2,
      canvas.height * 0.6,
      canvas.height * 0.6
    );
    ctx.font = `900% "Impact"`;
    ctx.fillStyle = "#f04324";
    ctx.fillText(`WINNER IS PLAYER1`, canvas.width * 0.4, canvas.height * 0.25);
  } else {
    ctx.drawImage(
      p1.rightSprite,
      canvas.width * 0.3,
      canvas.height * 0.5,
      canvas.height * 0.3,
      canvas.height * 0.3
    );
    ctx.drawImage(
      p2.rightSprite,
      canvas.width * 0.5,
      canvas.height * 0.2,
      canvas.height * 0.6,
      canvas.height * 0.6
    );
    ctx.font = `900% "Impact"`;
    ctx.fillStyle = "#249bf0";
    ctx.fillText(`WINNER IS PLAYER2`, canvas.width * 0.4, canvas.height * 0.25);
  }
}
function togglechoosemap(state) {
  let buttons = document.getElementsByClassName("choosemap");
  [...buttons].forEach((e, i) => {
    if (state == -1) {
      if (buttons[i].classList.contains("slideout")) {
        buttons[i].classList.remove("slideout");
        buttons[i].classList.add("slidein");
      } else {
        buttons[i].classList.add("slideout");
        buttons[i].classList.remove("slidein");
      }
    }
    if (state == 0) {
      buttons[i].classList.add("slideout");
      buttons[i].classList.remove("slidein");
    }
    if (state == 1) {
      buttons[i].classList.remove("slideout");
      buttons[i].classList.add("slidein");
    }
  });
}
function togglesettings(state) {
  let buttons = document.getElementsByClassName("choosesettings");
  [...buttons].forEach((e, i) => {
    if (state == -1) {
      if (buttons[i].classList.contains("slideout")) {
        buttons[i].classList.remove("slideout");
        buttons[i].classList.add("slidein");
      } else {
        buttons[i].classList.add("slideout");
        buttons[i].classList.remove("slidein");
      }
    }
    if (state == 0) {
      buttons[i].classList.add("slideout");
      buttons[i].classList.remove("slidein");
    }
    if (state == 1) {
      buttons[i].classList.remove("slideout");
      buttons[i].classList.add("slidein");
    }
  });
}

function togglecontrols(state) {
  let buttons = document.getElementsByClassName("choosecontrols");
  [...buttons].forEach((e, i) => {
    if (state == -1) {
      if (buttons[i].classList.contains("slideout")) {
        buttons[i].classList.remove("slideout");
        buttons[i].classList.add("slidein");
      } else {
        buttons[i].classList.add("slideout");
        buttons[i].classList.remove("slidein");
      }
    }
    if (state == 0) {
      buttons[i].classList.add("slideout");
      buttons[i].classList.remove("slidein");
    }
    if (state == 1) {
      buttons[i].classList.remove("slideout");
      buttons[i].classList.add("slidein");
    }
  });
}
function clearmap() {
  while (platforms.length > 0) {
    platforms.pop();
  }
}
function loadMap1() {
  ozadje = ozadje1;
  platforma = platform1;
  clearmap();
  p1spawn.x = canvas.width / 4;
  p1spawn.y = canvas.height * 0.1;
  p2spawn.x = (canvas.width * 3) / 4;
  p2spawn.y = canvas.height * 0.1;
  addPlatform(
    canvas.width / 2 - (platw * 3) / 2,
    canvas.height * 0.9,
    platw * 3,
    plath
  );
  addPlatform(canvas.width / 4 - platw / 2, canvas.height * 0.5, platw, plath);
  addPlatform(
    (canvas.width / 4) * 3 - platw / 2,
    canvas.height * 0.5,
    platw,
    plath
  );
  localStorage.setItem("map", "map1");
}
function loadMap2() {
  ozadje = ozadje2;
  platforma = platform2;
  clearmap();
  p1spawn.x = canvas.width / 4;
  p1spawn.y = canvas.height * 0.1;
  p2spawn.x = (canvas.width * 3) / 4;
  p2spawn.y = canvas.height * 0.1;
  addPlatform(0, canvas.height * 0.8 - plath, canvas.width, plath);
  localStorage.setItem("map", "map2");
}
function loadMap3() {
  ozadje = ozadje3;
  platforma = platform3;
  clearmap();
  p1spawn.x = canvas.width * 0.2;
  p1spawn.y = canvas.height * 0.1;
  p2spawn.x = canvas.width * 0.65;
  p2spawn.y = canvas.height * 0.1;

  addPlatform(canvas.width * 0.2, canvas.height * 0.2, platw / 1.5, plath);
  addPlatform(canvas.width * 0.3, canvas.height * 0.7, platw / 1.5, plath);
  addPlatform(canvas.width * 0.65, canvas.height * 0.9, platw / 1.5, plath);
  addPlatform(canvas.width * 0.9, canvas.height * 0.45, platw / 1.5, plath);
  addPlatform(canvas.width * 0.55, canvas.height * 0.3, platw / 1.5, plath);
  addPlatform(canvas.width * 0.1, canvas.height * 0.8, platw / 1.5, plath);
  localStorage.setItem("map", "map3");
}

function volumeinput(e) {
  volume = e.value / 100;
  menutheme.volume = volume;
  battletheme.volume = volume;
  p1.attaksound.volume = volume;
  p2.attaksound.volume = volume;
  localStorage.setItem("volume", `${volume}`);
}

function init() {
  menutheme.play();

  let map = localStorage.getItem("map");
  if (map == "map3") {
    loadMap3();
  } else if (map == "map2") {
    loadMap2();
  } else loadMap1();

  volume = localStorage.getItem("volume");
  menutheme.volume = volume;
  battletheme.volume = volume;
  p1.attaksound.volume = volume;
  p2.attaksound.volume = volume;
  document.getElementById("volumeslider").value = volume * 100;

  if (localStorage.getItem("controls") === "true") {
    controlscheme.p1Jump = localStorage.getItem("p1Jump");
    controlscheme.p1Left = localStorage.getItem("p1Left");
    controlscheme.p1Right = localStorage.getItem("p1Right");
    controlscheme.p1Down = localStorage.getItem("p1Down");
    controlscheme.p1Attack = localStorage.getItem("p1Attack");
    controlscheme.p2Jump = localStorage.getItem("p2Jump");
    controlscheme.p2Left = localStorage.getItem("p2Left");
    controlscheme.p2Right = localStorage.getItem("p2Right");
    controlscheme.p2Down = localStorage.getItem("p2Down");
    controlscheme.p2Attack = localStorage.getItem("p2Attack");
  }
  bgloop();
}

function getInput() {
  let key;
  while (keys[(key = prompt("please enter a valid key"))] == undefined) {}
  return key;
}

function resetControls() {
  controlscheme = defaultControlScheme;
  saveInput();
}

function saveInput() {
  localStorage.setItem("controls", `true`);
  localStorage.setItem("p1Jump", `${controlscheme.p1Jump}`);
  localStorage.setItem("p1Left", `${controlscheme.p1Left}`);
  localStorage.setItem("p1Right", `${controlscheme.p1Right}`);
  localStorage.setItem("p1Down", `${controlscheme.p1Down}`);
  localStorage.setItem("p1Attack", `${controlscheme.p1Attack}`);
  localStorage.setItem("p2Jump", `${controlscheme.p2Jump}`);
  localStorage.setItem("p2Left", `${controlscheme.p2Left}`);
  localStorage.setItem("p2Right", `${controlscheme.p2Right}`);
  localStorage.setItem("p2Down", `${controlscheme.p2Down}`);
  localStorage.setItem("p2Attack", `${controlscheme.p2Attack}`);
}

const menutheme = new Audio("musik.mp3");
const battletheme = new Audio("battlemusik.mp4");
p1.attaksound = new Audio("punchsound.mp3");
p2.attaksound = new Audio("punchsound.mp3");
const ozadje1 = new Image();
const ozadje2 = new Image();
const ozadje3 = new Image();
const platform1 = new Image();
const platform2 = new Image();
const platform3 = new Image();
p1.leftSprite = new Image();
p1.rightSprite = new Image();
p2.leftSprite = new Image();
p2.rightSprite = new Image();
const slika3 = new Image();
let ozadje = undefined;
let platforma = undefined;

p1.leftSprite.src = "player1left.png";
p1.rightSprite.src = "player1right.png";
p2.leftSprite.src = "player2left.png";
p2.rightSprite.src = "player2right.png";
slika3.src = "PUNCH.png";
platform1.src = "logotipVegova.png";
platform2.src = "brokenbuilding.png";
platform3.src = "rocketship.png";
ozadje1.src = "vegova.png";
ozadje2.src = "tokyo.png";
ozadje3.src = "space.png";

init();
