import EmberRouter from '@ember/routing/router';
import config from 'comunica-sparql-ember/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('custom-query');
  this.route('data');
  this.route('upload');
});
