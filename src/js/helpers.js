// wait function used for waiting between animations
export const wait = async function (seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};
