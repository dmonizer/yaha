import {BaseEntity} from "../model/BaseEntity";
import {Logger} from "./utilities/logger";
const log = Logger("EntityManager")

export class EntityManager {
    entities: Map<string, BaseEntity> = new Map<string, BaseEntity>();
    constructor() {
        setInterval(this.reporting.bind(this),10000)
    }

    addEntity(entity: BaseEntity) {
        this.entities.set(entity.id, entity)
    }

    getEntity(id : string) {
        if (this.entities.has(id)) {
            return this.entities.get(id)
        } else log.warn(`No entity with id ${id} in EntityManager - this might be a bug.`)
    }

    reporting() {
        log.trace(`${this.entities.size} entities known to EntityManager`)
        const entityNames:string[] = [];
        this.entities.forEach((entity) => {entityNames.push(entity.name+ ":" +entity.entityOrigin)})
        log.trace(`${entityNames.join(", ")}`)
    }
}
