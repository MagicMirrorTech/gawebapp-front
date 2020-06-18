import React from "react";
import { Link } from 'react-router-dom'
import axios from 'axios'
import Moment from 'react-moment'

import {
  Card,
  CardHeader,
  Container,
  Row,
  Col,
  Table,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown
} from "reactstrap";
// core components
import Header from "components/Headers/Header.jsx";
import Global from "../../global";
let loggedUser

class Expenses extends React.Component {
  state = {
    jobs:[]
  };

  constructor(props) {
    super(props);
    loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
  }

  componentDidMount() {
    loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
    if(loggedUser.level <=1){
      axios
      .get(Global.url + `checkjobs/${loggedUser._id}`)
      .then(({ data }) => {
        this.setState(prevState => {
          return {
            ...prevState,
            ...data
          }
        })
      })
      .catch(err => {
        console.log(err.response)
      })
    }
    else if(loggedUser.level >=2){
      axios
      .get(Global.url + `checkjobs`)
      .then(({ data }) => {
        this.setState(prevState => {
          return {
            ...prevState,
            ...data
          }
        })
      })
      .catch(err => {
        console.log(err.response)
      })
    }
  }


  

  render() {
    console.log(this.state)
    if (!this.state) return <p>Loading</p>
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
                      <h3 className="mb-0">Information</h3>
                    </div>
                    <div className="col text-right">
                    <Link to="addexpense">
                      <p
                        color="primary"
                        size="sm" 
                      >
                        Add an Expense
                      </p>
                    </Link>
                      
                    </div>
                  </Row>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col"></th>
                      <th scope="col">Description</th>
                      <th scope="col">Category</th>
                      <th scope="col">Date</th>
                      <th scope="col">Total</th>
                    </tr>
                  </thead>
                  
                    

                     {this.state.jobs.length === 0 ?  <tbody><tr><td>No expenses register</td></tr></tbody>:
                     this.state.jobs.map((e,i)=>{
                       const estimateId = e._id
                       let userInEstimate = e.workers.filter(wx =>  wx.workerId._id === loggedUser._id).length > 0

                       return(
                       e.expenses.map((e,i)=>{
                        return(
                          <tbody key={i}>
                          <tr >
                          <td>
                            <div className="dropdownButtons">
                            <UncontrolledDropdown>
                              <DropdownToggle>
                                ...
                              </DropdownToggle>
                              <DropdownMenu>
                                 {
                                   loggedUser.level >= 2 ? <DropdownItem to={`/admin/expenses/${estimateId}/${e._id}/update`} tag={Link}>Update</DropdownItem> : 
                                   loggedUser.level === 1 && userInEstimate ? <DropdownItem to={`/admin/expenses/${estimateId}/${e._id}/update`} tag={Link}>Update</DropdownItem> :
                                   <DropdownItem disabled to={`/admin/expenses/${estimateId}/${e._id}/update`} tag={Link}>Update</DropdownItem>
                                 }
                                {
                                  loggedUser.level >= 4 ?
                                  <DropdownItem onClick={()=>{
                                  axios.patch(Global.url + `expensedelete/${estimateId}/${e._id}`)
                                  .then(({data})=>{
                                    alert('Expense Delete')
                                        window.location.reload()
                                  })
                                  .catch(err => {
                                    console.log(err.response)
                                  })
                                }}><span
                                    className="text-danger">Delete</span>
                                </DropdownItem>
                                :null
                              }
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </div>
                          </td>
                          <th scope="row" >{e.description}</th>
                          <td>{e.category}</td>
                          <td>
                          <Moment add={{days: 1}} date={new Date(e.date)}  format={"MMM D, YY"} />
                          
                          </td>
                          <td>$ {parseFloat(Math.round(e.total * 100) / 100).toFixed(2)}</td>
                          
                          </tr>                                               
                        </tbody>
                       )
                       })
                      
                      ) })}
                      
                      
                </Table>
              </Card>
            </Col>
            
          </Row>
        </Container>
      </>
    );
  }
}

export default Expenses;
