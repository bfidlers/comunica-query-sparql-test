import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { QueryEngine } from '@comunica/query-sparql';
import N3 from 'n3';

const myEngine = new QueryEngine();
const store = new N3.Store();

export default class IndexController extends Controller {
  @tracked output = '';
  @tracked previous_output = '';
  @tracked ask_result = '';
  @tracked last_query = '';

  async updateOutput(value) {
    this.previous_output = this.output;
    this.output = value;
  }

  // select queries

  async outputBindings(stream) {
    let result = '';
    const bindings = await stream.toArray();
    bindings.map((b) => {
      result += b.toString();
    });

    this.updateOutput(result);
  }

  @action
  async queryAll() {
    this.last_query = `
    SELECT ?s ?p ?o WHERE {
      ?s ?p ?o.
    }`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/data.ttl' },
      ],
    });

    this.outputBindings(bindingsStream);
  }

  @action
  async queryLimit() {
    this.last_query = `
    SELECT ?s ?p ?o WHERE {
      ?s ?p ?o.
    }
    LIMIT 2`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/data.ttl' },
      ],
    });

    this.outputBindings(bindingsStream);
  }

  @action
  async queryOrdered() {
    this.last_query = `
    SELECT ?s ?p ?o WHERE {
      ?s ?p ?o.
    }
    ORDER BY ?s
    LIMIT 5`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/data.ttl' },
      ],
    });

    this.outputBindings(bindingsStream);
  }

  @action
  async queryOffset() {
    this.last_query = `
    SELECT ?s ?p ?o WHERE {
      ?s ?p ?o.
    }
    ORDER BY ?s
    LIMIT 5
    OFFSET 2`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/data.ttl' },
      ],
    });

    this.outputBindings(bindingsStream);
  }

  @action
  async queryGroupAggregate() {
    this.last_query = `
    SELECT ?category (sum(?price) AS ?total)
    WHERE {
      ?expense <http://mu.semte.ch/vocabularies/ext/category> ?category ;
               <http://mu.semte.ch/vocabularies/ext/amount> ?price .
    }
    GROUP BY ?category`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/expenses.ttl' },
      ],
    });

    this.outputBindings(bindingsStream);
  }

  @action
  async queryNested() {
    this.last_query = `
    SELECT ?category (sum(?price) AS ?total)
    WHERE {
      ?expense <http://mu.semte.ch/vocabularies/ext/category> ?category ;
               <http://mu.semte.ch/vocabularies/ext/amount> ?price .
      {
        SELECT DISTINCT ?category
        WHERE {
          <http://mu.semte.ch/sessions/3a8c852e-888a-11ee-896a-0242ac14000a> <http://mu.semte.ch/vocabularies/session/account> ?account .
          ?account <http://mu.semte.ch/vocabularies/ext/expense> ?expense .
          ?expense <http://mu.semte.ch/vocabularies/ext/category> ?category .
        }
      }
    }
    GROUP BY ?category`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/expenses.ttl' },
      ],
    });

    this.outputBindings(bindingsStream);
  }

  @action
  async queryBind() {
    this.last_query = `
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    SELECT ?name ?born ?died ?n1 ?n2 ?n3 ?ageInDays ?ageInDays2 ?ageInYears WHERE {
      ?id ext:name ?name;
          ext:birthdate ?born;
          ext:deathdate ?died;
          ext:n1 ?n1;
          ext:n2 ?n2.
      BIND(?n1 - ?n2 AS ?n3).
      BIND(?died - ?born AS ?ageInDays).
      BIND(day(?died) - day(?born) AS ?ageInDays2).
      BIND(year(?died) - year(?born) AS ?ageInYears).
    }`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/persons.ttl' },
      ],
    });

    this.outputBindings(bindingsStream);
  }

  @action
  async queryValues() {
    this.last_query = `
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    SELECT ?name ?born ?died WHERE {
      VALUES ?id {ext:person1 ext:person2}
      ?id ext:name ?name;
          ext:birthdate ?born;
          ext:deathdate ?died;
    } `;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/persons.ttl' },
      ],
    });

    this.outputBindings(bindingsStream);
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
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/persons.ttl' },
      ],
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
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/persons.ttl' },
      ],
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
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/persons.ttl' },
      ],
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
      sources: ['http://localhost:4200/turtle/persons.ttl'],
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
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/people.ttl' },
      ],
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
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/people.ttl' },
      ],
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
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/people.ttl' },
      ],
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
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/people.ttl' },
      ],
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
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/people.ttl' },
      ],
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
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/people.ttl' },
      ],
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
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/people.ttl' },
      ],
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
      sources: [
        { type: 'file', value: 'http://localhost:4200/turtle/people.ttl' },
      ],
    });
    this.outputBindings(bindingsStream);
  }
}
