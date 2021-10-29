import { subject } from "./variable.js";
import { client } from "../index.js";
//manage connection mongodb
let con = async () => {
  if (client.isConnected()) {
  } else {
    await client.connect();
  }
};

//write new document
let write = async (arr, files) => {
  await con();
  const dbo = client.db("data").collection(arr[0]);

  await dbo
    .updateOne(
      { year: arr[0], subject: arr[1], type: arr[2], number: arr[3] },
      { $set: { arr: files, date: new Date() } },
      { upsert: true }
    )
    .then((result) => {});
  return true;
};

//read function for list
let read = async (arr) => {
  try {
    arr.shift();
    if (arr.length === 1) {
      return subject[arr[0]];
    } else {
      // read from database
      await con();
      const db = client.db("data");
      // types
      const dbo = db.collection(arr[0]);

      if (arr.length === 2) {
        const pipline = [
          { $match: { subject: arr[1] } },
          { $group: { _id: "$type" } },
          { $sort: { _id: -1 } },
        ];
        let types = await dbo.aggregate(pipline).toArray();
        return types.map(({ _id }) => _id);
      } else if (arr.length === 3) {
        const pipline = [
          { $match: { subject: arr[1], type: arr[2] } },
          { $sort: { date: 1 } },
          { $project: { number: 1, _id: 0 } },
        ];

        let nums = await dbo.aggregate(pipline).toArray();

        return nums.map(({ number }) => number);
      } // return media ids
      else if (arr.length === 4) {
        const doc = await dbo.findOne({
          subject: arr[1],
          type: arr[2],
          number: arr[3],
        });

        return doc.arr;
      }
    }
  } catch (err) {
    return [];
  }
};

//create new list
let newitems = async () => {
  await con();
  const dbo = client.db("data").collection("41");
  const pipline = [{ $sort: { _id: -1 } }, { $limit: 8 }];
  let arr = await dbo.aggregate(pipline).toArray();
  arr = arr.map((item) => {
    return [
      {
        text: `${subject[41][item.subject * 1]}  ${item.type}  ${item.number}`,
        callback_data: `get,41,${item.subject},${item.type},${item.number}`,
      },
    ];
  });
  return arr;
};

let writeLog = async (name, year, subject, type, number) => {
  await con();
  let dbo = await client.db("data").collection("logs");
  dbo.insertOne({
    name,
    year,
    subject,
    type,
    number,
    date: new Date(),
  });
};

//granting permission
export { write, read, newitems, writeLog };
