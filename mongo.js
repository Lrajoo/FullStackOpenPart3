const mongoose = require("mongoose")

if (process.argv.length < 3) {
	console.log("Please provide the password as an argument: node mongo.js <password>")
	process.exit(1)
}

const password = process.argv[2]
let name = ""
let number = ""
if (process.argv.length === 5) {
	name = process.argv[3]
	number = process.argv[4]
}

const url = `mongodb+srv://Lrajoo:${password}@fullstackopencluster.mxbyw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
})

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
	id: Number
})

const Person = mongoose.model("Person", personSchema)

const person = new Person({
	name: name ? name : "Name Test",
	number: number ? number : "1231231234",
	id: 126
})

if (process.argv.length === 3) {
	console.log("phonebook:")
	Person.find({}).then(persons => {
		persons.map(person => {
			console.log(`${person.name} ${person.number}`)
		})
		mongoose.connection.close()
	})
} else if (process.argv.length === 5) {
	person.save().then(result => {
		console.log(`added ${person.name} number ${person.number} to phonebook`)
		mongoose.connection.close()
	})
}
