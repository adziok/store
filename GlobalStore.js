import { EventEmitter } from './EventEmiter'

class SubStore {
    constructor([actions, effects]) {
        this.actions = actions;
        this.store = {};
        this.effects = effects;
        this.eventEmitter = new EventEmitter();
        this.aaa = [];
    }

    dispatch(type, data) {
        this.effects[this.actions[type]].func(this.updateStore.bind(this), data);
    }

    subscribe(func) {
        return this.eventEmitter.on('change', () => func(this.store));
    }

    getAndSubscribe(func) {
        func(this.store)
        return this.eventEmitter.on('change', () => func(this.store));
    }
    
    updateStore(store) {
        this.store = { ...this.store, ...store };
        this.eventEmitter.emit('change');
    }

    // unsubscribe(eventName) {
    //     return
    // }
}

export class GlobalStore {
    constructor() {
        this.store = {};
    }

    add(name, storeData) {
        this.store[name] = name && storeData && new SubStore(storeData) || new Error('Global store error');
    }

    select(name) {
        return this.store[name] || new Error('No store found');
    }
}

export const createAction = type => type;

export class Effect {
    constructor(type, func) {
        this.type = type;
        this.func = function(updateStore, data) {
            return func.apply(this, [this.succcess(updateStore), this.fail(updateStore), data]);
        }
    }

    onSuccess(func) {
        this.succcess = updateStore => function() {
            return func.apply(this, [{ data: arguments[0], updateStore }]);
        }

        return this;
    }

    onFailure(func) {
        this.fail = updateStore => function() {
            return func.apply(this, [{ data: arguments[0], updateStore }]);
        }
        return this;
    }

}

export const createSubStore = (types, effects) => {
    const effectTypes = effects.map(({ type }) => type);

    return compareTwoArraysIdentity(types, effectTypes) &&
        [
            types.reduce((prev, next, i) => ({ ...prev, [next]: i }), {}),
            effects,
        ]
        ||
        new Error('Create Sub Store Error')
}

const compareTwoArraysIdentity = (arr1, arr2) => {
    const a = [];
    arr1.forEach(k => !arr2.includes(k) && a.push(k));
    arr2.forEach(k => !arr1.includes(k) && a.push(k));

    return a.length > 0 && new Error('Effects and Actions not identity') || true;
}
