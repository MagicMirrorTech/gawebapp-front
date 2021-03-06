import React from "react";
import { withRouter } from 'react-router-dom'
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
import {connect} from "react-redux";
import {getUsers} from "../../redux/actions/userAction";
import {addProjectManager} from "../../redux/actions/jobAction";

let estimate
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
    if(this.props.users.length === 0) this.props.getUsers()
    estimate = this.props.jobs.filter(item => item._id === this.props.match.params.id)[0]
    this.setState(prevState => {
      return {
        ...prevState,
        users: this.props.users.filter(user => user.role === "PROJECT MANAGER")
      }
    })

  }

  handleSubmit = (e, props) => {
    e.preventDefault()
    const workerIn =[]
    estimate.projectManager.map(e =>{
      return workerIn.push(e.projectId._id) 
    })
    if(workerIn.includes(this.state._id)){
      alert('This PM already exists in this job')
    }
    else {
      this.props.addProjectManager(this.props.match.params.id, {id2: this.state._id})
      this.props.history.push(`/admin/jobs`)
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
                      <h3 className="mb-0">Information Project Manager</h3>
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
                              onChange={this.handleInput}>
                            <option>Select project manager</option>
                            {this.state.users.map((e,i)=>{
                                return(
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
                              color="info">
                              Add Project Manager</Button>
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
  users: state.user.users,
  jobs: state.job.jobs
})

export default connect(mapStateToProps, {getUsers, addProjectManager})(withRouter(AddWorkerJob));
