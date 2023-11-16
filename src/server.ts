import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

type User = {
    id:string;
    name:string;
    username:string;
    technologies: Technology[];
}

type Technology = {
    id:string;
    title:string;
    studied:boolean;
    deadline:Date;
    created_at:Date;
}

const checkExistsUserAccount = async (req:Request, res:Response, next:NextFunction) => {
    const { username } = req.headers as {username:string};
    const userExists = await prisma.user.findUnique({
        where: {
            username
        }
    });
    if (!userExists) {
        return res.status(404).json({error:'Usuário não existe.'});
    }
    req.user = userExists;
    return next();
}

app.post('/users', async (req, res) => {
    const { name, username } = req.body;

    const userExists = await prisma.user.findUnique({
        where: {
            username
        }
    });
    if (userExists) {
        return res.status(400).json({error:'Username já cadastrado.'});
    }
    const newUser = await prisma.user.create({
        data: {
            name,
            username,
        }
    });
    return res.status(201).json(newUser);
});

app.post('/technologies', checkExistsUserAccount, async (req, res) => {
    const { title, deadline } = req.body
    const { user } = req;

    const technology = await prisma.technology.create({
        data: {
            title,
            deadline,
            user: {
                connect: {
                    id: user.id
                }
            }
        }
    });

    return res.status(201).json(technology);
});

app.get('/technologies', checkExistsUserAccount, async (req, res) => {
    const { user } = req;

    const technologies = await prisma.technology.findMany({
        where: {
            userId: user.id
        }
    });

    return res.status(200).json(technologies);
});

app.put('/technologies/:id', checkExistsUserAccount, async (req, res) => {
    const { title, deadline } = req.body;
    const { id } = req.params;

    const technologyExists = await prisma.technology.findUnique({
        where: {
            id
        }
    });

    if (!technologyExists) {
        return res.status(404).json({error:'Tecnologia não encontrada.'});
    }

    const technology = await prisma.technology.update({
        where: {id},
        data: {
            title,
            deadline
        }
    });
    
    return res.status(200).json(technology);
});

app.patch('/technologies/:id/studied', checkExistsUserAccount, async (req, res) => {
    const { id } = req.params;

    const technologyExists = await prisma.technology.findUnique({
        where: {
            id
        }
    });

    if (!technologyExists) {
        return res.status(404).json({error:'Tecnologia não encontrada.'});
    }

    const technology = await prisma.technology.update({
        where: {id},
        data: {studied: true}
    });

    return res.status(200).json(technology);
});

app.delete('/technologies/:id', checkExistsUserAccount, async (req, res) => {
    const { id } = req.params;

    const technologyExists = await prisma.technology.findUnique({
        where: {
            id
        }
    });

    if (!technologyExists) {
        return res.status(404).json({error:'Tecnologia não encontrada.'});
    }
    
    await prisma.technology.delete({
        where: {id}
    });

    return res.status(200).json({message:'Tecnologia deletada.'});
});


app.listen(3000, () => {console.log('Server online on port 3000.')});