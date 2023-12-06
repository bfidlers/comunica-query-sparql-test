import Route from '@ember/routing/route';

export default class CustomQueryRoute extends Route {
  async model() {
    let response = await fetch('http://localhost:3000/files');
    let parsed = await response.json();
    return parsed.fileNames;
  }
}
