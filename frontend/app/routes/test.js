import Route from '@ember/routing/route';

export default class TestRoute extends Route {
  async model() {
    let response = await fetch('http://localhost:3000/queries/select_queries.json');
    let parsed = await response.json();

    return parsed;
  }
}
