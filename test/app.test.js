process.env.NODE_ENV = 'test';

let chai = require('chai');
let should = chai.should
chai.use("server")
describe("/GET/:phoneNumber /",() =>{
	it("It should give message that it is ready",(done) =>{
		chai.request(server).get('/5702309588').end((err,res)=>{
			res.should.have.staus(200)
					done()

		})
	})
})