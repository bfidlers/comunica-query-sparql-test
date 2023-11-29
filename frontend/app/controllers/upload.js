import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class ExampleController extends Controller {
  @action
  async uploadPhoto(file) {
    const data = await file.readAsDataURL();

    let json = {name: file.file.name, data: data};

    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
    });
  }
}
