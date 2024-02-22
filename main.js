"use strict";
const getEvents = () => {
  return document
    .querySelector("div[role='main']")
    .querySelectorAll("div[role='button']");
};

// const acceptOrDeclineEvent = (event, action, delay = 10) => {
//   console.log("ACCEPT OR DECLINE");
//   let targetString = "unknown";
//   if (action === "accept") {
//     targetString = "Yes";
//   } else if (action === "decline") {
//     targetString = "No";
//   } else {
//     console.error(`Unknown action: ${action}`);
//     return;
//   }
//   setTimeout(() => {
//     event.click();
//     const goingSpan = Array.from(
//       document.querySelectorAll("span[aria-hidden='true']")
//     ).filter((span) => span.textContent === "Going?")[0];
//     if (goingSpan) {
//       console.log("FOUND GOING SPAN");
//       const spans = goingSpan.nextSibling?.querySelectorAll("span");
//       if (spans) {
//         console.log("FOUND INNER SPANS");
//         Array.from(spans)
//           .filter((span) => span.outerText === targetString)[0]
//           ?.parentElement?.click();
//       }
//     }
//   }, 1);

// setTimeout(() => {
//   const buttons = Array.from(document.querySelectorAll("div[role='button']"));
//   if (buttons) {
//     const innerSpans = buttons.flatMap((button) =>
//       Array.from(document.querySelectorAll("span")).filter(
//         (span) => span.textContent === "OK"
//       )
//     );
//     innerSpans[0]?.parentElement?.click();
//     console.log("CLICKED OK");
//   }
// }, 5);
// };

const dismissBigModal = () => {
  const buttons = Array.from(document.querySelectorAll("div[role='button']"));
  if (buttons) {
    const innerSpans = buttons.flatMap((button) =>
      Array.from(document.querySelectorAll("span")).filter(
        (span) => span.textContent === "OK"
      )
    );
    innerSpans[0]?.parentElement?.click();
    console.log("CLICKED OK");
  }
};

const css = `
:root {
  --color-black: hsl(235deg 15% 15%);
  --color-grey: hsl(235deg 5% 35%);
  --color-playarea: hsl(235deg 15% 67%);
}

.play-area {
  position: fixed;
  top: calc(var(--top) * 1px);
  left: calc(var(--left) * 1px);
  width: calc(var(--width) * 1px);
  height: calc(var(--height) * 1px);
  background-color: var(--color-playarea);
  outline: 2px dashed black;
  pointer-events: none;
  transition: opacity 1s ease;
}

.ball {
  position: fixed;
  left: calc(var(--left)* 1px);
  top: calc(var(--top)* 1px);
  width: calc(var(--size)* 1px);
  height: calc(var(--size)* 1px);
  background-color: var(--color-grey);
  border-radius: 50%; 
  will-change: transform;
  transition: transform var(--transform-speed) linear, opacity 1s ease;
  z-index: 1001;
}

@keyframes fading-trail {
  0% {
    opacity: 0.75;
    transform: scale(0.9);
  }

  100% {
    opacity: 0;
    transform: scale(0.3);
  }
}

.fading-trail {
  animation: fading-trail 1s ease-out both;
  filter: blur(4px);
}

/* .ball::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100px;
  height: 50px;
  z-index: -1;
  transform: rotate(180deg) translateX(65px);
  clip-path: polygon(0% 10%, 100% 30%, 100% 70%, 0% 90%);
  background: linear-gradient(270deg, rgba(123,183,217,0) 0%,
                                     rgba(167,204,224,0.72) 50%, 
                                     rgba(225,237,244,0.2) 65%,
                                     rgba(225,237,244,0) 80%
                                     );
} */

.paddle {
  position: fixed;
  left: calc(var(--left)* 1px);
  top: calc(var(--top)* 1px);
  width: calc(var(--width)* 1px);
  height: calc(var(--height)* 1px);
  background-color: var(--color-grey);
  z-index: 1002;
  transition: transform 0.05s linear, opacity 1s ease;
}

.transparent {
  opacity: 0;
}

.faded {
  opacity: 0.3;
  transition: opacity 0.5s ease, background-color 0.5s ease;
}

.brickEvent {
  border-radius: 0;
}
`;

const main = function () {
  const style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  const BALL_SIZE = 25;
  const RADIUS = BALL_SIZE / 2;
  const TICK_TIME = 50;
  const BASE_SPEED = 7.5;
  const STOP_AFTER_THIS_MANY_TICKS = 2000;
  const FADE_IN_TIME = 1000;

  const mainElt = document.querySelector("div[role='main']");
  const grid = mainElt.querySelector("div[role='grid']");
  const topPlayArea = grid
    .querySelector("div[role='row'][aria-hidden='false']")
    .getBoundingClientRect();
  const bottomPlayArea = grid.children[1].getBoundingClientRect();
  const LEFT = Math.min(topPlayArea.left, bottomPlayArea.left);
  const TOP = topPlayArea.top;
  const RIGHT = Math.max(topPlayArea.right, bottomPlayArea.right);
  const BOTTOM = Math.max(bottomPlayArea.bottom, window.innerHeight - 25) - 25;
  const WIDTH = RIGHT - LEFT;
  const HEIGHT = BOTTOM - TOP;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 20;
  // It's gross but these need to be global :/
  let paddleLeft = WIDTH / 2 - 50;
  const paddleTop = HEIGHT - 22;
  let ballLeft = WIDTH / 2 - BALL_SIZE / 2;
  let ballTop = HEIGHT - 100;

  function createElt(id, style = {}, classList = []) {
    document.querySelector(`#${id}`)?.remove();
    const elt = document.createElement("div");
    elt.id = id;
    elt.classList.add(...classList);
    Object.keys(style).forEach((key) => {
      elt.style.setProperty(key, style[key]);
    });
    document.body.appendChild(elt);
    return elt;
  }

  const playArea = createElt(
    "_playArea",
    { "--top": TOP, "--left": LEFT, "--width": WIDTH, "--height": HEIGHT },
    ["play-area", "transparent"]
  );

  const ball = createElt(
    "_ball",
    {
      "--top": TOP,
      "--left": LEFT,
      "--size": BALL_SIZE,
      "--transform-speed": `${TICK_TIME * 1.1}ms`,
    },
    ["ball", "transparent"]
  );

  const paddle = createElt(
    "_paddle",
    {
      "--top": TOP,
      "--left": LEFT,
      "--width": PADDLE_WIDTH,
      "--height": PADDLE_HEIGHT,
    },
    ["paddle", "transparent"]
  );

  const clamp = (min, max, value) => Math.min(Math.max(min, value), max);

  // nroyalty: make sure this handles things in the right order
  function addTransform(elt, transform, key) {
    const prefix = `data-transform-`;
    elt.setAttribute(prefix + key, transform);
    const transforms = [];
    for (const [k, v] of Object.entries(elt.dataset)) {
      if (k.startsWith("transform")) {
        transforms.push(v);
      }
    }
    elt.style.transform = transforms.join(" ");
  }

  function translate(elt, x, y) {
    addTransform(elt, `translate(${x}px, ${y}px)`, "translate");
  }

  function rotateForVector(elt, dx, dy) {
    // dy is negative because the y axis is inverted in the browser.
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) {
      angle += 360;
    }

    addTransform(elt, `rotate(${angle}deg)`, "rotate");
  }
  const makeBox = (left, top, width, height) => ({
    left,
    right: left + width,
    top,
    bottom: top + height,
  });

  const makeBallBox = (left, top) => makeBox(left, top, BALL_SIZE, BALL_SIZE);
  const makePaddleBox = (left, top) =>
    makeBox(left, top, PADDLE_WIDTH, PADDLE_HEIGHT);

  function circleOfBox(left, top) {
    return { x: left + RADIUS, y: top + RADIUS, r: RADIUS };
  }

  function getClosestPointToCircle(circle, rect) {
    const closestX =
      circle.x < rect.left
        ? rect.left
        : circle.x > rect.right
        ? rect.right
        : circle.x;
    const closestY =
      circle.y < rect.top
        ? rect.top
        : circle.y > rect.bottom
        ? rect.bottom
        : circle.y;
    return { x: closestX, y: closestY };
  }

  function getDistance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function circleCollidesWithRect(circle, closestPoint) {
    const distance = getDistance(circle, closestPoint);
    return distance < circle.r;
  }

  function detectCircularCollision(newBall, collisionRect) {
    const newCircle = circleOfBox(newBall.left, newBall.top);
    const closestPoint = getClosestPointToCircle(newCircle, collisionRect);
    const collided = circleCollidesWithRect(newCircle, closestPoint);
    return collided;
  }

  const ticksToCollision = (center, side, direction) =>
    Math.abs((RADIUS - Math.abs(side - center)) / direction);

  const getTicksToCollision = (circle, rect, direction) => {
    const ticks = { x: Infinity, y: Infinity };
    const relevantSideX = direction.x > 0 ? rect.left : rect.right;
    const relevantSideY = direction.y > 0 ? rect.top : rect.bottom;
    const canCollideX =
      direction.x > 0 ? circle.x < rect.left : circle.x > rect.right;
    const canCollideY =
      direction.y > 0 ? circle.y < rect.top : circle.y > rect.bottom;
    [
      ["x", relevantSideX, direction.x, canCollideX],
      ["y", relevantSideY, direction.y, canCollideY],
    ].forEach(([axis, relevantSide, direction, canCollide]) => {
      ticks[axis] = canCollide
        ? ticksToCollision(circle[axis], relevantSide, direction)
        : Infinity;
    });
    return ticks;
  };

  function handleCollision(newBall, collisionRect, direction, hasCollided) {
    const newCircle = circleOfBox(newBall.left, newBall.top);
    const ticksToCollision = getTicksToCollision(
      newCircle,
      collisionRect,
      direction
    );

    const minTicks = Math.min(ticksToCollision.x, ticksToCollision.y);
    const tryBounce = {
      x: ticksToCollision.x !== Infinity,
      y: ticksToCollision.y !== Infinity,
    };

    // nroyalty: need to figure out if this needs to account for bouncing
    // on two different events and whether, in that case, we should bounce
    // off the "minor" axis of the second event if the first event only
    // triggers a bounce on the major axis
    let didCollide = false;
    if (tryBounce.x && !hasCollided.x) {
      hasCollided.x = true;
      newBall.left -= minTicks * direction.x;
      direction.x *= -1;
      didCollide = true;
    }
    if (tryBounce.y && !hasCollided.y) {
      hasCollided.y = true;
      newBall.top -= minTicks * direction.y;
      direction.y *= -1;
      didCollide = true;
    }
    return didCollide;
  }

  function handlePlayAreaCollision(
    { nextLeft, nextTop },
    direction,
    hasCollided
  ) {
    if (nextLeft < 0) {
      direction.x = Math.abs(direction.x);
      nextLeft = 0;
      hasCollided.x = true;
    } else if (nextLeft + BALL_SIZE > WIDTH) {
      direction.x = -Math.abs(direction.x);
      nextLeft = WIDTH - BALL_SIZE;
      hasCollided.x = true;
    }
    if (nextTop < 0 || nextTop > HEIGHT - BALL_SIZE) {
      direction.y *= -1;
      nextTop = clamp(0, HEIGHT - BALL_SIZE, nextTop);
      hasCollided.y = true;
    }
  }

  function handlePaddleCollision(
    newBall,
    paddleLeft,
    direction,
    hasCollided,
    tickId
  ) {
    const paddleCenter = paddleLeft + PADDLE_WIDTH / 2;
    const ballCenter = newBall.left + BALL_SIZE / 2;
    const leftThird = paddleLeft + PADDLE_WIDTH / 3;
    const rightThird = paddleLeft + (PADDLE_WIDTH / 3) * 2;
    let reflectionVector = { x: 0, y: -1 };
    if (ballCenter < leftThird) {
      const distanceFromLeft = Math.max(0, ballCenter - paddleLeft);
      const scaledToPaddle = distanceFromLeft / (PADDLE_WIDTH / 3);
      const x = -8 * (1 - scaledToPaddle);
      reflectionVector = { x, y: -8 };
    } else if (ballCenter > rightThird) {
      const distanceFromTheRight = Math.min(
        PADDLE_WIDTH / 3,
        ballCenter - rightThird
      );
      const scaledToPaddle = distanceFromTheRight / (PADDLE_WIDTH / 3);
      const x = 8 * scaledToPaddle;
      reflectionVector = { x, y: -8 };
    }
    const dot = dotProduct(reflectionVector, direction);
    const toSubtract = multiplyVector(reflectionVector, 2 * dot);
    let newDirection = subtractVectors(direction, toSubtract);
    console.log(`[${tickId}] OLD DIRECTION: ${JSON.stringify(direction)}`);
    newDirection = multiplyVector(
      normalize(newDirection),
      magnitude({ x: 1, y: 1 })
    );
    newDirection = truncateDigits(newDirection);
    console.log(`[${tickId}] NEW DIRECTION: ${JSON.stringify(newDirection)}`);
    direction.x = newDirection.x;
    direction.y = newDirection.y;
    hasCollided.y = true;
    hasCollided.x = true;
  }

  function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  function normalize(v) {
    const mag = magnitude(v);
    return { x: v.x / mag, y: v.y / mag };
  }

  function dotProduct(v1, v2) {
    v1 = normalize(v1);
    v2 = normalize(v2);
    return v1.x * v2.x + v1.y * v2.y;
  }

  function truncateDigits(v) {
    const amount = 100;
    return {
      x: Math.round(v.x * amount) / amount,
      y: Math.round(v.y * amount) / amount,
    };
  }

  function subtractVectors(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
  }

  function multiplyVector(v, scalar) {
    return { x: v.x * scalar, y: v.y * scalar };
  }

  function wrappedIntervalLoop(fn, label) {
    return () => {
      try {
        fn();
      } catch (e) {
        console.log(`${label} ERROR: ${e}`);
      }
    };
  }

  function paddleLoop() {
    const keysPressed = { ArrowLeft: false, ArrowRight: false };
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        keysPressed[e.key] = true;
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        keysPressed[e.key] = false;
      }
    });

    function loop() {
      let shouldTranslate = false;
      if (keysPressed.ArrowLeft) {
        paddleLeft = clamp(0, WIDTH - PADDLE_WIDTH, paddleLeft - 2);
        shouldTranslate = true;
      }
      if (keysPressed.ArrowRight) {
        paddleLeft = clamp(0, WIDTH - PADDLE_WIDTH, paddleLeft + 2);
        shouldTranslate = true;
      }
      if (shouldTranslate) {
        translate(paddle, paddleLeft, paddleTop);
      }
    }

    return wrappedIntervalLoop(loop, "PADDLE");
  }

  function addBallTrail(left, top) {
    const id = Math.floor(Math.random() * 1000000);
    const trail = createElt(
      "ball-trail-" + id,
      {
        "--top": TOP + top,
        "--left": LEFT + left,
        "--size": BALL_SIZE,
        "--transform-speed": `${TICK_TIME * 1.1}ms`,
      },
      ["ball", "fading-trail"]
    );
    setTimeout(() => {
      trail.remove();
    }, 1000);
  }

  function mainLoop() {
    const direction = { x: 1, y: 1 };
    let ticksUntilWeCanBounce = 0;

    const translatedBounds = (obj) => {
      const bounds = obj.getBoundingClientRect();
      return {
        left: bounds.left - LEFT,
        right: bounds.right - LEFT,
        top: bounds.top - TOP,
        bottom: bounds.bottom - TOP,
      };
    };

    function loop() {
      const tickId = Math.floor(Math.random() * 1000000);
      ticksUntilWeCanBounce = Math.max(0, ticksUntilWeCanBounce - 1);
      let nextLeft = ballLeft + BASE_SPEED * direction.x;
      let nextTop = ballTop + BASE_SPEED * direction.y;
      let hasCollided = { x: false, y: false };

      handlePlayAreaCollision({ nextLeft, nextTop }, direction, hasCollided);
      const newBall = makeBallBox(nextLeft, nextTop);

      function collideWithEvent(event, doClick) {
        event.classList.add("faded");
        event.dataset.intersected = "true";
      }

      const paddleBox = makePaddleBox(paddleLeft, paddleTop);
      const collidesWithPaddle = detectCircularCollision(newBall, paddleBox);

      if (collidesWithPaddle && ticksUntilWeCanBounce === 0) {
        ticksUntilWeCanBounce = 10;
        console.log(`[${tickId}] PADDLE COLLISION DETECTED`);
        handlePaddleCollision(
          newBall,
          paddleLeft,
          direction,
          hasCollided,
          tickId
        );
      }

      let doClick = true;
      getEvents().forEach((event) => {
        if (event.dataset.intersected) {
          return;
        }

        const eventBounds = translatedBounds(event);
        const collided = detectCircularCollision(newBall, eventBounds);
        if (collided) {
          console.log(`[${tickId}] COLLISION DETECTED: ${event.textContent}`);
          collideWithEvent(event, doClick);
          const bounced = handleCollision(
            newBall,
            eventBounds,
            direction,
            hasCollided
          );
          console.log(`[${tickId}] BOUNCE? ${bounced}: ${event.textContent}`);
        }
      });

      translate(ball, newBall.left, newBall.top);
      rotateForVector(ball, direction.x, direction.y);
      addBallTrail(ballLeft, ballTop);
      ballLeft = newBall.left;
      ballTop = newBall.top;
    }

    return wrappedIntervalLoop(loop, "GAME");
  }

  let mainInterval;
  let paddleInterval;
  function applyInitialTranslations() {
    translate(ball, ballLeft, ballTop);
    translate(paddle, paddleLeft, paddleTop);
  }
  applyInitialTranslations();

  const stopGame = setTimeout(() => {
    console.log("STOPPING");
    clearInterval(mainInterval);
    clearInterval(paddleInterval);
  }, STOP_AFTER_THIS_MANY_TICKS * TICK_TIME);

  const setup = setTimeout(() => {
    ball.classList.remove("transparent");
    playArea.classList.remove("transparent");
    paddle.classList.remove("transparent");
  }, 1);

  const startGame = setTimeout(() => {
    mainInterval = setInterval(mainLoop(), TICK_TIME);
    paddleInterval = setInterval(paddleLoop(), 1000 / 60);
  }, FADE_IN_TIME + 1);
};

function resetEvents() {
  getEvents().forEach((event, i) => {
    event.classList.remove("faded");
    event.classList.add("brickEvent");
    event.dataset.intersected = "";
  });
}

resetEvents();
main();
