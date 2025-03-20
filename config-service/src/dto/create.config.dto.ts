import { Types } from "mongoose";

export interface CreateConfigurationDto {
    _id: { type: String },
  Name:{type:String},
  StoreId:{type:String},
  Description:{type:String},
  Type:{type:String},
  Value:string[]
}