import Controller from '@ember/controller';
import { action } from '@ember/object';
import { QueryEngine } from '@comunica/query-sparql';

const myEngine = new QueryEngine();

export default class DataController extends Controller {
  @action
  async outputBindings(stream) {
    let result = '"expected_output" : [';
    const bindings = await stream.toArray();
    bindings.map((b) => {
      result += b.toString() + ',';
    });
    result = result.slice(0, -1);
    result += ']';
    console.log(result);
  }

  @action
  async executeQuery() {
    const bindingsStream = await myEngine.queryBindings(this.model.query, {
      sources: [this.model.source],
    });

    this.outputBindings(bindingsStream);
  }
}
