///<reference path="../../headers/common.d.ts" />

import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import {Variable, assignModelProperties} from './variable';
import {VariableSrv, variableConstructorMap} from './variable_srv';

export class IntervalVariable implements Variable {
  auto_count: number;
  auto_min: number;
  options: any;
  auto: boolean;
  query: string;
  refresh: number;

  defaults = {
    type: 'interval',
    name: '',
    hide: 0,
    label: '',
    refresh: 2,
    options: [],
    current: {text: '', value: ''},
    query: '1m,10m,30m,1h,6h,12h,1d,7d,14d,30d',
    auto: false,
    auto_min: '10s',
    auto_count: 30,
  };

  /** @ngInject */
  constructor(private model, private timeSrv, private templateSrv, private variableSrv) {
    assignModelProperties(this, model, this.defaults);
    this.refresh = 2;
  }

  getModel() {
    assignModelProperties(this.model, this, this.defaults);
    return this.model;
  }

  setValue(option) {
    this.updateAutoValue();
    return this.variableSrv.setOptionAsCurrent(this, option);
  }

  updateAutoValue() {
    if (!this.auto) {
      return;
    }

    // add auto option if missing
    if (this.options.length && this.options[0].text !== 'auto') {
      this.options.unshift({ text: 'auto', value: '$__auto_interval' });
    }

    var interval = kbn.calculateInterval(this.timeSrv.timeRange(), this.auto_count, (this.auto_min ? ">"+this.auto_min : null));
    this.templateSrv.setGrafanaVariable('$__auto_interval', interval);
  }

  updateOptions() {
   // extract options in comma separated string
    this.options = _.map(this.query.split(/[,]+/), function(text) {
      return {text: text.trim(), value: text.trim()};
    });

    this.updateAutoValue();
    return this.variableSrv.validateVariableSelectionState(this);
  }

  dependsOn(variable) {
    return false;
  }

  setValueFromUrl(urlValue) {
    this.updateAutoValue();
    return this.variableSrv.setOptionFromUrl(this, urlValue);
  }
}

variableConstructorMap['interval'] = IntervalVariable;