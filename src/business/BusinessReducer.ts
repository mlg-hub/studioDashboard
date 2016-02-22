import {List} from 'immutable';
import {Map} from 'immutable';
import * as BusinessAction from './BusinessAction';
import businessesReducer from '../business/BusinessesReducer';
import {BusinessModel} from "./BusinesModel";

export function business(state:Map<string,any> = Map<string,any>(), action:any):Map<string,any> {

    switch (action.type) {
        case BusinessAction.REQUEST_BUSINESSES:
            return state;

        case BusinessAction.RECEIVE_BUSINESSES:
            var businesses:List<BusinessModel> = state.getIn(['businesses'])
            var list:List<BusinessModel> = businessesReducer(businesses, action);
            return state.setIn(['businesses'], list);

        case BusinessAction.RECEIVE_BUSINESSES_STATS:
            return state.setIn(['businessStats'], action.stats);

        case BusinessAction.SET_BUSINESS_DATA:
            var businesses:List<BusinessModel> = state.getIn(['businesses'])
            var list:List<BusinessModel> = businessesReducer(businesses, action);
            return state.setIn(['businesses'], list);

        //case 'REMOVE':
        //    return List<BusinessModel>(state.filter((i: BusinessModel) => i.uuid !== action.itemId));
        default:
            return state;
    }
}