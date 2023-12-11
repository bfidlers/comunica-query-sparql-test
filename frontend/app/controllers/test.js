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
  async compareBindings(stream, expected) {
    let result = '';
    const bindings = await stream.toArray();
    let i = 0;
    bindings.map((b) => {
      let expected_line = JSON.stringify(expected[i], null, 2);

      if (b.toString() != expected_line) {
        this.output += `<div class="incorrect">${b.toString()}</div>`
        this.expected_output += `<div class="incorrect">${expected_line}</div>`
      }
      else {
        this.output += b.toString();
        this.expected_output += expected_line;
      }
      result += b.toString() + ',\n';
      i++;
    });
    result = result.slice(0, -2);
    console.log('"expected_output" : [\n' + result + ']');
  }

  @action
  async executeQuery(query) {
    this.last_query = query.query;
    const bindingsStream = await myEngine.queryBindings(query.query, {
      sources: [query.source],
    });

    this.compareBindings(bindingsStream, query.expected_output);
  }
}
