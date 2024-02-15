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
  background-color: var(--color-black);
  border-radius: 50%; 
  will-change: transform;
  transition: transform 0.1s linear, opacity 1s ease;
  z-index: 1001;
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
  background-color: var(--color-black);
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

  const BALL_SIZE = 50;
  const RADIUS = BALL_SIZE / 2;
  const TICK_TIME = 50;
  const BASE_SPEED = 7.5;
  const STOP_AFTER_THIS_MANY_TICKS = 2000;
  const FADE_IN_TIME = 1000;
  const RELATIVE_PADDLE_BOUNCES = false;

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
    { "--top": TOP, "--left": LEFT, "--size": BALL_SIZE },
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

  const getIntersectionState = ({ oldBall, newBall, elt }) => {
    // We need to add 1 to all of these functions in case the ball is exactly on the edge of the element.
    const leftIntersectionStrength = (ball, bounds) =>
      ball.right >= bounds.left && ball.left <= bounds.left
        ? 1 + ball.right - bounds.left
        : 0;

    const rightIntersectionStrength = (ball, bounds) =>
      ball.left <= bounds.right && ball.right >= bounds.right
        ? 1 + bounds.right - ball.left
        : 0;

    const aboveIntersectionStrength = (ball, bounds) =>
      ball.bottom >= bounds.top && ball.top <= bounds.top
        ? 1 + ball.bottom - bounds.top
        : 0;

    const belowIntersectionStrength = (ball, bounds) =>
      ball.top <= bounds.bottom && ball.bottom >= bounds.bottom
        ? 1 + bounds.bottom - ball.top
        : 0;

    const doesNotIntersect =
      newBall.bottom < elt.top ||
      newBall.top > elt.bottom ||
      newBall.right < elt.left ||
      newBall.left > elt.right;

    if (doesNotIntersect) {
      return { intersects: false };
    }

    const justIntersected = (checkIntersect) => {
      return checkIntersect(newBall, elt) && !checkIntersect(oldBall, elt);
    };

    const strengthIfJustIntersected = (strengthFn) => {
      const oldStrength = strengthFn(oldBall, elt);
      const newStrength = strengthFn(newBall, elt);
      return oldStrength === 0 && newStrength > 0 ? newStrength : 0;
    };

    const intersectsFrom = {
      left: strengthIfJustIntersected(leftIntersectionStrength),
      right: strengthIfJustIntersected(rightIntersectionStrength),
      above: strengthIfJustIntersected(aboveIntersectionStrength),
      below: strengthIfJustIntersected(belowIntersectionStrength),
    };
    return { intersects: true, intersectsFrom };
  };

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

  function mainLoop() {
    const direction = { x: 1, y: 1 };

    const translatedBounds = (obj) => {
      const bounds = obj.getBoundingClientRect();
      return {
        left: bounds.left - LEFT,
        right: bounds.right - LEFT,
        top: bounds.top - TOP,
        bottom: bounds.bottom - TOP,
      };
    };

    const ensureToLeftOf = (ballBox, left) => {
      ballBox.left = left - BALL_SIZE;
      ballBox.right = left;
    };
    const ensureToRightOf = (ballBox, right) => {
      ballBox.right = right + BALL_SIZE;
      ballBox.left = right;
    };
    const ensureAbove = (ballBox, top) => {
      ballBox.top = top - BALL_SIZE;
      ballBox.bottom = top;
    };
    const ensureBelow = (ballBox, bottom) => {
      ballBox.bottom = bottom + BALL_SIZE;
      ballBox.top = bottom;
    };

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

    function detectCircularCollision(oldBall, newBall, collisionRect) {
      const oldCircle = circleOfBox(oldBall.left, oldBall.top);
      const newCircle = circleOfBox(newBall.left, newBall.top);
      const closestPoint = getClosestPointToCircle(newCircle, collisionRect);
      const collided = circleCollidesWithRect(newCircle, closestPoint);
      return collided;
    }

    function handleCircularCollision(
      oldBall,
      newBall,
      collisionRect,
      direction,
      collisionState
    ) {
      const oldCircle = circleOfBox(oldBall.left, oldBall.top);
      const newCircle = circleOfBox(newBall.left, newBall.top);
      const oldClosestPoint = getClosestPointToCircle(oldCircle, collisionRect);
      const newClosestPoint = getClosestPointToCircle(newCircle, collisionRect);

      const distanceX = oldClosestPoint.x - oldCircle.x;
      const distanceY = oldClosestPoint.y - oldCircle.y;

      // The distance between the circle and the closest point on the rectangle,
      // normalized by how fast the ball is moving in that direction; this is
      // the amount of time it would take for the ball to collide with the rectange
      // in the X and Y directions.
      const normalizedX = distanceX / direction.x;
      const normalizedY = distanceY / direction.y;
      let didCollide = false;
      if (
        normalizedX > 0 &&
        !collisionState.hasCollidedX &&
        oldClosestPoint.x == newClosestPoint.x
      ) {
        const amountToMove = Math.abs(distanceX) - RADIUS;
        direction.x *= -1;
        collisionState.hasCollidedX = true;
        newBall.left += amountToMove * direction.x;
        didCollide = true;
        console.log(`COLLIDED X: ${amountToMove} | ${normalizedX}`);
      }
      if (
        normalizedY > 0 &&
        !collisionState.hasCollidedY &&
        oldClosestPoint.y == newClosestPoint.y
      ) {
        const amountToMove = Math.abs(distanceY) - RADIUS;
        direction.y *= -1;
        collisionState.hasCollidedY = true;
        newBall.top += amountToMove * direction.y;
        didCollide = true;
        console.log(`COLLIDED Y: ${amountToMove} | ${normalizedY}`);
      }

      return didCollide;
    }

    function handleCircularCollisionNew(
      oldBall,
      newBall,
      collisionRect,
      direction,
      collisionState
    ) {
      const oldCircle = circleOfBox(oldBall.left, oldBall.top);
      const newCircle = circleOfBox(newBall.left, newBall.top);

      const relevantSideVertically =
        direction.y > 0 ? collisionRect.top : collisionRect.bottom;
      const relevantSideHorizontally =
        direction.x > 0 ? collisionRect.right : collisionRect.left;

      const ticksToCollisionX = Math.abs(
        (RADIUS - Math.abs(relevantSideHorizontally - newCircle.x)) /
          direction.x
      );
      const ticksToCollisionY = Math.abs(
        (RADIUS - Math.abs(relevantSideVertically - newCircle.y)) / direction.y
      );
      didCollide = false;
      if (
        ticksToCollisionX < ticksToCollisionY &&
        !collisionState.hasCollidedX
      ) {
        direction.x *= -1;
        newBall.left += ticksToCollisionX * direction.x;
        collisionState.hasCollidedX = true;
        didCollide = true;
      } else if (
        ticksToCollisionY < ticksToCollisionX &&
        !collisionState.hasCollidedY
      ) {
        direction.y *= -1;
        newBall.top += ticksToCollisionY * direction.y;
        collisionState.hasCollidedY = true;
        didCollide = true;
      } else if (ticksToCollisionX === ticksToCollisionY) {
        if (!collisionState.hasCollidedX) {
          direction.x *= -1;
          newBall.left += ticksToCollisionX * direction.x;
          newBall.left += distX;
          collisionState.hasCollidedX = true;
          didCollide = true;
        }
        if (!collisionState.hasCollidedY) {
          direction.y *= -1;
          newBall.top += distY;
          newBall.top += ticksToCollisionY * direction.y;
          collisionState.hasCollidedY = true;
          didCollide = true;
        }
        return didCollide;
      }
    }

    function loop() {
      const tickId = Math.floor(Math.random() * 1000000);
      let nextLeft = ballLeft + BASE_SPEED * direction.x;
      let nextTop = ballTop + BASE_SPEED * direction.y;
      let hasCollidedX = false;
      let hasCollidedY = false;
      const movingLeft = direction.x < 0;
      const movingRight = direction.x > 0;
      const movingUp = direction.y < 0;
      const movingDown = direction.y > 0;

      if (nextLeft < 0) {
        direction.x *= -1;
        nextLeft = 0;
        hasCollidedX = true;
      } else if (nextLeft + BALL_SIZE > WIDTH) {
        direction.x *= -1;
        nextLeft = WIDTH - BALL_SIZE;
        hasCollidedX = true;
      }
      if (nextTop < 0) {
        direction.y *= -1;
        nextTop = 0;
        hasCollidedY = true;
      } else if (nextTop > HEIGHT - BALL_SIZE) {
        direction.y *= -1;
        nextTop = HEIGHT - BALL_SIZE;
        hasCollidedY = true;
      }

      const oldBall = makeBallBox(ballLeft, ballTop);
      const newBall = makeBallBox(nextLeft, nextTop);

      function collideWithEvent(event, doClick) {
        event.classList.add("faded");
        event.dataset.intersected = "true";
      }

      const paddleBox = makePaddleBox(paddleLeft, paddleTop);
      const collidesWithPaddle = detectCircularCollision(
        oldBall,
        newBall,
        paddleBox
      );

      if (collidesWithPaddle) {
        console.log(`[${tickId}] PADDLE COLLISION DETECTED`);
        const collisionState = { hasCollidedX, hasCollidedY };
        const bounced = handleCircularCollisionNew(
          oldBall,
          newBall,
          paddleBox,
          direction,
          collisionState
        );
        hasCollidedX = collisionState.hasCollidedX;
        hasCollidedY = collisionState.hasCollidedY;
        if (!bounced) {
          console.log(`[${tickId}] BUG: SKIPPED BOUNCE OFF PADDLE`);
        }
      }

      // const {
      //   intersects: intersectsPaddle,
      //   intersectsFrom: intersectsPaddleFrom,
      // } = getIntersectionState({
      //   oldBall,
      //   newBall,
      //   elt: paddleBox,
      // });

      // // Consider whether this should work if you move the paddle into the ball such that
      // // the size of the paddle would hit it.
      // if (intersectsPaddle) {
      //   console.log(`[${tickId}] PADDLE INTERSECTION DETECTED`);
      //   if (RELATIVE_PADDLE_BOUNCES) {
      //     if (direction.y < 0) {
      //       console.log(
      //         `[${tickId}] BUG? PADDLE INTERSECTION DETECTED BUT BALL IS MOVING UP`
      //       );
      //     } else {
      //       // shoutout to https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl
      //       const paddleCenter = paddleBox.left + PADDLE_WIDTH / 2;
      //       const oldBallCenter = oldBall.left + BALL_SIZE / 2;
      //       const delta = (paddleTop - oldBall.bottom) / direction.y;
      //       const xIntercept =
      //         delta * direction.x + oldBall.left + BALL_SIZE / 2;
      //       const relativeIntersectX = paddleCenter - xIntercept;
      //       const normalizedRelativeIntersectX =
      //         relativeIntersectX / (PADDLE_WIDTH / 2);
      //       const MAXBOUNCEANGLE = (4 * Math.PI) / 12; // 60 degrees
      //       const bounceAngle = normalizedRelativeIntersectX * MAXBOUNCEANGLE;
      //       direction.x = -Math.sin(bounceAngle);
      //       direction.y = -Math.cos(bounceAngle);
      //       console.log(
      //         `[${tickId}] DIRECTIONS bounceAngle: ${bounceAngle} x: ${direction.x} y: ${direction.y}`
      //       );
      //       hasCollidedY = true;
      //       hasCollidedX = true;
      //     }
      //   } else {
      //     direction.y *= -1;
      //     hasCollidedY = true;
      //   }
      //   ensureAbove(newBall, paddleBox.top);
      // }

      let doClick = true;
      getEvents().forEach((event) => {
        if (event.dataset.intersected) {
          return;
        }

        const eventBounds = translatedBounds(event);
        const collided = detectCircularCollision(oldBall, newBall, eventBounds);
        if (collided) {
          console.log(
            `[${tickId}] CIRCULAR COLLISION DETECTED: ${event.textContent}`
          );
          collideWithEvent(event, doClick);
          const collisionState = { hasCollidedX, hasCollidedY };
          const bounced = handleCircularCollisionNew(
            oldBall,
            newBall,
            eventBounds,
            direction,
            collisionState
          );
          if (bounced) {
            console.log(`[${tickId}] BOUNCED OFF EVENT: ${event.textContent}`);
          } else {
            console.log(
              `[${tickId}] SKIPPED BOUNCE OFF EVENT: ${event.textContent}`
            );
          }
          hasCollidedX = collisionState.hasCollidedX;
          hasCollidedY = collisionState.hasCollidedY;
        }
      });

      translate(ball, newBall.left, newBall.top);
      rotateForVector(ball, direction.x, direction.y);
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
