import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DropDown extends Component {
  @tracked value = this.args.default;

  @action
  updateValue(event) {
    this.value = event.target.value;
    this.args.callback(this.value);
  }
}
