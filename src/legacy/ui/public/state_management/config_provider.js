/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @name stateManagementConfig
 *
 * @description Allows apps to configure state management
 */

import { uiModules } from '../modules';

export class StateManagementConfigProvider {
  _enabled = true

  $get(/* inject stuff */) {
    return {
      enabled: this._enabled,
    };
  }

  disable() {
    this._enabled = false;
  }

  enable() {
    this._enabled = true;
  }
}

uiModules.get('kibana/state_management')
  .provider('stateManagementConfig', StateManagementConfigProvider);
