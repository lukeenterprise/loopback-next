// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {service} from '../..';

describe('@service', () => {
  let ctx: Context;

  beforeEach(givenContext);

  it('injects a service by class argument', async () => {
    class MyController {
      constructor(@service(MyService) public myService: MyService) {}
    }
    ctx.bind('controllers.MyController').toClass(MyController);

    const controller = await ctx.get<MyController>('controllers.MyController');
    expect(controller.myService).to.be.instanceOf(MyService);
  });

  it('injects a service by design type', async () => {
    class MyController {
      constructor(@service() public myService: MyService) {}
    }
    ctx.bind('controllers.MyController').toClass(MyController);

    const controller = await ctx.get<MyController>('controllers.MyController');
    expect(controller.myService).to.be.instanceOf(MyService);
  });

  it('throws error when more than one services are bound', async () => {
    class MyController {
      constructor(@service() public myService: MyService) {}
    }

    ctx.bind('services.MyService2').toClass(MyService);
    ctx.bind('controllers.MyController').toClass(MyController);

    await expect(
      ctx.get<MyController>('controllers.MyController'),
    ).to.be.rejectedWith(/The ContextView has more than one value/);
  });

  it('throws error if the design type cannot be inferred', async () => {
    class MyController {
      constructor(@service() public myService: unknown) {}
    }

    ctx.bind('controllers.MyController').toClass(MyController);

    await expect(
      ctx.get<MyController>('controllers.MyController'),
    ).to.be.rejectedWith(/Service class cannot be inferred from design type/);
  });

  class MyService {}

  function givenContext() {
    ctx = new Context();
    ctx.bind('services.MyService').toClass(MyService);
  }
});
