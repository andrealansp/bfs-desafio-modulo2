import express from 'express';
import { promises as fs } from 'fs';

const routes = express.Router();
routes.use(express.json());

routes.get('/', async (req, res, next) => {
  try {
    const gradeList = JSON.parse(await fs.readFile(global.fileName));
    res.send(gradeList);
  } catch (error) {
    next(error);
  }
});

routes.get('/final', async (req, res, next) => {
  let { student, subject } = req.body;
  let totalNota = 0;
  if (!student && !subject)
    throw new Error('É necessário o preenchimento de Student and subject');
  try {
    const gradeList = JSON.parse(await fs.readFile(global.fileName));
    const grades = gradeList.grades.filter(
      (grade) => student === grade.student && subject === grade.subject
    );
    totalNota = grades.reduce((acc, curr) => acc + curr.value, 0);
    res.send({ NotalFinal: totalNota });
  } catch (error) {
    next(error);
  }
});

routes.get('/media', async (req, res, next) => {
  let { subject, type } = req.query;
  try {
    const gradeList = JSON.parse(await fs.readFile(global.fileName));
    const grades = gradeList.grades.filter(
      (grade) => subject === grade.subject && type === grade.type
    );
    console.log(grades);
    const nota = grades.reduce((acc, current) => acc + current.value, 0);
    const media = nota / grades.length;

    console.log(media);
    res.send({ NotaMedia: media });
  } catch (error) {
    next(error);
  }
});

routes.get('/melhores', async (req, res, next) => {
  let { subject, type } = req.query;
  try {
    const gradeList = JSON.parse(await fs.readFile(global.fileName));
    const grades = gradeList.grades
      .filter((grade) => subject === grade.subject && type === grade.type)
      .sort((a, b) => b.value - a.value);

    res.send(grades.slice(0, 3));
  } catch (error) {
    next(error);
  }
});

routes.get('/:id', async (req, res, next) => {
  try {
    let id = req.params.id;
    const gradeList = JSON.parse(await fs.readFile(global.fileName));
    let grade = gradeList.grades.filter((grade) => grade.id === parseInt(id));

    res.send(grade);
  } catch (error) {
    next(error);
  }
});

routes.post('/', async (req, res, next) => {
  let grade = req.body;

  let options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  };

  try {
    const gradeList = JSON.parse(await fs.readFile(global.fileName));
    if (!grade) throw new Error('Json não foi definido no body');
    if (
      !grade.student ||
      !grade.subject ||
      !grade.type ||
      !grade.value === null
    ) {
      logger.error('Todos os campos são obrigatórios!');
      throw new Error('Todos os campos são obrigatórios!');
    }

    console.log(grade.student);
    grade = {
      id: gradeList.nextId++,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: Intl.DateTimeFormat('pt-br', options).format(Date.now()),
    };
    gradeList.grades.push(grade);
    await fs.writeFile(global.fileName, JSON.stringify(gradeList));
    res.send(grade);
  } catch (error) {
    next(error);
  }
});

routes.put('/:id', async (req, res, next) => {
  let grade = req.body;

  let options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  };

  try {
    const gradeList = JSON.parse(await fs.readFile(global.fileName));
    const index = gradeList.grades.findIndex(
      (grade) => grade.id === parseInt(req.params.id)
    );
    if (!grade) throw new Error('Json não foi definido no body');
    if (
      !grade.student ||
      !grade.subject ||
      !grade.type ||
      !grade.value === null
    ) {
      logger.error('Todos os campos são obrigatórios!');
      throw new Error('Todos os campos são obrigatórios!');
    }
    if (index === -1) throw Error('Registro Não Encontrado');

    gradeList.grades[index].student = grade.student;
    gradeList.grades[index].subject = grade.subject;
    gradeList.grades[index].type = grade.type;
    gradeList.grades[index].value = grade.value;

    await fs.writeFile(global.fileName, JSON.stringify(gradeList, null, 2));
    res.send(grade);
  } catch (error) {
    next(error);
  }
});

routes.delete('/:id', async (req, res, next) => {
  let id = req.params.id;

  try {
    const gradeList = JSON.parse(await fs.readFile(global.fileName));
    gradeList.grades = gradeList.grades.filter(
      (grade) => grade.id != parseInt(id)
    );

    await fs.writeFile(global.fileName, JSON.stringify(gradeList), null, 2);

    res.end();
  } catch (error) {
    next(error);
  }
});

routes.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.sendStatus(400).send({ error: err.message });
});

export default routes;
