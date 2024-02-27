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
  --color-grey-transparent: hsla(235deg 5% 35% / 0.7);
  --color-playarea: hsl(235deg 15% 67%);

  --hue-rotation: 0deg;
}

@keyframes revealClipPath {
  from {
    clip-path: polygon(-10% -10%, 110% -10%, 110% -10%, -10% -10%);
  }
  to {
    clip-path: polygon(-10% -10%, 110% -10%, 110% 110%, -10% 110%);
  }
}

.play-area {
  position: fixed;
  top: calc(var(--top) * 1px);
  left: calc(var(--left) * 1px);
  width: calc(var(--width) * 1px);
  height: calc(var(--height) * 1px);
  /* background-color: var(--color-playarea); */
  outline: 2px dashed black;
  pointer-events: none;
  transition: opacity 1.5s ease;
  animation: revealClipPath 1s ease both;
  will-change: transform, clip-path;
}

.no-collision-zone {
  position: fixed;
  top: calc(var(--top) * 1px);
  left: calc(var(--left) * 1px);
  width: calc(var(--width) * 1px);
  bottom: calc(var(--bottom) * 1px);
  backdrop-filter: blur(5px);
  z-index: 999;
}

.ball {
  position: fixed;
  left: calc(var(--left)* 1px);
  top: calc(var(--top)* 1px);
  width: calc(var(--size)* 1px);
  height: calc(var(--size)* 1px);
  /* background-color: var(--color-grey); */
  background-color: hsl(0deg 20% 50%);
  border-radius: 50%; 
  will-change: transform;
  /* transition: transform var(--transform-speed) linear,
               opacity 1s ease, 
               filter var(--transform-speed) ease; */
  transition: opacity 1s ease, filter(var(--transform-speed)) ease;
  filter: hue-rotate(var(--hue-rotation));
  border: 2px solid var(--color-grey-transparent);
  box-sizing: border-box;
  z-index: 1001;
}

.hidden-ball {
  display: none;
  z-index: 1000;
  filter: blur(6px) hue-rotate(var(--hue-rotation));
  transition: opacity 1s ease, filter var(--transform-speed) ease, transform var(--transform-speed) ease;
}

@keyframes fading-trail {
  0% {
    opacity: 0.75;
    transform: scale(0.9);
    filter: blur(2px);
  }

  100% {
    opacity: 0;
    transform: scale(0.3);
    filter: blur(4px);
  }
}

.fading-trail {
  animation: fading-trail 1s ease-out both;
  display: revert;
}

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
  opacity: 0.1;
  transition: opacity 0.5s ease, background-color 0.5s ease;
}

.brickEvent {
  border-radius: 0;
}

particle {
  border-radius: 2px;
  width: var(--width);
  height: var(--height);
  background-color: var(--color);
  position: fixed;
  filter: brightness(0.9) hue-rotate(var(--hue-rotation)) saturate(var(--saturation));
  z-index: 1000;
  pointer-events: none;
  will-change: transform, opacity;
  left: var(--left);
  top: var(--top);
}
`;

const main = function () {
  const style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  const BALL_SIZE = 25;
  const RADIUS = BALL_SIZE / 2;
  const TICK_TIME = 50;
  const BASE_SPEED = 10;
  const STOP_AFTER_THIS_MANY_TICKS = 2000;

  const mainElt = document.querySelector("div[role='main']");
  const grid = mainElt.querySelector("div[role='grid']");
  const topPlayArea = grid
    .querySelector("div[role='row'][aria-hidden='false']")
    .getBoundingClientRect();
  const bottomPlayArea = grid.children[1].getBoundingClientRect();
  const LEFT = Math.min(topPlayArea.left, bottomPlayArea.left);
  const TOP = topPlayArea.top;
  const RIGHT = Math.max(topPlayArea.right, bottomPlayArea.right);
  const BOTTOM_OFFSET = 5;
  const BOTTOM =
    Math.max(bottomPlayArea.bottom, window.innerHeight - BOTTOM_OFFSET) -
    BOTTOM_OFFSET;
  const WIDTH = RIGHT - LEFT;
  const HEIGHT = BOTTOM - TOP;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 20;
  let HUE_ROTATION = 0;
  const HUE_ROTATION_INCREASE = 360 / (5000 / TICK_TIME);
  // It's gross but these need to be global :/
  let paddleLeft = WIDTH / 2 - 50;
  const paddleTop = HEIGHT - 22;
  let RUN_GAME = false;

  let currentBall = {
    x: WIDTH / 2,
    y: HEIGHT - 100 + RADIUS,
    r: RADIUS,
  };
  let nextBall = { x: currentBall.x, y: currentBall.y, r: currentBall.r };

  const getBallLeft = (ball) => ball.x - ball.r;
  const getBallRight = (ball) => ball.x + ball.r;
  const getBallTop = (ball) => ball.y - ball.r;
  const getBallBottom = (ball) => ball.y + ball.r;

  function createElt(id, style = {}, classList = [], kind = "div") {
    document.querySelector(`#${id}`)?.remove();
    const elt = document.createElement(kind);
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

  const [noCollisionZone, noCollisionZoneTop] = (() => {
    const heightOffset = TOP + HEIGHT * 0.8;
    const height = HEIGHT - heightOffset;
    const elt = createElt(
      "_noCollisionZone",
      {
        "--top": heightOffset,
        "--left": LEFT,
        "--width": WIDTH,
        "--bottom": BOTTOM_OFFSET,
      },
      ["no-collision-zone"]
    );
    return [elt, heightOffset - TOP];
  })();

  const ballElement = createElt(
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

  function removeTransform(elt, key) {
    const prefix = `data-transform-`;
    elt.removeAttribute(prefix + key);
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

  function translateBall(ball) {
    const left = getBallLeft(ball);
    const top = getBallTop(ball);
    // ballElement.style.setProperty("--left", LEFT + left);
    // ballElement.style.setProperty("--top", TOP + top);
    translate(ballElement, left, top);
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

  const makePaddleBox = (left, top) =>
    makeBox(left, top, PADDLE_WIDTH, PADDLE_HEIGHT);

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

  function detectCircularCollision(ball, collisionRect) {
    const closestPoint = getClosestPointToCircle(ball, collisionRect);
    const collided = circleCollidesWithRect(ball, closestPoint);
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

  function handleCollision(ball, collisionRect, direction, hasCollided) {
    const ticksToCollision = getTicksToCollision(
      ball,
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
      ball.x -= minTicks * direction.x;
      direction.x *= -1;
      didCollide = true;
    }
    if (tryBounce.y && !hasCollided.y) {
      hasCollided.y = true;
      ball.y -= minTicks * direction.y;
      direction.y *= -1;
      didCollide = true;
    }
    return didCollide;
  }

  function handlePlayAreaCollision(ball, direction, hasCollided) {
    const left = getBallLeft(ball);
    const top = getBallTop(ball);
    const right = getBallRight(ball);
    const bottom = getBallBottom(ball);
    if (left < 0) {
      direction.x = Math.abs(direction.x);
      ball.x += Math.abs(left);
      hasCollided.x = true;
    } else if (right > WIDTH) {
      direction.x = -Math.abs(direction.x);
      ball.x -= right - WIDTH;
      hasCollided.x = true;
    }
    if (top < 0) {
      direction.y = Math.abs(direction.y);
      ball.y += Math.abs(top);
      hasCollided.y = true;
    } else if (bottom > HEIGHT) {
      direction.y = -Math.abs(direction.y);
      ball.y -= bottom - HEIGHT;
      hasCollided.y = true;
    }
  }

  /* nroyalty: there are still some real bugs here :/
  nroyalty: remove math.abs hack
   */
  function updateForPaddleCollision(
    ball,
    paddleLeft,
    direction,
    hasCollided,
    tickId
  ) {
    const paddleCenter = paddleLeft + PADDLE_WIDTH / 2;
    const leftThird = paddleLeft + PADDLE_WIDTH / 3;
    const rightThird = paddleLeft + (PADDLE_WIDTH / 3) * 2;
    let reflectionVector = { x: 0, y: -1 };
    if (ball.x < leftThird) {
      const distanceFromLeft = Math.max(0, ball.x - paddleLeft);
      const scaledToPaddle = distanceFromLeft / (PADDLE_WIDTH / 3);
      const x = -8 * (1 - scaledToPaddle);
      reflectionVector = { x, y: -8 };
    } else if (ball.x > rightThird) {
      const distanceFromTheRight = Math.min(
        PADDLE_WIDTH / 3,
        ball.x - rightThird
      );
      const scaledToPaddle = distanceFromTheRight / (PADDLE_WIDTH / 3);
      const x = 8 * scaledToPaddle;
      reflectionVector = { x, y: -8 };
    }
    const dot = dotProduct(reflectionVector, direction);
    const toSubtract = multiplyVector(reflectionVector, 2 * dot);
    let newDirection = subtractVectors(direction, toSubtract);
    console.log(`[${tickId}] OLD DIRECTION: ${JSON.stringify(direction)}`);
    newDirection = scaleVectorToRoot2(newDirection);
    console.log(`[${tickId}] NEW DIRECTION: ${JSON.stringify(newDirection)}`);
    direction.x = newDirection.x;
    direction.y = -1 * Math.abs(newDirection.y);
    hasCollided.y = true;
    hasCollided.x = true;
  }

  const makeJitter = () => 0.9 + Math.random() * 0.2;

  function createParticle(xIndex, yIndex, bounds, color) {
    const baseWidth = bounds.width / 10;
    const baseHeight = bounds.height / 3;
    const width = Math.floor(baseWidth * makeJitter());
    const height = Math.floor(baseHeight * makeJitter());

    const startingX = bounds.left + baseWidth * xIndex;
    const startingY = bounds.top + baseHeight * yIndex;
    const distanceToTravel = Math.floor(Math.random() * 75 + 25);

    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    const vector = normalize(
      subtractVectors(
        { x: startingX, y: startingY },
        { x: centerX, y: centerY }
      )
    );

    vector.x *= makeJitter();
    vector.y *= makeJitter();

    const particle = createElt(
      `particle-${Math.floor(Math.random() * 1000000)}`,
      {
        "--width": `${width}px`,
        "--height": `${height}px`,
        "--color": color,
        "--hue-rotation": (Math.random() - 0.5) * 30 + "deg",
        "--saturation": 1.2 + Math.random() * 0.5,
        "--left": startingX + LEFT + "px",
        "--top": startingY + TOP + "px",
      },
      [],
      "particle"
    );

    const toX = vector.x * distanceToTravel;
    const toY = vector.y * distanceToTravel;
    const rotation = (Math.random() - 0.5) * 720 + "deg";
    const animation = particle.animate(
      [
        {
          opacity: 1,
        },
        {
          transform: `translate(${toX}px, ${toY}px) rotate(${rotation})`,
          opacity: 0.35,
        },
      ],
      {
        duration: 250 + Math.random() * 500,
        easing: "ease",
        delay: Math.random() * 100,
      }
    );

    animation.onfinish = () => {
      particle.remove();
    };
  }

  function addParticlesForEvent(event, bounds) {
    const computedStyle = window.getComputedStyle(event);
    const color = computedStyle.backgroundColor || "slategrey";
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 10; x++) {
        createParticle(x, y, bounds, color);
      }
    }
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

  function truncateDigits(v, digits = 2) {
    const amount = Math.pow(10, digits);
    return Math.floor(v * amount) / amount;
  }
  function truncateVector(v, digits = 2) {
    return {
      x: truncateDigits(v.x, digits),
      y: truncateDigits(v.y, digits),
    };
  }

  function subtractVectors(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
  }

  function multiplyVector(v, scalar) {
    return { x: v.x * scalar, y: v.y * scalar };
  }

  function scaleVectorToRoot2(v) {
    const scaled = multiplyVector(normalize(v), Math.sqrt(2));
    return truncateVector(scaled, 2);
  }

  function wrappedIntervalLoop(fn, label) {
    return () => {
      try {
        fn();
      } catch (e) {
        console.log(`${label} ERROR: ${e}`);
        console.log(`TRACE: ${e.stack}`);
      }
    };
  }

  function makeScreenShake() {
    const target = document.querySelector("body");
    const duration = 250;
    let magnitude = 7.5;
    let startTime = null;
    const isShaking = false;

    function shake(currentTime) {
      const elapsedTime = currentTime - startTime;
      const remainingTime = duration - elapsedTime;
      if (remainingTime > 0) {
        const randomX = (Math.random() - 0.5) * magnitude;
        const randomY = (Math.random() - 0.5) * magnitude;
        target.style.transform = `translate(${randomX}px, ${randomY}px)`;
        requestAnimationFrame(shake);
      } else {
        target.style.transform = "translate(0px, 0px)";
        magnitude = 5;
        isShaking = false;
      }
    }

    function startOrContinueShaking() {
      startTime = performance.now();
      if (isShaking) {
        magnitude += 5;
      } else {
        requestAnimationFrame(shake);
      }
    }
    return startOrContinueShaking;
  }

  const screenShake = makeScreenShake();

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

  function incrementHueRotation(amount) {
    HUE_ROTATION += amount;
    HUE_ROTATION = HUE_ROTATION % 360;
    ballElement.style.setProperty("--hue-rotation", HUE_ROTATION + "deg");
  }

  /* to avoid adding a new dom element every tick we use a little pool */
  function makeAddBallTrail() {
    const TRAIL_COUNT = 10;
    const makeTrail = () => {
      const id = Math.floor(Math.random() * 1000000);
      const elt = createElt(
        "ball-trail-" + id,
        {
          "--top": TOP,
          "--left": LEFT,
          "--size": BALL_SIZE,
          "--transform-speed": `${TICK_TIME}ms`,
        },
        ["ball", "hidden-ball"]
      );
      return [elt, null];
    };
    const trails = Array.from({ length: TRAIL_COUNT }, makeTrail);
    let trailIndex = 0;

    const addBallTrail = () => {
      const left = getBallLeft(currentBall);
      const top = getBallTop(currentBall);
      const [trail, oldAnimation] = trails[trailIndex];
      if (oldAnimation) {
        oldAnimation.cancel();
      }

      trail.style.setProperty("--top", TOP + top);
      trail.style.setProperty("--left", LEFT + left);
      trail.style.setProperty("--hue-rotation", HUE_ROTATION + "deg");
      const animation = trail.animate(
        [
          {
            opacity: 0.75,
            transform: "scale(0.8)",
            display: "revert",
          },
          {
            opacity: 0.1,
            transform: "scale(0.3)",
            display: "revert",
          },
        ],
        { duration: 1000, easing: "ease", fill: "both" }
      );
      trails[trailIndex] = [trail, animation];

      trailIndex = (trailIndex + 1) % TRAIL_COUNT;
    };

    return addBallTrail;
  }
  const addBallTrail = makeAddBallTrail();

  const translatedBounds = (obj) => {
    const bounds = obj.getBoundingClientRect();
    const top = bounds.top - TOP;
    if (top > noCollisionZoneTop) {
      return null;
    }
    return {
      left: bounds.left - LEFT,
      right: bounds.right - LEFT,
      top: bounds.top - TOP,
      bottom: Math.min(bounds.bottom - TOP, noCollisionZoneTop),
      width: bounds.width,
      height: bounds.height,
    };
  };

  function maybeCollideWithEvent(event, ball, direction, hasCollided, tickId) {
    if (event.dataset.intersected) {
      return;
    }

    const eventBounds = translatedBounds(event);
    if (eventBounds === null) {
      return;
    }
    const collided = detectCircularCollision(ball, eventBounds);
    if (collided) {
      console.log(`[${tickId}] COLLISION DETECTED: ${event.textContent}`);
      event.classList.add("faded");
      event.dataset.intersected = "true";
      addParticlesForEvent(event, eventBounds);
      screenShake();
      const bounced = handleCollision(
        ball,
        eventBounds,
        direction,
        hasCollided
      );
      console.log(`[${tickId}] BOUNCE? ${bounced}: ${event.textContent}`);
    }
  }

  function mainLoop() {
    const direction = { x: 1, y: 1 };
    const hasCollided = { x: false, y: false };
    let ticksUntilCanPaddleBounce = 0;
    let tickId = 0;
    let lastFrameTime = 0;
    let timeUntilNextBallTrail = 0;

    function applyForces(direction, delta) {
      nextBall.x = currentBall.x + BASE_SPEED * direction.x * delta;
      nextBall.y = currentBall.y + BASE_SPEED * direction.y * delta;
    }

    function resetTickState(delta) {
      ticksUntilCanPaddleBounce = Math.max(0, ticksUntilCanPaddleBounce - 1);
      tickId = Math.floor(Math.random() * 1000000);
      hasCollided.x = false;
      hasCollided.y = false;
      timeUntilNextBallTrail += delta;
    }

    function handlePaddleCollision() {
      if (ticksUntilCanPaddleBounce > 0) {
        return false;
      }

      const paddleBox = makePaddleBox(paddleLeft, paddleTop);
      const collidesWithPaddle = detectCircularCollision(nextBall, paddleBox);

      if (collidesWithPaddle) {
        if (direction.y < 0) {
          // nroyalty: do a better job here.
          console.log(`[${tickId}] COLLIDED WITH PADDLE WHILE MOVING UP`);
          return false;
        } else {
          ticksUntilCanPaddleBounce = 10;
          console.log(`[${tickId}] PADDLE COLLISION DETECTED`);
          updateForPaddleCollision(
            nextBall,
            paddleLeft,
            direction,
            hasCollided,
            tickId
          );
          return true;
        }
      }
    }

    let ballScaleBeginTime = null;
    const BALL_SCALE_DURATION = 250;
    const BALL_SCALE_UP_DURATION = BALL_SCALE_DURATION / 4;
    const BALL_SCALE_DOWN_DURATION = (3 * BALL_SCALE_DURATION) / 4;
    const BALL_MAX_SCALE = 0.3;
    /* We need to do our scaling and easing by hand because we rely
    on translating the ball's position in CSS to move that and *don't*
    want any easing to be applied to that translation. */
    function handleBallScale(currentTime) {
      if (ballScaleBeginTime === null) {
        return;
      }
      const timeElapsed = currentTime - ballScaleBeginTime;
      if (timeElapsed > BALL_SCALE_DURATION) {
        addTransform(ballElement, `scale(1)`, "scale");
        ballScaleBeginTime = null;
        return;
      }

      let scale;
      if (timeElapsed <= BALL_SCALE_UP_DURATION) {
        const t = timeElapsed / BALL_SCALE_UP_DURATION;
        scale = 1 + (1 - Math.pow(1 - t, 2)) * BALL_MAX_SCALE;
      } else {
        const t =
          (timeElapsed - BALL_SCALE_UP_DURATION) / BALL_SCALE_DOWN_DURATION;
        scale = 1 + (1 - t) * BALL_MAX_SCALE;
      }
      scale = truncateDigits(scale, 2);
      addTransform(ballElement, `scale(${scale})`, "scale");
    }

    function applyCollisionVisualEffects(currentTime) {
      const collisionCount = (hasCollided.x ? 1 : 0) + (hasCollided.y ? 1 : 0);

      if (collisionCount > 0) {
        incrementHueRotation(30 * collisionCount);
        ballScaleBeginTime = currentTime;
      }

      ballElement.style.setProperty("--hue", HUE_ROTATION + "deg");
      handleBallScale(currentTime);
    }

    function maybeAddBallTrail() {
      if (timeUntilNextBallTrail > 1) {
        addBallTrail();
        timeUntilNextBallTrail -= 1;
      }
    }

    function handleCleanup() {}

    function loop(timestamp) {
      try {
        if (!RUN_GAME) {
          handleCleanup();
          return;
        }

        const timeElapsed = timestamp - lastFrameTime;
        const delta = truncateDigits(timeElapsed / TICK_TIME, 1);
        lastFrameTime = timestamp;

        resetTickState(delta);
        applyForces(direction, delta);
        handlePlayAreaCollision(nextBall, direction, hasCollided);
        handlePaddleCollision();

        getEvents().forEach((event) => {
          maybeCollideWithEvent(
            event,
            nextBall,
            direction,
            hasCollided,
            tickId
          );
        });

        translateBall(nextBall);
        applyCollisionVisualEffects(timestamp);
        incrementHueRotation(HUE_ROTATION_INCREASE * delta);
        maybeAddBallTrail();

        currentBall.x = nextBall.x;
        currentBall.y = nextBall.y;
        requestAnimationFrame(loop);
      } catch (e) {
        console.log("MAIN LOOP ERROR: ", e);
        console.log("TRACE: ", e.stack);
      }
    }

    function beginLoop() {
      lastFrameTime = performance.now();
      requestAnimationFrame(loop);
    }

    return beginLoop;
  }
  const runMainLoop = mainLoop();

  let paddleInterval;
  function applyInitialTranslations() {
    translateBall(currentBall);
    translate(paddle, paddleLeft, paddleTop);
  }
  applyInitialTranslations();

  const stopGame = setTimeout(() => {
    console.log("STOPPING");
    clearInterval(paddleInterval);
    RUN_GAME = false;
  }, STOP_AFTER_THIS_MANY_TICKS * TICK_TIME);

  const setup = setTimeout(() => {
    ballElement.classList.remove("transparent");
    playArea.classList.remove("transparent");
    paddle.classList.remove("transparent");
  }, 1);

  paddleInterval = setInterval(paddleLoop(), 1000 / 60);

  let started = false;
  const listener = document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !started) {
      console.log("STARTING");
      started = true;
      RUN_GAME = true;
      runMainLoop();
      document.removeEventListener("keydown", listener);
    }
  });
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
