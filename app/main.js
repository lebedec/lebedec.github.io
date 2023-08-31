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

/**
 * @param search {string}
 * @returns {{}}
 */
function parseQuery(search) {
    let query = {};
    let pairs = (search[0] === '?' ? search.substring(1) : search).split('&');
    for (let i = 0; i < pairs.length; i++) {
        let [a, b] = pairs[i].split('=');
        let key = decodeURIComponent(a);
        let value = decodeURIComponent(b || '');
        query[key] = value;
    }
    return query;
}

setTimeout(() => {
    const query = parseQuery(window.location.search);
    const tagsFilter = query.tags ? query.tags.split('+') : [];
    console.log('Hello world!', tagsFilter);

    let container = append('div', 'container', document.body);
    for (let article of articles) {
        if (tagsFilter.length > 0) {
            let index = article.tags.findIndex(tag => tagsFilter.includes(tag));
            if (index == -1) {
                continue
            }
        }
        let card = append('div', 'card', container);

        // let title = append('h1', '', card);
        // title.innerText = article.title;

        let preview = article.preview;
        if (preview.type === 'picture') {
            let responsive = append('div', 'aspect-16-9', card);
            let img = append('img', 'picture', responsive);
            img.src = preview.url;
            let date = append('h2', 'date', card);
            date.innerText = new Date(article.date).toLocaleDateString('ru-Ru', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        if (preview.type === 'vimeo') {
            let div = append('div', 'aspect-16-9', card);
            let iframe = append('iframe', 'vimeo', div);
            iframe.src = preview.url;
            iframe.allow = "autoplay; fullscreen; picture-in-picture";
            iframe.title = article.title;
            let date = append('h2', 'date', card);
            date.innerText = new Date(article.date).toLocaleDateString('ru-Ru', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        if (preview.type === 'youtube') {
            let div = append('div', 'aspect-16-9', card);
            let iframe = append('iframe', 'youtube', div);
            iframe.src = preview.url;
            iframe.title = "YouTube video player";
            iframe.frameborder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        }

        let tags = append('div', 'tags', card);
        for (let tag of article.tags) {
            let span = append('span', 'tag', tags);
            span.innerText = tag + ", ";
        }

        let paragraph = append('p', '', card);
        paragraph.innerText = article.text;
    }
});