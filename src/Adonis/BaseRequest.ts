// @ts-ignore
import type { HttpContext } from '@adonisjs/core/http'


/**
 * BaseRequest class
 * This class is used to create a base request class for Adonis Applications
 * Avoid overriding the non on* methods like updateOrCreate, delete.
 * The on* methods are hooks that can be overriden by the extended classes.
 */
export abstract class BaseRequest {

  ctx: HttpContext
  public Model: any

  public entity: string
  public id: string | null | number
  public data: any
  public instance: any
  public idColumn: string = 'id'

  constructor(ctx: HttpContext, Model: any) {
    this.ctx = ctx
    this.Model = Model

    const { id = null, entity, data = {} } = this.ctx.request.all()

    this.entity = entity
    this.id = id
    this.data = data

    if (!this.Model) {
      throw new Error('Model is required.')
    }
    
  }
  
  public async validate() {
    if(!this.entity) {
      throw new Error('Entity is required.')
    }

    if(this.entity !== new this.Model().constructor.name) {
      throw new Error('Invalid entity.')
    }
  }

  /**
   * This method is used to delete the blank _path keys on the data object to avoid clearing 
   * the _path on the instance object when we don't want to update them or didn't passed the path again.
   */
  protected clearBlankPathKeysOnData() {
    Object.keys(this.data).map((key) => {
      if (key.includes('_path') && !this.data[key]) {
        delete this.data[key]
      }
    })
  }

  public async onLoadInstance() {
    this.instance = await this.Model.findBy(this.idColumn, this.id)
  }

  /**
   * onMiddleware hook
   * This method is called before the updateOrCreate and delete methods
   */
  public async onMiddleware() {
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
  public async updateOrCreate() {
    
    if(this.id) {
      await this.onLoadInstance()
    } 
    
    if(!this.instance) {
      this.instance = new this.Model()
    }

    await this.beforeUpdate()

    await this.persist()

    await this.afterUpdate()
  }

  protected async beforeUpdate() {
    this.validate()
    await this.onMiddleware()
    await this.onBeforeUpdate()
    this.clearBlankPathKeysOnData()
  }


  public async onBeforeUpdate() {
  }

  protected async persist() {
    if (this.id && this.instance) {
      await this.onUpdate()
    } else {
      await this.onCreate()
    }
  }

  public async onUpdate() {
    const data = this.instance.getFillableKeys(this.data)
    this.instance.merge({ ...data })
    await this.instance.save()
  }

  public async onCreate() {
    const data = this.instance.getFillableKeys(this.data)
    this.instance = await this.Model.create(data)
  }

  protected async afterUpdate() {
  }

  public async onAfterUpdate() {
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
  public async delete() {
    
    if(this.id) {
      await this.onLoadInstance()
    }

    await this.beforeDelete()

    if(!this.id) {
      throw new Error('Id is required.')
    }

    if(!this.instance) {
      throw new Error('Instance not found.')
    }

    await this.onDelete()

    await this.afterDelete()

  }

  protected async beforeDelete() {
    this.validate()
    await this.onMiddleware()
    await this.onBeforeDelete()
  }

  public async onBeforeDelete() {
  }

  public async onDelete() {
    await this.instance.delete()
  }

  public async afterDelete() {
    await this.onAfterDelete()
  }

  public async onAfterDelete() {
  }

}