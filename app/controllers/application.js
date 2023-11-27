import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { QueryEngine } from '@comunica/query-sparql';

const myEngine = new QueryEngine();

export default class ApplicationController extends Controller {
  @tracked output = '';
  @tracked previous_output = '';

  async updateOutput(stream) {
    let result = '';
    const bindings = await stream.toArray();
    bindings.map((b) => {
      result += b.toString();
    });

    this.previous_output = this.output;
    this.output = result;
  }

  // select queries

  @action
  async queryAll() {
    const bindingsStream = await myEngine.queryBindings(
      `
      SELECT ?s ?p ?o WHERE {
        ?s ?p ?o.
      }
      LIMIT 10`,
      {
        sources: [
          { type: 'file', value: 'http://localhost:4200/turtle/data.ttl' },
        ],
      },
    );

    this.updateOutput(bindingsStream);
  }

  @action
  async queryLimit() {
    const bindingsStream = await myEngine.queryBindings(
      `
      SELECT ?s ?p ?o WHERE {
        ?s ?p ?o.
      }
      LIMIT 2`,
      {
        sources: [
          { type: 'file', value: 'http://localhost:4200/turtle/data.ttl' },
        ],
      },
    );

    this.updateOutput(bindingsStream);
  }

  @action
  async queryOrdered() {
    const bindingsStream = await myEngine.queryBindings(
      `
      SELECT ?s ?p ?o WHERE {
        ?s ?p ?o.
      }
      ORDER BY ?s
      LIMIT 5`,
      {
        sources: [
          { type: 'file', value: 'http://localhost:4200/turtle/data.ttl' },
        ],
      },
    );

    this.updateOutput(bindingsStream);
  }

  @action
  async queryOffset() {
    const bindingsStream = await myEngine.queryBindings(
      `
      SELECT ?s ?p ?o WHERE {
        ?s ?p ?o.
      }
      ORDER BY ?s
      LIMIT 5
      OFFSET 2`,
      {
        sources: [
          { type: 'file', value: 'http://localhost:4200/turtle/data.ttl' },
        ],
      },
    );

    this.updateOutput(bindingsStream);
  }

  @action
  async queryGroupAggregate() {
    const bindingsStream = await myEngine.queryBindings(
      `
      SELECT ?category (sum(?price) AS ?total)
      WHERE {
          ?expense <http://mu.semte.ch/vocabularies/ext/category> ?category ;
                   <http://mu.semte.ch/vocabularies/ext/amount> ?price .
      }
      GROUP BY ?category`,
      {
        sources: [
          { type: 'file', value: 'http://localhost:4200/turtle/expenses.ttl' },
        ],
      },
    );

    this.updateOutput(bindingsStream);
  }

  @action
  async queryNested() {
    const bindingsStream = await myEngine.queryBindings(
      `
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
      GROUP BY ?category`,
      {
        sources: [
          { type: 'file', value: 'http://localhost:4200/turtle/expenses.ttl' },
        ],
      },
    );

    this.updateOutput(bindingsStream);
  }

  @action
  async queryBind() {
    const bindingsStream = await myEngine.queryBindings(
      `
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
      }`,
      {
        sources: [
          { type: 'file', value: 'http://localhost:4200/turtle/persons.ttl' },
        ],
      },
    );

    this.updateOutput(bindingsStream);
  }

  @action
  async queryValues() {
    const bindingsStream = await myEngine.queryBindings(
      `
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      SELECT ?name ?born ?died WHERE {
        VALUES ?id {ext:person1 ext:person2}
        ?id ext:name ?name;
            ext:birthdate ?born;
            ext:deathdate ?died;
      } `,
      {
        sources: [
          { type: 'file', value: 'http://localhost:4200/turtle/persons.ttl' },
        ],
      },
    );

    this.updateOutput(bindingsStream);
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

    this.previous_output = this.output;
    this.output = result;
  }

  @action
  async constructExternalSource() {
    const quadStream = await myEngine.queryQuads(
      `
      CONSTRUCT WHERE {
        ?s ?p ?o
      }
      LIMIT 10`,
      {
        sources: ['http://fragments.dbpedia.org/2015/en'],
      },
    );

    this.outputQuads(quadStream);
  }
}
