import Controller from '@ember/controller';
import { action } from '@ember/object';
import { QueryEngine } from '@comunica/query-sparql';

export default class ApplicationController extends Controller {
  @action
  async queryAll() {
    const myEngine = new QueryEngine();

    const bindingsStream = await myEngine.queryBindings(
      `
        SELECT ?s ?p ?o WHERE {
          ?s ?p ?o.
        }
        LIMIT 10`,
      {
        sources: [{ type: 'file', value: 'http://localhost:4200/data.ttl' }],
      },
    );

    bindingsStream.on('data', (binding) => {
      console.log(binding.toString());
    });
  }
}
