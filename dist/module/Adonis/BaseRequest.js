"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRequest = void 0;
/**
 * BaseRequest class
 * This class is used to create a base request class for Adonis Applications
 * Avoid overriding the non on* methods like updateOrCreate, delete.
 * The on* methods are hooks that can be overriden by the extended classes.
 */
class BaseRequest {
    constructor(ctx, Model) {
        this.idColumn = 'id';
        this.ctx = ctx;
        this.Model = Model;
        const { id = null, entity, data = {} } = this.ctx.request.all();
        this.entity = entity;
        this.id = id;
        this.data = data;
        if (!this.Model) {
            throw new Error('Model is required.');
        }
    }
    validate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.entity) {
                throw new Error('Entity is required.');
            }
            if (this.entity !== new this.Model().constructor.name) {
                throw new Error('Invalid entity.');
            }
        });
    }
    /**
     * This method is used to delete the blank _path keys on the data object to avoid clearing
     * the _path on the instance object when we don't want to update them or didn't passed the path again.
     */
    clearBlankPathKeysOnData() {
        Object.keys(this.data).map((key) => {
            if (key.includes('_path') && !this.data[key]) {
                delete this.data[key];
            }
        });
    }
    onLoadInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            this.instance = yield this.Model.findBy(this.idColumn, this.id);
        });
    }
    /**
     * onMiddleware hook
     * This method is called before the updateOrCreate and delete methods
     */
    onMiddleware() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * This method should be implemented on the updateOrCreate endpoint
     *
     * The updateOrCreate chain is:
     *  - onLoadInstance
     *  - beforeUpdate
     *    - validate
     *    - onMiddleware
     *    - onBeforeUpdate
     *    - clearBlankPathKeysOnData
     *  - persist
     *    - onUpdate
     *    - onCreate
     *  - afterUpdate
     *     - onAfterUpdate
     *
     */
    updateOrCreate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.id) {
                yield this.onLoadInstance();
            }
            yield this.beforeUpdate();
            yield this.persist();
            yield this.afterUpdate();
        });
    }
    beforeUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.validate();
            yield this.onMiddleware();
            yield this.onBeforeUpdate();
            this.clearBlankPathKeysOnData();
        });
    }
    onBeforeUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    persist() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.id && this.instance) {
                yield this.onUpdate();
            }
            else {
                yield this.onCreate();
            }
        });
    }
    onUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = this.instance.getFillableKeys(this.data);
            this.instance.merge(Object.assign({}, data));
            yield this.instance.save();
        });
    }
    onCreate() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = this.instance.getFillableKeys(this.data);
            this.instance = yield this.Model.create(data);
        });
    }
    afterUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    onAfterUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * This method should be implemented on the delete endpoint
     * The delete chain is:
     *  - onLoadInstance
     *  - beforeDelete
     *    - validate
     *    - onMiddleware
     *    - onBeforeDelete
     *  - onDelete
     *  - afterDelete
     *    - onAfterDelete
     */
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.id) {
                yield this.onLoadInstance();
            }
            yield this.beforeDelete();
            if (!this.id) {
                throw new Error('Id is required.');
            }
            if (!this.instance) {
                throw new Error('Instance not found.');
            }
            yield this.onDelete();
            yield this.afterDelete();
        });
    }
    beforeDelete() {
        return __awaiter(this, void 0, void 0, function* () {
            this.validate();
            yield this.onMiddleware();
            yield this.onBeforeDelete();
        });
    }
    onBeforeDelete() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    onDelete() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.instance.delete();
        });
    }
    afterDelete() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.onAfterDelete();
        });
    }
    onAfterDelete() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.BaseRequest = BaseRequest;
