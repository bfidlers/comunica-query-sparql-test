import Route from '@ember/routing/route';

export default class CustomQueryRoute extends Route {
  async model() {
    let response = await fetch('/turtle/files.json');
    let parsed = await response.json();
    return parsed.fileNames;
  }
}
