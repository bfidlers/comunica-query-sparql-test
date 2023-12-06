import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { QueryEngine } from '@comunica/query-sparql';
import N3 from 'n3';

const myEngine = new QueryEngine();
const store = new N3.Store();

const peopleFile = 'http://localhost:3000/turtle/people.ttl';
const personFile = 'http://localhost:3000/turtle/person.ttl';

export default class IndexController extends Controller {
  @tracked output = '';
  @tracked previous_output = '';
  @tracked ask_result = '';
  @tracked last_query = '';

  @tracked css_class = 'collapsible';

  async updateOutput(value) {
    this.previous_output = this.output;
    this.output = value;
  }

  // select queries

  @action
  async toggleSelectSection() {
    this.toggleProperty('isShowingBody');
    this.css_class = this.css_class == 'collapsible' ? 'open' : 'collapsible';
  }

  @action
  async outputBindings(stream) {
    let result = '';
    const bindings = await stream.toArray();
    bindings.map((b) => {
      result += b.toString();
    });

    this.updateOutput(result);
  }

  // Construct queries

  async outputQuads(stream) {
    let result = '';
    const bindings = await stream.toArray();
    bindings.map((quad) => {
      result += '{\n';
      result += 's:' + quad.subject.value + '\n';
      result += 'p:' + quad.predicate.value + '\n';
      result += 'o:' + quad.object.value + '\n';
      result += 'g:' + quad.graph.value + '\n';
      result += '}\n';
    });

    this.updateOutput(result);
  }

  @action
  async constructExternalSource() {
    this.last_query = `
    CONSTRUCT WHERE {
      ?s ?p ?o
    }
    LIMIT 10`;
    const quadStream = await myEngine.queryQuads(this.last_query, {
      sources: ['http://fragments.dbpedia.org/2015/en'],
    });

    this.outputQuads(quadStream);
  }

  // Ask queries

  @action
  async askQueryAll() {
    this.last_query = `
    ASK {
      ?s ?p ?o
    }`;
    const hasMatches = await myEngine.queryBoolean(this.last_query, {
      sources: [personFile],
    });

    this.ask_result = hasMatches;
  }

  @action
  async askQueryTrue() {
    this.last_query = `
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    ASK {
      ?s ext:name "Jimmy"
    }`;
    const hasMatches = await myEngine.queryBoolean(this.last_query, {
      sources: [personFile],
    });

    this.ask_result = hasMatches;
  }

  @action
  async askQueryFalse() {
    this.last_query = `
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    ASK {
      ?s ext:name "Walter"
    }`;
    const hasMatches = await myEngine.queryBoolean(this.last_query, {
      sources: [personFile],
    });

    this.ask_result = hasMatches;
  }

  // Queries with store

  @action
  async queryStore() {
    this.last_query = `
    SELECT ?s ?p ?o WHERE {
      ?s ?p ?o.
    }
    `;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [store],
    });

    this.outputBindings(bindingsStream);
  }

  @action
  async insertStore() {
    this.last_query = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    INSERT DATA
    {
      <http://example/president25> foaf:givenName "Bill" .
      <http://example/president25> foaf:familyName "McKinley" .
      <http://example/president27> foaf:givenName "Bill" .
      <http://example/president27> foaf:familyName "Taft" .
      <http://example/president42> foaf:givenName "Bill" .
      <http://example/president42> foaf:familyName "Clinton" .
    }
    `;
    await myEngine.queryVoid(this.last_query, {
      sources: [store],
    });

    console.log(store.size);
  }

  @action
  async deleteStore() {
    this.last_query = `
    PREFIX foaf:  <http://xmlns.com/foaf/0.1/>
    DELETE { ?person foaf:familyName 'Taft' }
    WHERE
    {
      ?person foaf:familyName 'Taft'
    }
    `;
    await myEngine.queryVoid(this.last_query, {
      sources: [store],
    });

    console.log(store.size);
  }

  @action
  async deleteInsertStore() {
    this.last_query = `
    PREFIX foaf:  <http://xmlns.com/foaf/0.1/>
    DELETE { ?person foaf:givenName 'Bill' }
    INSERT { ?person foaf:givenName 'William' }
    WHERE
    {
      ?person foaf:givenName 'Bill'
    }
    `;
    await myEngine.queryVoid(this.last_query, {
      sources: [store],
    });

    console.log(store.size);
  }

  @action
  async loadIntoStore() {
    this.last_query = `
    PREFIX foaf:  <http://xmlns.com/foaf/0.1/>
    INSERT
      { ?s ?p ?o }
    WHERE
      { ?s ?p ?o }
    `;
    await myEngine.queryVoid(this.last_query, {
      sources: [personFile],
      destination: store,
    });

    console.log(store.size);
  }

  @action
  async clearStore() {
    this.last_query = `
    DELETE { ?s ?p ?o }
    WHERE
    {
      ?s ?p ?o
    }
    `;
    await myEngine.queryVoid(this.last_query, {
      sources: [store],
    });

    console.log(store.size);
  }
  // Graph queries with store

  @action
  async querySpecifiedGraph() {
    this.last_query = `
    SELECT ?s ?p ?o WHERE {
      GRAPH <http://example/books>
      {
        ?s ?p ?o.
      }
    }
    `;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [store],
    });

    this.outputBindings(bindingsStream);
  }

  @action
  async insertSpecifiedGraph() {
    this.last_query = `
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    INSERT DATA
    {
      GRAPH <http://example/books>
      {
        <http://example/book1> dc:title "Frankenstein" ;
                               dc:author "Mary Shelley" .
        <http://example/book2> dc:title "Crime and Punishment" ;
                               dc:author "Fyodor Dostoevsky" .
        <http://example/book3> dc:title "The hobbit" ;
                               dc:author "J. R. R. Tolkien" .
      }
    }
    `;
    await myEngine.queryVoid(this.last_query, {
      sources: [store],
    });

    console.log(store.size);
  }

  @action
  async deleteSpecifiedGraph() {
    this.last_query = `
    PREFIX foaf:  <http://xmlns.com/foaf/0.1/>
    WITH <http://example/books>
    DELETE { ?book ?p ?o }
    WHERE
    {
      ?book ?p ?o;
            ?p2 'Crime and Punishment'.
    }
    `;
    await myEngine.queryVoid(this.last_query, {
      sources: [store],
    });

    console.log(store.size);
  }

  @action
  async deleteInsertSpecifiedGraph() {
    this.last_query = `
    PREFIX foaf:  <http://xmlns.com/foaf/0.1/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    DELETE { GRAPH <http://example/books> { ?book dc:title ?title } }
    INSERT { GRAPH <http://example/books> { ?book dc:title 'The Lord of the Rings' } }
    WHERE
    {
      GRAPH <http://example/books>
      {
        ?book ?p 'J. R. R. Tolkien';
        dc:title ?title.
      }
    }
    `;
    await myEngine.queryVoid(this.last_query, {
      sources: [store],
    });

    console.log(store.size);
  }

  @action
  async deleteInsertSpecifiedGraphAlt() {
    this.last_query = `
    PREFIX foaf:  <http://xmlns.com/foaf/0.1/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    WITH <http://example/books>
    DELETE { ?book dc:title ?title }
    INSERT { ?book dc:title 'The Lord of the Rings' }
    WHERE
    {
      ?book ?p 'J. R. R. Tolkien';
      dc:title ?title.
    }
    `;
    await myEngine.queryVoid(this.last_query, {
      sources: [store],
    });

    console.log(store.size);
  }

  @action
  async clearSpecifiedGraph() {
    this.last_query = `
    WITH <http://example/books>
    DELETE { ?s ?p ?o }
    WHERE
    {
      ?s ?p ?o
    }
    `;
    await myEngine.queryVoid(this.last_query, {
      sources: [store],
    });

    console.log(store.size);
  }

  // property paths

  @action
  async queryPathSequence() {
    this.last_query = `
    SELECT ?name WHERE
    {
      ?x foaf:name 'Alice' .
      ?x foaf:knows/foaf:name ?name .
    }
    LIMIT 10`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [peopleFile],
    });

    this.outputBindings(bindingsStream);
  }

  @action
  async queryPathLongSequence() {
    this.last_query = `
    SELECT ?name WHERE
    {
      ?x foaf:name 'Alice' .
      ?x foaf:knows/foaf:knows/foaf:name ?name .
    }
    LIMIT 10`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [peopleFile],
    });

    this.outputBindings(bindingsStream);
  }

  @action
  async queryPathLongSequenceNoDuplicates() {
    this.last_query = `
    SELECT ?name WHERE
    {
      ?x foaf:name 'Alice' .
      ?x foaf:knows/foaf:knows/foaf:name ?name .
      FILTER ( ?x != ?y )
      ?y foaf:name ?name
    }
    LIMIT 10`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [peopleFile],
    });

    this.outputBindings(bindingsStream);
  }

  // Does not work.
  @action
  async inversePathSequence() {
    this.last_query = `
    SELECT ?name WHERE
    {
      ?x foaf:knows/^foaf:knows ?y .
      FILTER(?x != ?y)
      ?y foaf:name ?name
    }
    LIMIT 10`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [peopleFile],
    });

    this.outputBindings(bindingsStream);
  }

  @action
  async inversePropertyPath() {
    this.last_query = `
    SELECT ?x WHERE
    {
      ?x foaf:name 'Alice' .
    }
    LIMIT 10`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [peopleFile],
    });
    this.outputBindings(bindingsStream);
  }

  @action
  async queryPathSequencePlus() {
    this.last_query = `
    SELECT ?name WHERE
    {
      ?x foaf:name 'Alice' .
      ?x (foaf:knows+)/foaf:name ?name .
      FILTER ( ?x != ?y )
      ?y foaf:name ?name
    }
    LIMIT 10`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [peopleFile],
    });

    this.outputBindings(bindingsStream);
  }

  // Does not work.
  @action
  async queryPathSequenceNM() {
    this.last_query = `
    SELECT ?name WHERE
    {
      ?x foaf:name 'Alice' .
      ?x foaf:knows{3,4} /foaf:name ?name .
      FILTER ( ?x != ?y )
      ?y foaf:name ?name
    }
    LIMIT 10`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [peopleFile],
    });

    this.outputBindings(bindingsStream);
  }

  // Does not work.
  @action
  async queryAlternativePath() {
    this.last_query = `
    SELECT ?name WHERE
    {
      ?x foaf:name 'Alice' .
      ?x (foaf:knows|foaf:mightKnow)/foaf:name ?name .
    }
    LIMIT 10`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [peopleFile],
    });
    this.outputBindings(bindingsStream);
  }
}
