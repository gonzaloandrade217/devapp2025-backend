import { Request, Response } from 'express';
import { ObjectId, WithId } from 'mongodb'; 
import { Persona } from '../models/persona'; 
import { Auto } from '../models/auto';

declare global {
  namespace Express {
    interface Locals {
      entity?: any; 
      data?: any; 
    }

    interface Request {
      locals: Locals;
    }

    interface Response {
      locals: Locals; 
    }
  }
}