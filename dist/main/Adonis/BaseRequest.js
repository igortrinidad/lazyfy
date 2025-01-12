"use strict";
// import type { HttpContext } from '@adonisjs/core/http'
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
    async validate() {
        if (!this.entity) {
            throw new Error('Entity is required.');
        }
        if (this.entity !== new this.Model().constructor.name) {
            throw new Error('Invalid entity.');
        }
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
    async onLoadInstance() {
        this.instance = await this.Model.findBy(this.idColumn, this.id);
    }
    /**
     * onMiddleware hook
     * This method is called before the updateOrCreate and delete methods
     */
    async onMiddleware() {
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
    async updateOrCreate() {
        if (this.id) {
            await this.onLoadInstance();
        }
        await this.beforeUpdate();
        await this.persist();
        await this.afterUpdate();
    }
    async beforeUpdate() {
        this.validate();
        await this.onMiddleware();
        await this.onBeforeUpdate();
        this.clearBlankPathKeysOnData();
    }
    async onBeforeUpdate() {
    }
    async persist() {
        if (this.id && this.instance) {
            await this.onUpdate();
        }
        else {
            await this.onCreate();
        }
    }
    async onUpdate() {
        const data = this.instance.getFillableKeys(this.data);
        this.instance.merge({ ...data });
        await this.instance.save();
    }
    async onCreate() {
        const data = this.instance.getFillableKeys(this.data);
        this.instance = await this.Model.create(data);
    }
    async afterUpdate() {
    }
    async onAfterUpdate() {
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
    async delete() {
        if (this.id) {
            await this.onLoadInstance();
        }
        await this.beforeDelete();
        if (!this.id) {
            throw new Error('Id is required.');
        }
        if (!this.instance) {
            throw new Error('Instance not found.');
        }
        await this.onDelete();
        await this.afterDelete();
    }
    async beforeDelete() {
        this.validate();
        await this.onMiddleware();
        await this.onBeforeDelete();
    }
    async onBeforeDelete() {
    }
    async onDelete() {
        await this.instance.delete();
    }
    async afterDelete() {
        await this.onAfterDelete();
    }
    async onAfterDelete() {
    }
}
exports.BaseRequest = BaseRequest;
