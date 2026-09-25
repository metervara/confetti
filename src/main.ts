import "./style.css";
import { ConfettiPaper, type ColorPair } from "./confetti/ConfettiPaper";
import { ConfettiRibbon } from "./confetti/ConfettiRibbon";

console.log("Metervara canvas confetti");

const CONFETTI_COUNT = 30;
const RIBBON_COUNT = 10;

const colors: ColorPair[] = [
  ["#df0049", "#660671"], // red
  ["#00e857", "#005291"], // green/mint
  ["#2bebbc", "#05798a"], // cyan/blue
  ["#0018ff", "#002369"], // blue
];

const app = document.querySelector<HTMLDivElement>("#app")!;
const canvas = document.createElement("canvas");
app.appendChild(canvas);
const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Could not get 2d context");
}


const fixedDelta = 1.0 / 60;
let animationFrameId: number | null = null;
let lastFrameTime: number = 0;
let accumulator: number = 0;

const confettiRibbons: ConfettiRibbon[] = [];
const confettiPapers: ConfettiPaper[] = [];
const rpCount = 30;
const rpDist = 8.0;
const rpThick = 8.0;

const start = () => {
  stop();
  prewarm();

  lastFrameTime = performance.now();
  accumulator = 0;
  run();
};

const stop = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

const prewarm = () => {
  const prewarmSteps = 150;
  let totalTime = 0;
  while (totalTime < prewarmSteps) {
    integrate(fixedDelta);
    totalTime += 1;
  }
};

/* Physics integration loop */
const integrate = (deltaTime: number) => {
  for (let i = 0; i < confettiPapers.length; i++) {
    confettiPapers[i].update(deltaTime);
  }

  for (let i = 0; i < confettiRibbons.length; i++) {
    confettiRibbons[i].update(deltaTime);
  }
};

/* Animation frame loop */
const run = () => {
  const currentTime = performance.now();
  let frameTime = (currentTime - lastFrameTime) / 1000.0; // seconds
  lastFrameTime = currentTime;

  if (frameTime > 0.25) frameTime = 0.25;
  accumulator += frameTime;

  while (accumulator >= fixedDelta) {
    integrate(fixedDelta);
    accumulator -= fixedDelta;
  }

  render();

  animationFrameId = requestAnimationFrame(run);
};

/* Rendering */
const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < confettiPapers.length; i++) {
    confettiPapers[i].draw(ctx);
  }

  for (let i = 0; i < confettiRibbons.length; i++) {
    confettiRibbons[i].draw(ctx);
  }
};

const resize = () => {
  canvas.width = canvas.parentElement?.offsetWidth ?? window.innerWidth;
  canvas.height = canvas.parentElement?.offsetHeight ?? window.innerHeight;

  ConfettiPaper.bounds.x = ConfettiRibbon.bounds.x = canvas.width;
  ConfettiPaper.bounds.y = ConfettiRibbon.bounds.y = canvas.height;
};

window.addEventListener("resize", resize);
resize();

// INIT
confettiRibbons.length = 0;
confettiPapers.length = 0;

for (let i = 0; i < RIBBON_COUNT; i++) {
 confettiRibbons.push(
   new ConfettiRibbon(
     Math.random() * canvas.width,
     Math.random() * canvas.height * 1.5 - canvas.height * 0.5,
     // -(rpCount * rpDist),
     rpCount,
     rpDist,
     rpThick,
     45,
     1,
     0.05,
     colors,
   ),
 );
}
for (let i = 0; i < CONFETTI_COUNT; i++) {
  confettiPapers.push(
    new ConfettiPaper(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      colors,
    ),
  );
}

start();

// No cleanup, no nothing, just let it run :-)