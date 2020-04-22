import {model, property, Model} from '@loopback/repository';

@model({settings: {strict: false}})
export class Team extends Model {
  @property({
    type: 'string',
  })
  arena?: string;

  @property({
    type: 'string',
  })
  city?: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
  })
  league?: string;

  @property({
    type: 'string',
  })
  logo?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  shortname?: string;

  @property({
    type: 'string',
  })
  lat?: string;

  @property({
    type: 'string',
  })
  long?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Team>) {
    super(data);
  }
}

export interface TeamRelations {
  // describe navigational properties here
}

export type TeamWithRelations = Team & TeamRelations;
