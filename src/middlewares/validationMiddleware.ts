import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

const validator =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: any) {
      console.log(e);
      return res.status(400).send(e.errors);
    }
  };

export default validator;
