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

    let container = document.getElementById("container");

    function fixMarginLeft() {
        let w = 736 + 80;
        let width = document.documentElement.scrollWidth;
        if (width >= (736 + 736 + 80)) {
            let maxCards = Math.floor((width + 80) / w);
            let contentWidth = 736 * maxCards + 80 * (maxCards - 1);
            let marginLeft = (width - contentWidth) / 2.0;
            container.style.marginLeft = marginLeft + 'px';
            console.log('W', width, marginLeft);
        } else {
            container.style.marginLeft = '0px';
            console.log('W', width, 'none');
        }
    }

    fixMarginLeft();
    window.addEventListener('resize', () => fixMarginLeft())

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
                'zoom': 4,
                zoomControl: false,
                fullscreenControl: false
            });
            for (let key of Object.keys(uniqueCoordinates)) {
                let article = uniqueCoordinates[key];
                let coordinates = [article.coordinates[0], article.coordinates[1]];
                let circle = DG.circle(coordinates, 100 * 1000, {weight: 2, color: 'black'});
                circle.addTo(map);
                circle.addEventListener('click', () => {
                    let access = document.getElementById(article.date);
                    access.scrollIntoView({behavior: 'smooth'}, true);
                })
                if (article.coordinates.length > 2) {
                    for (let i = 2; i < article.coordinates.length; i += 2) {
                        let coordinates = [article.coordinates[i], article.coordinates[i + 1]];
                        circle = DG.circle(coordinates, 50 * 1000, {weight: 2, color: 'black'});
                        circle.addTo(map);
                        circle.addEventListener('click', () => {
                            let access = document.getElementById(article.date);
                            access.scrollIntoView({behavior: 'smooth'}, true);
                        });
                    }
                }
            }
        });
    }

    for (let article of visible) {
        let card = append('div', 'card', container);

        // if (article.link) {
        //     card.className += ' link';
        //     let icon = append('a', 'icon', card);
        //     icon.innerHTML = ICON;
        //     icon.href = article.link;
        // }

        // let title = append('h1', '', card);
        // title.innerText = article.title;


        let header = append('div', 'header', card);
        let date = append('h4', 'date', header);
        date.id = article.date;
        date.innerText = new Date(article.date).toLocaleDateString('ru-Ru', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let preview = article.preview;
        if (preview.type === 'picture') {
            let responsive = append('div', 'aspect-16-9', card);
            let img = append('img', 'picture', responsive);
            img.src = preview.url;
        }

        if (preview.type === 'github') {
            let responsive = append('div', 'aspect-16-9-github', card);
            let img = append('img', 'github', responsive);
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

        if (preview.type === 'rutube') {
            let div = append('div', 'aspect-16-9', card);
            let iframe = append('iframe', 'rutube', div);
            iframe.src = preview.url;
            iframe.title = "RuTube video player";
            iframe.frameborder = "0";
            iframe.allowFullScreen = "";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        }

        let paragraph = append('p', 'paragraph', card);
        paragraph.innerText = article.text;

        let footer = append('div', 'footer', card);
        let tags = append('div', 'tags', footer);
        for (let tag of article.tags) {
            let className = 'tag';
            let href = filter(tag);
            if (tagsFilter.includes(tag)) {
                className += ' active';
                href = filter();
            }
            let span = append('a', className, tags);
            span.innerText = tag;
            span.href = href;
        }

        if (preview.type === 'github') {
            // append('div', 'spacer', tags);
            let span = append('a', 'tag tag-github', tags);
            // span.innerText = "github";
            span.innerHTML = "GitHub";
            span.href = article.link;
        }
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
