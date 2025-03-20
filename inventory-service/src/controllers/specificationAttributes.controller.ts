import express from 'express';
import specificationAttributesService from '../services/specificationattributes.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:stores-controller');

class SpecificationController {
    async listSpeicificationAttributes(req: express.Request, res: express.Response) {
        try {
            const stores = await specificationAttributesService.findSpecificAttributesUsingCustomerId();
            if(!stores){
                return res.status(404).send({errors:['Specification Attribute fetch unsuccessfully.']});        
            }
            return res.status(200).send(stores);    
        } catch (error) {
            return res.status(404).send({errors:['Specification Attribute fetch unsuccessfully.']})
        }

        
    }   
}

export default new SpecificationController();
