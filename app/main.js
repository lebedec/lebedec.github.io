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
    console.log('Hello world!', tagsFilter);

    const filter = (tag) => getBaseURL() + saveQuery({tags: tag});

    let visible = [];
    let uniqueCoordinates = {};
    for (let article of articles) {
        if (tagsFilter.length > 0) {
            let index = article.tags.findIndex(tag => tagsFilter.includes(tag));
            if (index === -1) {
                continue
            }
        }
        visible.push(article);
        uniqueCoordinates[article.coordinates.toString()] = article;
    }

    let container = append('div', 'container', document.body);

    if (tagsFilter.includes('путешествия')) {
        let gisContainer = append('div', 'map', container);
        let gis = append('div', 'gis', gisContainer);
        gis.style = "height: 100%";
        gis.id = 'gis';
        DG.then(function () {
            let coordinates = Object.values(uniqueCoordinates);
            let avgLat = 0;
            let avgLon = 0;
            for (let article of coordinates) {
                avgLat += article.coordinates[0];
                avgLon += article.coordinates[1];
            }
            avgLat = avgLat / coordinates.length;
            avgLon = avgLon / coordinates.length;
            // https://api.2gis.ru/doc/maps/ru/manual/vector-layers/#dgpath-options
            map = DG.map('gis', {
                'center': [avgLat, avgLon],
                'zoom': 4
            });
            for (let key of Object.keys(uniqueCoordinates)) {
                let article = uniqueCoordinates[key];
                let coordinates = [article.coordinates[0], article.coordinates[1]];
                DG.circle(coordinates, 100 * 1000, {weight: 2, color: 'black'}).addTo(map);
                if (article.coordinates.length > 2) {
                    for (let i = 2; i < article.coordinates.length; i+= 2) {
                        let coordinates = [article.coordinates[i], article.coordinates[i+1]];
                        DG.circle(coordinates, 50 * 1000, {weight: 2, color: 'black'}).addTo(map);
                    }
                }
            }
        });
    }

    for (let article of visible) {
        let card = append('div', 'card', container);

        if (article.link) {
            card.className += ' link';
            let icon = append('a', 'icon', card);
            icon.innerHTML = ICON;
            icon.href = article.link;
        }

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
    }
}

const ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     viewBox=\"0 -256 1850 1850\"\n" +
    "     width=\"100%\"\n" +
    "     height=\"100%\" fill=\"currentColor\">\n" +
    "    <g transform=\"matrix(1,0,0,-1,30.372881,1426.9492)\">\n" +
    "        <path d=\"M 1408,608 V 288 Q 1408,169 1323.5,84.5 1239,0 1120,0 H 288 Q 169,0 84.5,84.5 0,169 0,288 v 832 Q 0,1239 84.5,1323.5 169,1408 288,1408 h 704 q 14,0 23,-9 9,-9 9,-23 v -64 q 0,-14 -9,-23 -9,-9 -23,-9 H 288 q -66,0 -113,-47 -47,-47 -47,-113 V 288 q 0,-66 47,-113 47,-47 113,-47 h 832 q 66,0 113,47 47,47 47,113 v 320 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z m 384,864 V 960 q 0,-26 -19,-45 -19,-19 -45,-19 -26,0 -45,19 L 1507,1091 855,439 q -10,-10 -23,-10 -13,0 -23,10 L 695,553 q -10,10 -10,23 0,13 10,23 l 652,652 -176,176 q -19,19 -19,45 0,26 19,45 19,19 45,19 h 512 q 26,0 45,-19 19,-19 19,-45 z\"\n" +
    "              />\n" +
    "    </g>\n" +
    "</svg>";
