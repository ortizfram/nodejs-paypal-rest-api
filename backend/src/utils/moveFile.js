// utils/

const moveFile = (file, destination) =>
  new Promise((resolve, reject) => {
    file.mv(destination, (err) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve();
      }
    });
  });

export default moveFile;
