import {model, property, Model} from '@loopback/repository';

@model({settings: {strict: false}})
export class Scores extends Model {
  @property({
    type: 'string',
  })
  away?: string;

  @property({
    type: 'string',
  })
  awayScore: string;

  @property({
    type: 'string',
  })
  awayLogo: string;

  @property({
    type: 'string',
  })
  home: string;

  @property({
    type: 'string',
  })
  homeScore: string;

  @property({
    type: 'string',
  })
  homeLogo: string;

  @property({
    type: 'string',
  })
  url: string;

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Scores>) {
    super(data);
  }
}

export interface ScoresResponse {
  schedule: {
    awayTeam: {
      abbreviation: string;
    };
    homeTeam: {
      abbreviation: string;
    };
  };
  score: {
    awayScoreTotal: string;
    homeScoreTotal: string;
  };
}

export interface ScoresRelations {
  // describe navigational properties here
}

export type ScoresWithRelations = Scores & ScoresRelations;
