import json
import os.path
import re
from dataclasses import asdict
from dataclasses import dataclass
from typing import List
from typing import Optional
from typing import Union


@dataclass
class YouTube:
    url: str
    type: str = 'youtube'


@dataclass
class RuTube:
    url: str
    type: str = 'rutube'


@dataclass
class Vimeo:
    url: str
    type: str = 'vimeo'


@dataclass
class Picture:
    url: str
    type: str = 'picture'

@dataclass
class Github:
    url: str
    type: str = 'github'

@dataclass
class Gif:
    url: str
    type: str = 'gif'


@dataclass
class Article:
    title: str
    date: str
    tags: List[str]
    preview: Union[Picture, YouTube, Vimeo, Github]
    text: str
    link: Optional[str]
    coordinates: List[float]

    @staticmethod
    def empty():
        return Article('', '1970-01-01', [], Picture(''), '', None, [59.938784, 30.314997])


def parse_markdown_article(path: str, pictures_root: str) -> List[Article]:
    articles = []
    article = Article.empty()
    link_url = re.compile('\[link\]\((.+)\)')
    youtube_url = re.compile('\[youtube\]\((.+)\)')
    rutube_url = re.compile('\[rutube\]\((.+)\)')
    vimeo_url = re.compile('\[vimeo\]\((.+)\)')
    picture_url = re.compile('\!\[picture\]\((.+)\)')
    github_url = re.compile('\!\[github\]\((.+)\)')
    gif_url = re.compile('\!\[gif\]\((.+)\)')
    with open(path) as file:
        while line := file.readline():
            line = line.rstrip()
            if line.startswith('# '):
                article.title = line.replace('# ', '')
                continue

            if line.startswith('## '):
                article.date = line.replace('## ', '')
                continue

            if line.startswith('### '):
                article.coordinates = [float(value) for value in line.replace('### ', '').split(',')]
                continue

            if line.startswith('[link]'):
                url = link_url.match(line).group(1)
                article.link = url
                continue

            if line.startswith('[youtube]'):
                url = youtube_url.match(line).group(1)
                article.preview = YouTube(url)
                continue

            if line.startswith('[rutube]'):
                url = rutube_url.match(line).group(1)
                article.preview = RuTube(url)
                continue

            if line.startswith('[vimeo]'):
                url = vimeo_url.match(line).group(1)
                article.preview = Vimeo(url)
                continue

            if line.startswith('![picture]'):
                url = picture_url.match(line).group(1)
                if not url.startswith('http'):
                    url = pictures_root + url
                article.preview = Picture(url)
                continue

            if line.startswith('![github]'):
                url = github_url.match(line).group(1)
                article.preview = Github(url)
                continue

            if line.startswith('![gif]'):
                url = gif_url.match(line).group(1)
                if not url.startswith('http'):
                    url = pictures_root + url
                article.preview = Picture(url)
                continue

            if line.startswith('> '):
                words = line.replace('> ', '').split(',')
                article.tags = [word.strip() for word in words]
                articles.append(article)
                article = Article.empty()
                continue

            if not line:
                pass
            else:
                article.text += ' ' + line
    return articles


def parse_articles(src: str) -> List[Article]:
    root = os.path.dirname(__file__)
    src = os.path.join(root, src)
    articles = []
    for name in sorted(os.listdir(src), reverse=True):
        if not name.endswith('.md'):
            continue
        year, _ = name.split('.')
        path = os.path.join(src, name)
        year_articles = parse_markdown_article(path, f'/static/')
        articles.extend(year_articles)
    return articles


def render_articles(articles: List[Article], dst: str):
    with open(dst, 'w', encoding='utf8') as output:
        json_articles = [asdict(article) for article in articles]
        data = json.dumps(json_articles, indent=4, ensure_ascii=False)
        print(articles)
        output.write('const articles = ' + data)


if __name__ == '__main__':
    articles = parse_articles('static')
    render_articles(articles, './app/data.js')
