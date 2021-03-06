import React from "react";
import {  withRouter } from 'react-router-dom'
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
import { WithContext as ReactTags } from 'react-tag-input';
import ArgyleService from "../../services/argyleService";
import moment from "moment";
import {connect} from "react-redux";
import {getJobs, sendInvoice} from "../../redux/actions/jobAction";
import configureStore from "../../redux/store";
const {store} = configureStore();

const argyleService = new ArgyleService()

let loggedUser;
var fecha = new Date(); 
      var mes = fecha.getMonth()+1; 
      var dia = fecha.getDate(); 
      var ano = fecha.getFullYear(); 
      if(dia<10)
        dia='0'+dia; //agrega cero si es menor de 10
      if(mes<10)
        mes='0'+mes //agrega cero si es menor de 10

class SendInvoice extends React.Component {
  state = {
    workerId: "",
    date:ano+"-"+mes+"-"+dia,
    name: '',
    email: '',
    total: 0,
    jobName: '',
    tags : [],
    description: '',
    urlPay: '',
  };

  constructor(props) {
    super(props);
    const {auth} = store.getState();
    loggedUser = auth.userLogged
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
  }

  componentDidMount() {
    if (this.props.jobs.length === 0) this.props.history.push(`/admin/invoices`)
    const job = this.props.jobs.filter(item => item._id === this.props.match.params.id)[0]
    this.setState(prevState => {
      let date = ''
      let description = ''
      let total
      const invoices = job.invoices
      invoices.map((e,i)=>{
        if(e._id === this.props.match.params.invoiceId){
          description = e.description
          total = e.total
        }
        return {date,description,total}
      })
      return {
        ...prevState,
        workerId: loggedUser._id,
        invoiceId: this.props.match.params.invoiceId,
        jobId: job._id,
        name: job.clientId.name,
        email: job.clientId.email,
        jobName: job.jobName,
        description,
        total,
        tags: [{
          id: job.clientId.email,
          text: job.clientId.email}]
      }
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

    let data = {
      date: moment(this.state.date),
      total: this.state.total,
      description: this.state.description,
      extraData: {
        description: this.state.description,
        total: this.state.total,
        date: this.state.date,
        jobId: this.state.jobId,
        invoiceId: this.state.invoiceId,
        workerId: this.state.workerId
      }
    };

    //mandarlo al primer correo con el primer nombre nada mas
    console.log(this.state.tags[0]);
    argyleService.checkArgyleUser(this.state.tags[0].text, this.state.name).then(
      result =>{
        argyleService.addCharge(data).then(
          responseArgyle => {
            console.log("argyle, ", responseArgyle);
            this.setState(prevState => {
              return {
                ...prevState,
                urlPay: responseArgyle.data.data.url
              }
            })

            this.props.sendInvoice(this.state);
            this.props.history.push(`/admin/invoices`)
            },
          errorArgyle =>{
            console.log(errorArgyle);
            this.props.sendInvoice(this.state);
            this.props.history.push(`/admin/invoices`)
          }
        )
      },
      errorArgyle =>{
        console.log(errorArgyle);
        this.props.sendInvoice(this.state);
        this.props.history.push(`/admin/invoices`)
      }
    )
  }

  handleDelete(i) {
    const { tags } = this.state;
    this.setState({
      tags: tags.filter((tag, index) => index !== i),
    });
  }

  handleAddition(tag) {
    this.setState(state => ({ tags: [...state.tags, tag] }));
  }

  handleDrag(tag, currPos, newPos) {
    const tags = [...this.state.tags];
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: newTags });
  }

  render() {
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
                            <div>
                                <ReactTags
                                    placeholder="Add email"
                                    tags={this.state.tags}
                                    handleDelete={this.handleDelete}
                                    handleAddition={this.handleAddition}
                                    handleDrag={this.handleDrag}
                                    delimiters={this.state.delimiters} />
                              </div>
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

const mapStateToProps = state => ({
  jobs: state.job.jobs,
})

export default connect(mapStateToProps, {getJobs, sendInvoice})(withRouter(SendInvoice));
