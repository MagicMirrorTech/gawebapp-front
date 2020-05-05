import React from "react";
import { withRouter } from 'react-router-dom'
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


class AddWorkerJob extends React.Component {
  state = {
    users:[]
  };

  handleInput = e => {
    e.persist()
    this.setState(prevState => ({
      ...prevState,
      [e.target.name]: e.target.value
    }))
  }

  componentDidMount() {

    axios
      .get(Global.url + `workers`)
      .then(({ data }) => {
        this.setState(prevState => {
          return {
            ...prevState,
            ...data
          }
        })
      })
      .catch(err => {
        console.log(err)
      })
  }

  handleSubmit = async (e, props) => {
    e.preventDefault()
    const workerIn =[]
    const estimate = await axios.get(Global.url+`estimatedetail/${this.props.match.params.id}`)
    console.log('el estimate',estimate.data.estimate)
    estimate.data.estimate.workers.map(e =>{
      return workerIn.push(e.workerId._id) 
    })
    if(workerIn.includes(this.state._id)){
      alert('This worker ya está en el work')
    }
    else {
      axios
          .patch(Global.url + `addworkers/${this.props.match.params.id}`,{id2: this.state._id})
          .then(response => {
            //aquí deberia ir una notificacion o un swal o un toastr
            this.props.history.push(`/admin/jobs`)
            console.log(response)
          })
          .catch(err => {
            //aquí deberia ir una notificacion o un swal o un toastr
            console.log(err.response)
          })
    }
  }

  render() {
    console.log(this.state)
    return (
      <>
        <Header />
        {/* Page content */}
        <Container className="mt--7" fluid>
          <Row className="mt-5">
            <Col className="mb-5 mb-xl-0" xl="12">
              <Card className="shadow">
                <CardHeader className="border-0">
                  <Row className="align-items-center">
                    <div className="col">
                      <h3 className="mb-0">Information Worker</h3>
                    </div>
                  </Row>
                </CardHeader>
                <CardBody> 

                  <Form onSubmit={this.handleSubmit}>
                    <div className="pl-lg-4">
                      <Row>
                        <Col lg="6"> 
                          <FormGroup>
                            <Input
                              name="_id"
                              className="form-control-alternative"
                              type="select"
                              onChange={this.handleInput}
                              
                            >
                            <option>Select worker</option>
                            {this.state.users.map((e,i)=>{
                              return(
                                e.role === 'PROJECT MANAGER' ? <option key={i} value={`${e._id}`}>{e.name} (Project Manager)</option> :
                                <option key={i} value={`${e._id}`}>{e.name}</option>)
                            })
                            }
                            
                            
                            </Input>
                          </FormGroup>
                          
                        </Col>
                      </Row>
                      
                      
                      <Row>
                        <Col lg="6">
                          <FormGroup>
                        
                            <Button
                              className="form-control-alternative"
                              color="info"

                            >Add Worker</Button>
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

export default withRouter(AddWorkerJob);
