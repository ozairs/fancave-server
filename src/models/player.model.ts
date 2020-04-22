import {model, property, Model} from '@loopback/repository';

@model({settings: {strict: false}})
export class Player extends Model {
  @property({
    type: 'string',
  })
  playerId: string;

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
  })
  position: string;

  @property({
    type: 'string',
  })
  league: string;

  @property({
    type: 'string',
  })
  team: string;

  @property({
    type: 'string',
  })
  school: string;

  @property({
    type: 'string',
  })
  birthplace: string;

  @property({
    type: 'string',
  })
  picture: string;

  @property({
    type: 'string',
  })
  twitter: string;

  @property({
    type: 'string',
  })
  logo: string;

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Player>) {
    super(data);
  }
}

// export interface PlayerListResponse {
//   [key: string]: PlayerResponse;
//   [index: number]: PlayerResponse;
// }

export interface PlayerResponse {
  player: {
    id: string;
    firstName: string;
    lastName: string;
    currentTeam: {
      abbreviation: string;
    };
    primaryPosition: string;
    college: string;
    birthCity: string;
    birthCountry: string;
    officialImageSrc: string;
    socialMediaAccounts: {
      [index: number]: {
        value: string;
      };
    };
  };
}

export interface PlayersItem {
  playerId: string;
  name: string;
  position: string;
  league: string;
  team: string;
  school: string;
  birthplace: string;
  picture: string;
  twitter: string;
  logo: string;
}

export interface PlayerRelations {
  // describe navigational properties here
}

export type PlayerWithRelations = Player & PlayerRelations;
