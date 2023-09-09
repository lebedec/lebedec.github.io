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

function saveQuery(query) {
    let pairs = [];
    for (let key of Object.keys(query)) {
        let value = query[key];
        if (value) {
            pairs.push(key + '=' + encodeURIComponent(value));
        }
    }
    if (pairs.length > 0) {
        return '?' + pairs.join('&');
    } else {
        return '';
    }
}

/**
 * @returns {string}
 */
function getBaseURL() {
    return window.location.protocol + "//" + window.location.host + window.location.pathname
}

window.onload = () => {
    const query = parseQuery(window.location.search);
    const tagsFilter = query.tags ? query.tags.split('+') : [];
    const isBlog = query.blog === 'true';
    console.log('Hello world!', tagsFilter, isBlog);


    const modes = append('div', 'modes', document.body)
    let mode = append('a', 'mode', modes);
    mode.innerText = 'Блог';
    mode.href = getBaseURL() + saveQuery({blog: 'true', tags: query.tags});
    if (isBlog) {
        mode.className += ' active';
    }
    mode = append('a', 'mode', modes);
    mode.innerText = 'Портфолио'
    mode.href = getBaseURL() + saveQuery({tags: query.tags});
    if (!isBlog) {
        mode.className += ' active';
    }

    const filter = (tag) => getBaseURL() + saveQuery({blog: query.blog, tags: tag});

    let container = append('div', 'container', document.body);
    for (let article of articles) {
        let index = article.tags.findIndex(tag => tag === 'блог');
        if (!isBlog && index !== -1) {
            continue
        }
        if (tagsFilter.length > 0) {
            let index = article.tags.findIndex(tag => tagsFilter.includes(tag));
            if (index === -1) {
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
        }

        if (preview.type === 'gif') {
            let responsive = append('div', 'aspect-16-9', card);
            let img = append('img', 'gif', responsive);
            img.src = preview.url;
        }

        if (preview.type === 'vimeo') {
            let div = append('div', 'aspect-16-9', card);
            let iframe = append('iframe', 'vimeo', div);
            iframe.src = preview.url;
            iframe.allow = "autoplay; fullscreen; picture-in-picture";
            iframe.title = article.title;
        }

        if (preview.type === 'youtube') {
            let div = append('div', 'aspect-16-9', card);
            let iframe = append('iframe', 'youtube', div);
            iframe.src = preview.url;
            iframe.title = "YouTube video player";
            iframe.frameborder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        }

        let header = append('div', 'header', card);

        let date = append('h4', 'date', header);
        date.innerText = new Date(article.date).toLocaleDateString('ru-Ru', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let tags = append('div', 'tags', header);
        for (let tag of article.tags) {
            let className = 'tag';
            let href = filter(tag);
            if (tagsFilter.includes(tag)) {
                className += ' active';
                tag += '*';
                href = filter();
            }
            let span = append('a', className, tags);
            span.innerText = tag;
            span.href = href;
        }

        let paragraph = append('p', 'paragraph', card);
        paragraph.innerText = article.text;

        if (article.link) {
            let link = append('a', '', card);
            link.href = article.link;
            link.innerText = article.link;
        }
    }
}
