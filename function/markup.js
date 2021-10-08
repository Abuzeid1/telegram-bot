// create markup for telegram list
let list = (com, arr) => {
  let markup = [];
  let div = Math.ceil(arr.length / 4);
  com = com.split(",");

  arr = arr.map((item, index) => {
    if (com.length === 2) {
      return { text: item, callback_data: com + "," + index };
    } else {
      return { text: item, callback_data: com + "," + item };
    }
  });

  let count = 0;
  while (count < arr.length) {
    markup.push(arr.slice(count, count + div));
    count += div;
  }

  if (com.length > 2) {
    let arr = com.slice(0);

    arr.pop();
    arr = arr.toString();

    markup.push([{ text: "<< Back", callback_data: arr }]);
  }

  if (com[0] === "add" && com.length > 2) {
    com.shift();
    markup[markup.length - 1].push({
      text: "another",
      callback_data: "addx," + com.toString(),
    });
  }

  return markup;
};

// sort media to be sent in a media group
let media = ({ arr, type }) => {
  let group = arr.map((item) => ({ type, media: item }));
  return group;
};

//sort media ids to store in a media group
let createMedia = (arr) => {
  let resultarr = [];
  arr.forEach((item) => {
    let index = resultarr.findIndex((el) => {
      return el.type == item[1];
    });
    if (index === -1) {
      resultarr.push({ arr: [item[0]], type: item[1] });
    } else {
      resultarr[index].arr.push(item[0]);
    }
  });

  return resultarr;
};

export { createMedia, media, list };
