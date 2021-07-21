export default function generateState(): number {
  /* Generate state */
  const randomVals = new Uint32Array(1);
  if (window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomVals);
  } else {
    randomVals[0] = 0;
  }
  const state: number = randomVals[0];
  window.localStorage.setItem("state", state.toString());
  return state;
}
