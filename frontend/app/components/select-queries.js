import Component from '@glimmer/component';
import { action } from '@ember/object';
import { QueryEngine } from '@comunica/query-sparql';

const myEngine = new QueryEngine();

const dataFile = 'http://localhost:3000/turtle/data.ttl';
const expensesFile = 'http://localhost:3000/turtle/expenses.ttl';
const personFile = 'http://localhost:3000/turtle/person.ttl';

export default class SelectQueries extends Component {
  @action
  async queryAll() {
    this.last_query = `
    SELECT ?s ?p ?o WHERE {
      ?s ?p ?o.
    }`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [dataFile],
    });

    this.args.streamOutput(bindingsStream);
  }

  @action
  async queryLimit() {
    this.last_query = `
    SELECT ?s ?p ?o WHERE {
      ?s ?p ?o.
    }
    LIMIT 2`;
    const bindingsStream = await myEngine.queryBindings(this.last_query, {
      sources: [dataFile],
    });

    this.args.streamOutput(bindingsStream);
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
      sources: [dataFile],
    });

    this.args.streamOutput(bindingsStream);
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
      sources: [dataFile],
    });

    this.args.streamOutput(bindingsStream);
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
      sources: [expensesFile],
    });

    this.args.streamOutput(bindingsStream);
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
      sources: [expensesFile],
    });

    this.args.streamOutput(bindingsStream);
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
      sources: [personFile],
    });

    this.args.streamOutput(bindingsStream);
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
      sources: [personFile],
    });

    this.args.streamOutput(bindingsStream);
  }
}
