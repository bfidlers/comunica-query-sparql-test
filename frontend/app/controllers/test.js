import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { QueryEngine } from '@comunica/query-sparql';

const myEngine = new QueryEngine();

export default class DataController extends Controller {
  @tracked last_query = '';
  @tracked output = '';
  @tracked expected_output = '';

  @action
  async outputBindings(stream) {
    let result = '';
    const bindings = await stream.toArray();
    bindings.map((b) => {
      result += b.toString() + ',\n';
    });
    result = result.slice(0, -2);
    this.output = result;
    console.log('"expected_output" : [\n' + result + ']');
  }

  @action
  async executeQuery(query) {
    this.last_query = query.query;
    this.expected_output = this.jsonArrayToString(query.expected_output);
    const bindingsStream = await myEngine.queryBindings(query.query, {
      sources: [query.source],
    });

    this.outputBindings(bindingsStream);
  }

  jsonArrayToString(array) {
    let result = '';
    for (const elem of array) {
      result += JSON.stringify(elem, null, 2) + ',\n';
    }
    result = result.slice(0, -2);
    return result;
  }
}
