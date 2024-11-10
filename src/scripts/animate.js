export default function animate(options /* {duration, timing, draw} */) {
  const start = performance.now();

  requestAnimationFrame(function animate(time) {
    let timeFraction = (time - start) / options.duration;
    if (timeFraction > 1) timeFraction = 1;

    const progress = options.timing(timeFraction);

    options.draw(progress);

    if (timeFraction < 1) {
      requestAnimationFrame(animate);
    }
  });
}
