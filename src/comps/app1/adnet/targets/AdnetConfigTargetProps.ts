import {Component, ChangeDetectionStrategy, Input, ChangeDetectorRef} from "@angular/core";
import {FormControl, FormGroup, FormBuilder} from "@angular/forms";
import * as _ from "lodash";
import {List} from 'immutable';
import {Lib} from "../../../../Lib";
import {AdnetActions} from "../../../../adnet/AdnetActions";
import {AppStore} from "angular2-redux-util";
import {AdnetCustomerModel} from "../../../../adnet/AdnetCustomerModel";
import {AdnetTargetModel} from "../../../../adnet/AdnetTargetModel";
import {AdnetRateModel} from "../../../../adnet/AdnetRateModel";
import AdnetConfigTargetPropsTemplate from './AdnetConfigTargetProps.html!text';

@Component({
    selector: 'AdnetConfigTargetProps',
    moduleId: __moduleName,
    template: AdnetConfigTargetPropsTemplate,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(input-blur)': 'onChangeSharing($event)'
    },
    styles: [`
        .material-switch {
            position: relative;
            padding-top: 10px;
        }
        .btn-group {
            width: 100%;
        }
        .input-group {
            padding-top: 10px;
        }
        
        i {
            width: 20px;
        }
    `]
})

export class AdnetConfigTargetProps {

    constructor(private fb: FormBuilder,
                private appStore: AppStore,
                private cd: ChangeDetectorRef,
                private adnetAction: AdnetActions) {

        this['me'] = Lib.GetCompSelector(this.constructor)

        this.contGroup = fb.group({
            'enabled': [''],
            'label': [''],
            'rateId': [''],
            'keys': [''],
            'targetDomain': [''],
            'locationLat': [''],
            'locationLng': [''],
            'targetType': [''],
            'comments': [''],
            'standardTimeOffset': [''],
            'url': ['']
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
    }

    ngOnInit() {
        var i_adnet = this.appStore.getState().adnet;
        this.rates = i_adnet.getIn(['rates']);
        this.unsub = this.appStore.sub((i_rates: List<AdnetRateModel>) => {
            this.rates = i_rates;
            this.updFilteredRates();
        }, 'adnet.rates');
        this.updFilteredRates();
    }

    @Input()
    set adnetTargetModel(i_adnetTargetModel: AdnetTargetModel) {
        this.targetModel = i_adnetTargetModel;
        this.renderFormInputs();
    }

    @Input()
    adnetCustomerModel: AdnetCustomerModel

    private unsub: Function;
    private rates: List<AdnetRateModel> = List<AdnetRateModel>();
    private filteredRates: List<AdnetRateModel> = List<AdnetRateModel>();
    private targetModel: AdnetTargetModel;
    private contGroup: FormGroup;
    private formInputs = {};


    private isWebLocation(): boolean {
        if (!this.targetModel || this.targetModel.getTargetType() == "0")
            return true;
        return false;
    }

    private updFilteredRates() {
        if (this.rates && this.adnetCustomerModel) {
            this.filteredRates = List<AdnetRateModel>();
            this.rates.forEach((i_adnetRateModel: AdnetRateModel) => {
                if (i_adnetRateModel.customerId() == this.adnetCustomerModel.customerId()) {
                    this.filteredRates = this.filteredRates.push(i_adnetRateModel)
                }
            })
        }
        this.cd.markForCheck();
    }

    private getSelectedRate(adnetRateModel: AdnetRateModel) {
        if (!adnetRateModel)
            return;
        if (adnetRateModel.getId() == this.targetModel.getRateId())
            return 'selected'
        return '';
    }

    private onChangeSharing(event) {
        this.updateSore();
    }

    private updateSore() {
        setTimeout(() => {
            let payload = Lib.CleanCharForXml(this.contGroup.value);
            payload.customerId = this.adnetCustomerModel.customerId();
            this.appStore.dispatch(this.adnetAction.saveTargetInfo(payload, this.targetModel.getId()))
        }, 1)
    }

    private renderFormInputs() {
        if (!this.targetModel)
            return;
        _.forEach(this.formInputs, (value, key: string) => {
            if (key=='rateId') // don't set <select/> controls as will cause odd bugs in selections when using List
                return;
            var data = this.targetModel.getKey('Value')[key];
            this.formInputs[key].setValue(data)
        });
    };

    ngOnDestroy() {
        this.unsub();
    }
}