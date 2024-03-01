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
  --color-borders: hsl(245deg 15% 70%);

  --hue-rotation: 0deg;
  --ball-background: hsl(0deg 20% 50%);
  --paddle-background: hsl(180deg 20% 50%);
}

@keyframes revealClipPath {
  from {
    clip-path: polygon(-10% -10%, 110% -10%, 110% -10%, -10% -10%);
  }
  to {
    clip-path: polygon(-10% -10%, 110% -10%, 110% 110%, -10% 110%);
  }
}

@keyframes revealFromCenter {
  from {
    clip-path: polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%);
  }
  to {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}

.play-area {
  position: fixed;
  top: calc(var(--top) * 1px);
  left: calc(var(--left) * 1px);
  width: calc(var(--width) * 1px);
  height: calc(var(--height) * 1px);
  /* background-color: var(--color-playarea); */
  outline: 2px dashed var(--color-borders);
  pointer-events: none;
  transition: opacity 1.5s ease;
  animation: revealClipPath 1s ease both;
  will-change: transform, clip-path;
}


.no-collision-zone {
  position: fixed;
  height: calc(var(--height) * 1px);
  left: calc(var(--left) * 1px);
  width: calc(var(--width) * 1px);
  bottom: calc(var(--bottom) * 1px);
  /* background-color: hsl(0deg 0% 96% / 0.7); */
  border-top: 2px dashed var(--color-borders);
  animation: revealFromCenter 0.5s ease both;
  animation-delay: 0.25s;
  backdrop-filter: blur(6px);
  z-index: 999;
}

@keyframes slideInFromBottom {
  from {
    transform: translate(var(--translate-x), calc(var(--slide-in-y-amount) + var(--translate-y)));
  }
  to {
   transform: translate(var(--translate-x), calc(var(--translate-y)));
  }

}

.slide-in-from-bottom {
  animation: slideInFromBottom 0.75s ease-out both;
}

.ball {
  --slide-in-y-amount: 300px;
  position: fixed;
  left: calc(var(--left)* 1px);
  top: calc(var(--top)* 1px);
  width: calc(var(--size)* 1px);
  height: calc(var(--size)* 1px);
  background-color: var(--ball-background);
  border-radius: 50%; 
  will-change: transform;
  /* transition: opacity 1s ease, filter(var(--transform-speed)) linear; */
  transition: opacity 1s ease;
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
  --hue-rotation: 0deg;
  --slide-in-y-amount: 200px;
  box-sizing: border-box;
  position: fixed;
  left: calc(var(--left)* 1px);
  top: calc(var(--top)* 1px);
  width: calc(var(--width)* 1px);
  height: calc(var(--height)* 1px);
  background-color: var(--paddle-background);
  border: 2px solid var(--color-grey-transparent);
  border-radius: 2px;
  filter: hue-rotate(var(--hue-rotation));
  z-index: 1002;
  /* transition: transform 0.05s linear, opacity 1s ease; */
  transition: opacity 1s ease;
  transform-origin: bottom center;
}

.transparent {
  /* opacity: 0; */
}

.faded {
  opacity: 0.1;
  transition: opacity 0.5s ease, background-color 0.5s ease;
}

.brickEvent {
  /* border-radius: 0; */
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
  display: var(--display);
}

[data-style-id="_nolenEventArea"] *::after {
  content: "";
  display: block;
  height: 150px;
}

.extend-bottom::after {
  content: "";
  display: block;
  height: 150px;
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
  const PADDLE_SPEED = 12.5;
  const STOP_AFTER_THIS_MANY_TICKS = 2000;

  const mainElt = document.querySelector("div[role='main']");
  const grid = mainElt.querySelector("div[role='grid']");

  const bottomPlayArea = grid.children[1];
  const bottomPlayRect = bottomPlayArea.getBoundingClientRect();
  /* We want to make sure you can delete events at the end of the day,
  so we need to push up the bottom boundary of the bottom of the event
  container. We grab this element to do that. */
  const playAreaToRestrict = bottomPlayArea.children[0];
  /* This only exists if there are all-day events on the calendar. */
  const topPlayArea = grid.querySelector(
    "div[role='row'][aria-hidden='false']"
  );

  const topPlayRect = topPlayArea?.getBoundingClientRect() || bottomPlayRect;

  const LEFT = Math.min(topPlayRect.left, bottomPlayRect.left);
  const TOP = topPlayRect.top;
  /* If there are all-day events there's an additional div at the top of the screen
  that we need to respect; an event can be *above* that but below top (and we should
    avoid shattering it) - and when we generate particles we should use this
    to cap the top of the particle area. */
  const NON_ALL_DAY_EVENT_TOP = topPlayArea ? topPlayRect.bottom - TOP : 0;
  console.log(`NON ALL DAY: ${NON_ALL_DAY_EVENT_TOP}`);
  const RIGHT = Math.max(topPlayRect.right, bottomPlayRect.right);
  const BOTTOM_OFFSET = 5;
  const TRANSLATE_EVENT_AREA_TO_AVOID_COLLISIONS = true;
  const SAFE_ZONE_HEIGHT = 150 - BOTTOM_OFFSET;
  const BOTTOM =
    Math.max(bottomPlayRect.bottom, window.innerHeight - BOTTOM_OFFSET) -
    BOTTOM_OFFSET;
  const WIDTH = RIGHT - LEFT;
  const HEIGHT = BOTTOM - TOP;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 20;
  const HUE_PER_TICK = 360 / (10000 / TICK_TIME);

  let RUN_GAME = false;
  const hueRotation = { ball: 0, paddle: 0 };
  let currentBall = {
    x: WIDTH / 2,
    y: HEIGHT - 100 + RADIUS,
    r: RADIUS,
  };
  let nextBall = { x: currentBall.x, y: currentBall.y, r: currentBall.r };
  const paddleRect = {
    left: WIDTH / 2 - PADDLE_WIDTH / 2,
    top: HEIGHT - 22,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    right: WIDTH / 2 + PADDLE_WIDTH / 2,
    bottom: HEIGHT - 22 + PADDLE_HEIGHT,
  };

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

  /* nroyalty: no more heightOffset hijinks? */
  const [noCollisionZone, noCollisionZoneTop] = (() => {
    let topForCalculations = BOTTOM - SAFE_ZONE_HEIGHT - TOP;
    const elt = createElt(
      "_noCollisionZone",
      {
        "--height": SAFE_ZONE_HEIGHT,
        "--left": LEFT,
        "--width": WIDTH,
        "--bottom": BOTTOM_OFFSET,
      },
      ["no-collision-zone"]
    );
    return [elt, topForCalculations];
  })();

  const ballElement = createElt(
    "_ball",
    {
      "--top": TOP,
      "--left": LEFT,
      "--size": BALL_SIZE,
      "--transform-speed": `${TICK_TIME * 1.1}ms`,
    },
    ["ball", "transparent", "slide-in-from-bottom"]
  );

  const paddleElement = createElt(
    "_paddle",
    {
      "--top": TOP,
      "--left": LEFT,
      "--width": PADDLE_WIDTH,
      "--height": PADDLE_HEIGHT,
    },
    ["paddle", "transparent", "slide-in-from-bottom"]
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
    elt.style.setProperty("--translate-x", x + "px");
    elt.style.setProperty("--translate-y", y + "px");
  }

  function translateBall(ball) {
    const left = getBallLeft(ball);
    const top = getBallTop(ball);
    translate(ballElement, left, top);
  }

  function translatePaddle() {
    translate(paddleElement, paddleRect.left, paddleRect.top);
  }

  function rotateForVector(elt, dx, dy) {
    // dy is negative because the y axis is inverted in the browser.
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) {
      angle += 360;
    }

    addTransform(elt, `rotate(${angle}deg)`, "rotate");
  }

  function getClosestPointToCircle(circle, rect) {
    const closestX = clamp(rect.left, rect.right, circle.x);
    const closestY = clamp(rect.top, rect.bottom, circle.y);
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

  /* Reflecting off the center 3rd of the paddle just inverts the Y direction. */
  function handleCenterCollision(direction, hasCollided, tickId) {
    direction.y = -1 * Math.abs(direction.y);
    hasCollided.y = true;
    console.log(`[${tickId}] COLLIDED WITH CENTER`);
  }

  const DO_REFLECTION_COLLISION = false;
  /* I spent a while trying to reflect the ball off the paddle but found it
   pretty wonky - you end up needing a ton of constraints to not send the ball
   at weird angles especially when it's colliding with, e.g., the right corner
   while moving to the right. I think using the reflection angle is ~fine. */
  function handleBounceAgainstCorner(
    reflectionVector,
    direction,
    hasCollided,
    tickId
  ) {
    reflectionVector = normalize(reflectionVector);
    let newDirection;
    if (DO_REFLECTION_COLLISION) {
      let normalizedDirection = normalize(direction);
      const dot = dotProduct(reflectionVector, normalizedDirection);
      const toSubtract = multiplyVector(reflectionVector, 2 * dot);
      newDirection = subtractVectors(normalizedDirection, toSubtract);
      console.log(`[${tickId}] OLD DIRECTION: ${JSON.stringify(direction)}`);
      console.log(
        `[${tickId}] REFLECTION VECTOR: ${JSON.stringify(reflectionVector)}`
      );
      newDirection = scaleVectorToRoot2(newDirection);
    } else {
      newDirection = scaleVectorToRoot2(reflectionVector);
    }
    console.log(`[${tickId}] NEW DIRECTION: ${JSON.stringify(newDirection)}`);
    direction.x = newDirection.x;
    direction.y = newDirection.y;
    hasCollided.x = true;
    hasCollided.y = true;
  }

  function updateForPaddleCollision(
    ball,
    paddleRect,
    direction,
    hasCollided,
    tickId
  ) {
    const leftThird = paddleRect.left + PADDLE_WIDTH / 3;
    const rightThird = paddleRect.left + (PADDLE_WIDTH / 3) * 2;
    if (ball.x < leftThird) {
      const distanceFromLeft = Math.max(0, ball.x - paddleRect.left);
      const scaledToPaddle = distanceFromLeft / (PADDLE_WIDTH / 3);
      const x = -8 * (1 - scaledToPaddle);
      const reflectionVector = { x, y: -8 };
      handleBounceAgainstCorner(
        reflectionVector,
        direction,
        hasCollided,
        tickId
      );
    } else if (ball.x > rightThird) {
      const distanceFromTheRight = Math.min(
        PADDLE_WIDTH / 3,
        ball.x - rightThird
      );
      const scaledToPaddle = distanceFromTheRight / (PADDLE_WIDTH / 3);
      const x = 8 * scaledToPaddle;
      const reflectionVector = { x, y: -8 };
      handleBounceAgainstCorner(
        reflectionVector,
        direction,
        hasCollided,
        tickId
      );
    } else {
      handleCenterCollision(direction, hasCollided, tickId);
    }
    if (direction.y > 0) {
      console.log(
        `[${tickId}] BUG? MOVING DOWN AFTER PADDLE COLLISION ${JSON.stringify(
          direction
        )}`
      );
      direction.y *= -1;
    }
  }

  const makeJitter = () => 0.9 + Math.random() * 0.2;

  function makeAddParticle() {
    const PARTICLE_COUNT = 300;
    let currentParticleIdx = 0;
    const makeParticle = (_, id) => {
      const elt = createElt(`particle-${id}`, {}, ["particle"], "particle");
      return [elt, null];
    };
    const particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);

    const addParticle = ({
      x,
      y,
      width,
      height,
      vector,
      distance,
      rotation,
      color,
      hueRotation,
      duration,
      delay,
      easing,
    }) => {
      const [currentParticle, currentAnimation] = particles[currentParticleIdx];

      if (currentAnimation) {
        // nroyalty: do I need to briefly hide the particle here?
        currentAnimation.cancel();
      }

      [
        ["--width", `${width}px`],
        ["--height", `${height}px`],
        ["--color", color],
        ["--hue-rotation", hueRotation],
        ["--saturation", 1.2 + Math.random() * 0.5],
        ["--left", x + LEFT + "px"],
        ["--top", y + TOP + "px"],
        ["--display", "block"],
      ].forEach(([propertyName, propertyValue]) => {
        currentParticle.style.setProperty(propertyName, propertyValue);
      });

      const toX = vector.x * distance;
      const toY = vector.y * distance;
      const startingAnimation = { opacity: 1 };
      const endingAnimation = {
        transform: `translate(${toX}px, ${toY}px) rotate(${rotation})`,
        opacity: 0.35,
      };
      const animation = currentParticle.animate(
        [startingAnimation, endingAnimation],
        { duration, delay, easing }
      );
      animation.onfinish = () => {
        currentParticle.style.setProperty("--display", "none");
      };

      particles[currentParticleIdx] = [currentParticle, animation];
      currentParticleIdx = (currentParticleIdx + 1) % PARTICLE_COUNT;
    };

    return addParticle;
  }
  const addParticle = makeAddParticle();

  function addParticlesForEvent(event, bounds) {
    const computedStyle = window.getComputedStyle(event);
    const color = computedStyle.backgroundColor || "slategrey";
    const width = bounds.width;
    const top = Math.max(bounds.top, 0);
    const bottom = Math.min(bounds.bottom, noCollisionZoneTop);
    const height = bottom - top;

    let numberOfRows = 3;
    let numberOfColumns = 10;
    if (height / 5 > width) {
      numberOfRows = 4;
      numberOfColumns = 5;
    }

    const baseParticleWidth = width / numberOfColumns;
    const baseParticleHeight = height / numberOfRows;

    for (let y = 0; y < numberOfRows; y++) {
      for (let x = 0; x < numberOfColumns; x++) {
        const fromX = bounds.left + baseParticleWidth * x;
        const fromY = top + baseParticleHeight * y;
        const centerX = bounds.left + bounds.width / 2;
        const centerY = top + height / 2;
        const vector = normalize(
          subtractVectors({ x: fromX, y: fromY }, { x: centerX, y: centerY })
        );
        vector.x *= makeJitter();
        vector.y *= makeJitter();

        addParticle({
          x: fromX,
          y: fromY,
          width: baseParticleWidth * makeJitter(),
          height: baseParticleHeight * makeJitter(),
          vector,
          distance: Math.floor(Math.random() * 75 + 25),
          rotation: (Math.random() - 0.5) * 720 + "deg",
          color,
          hueRotation: (Math.random() - 0.5) * 30 + "deg",
          duration: 250 + Math.random() * 500,
          delay: Math.random() * 100,
          easing: "ease",
        });
      }
    }
  }

  function addParticlesForPaddleCollision(direction) {
    const computedStyle = window.getComputedStyle(paddleElement);
    const color = computedStyle.backgroundColor || "slategrey";
    for (let i = 0; i < 15; i++) {
      const vectorX = (Math.random() - 0.5) * 2 + direction.x * 0.5;
      const vector = normalize({
        x: vectorX,
        y: -1,
      });
      addParticle({
        x: nextBall.x + 25 * (Math.random() - 0.5),
        y: paddleRect.top,
        width: 6 * makeJitter(),
        height: 5 * makeJitter(),
        vector,
        distance: Math.random() * 25 + 50,
        rotation: (Math.random() - 0.5) * 720 + "deg",
        color,
        hueRotation: hueRotation.paddle + "deg",
        duration: 250 + Math.random() * 150,
        delay: Math.random() * 50,
        easing: "ease-out",
      });
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
    const body = document.querySelector("body");

    const duration = 250;
    let magnitude = 7.5;
    let startTime = null;
    const isShaking = false;
    const sidebar = mainElt.parentElement.parentElement.children[0];

    function shake(currentTime) {
      [mainElt].forEach((target) => {
        if (!target) {
          return;
        }
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
      });
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

  /* it'd be more convenient to move the paddle within a separate interval loop,
  but for animation smoothness i think we want to move it within the main 
  requestAnimationFrame loop. So here we just keep some state around how
  long the paddle has been pressed and we apply and reset that state every
  tick. */
  const [startPaddleListeners, stopPaddleListeners, getDirectionalPaddleDelta] =
    (() => {
      const directions = [
        ["left", "ArrowLeft"],
        ["right", "ArrowRight"],
      ];
      const intervals = {
        left: { pressedSince: null, past: 0 },
        right: { pressedSince: null, past: 0 },
      };
      const handleKeydown = (e) => {
        directions.forEach(([key, code]) => {
          if (e.code === code) {
            intervals[key].pressedSince = performance.now();
          }
        });
      };

      const handleKeyup = (e) => {
        const addInterval = (key) => {
          const pressedSince = intervals[key].pressedSince;
          if (pressedSince) {
            const interval = performance.now() - pressedSince;
            intervals[key].past += interval;
            intervals[key].pressedSince = null;
          }
        };

        directions.forEach(([key, code]) => {
          if (e.code === code) {
            addInterval(key);
          }
        });
      };

      const start = () => {
        document.addEventListener("keydown", handleKeydown);
        document.addEventListener("keyup", handleKeyup);
      };

      const stop = () => {
        document.removeEventListener("keydown", handleKeydown);
        document.removeEventListener("keyup", handleKeyup);
      };

      const getAndReset = (key, timestamp) => {
        let t = intervals[key].past;
        if (intervals[key].pressedSince) {
          t += timestamp - intervals[key].pressedSince;
          intervals[key].pressedSince = timestamp;
        }
        intervals[key].past = 0;
        return t;
      };

      const getDirectionalDelta = (timestamp) => {
        return getAndReset("right", timestamp) - getAndReset("left", timestamp);
      };
      return [start, stop, getDirectionalDelta];
    })();

  function incrementHueRotation(amount) {
    hueRotation.ball += amount.ball || 0;
    hueRotation.paddle += amount.paddle || 0;
    if (hueRotation.paddle > 360) {
      console.log(`HUE ROTATION RESET: ${hueRotation.paddle}`);
      hueRotation.paddle = hueRotation.paddle % 360;
      console.log(`HUE ROTATION: ${hueRotation.paddle}`);
    }
    hueRotation.ball = hueRotation.ball % 360;

    ballElement.style.setProperty(
      "--hue-rotation",
      Math.floor(hueRotation.ball) + "deg"
    );
    paddleElement.style.setProperty(
      "--hue-rotation",
      Math.floor(hueRotation.paddle) + "deg"
    );
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
      trail.style.setProperty("--hue-rotation", hueRotation.ball + "deg");
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

  const translatedBounds = (obj, isAllDay) => {
    const bounds = obj.getBoundingClientRect();
    let bottom = Math.min(bounds.bottom - TOP, noCollisionZoneTop);
    const upperBound = isAllDay ? 0 : NON_ALL_DAY_EVENT_TOP;

    if (bottom < upperBound) {
      return null;
    }

    let top = Math.max(bounds.top - TOP, upperBound);

    if (top > noCollisionZoneTop) {
      return null;
    }

    return {
      left: bounds.left - LEFT,
      right: bounds.right - LEFT,
      top: top,
      bottom: bottom,
      width: bounds.width,
      height: bounds.height,
    };
  };

  function determineIsAllDay(event) {
    /* I don't know of a great way to do this that isn't either fragile due to
    the dom structure, fragile due to relying on English, or involves some guesswork
    around the bounds of the all day dom element D:

    This seems to work surprisingly well and it's not a huge deal to get this wrong.
    */
    const inner = event.innerText.split("\n");
    return inner.length === 2;
  }

  function maybeCollideWithEvent(event, ball, direction, hasCollided, tickId) {
    if (event.dataset.intersected) {
      return;
    }

    const isAllDay = determineIsAllDay(event);
    const eventBounds = translatedBounds(event, isAllDay);
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

    function applyDirectionDeltas(direction, timestamp, delta) {
      nextBall.x = currentBall.x + BASE_SPEED * direction.x * delta;
      nextBall.y = currentBall.y + BASE_SPEED * direction.y * delta;

      const paddleDelta = getDirectionalPaddleDelta(timestamp);
      const paddleMovement = (paddleDelta / TICK_TIME) * PADDLE_SPEED;
      paddleRect.left = clamp(
        0,
        WIDTH - PADDLE_WIDTH,
        paddleRect.left + paddleMovement
      );
      paddleRect.right = paddleRect.left + PADDLE_WIDTH;
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

      const collidesWithPaddle = detectCircularCollision(nextBall, paddleRect);
      if (!collidesWithPaddle) {
        return false;
      }

      if (direction.y < 0) {
        console.log(`[${tickId}] COLLIDED WITH PADDLE WHILE MOVING UP`);
      }
      ticksUntilCanPaddleBounce = 10;
      console.log(`[${tickId}] PADDLE COLLISION DETECTED`);
      updateForPaddleCollision(
        nextBall,
        paddleRect,
        direction,
        hasCollided,
        tickId
      );
      return true;
    }

    const easeOut = (t, factor = 2) => 1 - Math.pow(1 - t, factor);
    const easeIn = (t, factor = 2) => Math.pow(t, factor);

    /* We need to do some of our scaling and easing by hand because we rely
    on translating positions in CSS to move that and *don't*
    want any easing to be applied to that translation. */
    function makeTweenUpDown({
      timeUp,
      timeDown,
      valueUp,
      valueDown,
      applyValue,
      cleanUp,
    }) {
      let beginTime = null;
      const totalTime = timeUp + timeDown;

      const beginTween = (now) => {
        beginTime = now;
      };

      const maybeTween = (currentTime) => {
        if (beginTime === null) {
          return;
        }
        const timeElapsed = currentTime - beginTime;
        if (timeElapsed > totalTime) {
          cleanUp();
          beginTime = null;
          return;
        }
        if (timeElapsed <= timeUp) {
          const t = timeElapsed / timeUp;
          applyValue(valueUp(t));
        } else {
          const t = (timeElapsed - timeUp) / timeDown;
          applyValue(valueDown(t));
        }
      };

      return [beginTween, maybeTween];
    }

    const BALL_MAX_SCALE = 0.3;
    const BALL_SCALE_UP_DURATION = 100;
    const BALL_SCALE_DOWN_DURATION = 3 * BALL_SCALE_UP_DURATION;
    const [beginScaleBall, maybeScaleBall] = makeTweenUpDown({
      timeUp: BALL_SCALE_UP_DURATION,
      timeDown: BALL_SCALE_DOWN_DURATION,
      valueUp: (t) => 1 + easeOut(t) * BALL_MAX_SCALE,
      valueDown: (t) => 1 + (1 - t) * BALL_MAX_SCALE,
      applyValue: (value) => {
        const x = truncateDigits(value, 2);
        addTransform(ballElement, `scale(${x})`, "scale");
      },
      cleanUp: () => {
        removeTransform(ballElement, "scale");
      },
    });

    function applyCollisionVisualEffects(currentTime) {
      const collisionCount = (hasCollided.x ? 1 : 0) + (hasCollided.y ? 1 : 0);

      if (collisionCount > 0) {
        incrementHueRotation({ ball: 15 * collisionCount });
        beginScaleBall(currentTime);
      }

      maybeScaleBall(currentTime);
    }

    const PADDLE_MAX_Y_SCALE = -0.15;
    const PADDLE_MAX_X_SCALE = 0.05;
    const [beginTweenPaddle, maybeTweenPaddle] = makeTweenUpDown({
      timeUp: BALL_SCALE_UP_DURATION,
      timeDown: BALL_SCALE_DOWN_DURATION,
      valueUp: (t) => {
        const x = 1 + easeOut(t) * PADDLE_MAX_X_SCALE;
        const y = 1 + easeOut(t) * PADDLE_MAX_Y_SCALE;
        return { x, y };
      },
      valueDown: (t) => {
        const x = 1 + PADDLE_MAX_X_SCALE - easeIn(t) * PADDLE_MAX_X_SCALE;
        const y = 1 + PADDLE_MAX_Y_SCALE - easeIn(t) * PADDLE_MAX_Y_SCALE;
        return { x, y };
      },
      applyValue: (value) => {
        const x = truncateDigits(value.x, 2);
        const y = truncateDigits(value.y, 2);
        addTransform(paddleElement, `scale(${x}, ${y})`, "scale");
      },
      cleanUp: () => {
        removeTransform(paddleElement, "scale");
      },
    });

    function applyPaddleCollisionEffects(collidedWithPaddle, currentTime) {
      if (collidedWithPaddle) {
        beginTweenPaddle(currentTime);
        addParticlesForPaddleCollision(direction);
      }
      maybeTweenPaddle(currentTime);
    }

    function maybeAddBallTrail() {
      if (timeUntilNextBallTrail > 1) {
        addBallTrail();
        timeUntilNextBallTrail -= 1;
      }
    }

    function handleCleanup() {
      stopPaddleListeners();
    }

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
        applyDirectionDeltas(direction, timestamp, delta);

        handlePlayAreaCollision(nextBall, direction, hasCollided);
        const collidedWithPaddle = handlePaddleCollision();
        getEvents().forEach((event) => {
          maybeCollideWithEvent(
            event,
            nextBall,
            direction,
            hasCollided,
            tickId
          );
        });

        applyCollisionVisualEffects(timestamp);
        applyPaddleCollisionEffects(collidedWithPaddle, timestamp);
        const hueRotationAmount = truncateDigits(HUE_PER_TICK * delta, 1);

        incrementHueRotation({
          ball: hueRotationAmount,
          paddle: hueRotationAmount,
        });
        maybeAddBallTrail();

        translatePaddle();
        translateBall(nextBall);

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
      paddleElement.classList.remove("slide-in-from-bottom");
      ballElement.classList.remove("slide-in-from-bottom");
      startPaddleListeners();
      requestAnimationFrame(loop);
    }

    return beginLoop;
  }
  const runMainLoop = mainLoop();

  function applyInitialTranslations() {
    translateBall(currentBall);
    translatePaddle();
  }
  applyInitialTranslations();

  const stopGame = setTimeout(() => {
    console.log("STOPPING");
    RUN_GAME = false;
  }, STOP_AFTER_THIS_MANY_TICKS * TICK_TIME);

  const setup = setTimeout(() => {
    // ballElement.classList.remove("transparent");
    // playArea.classList.remove("transparent");
    // paddleElement.classList.remove("transparent");
    if (false && TRANSLATE_EVENT_AREA_TO_AVOID_COLLISIONS) {
      // playAreaToRestrict.style.position = "relative";
      // playAreaToRestrict.style.bottom = "150px";
      playAreaToRestrict.style.transition = "transform 0.75s ease";
      playAreaToRestrict.style.transform = `translateY(-${
        SAFE_ZONE_HEIGHT + BOTTOM_OFFSET
      }px)`;
    }
    // playAreaToRestrict.classList.add("extend-bottom");
    // const idxes = [1, 0, 0, 0];
    // const elt = grid;
    // idxes.forEach((idx) => {
    //   elt = elt.children[idx];
    //   elt.classList.add("extend-bottom");
    // });

    // grid.children[1].children[0].children[1].forEach((child) => {
    //   child.classList.add("extend-bottom");
    // });
  }, 1);

  const listener = document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !RUN_GAME) {
      console.log("STARTING");
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
