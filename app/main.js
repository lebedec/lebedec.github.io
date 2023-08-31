/**
 *
 * @param tag {string}
 * @param className {string}
 * @param parent {HTMLElement}
 * @returns {HTMLElement}
 */
function append(tag, className, parent) {
    let element = document.createElement(tag)
    element.className = className;
    parent.append(element);
    return element;
}

setTimeout(() => {
    console.log('Hello world!');
    let container = append('div', 'container', document.body);
    for (let article of articles) {
        let card = append('div', 'card', container);

        // let title = append('h1', '', card);
        // title.innerText = article.title;

        let preview = article.preview;
        if (preview.type === 'picture') {
            let img = append('img', 'picture', card);
            img.src = preview.url;
            let date = append('h2', 'date', card);
            date.innerText = new Date(article.date).toLocaleDateString('ru-Ru', {year: 'numeric', month: 'long', day: 'numeric'});
        }

        if (preview.type === 'youtube') {
            let iframe = append('iframe', 'youtube', card);
            // iframe.width = "560";
            // iframe.height = "315";
            // https://www.youtube.com/watch?v=qJ16vPIZpqc&t=1202s
            iframe.src = "https://www.youtube.com/embed/qJ16vPIZpqc?si=AgNLJohMoRE9Z976&start=1202&wmode=transparent";
            iframe.title="YouTube video player";
            iframe.frameborder="0";
            iframe.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

            /**
             * <iframe width="560" height="315" src="https://www.youtube.com/embed/qJ16vPIZpqc?si=AgNLJohMoRE9Z976" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
             */
        }

        let tags = append('div', 'tags', card);
        for (let tag of article.tags) {
            let span = append('span', 'tag', tags);
            span.innerText = tag + ", ";
        }

        let paragraph = append('p', '', card);
        paragraph.innerText = article.text;
    }
}, 100);