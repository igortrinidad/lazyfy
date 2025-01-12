/**
 * BaseRequest class
 * This class is used to create a base request class for Adonis Applications
 * Avoid overriding the non on* methods like updateOrCreate, delete.
 * The on* methods are hooks that can be overriden by the extended classes.
 */
export declare abstract class BaseRequest {
    ctx: any;
    Model: any;
    entity: string;
    id: string | null | number;
    data: any;
    instance: any;
    idColumn: string;
    constructor(ctx: any, Model: any);
    validate(): Promise<void>;
    /**
     * This method is used to delete the blank _path keys on the data object to avoid clearing
     * the _path on the instance object when we don't want to update them or didn't passed the path again.
     */
    protected clearBlankPathKeysOnData(): void;
    onLoadInstance(): Promise<void>;
    /**
     * onMiddleware hook
     * This method is called before the updateOrCreate and delete methods
     */
    onMiddleware(): Promise<void>;
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
    updateOrCreate(): Promise<void>;
    protected beforeUpdate(): Promise<void>;
    onBeforeUpdate(): Promise<void>;
    protected persist(): Promise<void>;
    onUpdate(): Promise<void>;
    onCreate(): Promise<void>;
    protected afterUpdate(): Promise<void>;
    onAfterUpdate(): Promise<void>;
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
    delete(): Promise<void>;
    protected beforeDelete(): Promise<void>;
    onBeforeDelete(): Promise<void>;
    onDelete(): Promise<void>;
    afterDelete(): Promise<void>;
    onAfterDelete(): Promise<void>;
}
