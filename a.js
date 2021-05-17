async function retryRequest(fn, retriesLeft, interval = 1000) {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        if (retriesLeft === 0) {
          reject(error);
          return;
        }

        setTimeout(() => {
          retryRequest(fn, retriesLeft - 1, interval)
            .then(resolve)
            .catch(reject);
        }, interval);
      });
  });
}

let hasFailed = false;
function getUserInfo() {
  return new Promise((resolve, reject) => {
    if (!hasFailed) {
      hasFailed = true;
      reject("Exception!");
    } else {
      resolve("Fetched user!");
    }
  });
}
let promise = retryRequest(getUserInfo, 3);
if (promise) {
  promise.then((result) => console.log(result)).catch((error) => console.log("Error!"));
}
module.exports.retryRequest = retryRequest;
