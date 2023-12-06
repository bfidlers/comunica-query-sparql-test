import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DataController extends Controller {
  @tracked data;
  @tracked fileName;

  @action
  setData(fileName) {
    this.data = this.model[fileName];
    this.fileName = fileName;
  }
}
