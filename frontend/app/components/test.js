import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { QueryEngine } from '@comunica/query-sparql';

const myEngine = new QueryEngine();

export default class TestComponent extends Component {
  @tracked last_query = '';
  @tracked output = '';
  @tracked expected_output = '';

  @tracked query_executed = false;
  @tracked query_result = '';

  @tracked css_class = 'collapsible';
  @tracked isShowingBody = false;

  @action
  async toggleBody() {
    this.isShowingBody = this.isShowingBody ? false : true;
    this.css_class = this.css_class == 'collapsible' ? 'open' : 'collapsible';
  }

  @action
  async compareBindings(stream, expected) {
    let result = '';
    let errors = false;
    const bindings = await stream.toArray();
    let i = 0;
    bindings.map((b) => {
      let expected_line = JSON.stringify(expected[i], null, 2);

      if (b.toString() != expected_line) {
        this.output += `<div class="incorrect">${b.toString()}</div>`
        this.expected_output += `<div class="incorrect">${expected_line}</div>`
        errors = true;
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

    this.query_result = errors
      ? '<span class="red-text">Query resulted in an unexpected response, please check the output with the expected output below.</span>'
      : '<span class="green-text">Query resulted in the expected outcome.</span>';
  }

  @action
  async executeQuery(query) {
    this.last_query = this.jsonArrayToString(query.query);

    const result = await myEngine.query(this.last_query, {
      sources: [query.source],
    });

    const stream = await result.execute();
    switch (result.resultType) {
      case 'bindings': {
        // query.expected_output = '';
        this.compareBindings(stream, query.expected_output);
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
    this.query_executed = true;
  }

  jsonArrayToString(array) {
    let result = '';
    for (const elem of array) {
      result += elem + '\n';
    }
    result = result.slice(0, -1);
    return result;
  }
}
