function elementsIntersect(ballLeft, ballTop, element) {
  const eltRect = element.getBoundingClientRect();
  const ballRight = ballLeft + BALL_SIZE;
  const ballBottom = ballTop + BALL_SIZE;

  const doNotIntersect =
    ballRight < eltRect.left || // ballRect is left of eltRect
    ballLeft > eltRect.right || // ballRect is right of eltRect
    ballBottom < eltRect.top || // ballRect is above eltRect
    ballTop > eltRect.bottom; // ballRect is below eltRect

  return { intersects: !doNotIntersect, eltRect };
}

const getIntersections = (elt1, elt2) => {
  const above = elt1.bottom < elt2.top;
  const below = elt1.top > elt2.bottom;
  const left = elt1.right < elt2.left;
  const right = elt1.left > elt2.right;
  const intersects = !(above || below || left || right);
  return { intersects, above, below, left, right };
};

const maybeNegate = () => (Math.random() > 0.5 ? 1 : -1);
const randomMaybeNegative = (max) =>
  Math.floor(Math.random() * max * maybeNegate());

function squarecollision() {
  const eventBounds = translatedBounds(event);
  const { intersects, intersectsFrom } = getIntersectionState({
    oldBall,
    newBall,
    elt: eventBounds,
  });
  if (intersects) {
    console.log(`[${tickId}] INTERSECTION DETECTED: ${event.textContent}`);
    collideWithEvent(event, doClick);
    doClick = false;

    if (hasCollidedX && hasCollidedY) {
      console.log("SKIPPING A COLLISION");
      return;
    }
    console.log(`OLD BOX: ${JSON.stringify(oldBall)}`);
    console.log(`NEXT BOX: ${JSON.stringify(newBall)}`);
    console.log(`EVENT BOUNDS: ${JSON.stringify(eventBounds)}`);
    console.log(`INTERSECTIONS: ${JSON.stringify(intersectsFrom)}`);

    let intersectionStrength = Infinity;
    let intersectionFn = null;

    const maybeUpdateIntersection = (strength, fn) => {
      // This is counterintuitive, but we care about the *smallest* strength.  The
      // way to think about it is that if there's an intersection, both a horizontal
      // and vertical `intersectsFrom` must be true (if only one was true, the ball
      // could be, say, between the event vertically but very far away horizontally.)

      // Typically this function is only called once in a tick, because we only call
      // it if the ball began to intersect the element in a direction *this tick*.
      // But it's possible that that becomes true both horizontally and vertically in
      // the same tick.

      // If that happens we want to pick the smaller of the two strengths, because
      // that's the one that happened second - meaning that it's the one that
      // "caused" the intersection. A way to think about this is that if our tick
      // function happened much more frequently, the larger strength intersection
      // would likely have happened on a prior tick.

      if (strength > 0 && strength < intersectionStrength) {
        intersectionStrength = strength;
        intersectionFn = fn;
      }
    };

    // Related to the above comment, it's important that our !hasCollided checks are inside the update
    // intersection logic, instead of guarding our update to our strongest intersection function for
    // an element. This is relevant when we collide with two elements on the same tick. Let's say that
    // we collide with two elements, A and B.
    // We're moving to the right and up.
    // For A, we intersect from the bottom. For B, we intersect from the left and bottom.
    // We want to avoid reversing our vertical direction twice, so it's important that we check !hasCollidedY.
    // But we only want to additionally reverse our *horizontal* direction if, without A, we would have chosen
    // to reverse B's horizontal direction instead of its vertical directon (that is, if the horizontal strength
    // is weakest). If the !hasCollided checks are in the outer if statement we wouldn't check our horizontal
    // strength against the weakest vertical strength and we'd always reverse our horizontal direction.

    if (movingRight && intersectsFrom.left) {
      maybeUpdateIntersection(intersectsFrom.left, () => {
        if (!hasCollidedX) {
          ensureToLeftOf(newBall, eventBounds.left);
          direction.x *= -1;
          hasCollidedX = true;
        }
      });
    } else if (movingLeft && intersectsFrom.right) {
      maybeUpdateIntersection(intersectsFrom.right, () => {
        if (!hasCollidedX) {
          ensureToRightOf(newBall, eventBounds.right);
          direction.x *= -1;
          hasCollidedX = true;
        }
      });
    }

    if (movingDown && intersectsFrom.above) {
      maybeUpdateIntersection(intersectsFrom.above, () => {
        if (!hasCollidedY) {
          ensureAbove(newBall, eventBounds.top);
          direction.y *= -1;
          hasCollidedY = true;
        }
      });
    } else if (movingUp && intersectsFrom.below) {
      maybeUpdateIntersection(intersectsFrom.below, () => {
        if (!hasCollidedY) {
          ensureBelow(newBall, eventBounds.bottom);
          direction.y *= -1;
          hasCollidedY = true;
        }
      });
    }

    if (intersectionFn) {
      intersectionFn();
    } else {
      console.info(
        `NO COLLISION DETECTED for ${event.textContent} | xCollision: ${hasCollidedX} | yCollision: ${hasCollidedY}`
      );
    }
    console.log("--------------");
  }
}

// const interval = setInterval(() => {
//   const oldBallRect = ball.getBoundingClientRect();
//   let nextLeft = ballLeft + SPEED * direction.x;
//   let nextTop = ballTop + SPEED * direction.y;
//   if (nextLeft >= WIDTH - BALL_SIZE || nextLeft <= 0) {
//     direction.x *= -1;
//   }
//   if (nextTop >= HEIGHT - BALL_SIZE || nextTop <= 0) {
//     direction.y *= -1;
//   }
//   nextLeft = clamp(0, WIDTH - BALL_SIZE, nextLeft);
//   nextTop = clamp(0, HEIGHT - BALL_SIZE, nextTop);
//   translateBall(nextLeft, nextTop);

//   EVENTS.forEach((event) => {
//     const { intersects, eltRect } = elementsIntersect(
//       oldBallRect.left + SPEED * direction.x,
//       oldBallRight.top + SPEED * direction.y,
//       event
//     );
//     if (event.dataset.intersected) {
//       return;
//     }

//     if (intersects) {
//       event.dataset.intersected = "true";
//       let intersectionOrientation = "unknown";

//       if (direction.x > 0) {
//         nextLeft = Math.min(nextLeft, eltRect.left - BALL_SIZE);
//       } else {
//         nextLeft = Math.max(nextLeft, eltRect.right);
//       }
//       if (direction.y > 0) {
//         nextTop = Math.min(nextTop, eltRect.top - BALL_SIZE);
//       } else {
//         nextTop = Math.max(nextTop, eltRect.bottom);
//       }

//       const ballCenterX = ballRect.left + ballRect.width / 2;
//       const ballCenterY = ballRect.top + ballRect.height / 2;
//       const eltCenterX = eltRect.left + eltRect.width / 2;
//       const eltCenterY = eltRect.top + eltRect.height / 2;

//       // shoutout to https://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddl
//       const relativeIntersectY = eltCenterY - ballCenterY;
//       const relativeIntersectX = eltCenterX - ballCenterX;

//       const normalizedIntersectY = relativeIntersectY / (eltRect.height / 2);
//       const normalizedIntersectX = relativeIntersectX / (eltRect.width / 2);

//       if (betweenTopAndBottom(oldBallRect, eltRect)) {
//         intersectionOrientation = "side";
//       } else if (betweenLeftAndRight(oldBallRect, eltRect)) {
//         intersectionOrientation = "top";
//       } else {
//         if (Math.abs(normalizedIntersectX) > Math.abs(normalizedIntersectY)) {
//           intersectionOrientation = "side";
//         } else {
//           intersectionOrientation = "top";
//         }
//       }

//       if (intersectionOrientation === "side") {
//         direction.x *= -1;
//       } else {
//         direction.y *= -1;
//       }

//       event.style.backgroundColor = "slategrey";
//       event.style.transition =
//         "opacity 0.5s ease, background-color 0.5s ease";
//       event.style.opacity = "0.3";
//     }
//   });

//   ballLeft = nextLeft;
//   ballTop = nextTop;
// }, 100);
