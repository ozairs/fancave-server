import {property, model, Model} from '@loopback/repository';

@model({settings: {strict: false}})
export class News extends Model {
  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  @property({
    type: 'string',
  })
  url: string;

  @property({
    type: 'string',
  })
  title: string;

  @property({
    type: 'string',
  })
  urlToImage: string;

  @property({
    type: 'string',
  })
  description: string;

  publishedAt: string;

  constructor(data?: Partial<News>) {
    super(data);
  }
}
export interface NewsResponse {
  rss: {
    channel: {
      item: NewsItem[];
    };
  };
  err: string;
}

export interface NewsItem {
  link: {
    _text: string;
  };
  title: {
    _text: string;
  };
  description: {
    _text: string;
  };
  pubDate: {
    _text: string;
  };
  'content:encoded': {
    _cdata: string;
  };
  urlToImage: string;
}

// export interface Article {
//   url: string;
//   title: string;
//   urlToImage: string;
//   description: string;
// }

export interface NewsRelations {
  // describe navigational properties here
}

export type NewsWithRelations = News & NewsRelations;
