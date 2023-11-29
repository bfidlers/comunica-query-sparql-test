import Route from '@ember/routing/route';

export default class DataRoute extends Route {
  async model() {
    let response = await fetch('/turtle/files.json');
    let parsed = await response.json();
    let fileNames = parsed.fileNames;

    let result = {};
    result.fileNames = fileNames;

    fileNames.forEach(async (fileName) => {
      let fileResponse = await fetch('turtle/' + fileName);
      let fileParsed = await fileResponse.text();
      result[fileName] = fileParsed;
    });

    return result;
  }
}
