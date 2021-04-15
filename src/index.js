const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

let persons = [
  {
    name: 'Ada Lovelace',
    number: '123456789',
    id: 1
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 2
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 3
  }
];

morgan.token('host', (req, res) => req.hostname);
morgan.token('body', (req, res) => JSON.stringify(req.body));

app.use(express.json());
app.use(express.urlencoded());
app.use(morgan(':method :url :host :status :res[content-length] - :response-time ms :body'));
app.use(cors());

const generateId = () => {
  return Math.floor(Math.random() * 10000);
};

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.get('/api/info', (request, response) => {
  response.send(`<h5>Phonebook has info for ${persons.length} people</h5><h5>${Date()}</h5>`);
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);
  response.status(204).end();
});

app.post('/api/persons', (request, response) => {
  const body = request.body;
  console.log(body);
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing'
    });
  }
  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({
      error: 'name already exists in the phonebook'
    });
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  };
  persons = persons.concat(person);
  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
