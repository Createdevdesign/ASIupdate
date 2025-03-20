import express from 'express';
export abstract class CommonRoutesConfig {
    app: express.Application;
    name: string;

    constructor(app: express.Application, name: string) {
        this.app = app;
        this.name = name;
        this.configureBaseRoutes();
        this.configureRoutes();
    }
    getName(): string {
        return this.name;
    }
    
    configureBaseRoutes(): express.Application { 
        this.app.get("/health", (req, res) => {
            res.status(200).send("Healthy");
        });
        return this.app;
    }

    abstract configureRoutes(): express.Application;
}
