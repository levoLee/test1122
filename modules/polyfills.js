if (!Object.assign) {
  Object.assign = (obj, ...arr) => {
    arr.forEach((item, index) => {
      for (const i in item) {
        if (item.hasOwnProperty(i)) {
          obj[i] = item[i];
        }
      }
    })

    return obj;
  };
}
