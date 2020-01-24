import React from "react";
import { Link } from 'react-router-dom'
import axios from 'axios'
import AuthService from '../../services/services'

import {
  Card,
  CardHeader,
  Container,
  Row,
  Col,
  Table,
  Dropdown,
  DropdownToggle,
  Media,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
// core components
import Header from "components/Headers/Header.jsx";

const authService = new AuthService()

class Icons extends React.Component {
  state = {
    estimates:[],
    id:'',
    btnDropup: false
  };

  componentDidMount() {
    axios
      .get(`http://localhost:3000/checkestimates`)
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
  convertInvoice = (_id)=>{
    authService
    .convertInvoice(_id)
    .then(response => {
            //aquí deberia ir una notificacion o un swal o un toastr
            this.props.history.push(`estimates`)
            console.log(response)
          })
          .catch(err => {
            //aquí deberia ir una notificacion o un swal o un toastr
            console.log(err.response)
            alert(err.response.data.msg || err.response.data.err.message)
          })

  }
  render() {
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
                    <Link to="addestimate">
                      <p
                        color="primary"
                        size="sm" 
                      >
                        Add Estimate
                      </p>
                    </Link>
                      
                    </div>
                  </Row>
                </CardHeader>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Client</th>
                      <th scope="col">Date</th>
                      <th scope="col">Status</th>
                      <th scope="col">Total</th>
                      <th scope="col">Options</th>
                    </tr>
                  </thead>
                  {this.state.estimates.length === 0 ?  <tbody><tr><td>No estimates register</td></tr></tbody>:
                     this.state.estimates.map((e,i)=>{
                      let subtotal = e.items.reduce((acc, current, i) => acc + current.subtotal, 0)
                      let tax = parseInt(e.tax) * subtotal / 100
                      let discount = e.discount
                      let paid = e.paid
                      return(
                        <tbody key={i}>
                        <tr >
                        <th scope="row" >{e.clientId.name}</th>
                        <td>{e.dateCreate}</td>
                        <td>{e.status}</td>
                        <td>${subtotal + tax - paid - discount}USD</td>
                        <td>
                        <Dropdown position="absolute" direction="up" isOpen={this.state.btnDropup} toggle={(e) => {this.setState({ btnDropup: !this.state.btnDropup }); }}>
                        <DropdownToggle className="pr-0" nav >
                        <Media className="align-items-center">
                    <Media className="ml-2 d-none d-lg-block">
                      <span className="mb-0 mt-0 text-sm font-weight-bold">
                        ...
                      </span>
                    </Media>
                  </Media>
                        </DropdownToggle>
                        <DropdownMenu
                            modifiers={{
                              setMaxHeight: {
                                enabled: true,
                                order: 890,
                                fn: (data) => {
                                  return {
                                    ...data,
                                    styles: {
                                      ...data.styles,
                                      overflow: 'auto',
                                      maxHeight: 100,
                                    },
                                  };
                                },
                              },
                            }}
                          >
                          <DropdownItem onClick={()=>{
                            authService
                              .convertInvoice(e._id)
                              .then(response => {
                                //aquí deberia ir una notificacion o un swal o un toastr
                                this.props.history.push(`invoices`)
                                console.log(response)
                                
                              })
                              .catch(err => {
                                //aquí deberia ir una notificacion o un swal o un toastr
                                console.log(err.response)
                                alert(err.response.data.msg || err.response.data.err.message)
                              })
                          }}>Convert to Invoice</DropdownItem>
                          <DropdownItem onClick={()=>{
                            authService
                              .convertJob(e._id)
                              .then(response => {
                                //aquí deberia ir una notificacion o un swal o un toastr
                                this.props.history.push(`jobs`)
                                console.log(response)
                                
                              })
                              .catch(err => {
                                //aquí deberia ir una notificacion o un swal o un toastr
                                console.log(err.response)
                                alert(err.response.data.msg || err.response.data.err.message)
                              })
                          }}>Approve</DropdownItem>
                          <DropdownItem onClick={()=>{
                            authService
                              .decline(e._id)
                              .then(response => {
                                //aquí deberia ir una notificacion o un swal o un toastr
                                window.location.reload()
                                console.log(response)
                                
                              })
                              .catch(err => {
                                //aquí deberia ir una notificacion o un swal o un toastr
                                console.log(err.response)
                                alert(err.response.data.msg || err.response.data.err.message)
                              })
                          }}>Decline</DropdownItem>
                          <DropdownItem>Sent Email</DropdownItem>
                          <DropdownItem>Update</DropdownItem>
                          <DropdownItem>Delete</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                        </td>
                        </tr>
                      </tbody>
                     )  
                    })}
                </Table>
              </Card>
            </Col>
            
          </Row>
        </Container>
      </>
    );
  }
}



export default Icons;
