import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class TestController extends Controller {
  @action
  async runTestSuite() {
    this.toggleProperty("testInitiated");
  }
}
