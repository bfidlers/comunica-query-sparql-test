import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { QueryEngine } from '@comunica/query-sparql';
import N3 from 'n3';

const myEngine = new QueryEngine();
const store = new N3.Store();

export default class CustomQueryController extends Controller {
  @tracked output = '';
  @tracked previous_output = '';
  @tracked custom_query = `
  SELECT ?s ?p ?o WHERE {
    ?s ?p ?o.
  }`;
  @tracked source = 'data.ttl';

  async updateOutput(value) {
    this.previous_output = this.output;
    this.output = value;
  }

  @action
  async executeQuery(event) {
    event.preventDefault();

    const result = await myEngine.query(this.custom_query, {
      sources: ['http://localhost:4200/turtle/' + this.source],
      destination: store,
    });

    const stream = await result.execute();
    switch (result.resultType) {
      case 'bindings': {
        let output = '';
        const bindings = await stream.toArray();
        bindings.map((b) => {
          output += b.toString();
        });
        this.updateOutput(output);
        break;
      }
      case 'quads': {
        let output = '';
        const bindings = await stream.toArray();
        bindings.map((quad) => {
          output += '{\n';
          output += 's:' + quad.subject.value + '\n';
          output += 'p:' + quad.predicate.value + '\n';
          output += 'o:' + quad.object.value + '\n';
          output += 'g:' + quad.graph.value + '\n';
          output += '}\n';
        });
        this.updateOutput(output);
        break;
      }
      case 'boolean':
        this.updateOutput(`Result of the query is: ${stream}`);
        break;
      case 'void':
        this.updateOutput(
          `Data was successfully written, store size is now: ${store.size}`,
        );
    }
  }

  @action
  setSource(source) {
    this.source = source;
  }
}
