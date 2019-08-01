// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BoundValue,
  Constructor,
  ContextView,
  inject,
  MetadataInspector,
} from '@loopback/context';

/**
 * `@service` injects a service with matching class
 * @param serviceClass - Constructor for the service. If not provided, try to
 * infer it from the design:type
 */
export function service(serviceClass?: Constructor<unknown>) {
  return function serviceInjectionDecorator(
    target: Object,
    member: string,
    methodDescriptorOrParameterIndex?:
      | TypedPropertyDescriptor<BoundValue>
      | number,
  ) {
    return inject('', {decorator: '@service'}, ctx => {
      let serviceType: Function | undefined = serviceClass;
      if (!serviceType) {
        if (typeof methodDescriptorOrParameterIndex === 'number') {
          serviceType = MetadataInspector.getDesignTypeForMethod(target, member)
            .parameterTypes[methodDescriptorOrParameterIndex];
        } else {
          serviceType = MetadataInspector.getDesignTypeForProperty(
            target,
            member,
          );
        }
      }
      if (serviceType === Object || serviceType === Array) {
        throw new Error('Service class cannot be inferred from design type');
      }
      const view = new ContextView(
        ctx,
        binding => binding.valueConstructor === serviceType,
      );
      return view.singleValue();
    })(target, member, methodDescriptorOrParameterIndex);
  };
}
