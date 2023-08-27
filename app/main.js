setTimeout(() => {
    console.log('Hello world!');
    for (let article of articles) {
        let div = document.createElement("h1");
        div.innerText = article.title;
        document.body.append(div);
    }
});