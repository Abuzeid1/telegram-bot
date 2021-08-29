

// create markup for telegram list
module.exports.list = (com, arr) => {
    let markup = []
    let div = Math.ceil(arr.length / 4);
    com = com.split(",")
    
    arr = arr.map((item, index) => {
        if (com.length === 2) {
            return { text: item, callback_data: com + "," + index }
        } else {
            return { text: item, callback_data: com + "," + item }
        }
    })

    let count = 0;
    while (count < arr.length) {
        markup.push(arr.slice(count, count + div))
        count += div;
    }


    if (com.length > 2 ) {
        let arr = com.slice(0)

        console.log({fun: true})
        arr.pop()
        arr = arr.toString()
        
        markup.push([{ text: "<< Back", callback_data: arr }])
    }
    console.log({commark: com})
    if (com[0] === 'add' && com.length > 2 ) {
        console.log(markup[markup.length-2])
        com.shift()
        markup[markup.length - 1].push({ text: "another", callback_data: "addx," + com.toString() })
        console.log({lastelemetn: markup[markup.length-1]})
    }
   
    return markup
}


// sort media to be sent in a media group
module.exports.media = (obj) => {
    let group = [];
    obj.arr.forEach(item => {
        group.push({ type: obj.type, media: item })
    });
    return group
}

//sort media ids to store in a media group
module.exports.createMedia = (arr) => {
    let resultarr = [];
    arr.forEach((item) => {
        let index = resultarr.findIndex((el) => { return el.type == item[1] })
        if (index === -1) {
            resultarr.push({ arr: [item[0]], type: item[1] })
        } else {
            resultarr[index].arr.push(item[0])
        }
    })

    return resultarr
}


