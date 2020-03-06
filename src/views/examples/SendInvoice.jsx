import React from "react";
import {  withRouter } from 'react-router-dom'
import axios from 'axios'
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Button,
  FormGroup,
  Input,
  Form
} from "reactstrap";
// core components
import Header from "components/Headers/Header.jsx";
import Global from "../../global";

let loggedUser;

class SendInvoice extends React.Component {
  state = {
    workerId: "",
    date:'',
    name: '',
    email: '',
    total: 0,
    jobName: '',
    description: ''
  };

  constructor(props) {
    super(props);
    console.log("constructor!!!")
    loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
    console.log("jsonParse", loggedUser);
  }

  componentDidMount() {
    console.log(loggedUser);
    this.setState({
      workerId: loggedUser._id
    })
    axios
      .get(Global.url + `estimatedetail/${this.props.match.params.id}`)
      .then(({ data }) => {
        this.setState(prevState => {
          let date = ''
          let description = ''
          let total
          const invoices = data.estimate.invoices
              invoices.map((e,i)=>{
                if(e._id === this.props.match.params.invoiceId){
                  date = e.date
                  description = e.description
                  total = e.total
                }
                return {date,description,total}
              })
          return {
            ...prevState,
            name: data.estimate.clientId.name,
            email: data.estimate.clientId.email,
            jobName: data.estimate.jobName,
            date,
            description,
            total
          }
        })
      })
      .catch(err => {
        console.log(err.response)
      })
  }

  handleInput = e => {
    e.persist()
    this.setState(prevState => ({
      ...prevState,
      [e.target.name]: e.target.value
    }))
  }


  handleSubmit = async (e, props) => {
    e.preventDefault()
        axios.post(Global.url + `sendinvoice`,this.state)
        .then(response => {
          this.props.history.push(`/admin/invoices`)
          console.log(response)
        })
        .catch(err => {
          console.log(err.response)
        })
  }

  render() {    
    console.log(this.state)
    if(!this.state.workerId||this.state.workerId==='') return <p>Loading</p>
    

    return (
      <>
        <Header forms={true}/>
        {/* Page content */}
        <Container className="mt--7" fluid>
          <Row className="mt-5">
            <Col className="mb-5 mb-xl-0" xl="12">
              <Card className="shadow">
                <CardHeader className="border-0">
                  <Row className="align-items-center">
                    <div className="col">
                      <h3 className="mb-0">Information Invoice</h3>
                    </div>
                  </Row>
                </CardHeader>
                <CardBody> 

                  <Form onSubmit={this.handleSubmit}>
                    <div className="pl-lg-4">
                      <Row>
                        <Col lg="6">
                        <FormGroup>
                        <label
                          className="form-control-label d-inline-block"
                          htmlFor="input-name"
                        >
                          Client Name
                        </label>
                        <Input
                          defaultValue={`${this.state.name}`}
                          className="form-control-alternative"
                          placeholder="Enter the name client"
                          name="name"
                          type="text"
                          onChange={this.handleInput}
                        />
                        </FormGroup>
                        <FormGroup>
                            <label
                              className="form-control-label d-inline-block"
                              htmlFor="input-name"
                            >
                              Emails
                            </label>
                            <Input
                              defaultValue={`${this.state.email}`}
                              className="form-control-alternative"
                              placeholder="Enter the email client"
                              name="email"
                              type="email"
                              onChange={this.handleInput}
                            />
                          </FormGroup>
                          <FormGroup>
                            <label
                            className="form-control-label d-inline-block"
                            htmlFor="input-jobName"
                            >
                            Job Name
                            </label>
                            <Input
                              name="_id"
                              className="form-control-alternative"
                              type="text"
                              onChange={this.handleInput}
                              value={this.state.jobName}
                            />
                          </FormGroup>
                          <FormGroup>
                            <label
                              className="form-control-label d-inline-block"
                              htmlFor="input-date"
                            >
                              Invoice Date
                            </label>
                            <Input
                              className="form-control-alternative"
                              placeholder="Select a date"
                              id="date"
                              value={this.state.date}
                              name="date"
                              type="date"
                              onChange={this.handleInput}
                            />
                          </FormGroup>
                        
                          <FormGroup>
                            <label
                              className="form-control-label"
                              htmlFor="input-merchant"
                            >
                              Total Invoice
                            </label>
                            <Input
                              name="total"
                              className="form-control-alternative"
                              type="number"
                              onChange={this.handleInput}
                              value={this.state.total}
                            />
                          </FormGroup>
                          <FormGroup>
                            <label
                              className="form-control-label"
                              htmlFor="input-first-name"
                            >
                              Description
                            </label>
                            <Input
                              name="description"
                              className="form-control-alternative"
                              placeholder="This is an invoice generated with the items of an estimate"
                              type="text"
                              onChange={this.handleInput}
                              value={this.state.description}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      
                      
                      <Row>
                        <Col lg="6">
                          <FormGroup>
                        
                            <Button
                              className="form-control-alternative"
                              color="info"

                            >Send</Button>
                          </FormGroup>
                        </Col>
                      </Row>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
            
          </Row>
        </Container>
      </>
    );
  }
}

export default withRouter(SendInvoice);
