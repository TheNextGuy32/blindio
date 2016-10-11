module.exports = class Player {
	constructor(ws, name) {
		this.ws = ws;
		this.name = name != null ? name : "The Nameless One";
	}
	get name () { return name; }
}