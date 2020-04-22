import {Client, expect} from '@loopback/testlab';
import {FancaveGraphqlApplication} from '../..';
import {setupApplication} from './test-helper';

describe('SportsController', () => {
  let app: FancaveGraphqlApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('retrieve all news from a league GET /api/list/news?league=nba', async () => {
    const res = await client.get('/api/list/news?league=nba').expect(200);
    expect(res.body[0]).to.have.property('title');
  });

  it('retrieve all players from a team GET /api/list/players?league=nba&team=tor', async () => {
    const res = await client.get('/api/list/players?league=nba&team=tor').expect(200);
    expect(res.body[0]).to.have.property('position');
  });

  it('retrieve scores from a league on a specified date GET /api/team/scores?league=nba&season=2019-2020-regular&date=20200306', async () => {
    const res = await client.get('/api/team/scores?league=nba&season=2019-2020-regular&date=20200306').expect(200);
    expect(res.body[0]).to.have.property('homeScore');
  });

  it('retrieve all teams from a league GET /api/list/team?league=nba', async () => {
    const res = await client.get('/api/list/team?league=nba').expect(200);
    expect(res.body[0]).to.have.property('arena');
  });

  it('retrieve single team from a league GET /api/list/team?league=nba&team=tor', async () => {
    const res = await client.get('/api/list/team?league=nba&team=tor').expect(200);
    expect(res.body[0]).to.have.property('arena');
  });
});
