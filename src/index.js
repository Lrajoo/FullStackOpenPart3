require("dotenv").config()
const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")
const PORT = process.env.PORT

let numberPersons = 0
morgan.token("host", (req, res) => req.hostname)
morgan.token("body", (req, res) => JSON.stringify(req.body))

app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("build"))
app.use(morgan(":method :url :host :status :res[content-length] - :response-time ms :body"))
app.use(cors())

const generateId = () => {
	return Math.floor(Math.random() * 10000)
}

const errorHandler = (error, request, response, next) => {
	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" })
	} else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message })
	} else if (error.name === "MongoError") {
		return response.status(500).json({ error: "Duplicate name" })
	}
	next(error)
}

app.get("/", (request, response) => {
	response.send("<h1>Hello World!</h1>")
})

app.get("/api/persons", (request, response) => {
	Person.find({}).then(persons => {
		numberPersons = persons.length
		response.json(persons)
	})
})

app.get("/api/persons/:id", (request, response, next) => {
	const id = Number(request.params.id)
	Person.findById(request.params.id)
		.then(person => {
			if (person) {
				response.json(person)
			} else {
				response.status(404).end()
			}
		})
		.catch(error => next(error))
})

app.get("/api/info", (request, response) => {
	response.send(`<h5>Phonebook has info for ${numberPersons} people</h5><h5>${Date()}</h5>`)
})

app.delete("/api/persons/:id", (request, response, next) => {
	// const id = Number(request.params.id);
	Person.findByIdAndRemove(request.params.id)
		.then(result => {
			response.status(204).end()
		})
		.catch(error => next(error))
})

app.post("/api/persons", (request, response, next) => {
	const body = request.body
	if (!body.name || !body.number) {
		return response.status(400).json({
			error: "name or number is missing"
		})
	}
	const person = new Person({
		name: body.name,
		number: body.number,
		id: generateId()
	})
	person
		.save()
		.then(savedPerson => {
			response.json(savedPerson.toJSON())
		})
		.catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
	const body = request.body
	const person = {
		name: body.name,
		number: body.number
	}
	Person.findByIdAndUpdate(request.params.id, person, { new: true })
		.then(updatedPerson => {
			response.json(updatedPerson)
		})
		.catch(error => next(error))
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})

app.use(errorHandler)
