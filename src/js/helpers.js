// wait function used for waiting between animations
export const wait = async function (seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};

/**
 * formats a number of seconds into minutes and seconds and returns a string 'm:ss'
 * @param {Number} seconds
 * @returns m:ss
 * @author Cristi Sebeni
 */
export const formatTimer = function (sec) {
  const minutes = Math.trunc(sec / 60);
  const seconds = (sec % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
};

export const AJAX = async function (url) {
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};
