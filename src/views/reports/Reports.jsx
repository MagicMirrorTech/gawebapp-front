import React from "react";
import {Link} from 'react-router-dom'
import axios from 'axios'
import classnames from 'classnames';

import {
    Card,
    CardHeader,
    Container,
    Row,
    Col,
    Input,
    Form,
    FormGroup,
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";
// core components
import Global, {compareValues} from "../../global";

import Header from "components/Headers/Header.jsx";
import ReportJobs from "./ReportJobs";
import ReportWorkers from "./ReportWorkers";
import PDFViewer from 'pdf-viewer-reactjs';
import CustomNavigation from './Navigation';
import {connect} from "react-redux";
import {getUsers} from "../../redux/actions/userAction"
import {getJobs} from "../../redux/actions/jobAction"

let pdfFile;
class Reports extends React.Component {
    state = {
        jobs: [],
        workers: [],
        activeTab: '1',
        buttonActive: '1',
        modal: false,
        extension: ''
    };

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    toggleModal = () => {
        this.setState({
            modal: !this.state.modal
        })
    };

    handleExpenseOpenModal = (url) => {
        this.setState(prevState => {
            let img = url;
            if (img !== '') {
                img = img.replace("http", "https");
                pdfFile = img;
            }
            return {
                ...prevState,
                img: img,
                modal: true,
                extension: img === '' ? '' : img.substring(img.length - 3, img.length).toLowerCase()
            }
        })
    }

    handleOpenModal = (estimateId, expenseId) => {
        const job = this.props.jobs.filter(item => item._id === this.props.match.params.estimateId)[0]
        this.setState(prevState => {
            let img = '';
            const expenses = job.expenses
            expenses.map((e, i) => {
                if (e._id === expenseId) {
                    img = e.img
                }
                return {img}
            })
            if (img !== '') {
                img = img.replace("http", "https");
                pdfFile = img
            }

            return {
                ...prevState,
                img: img,
                modal: true,
                extension: img === '' ? '' : img.substring(img.length - 3, img.length).toLowerCase()
            }
        });

    }

    handleInput = e => {
        e.persist()
        this.setState(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }

    updateWindowDimensions = () => {
        this.setState(prevState => {
            return {...prevState, isMobileVersion: (window.innerWidth < Global.mobileWidth)}
        })
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions)
    }

    componentDidMount(props) {
        this.updateWindowDimensions()
        window.addEventListener('resize', this.updateWindowDimensions)

        if (this.props.jobs.length === 0) this.props.getJobs()
        if (this.props.users.length === 0 ) this.props.getUsers()

        this.setState(prevState => {
            return {
                ...prevState,
                jobs: this.props.jobs.filter(job => job.status === 'Approve'),
                workers: this.workersTransformer(
                    this.props.users.filter(user => user.role === "WORKER" ||
                    user.role ==="PROJECT MANAGER" ||
                    user.role ==="ADMIN"))
            }
        })
    }

    getOpen = () => {
        this.setState(prevState => {
            return {
                ...prevState,
                buttonActive: "1",
                jobs: this.props.jobs.filter(job => job.status === 'Approve')
            }
        })
    }

    getClose = () => {
        this.setState(prevState => {
            return {
                ...prevState,
                buttonActive: "2",
                jobs: this.props.jobs.filter(job => job.status === 'Closed')
            }
        })
    }

    getAll = () => {
        this.setState(prevState => {
            return {
                ...prevState,
                buttonActive: "3",
                jobs: this.props.jobs
            }
        })
     }

    filterDate = () => {
        let dates = {"startDate": this.state.startDate, "endDate": this.state.endDate}
        console.log('los params', dates)
        axios
            .post(Global.url + `filterdate`, this.state)
            .then(({data}) => {

                console.log(data);

                this.setState(prevState => {
                    return {
                        ...prevState,
                        jobs: data.jobs,
                        workers: this.workersTransformer(data.workers)
                    }


                })
                console.log("State filtrado", this.state)
            })
            .catch(err => {
                console.log(err)
            })
    }

    clearFilter = () => {

        this.setState(prevState => {
            return {
                ...prevState,
                buttonActive: "1",
                activeTab: "1",
                jobs: this.props.jobs.filter(job => job.status === 'Approve'),
                workers: this.workersTransformer(
                    this.props.users.filter(user => user.role === "WORKER" ||
                        user.role ==="PROJECT MANAGER" ||
                        user.role ==="ADMIN"))
            }
        })

        document.getElementById("startDate").value = "";
        document.getElementById("endDate").value = "";
    }

    workersTransformer(users) {
        users.sort(compareValues('name', 'asc'))
        users.forEach(user => {
            let hoursPerJob = []
            let hoursFull = []

            user.jobs = []
            user.totalPayroll = []
            user.totalEffective = []
            user.totalHours = []

            user.proccessJobs = []

            user.works.sort(compareValues('date', 'desc')).forEach((work, i) => {
                work.time.sort(compareValues('date', 'desc')).forEach((time, i) => {
                    hoursFull.push({hoursT: time.hours, date: time.date})
                    hoursPerJob.push({
                        works: work._id ? work._id : work.workId._id,
                        time: time.hours,
                        date: time.date,
                        hours: hoursFull
                    })
                })
            })

            user.works.sort(compareValues('date', 'desc')).forEach(works => {
                if (works.workId instanceof Array) { //search
                    works.workId.sort(compareValues('date', 'desc')).forEach(work => {
                        if (works.time.length > 0) {
                            hoursPerJob.forEach(hoursTime => {
                                if (hoursTime.works === work._id) {
                                    user.jobs.push({
                                        date: hoursTime.date,
                                        jobName: work.jobName,
                                        hours: hoursTime.time,
                                        hoursT: hoursTime.time,
                                        payroll: user.payment * hoursTime.time,
                                        effective: user.effective * hoursTime.time,
                                    });

                                }
                            });
                        }
                    });

                } else {
                    if (works.workId && works.workId.workers) {
                        works.workId.workers.sort(compareValues('date', 'desc')).forEach(worker => {
                            if (worker.workerId && worker.workerId._id === user._id) {
                                hoursPerJob.forEach(hoursTime => {
                                    if ((hoursTime.works === works._id) || (works.workId && hoursTime.works === works.workId._id)) {
                                        user.jobs.push({
                                            date: hoursTime.date,
                                            jobName: works.workId.jobName,
                                            hours: hoursTime.time,
                                            hoursT: hoursTime.time,
                                            payroll: user.payment * hoursTime.time,
                                            effective: user.effective * hoursTime.time,
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });
            user.jobs.forEach((e, i) => {
                user.totalPayroll.push(e.payroll)
                user.totalEffective.push(e.effective)
                user.totalHours.push(e.hours)
            })
        })
        return users;
    }

    render() {
        if (!this.state) return <p>Loading</p>
        return (
            <>
                <Header/>
                {/* Page content */}
                <Container className="mt--7" fluid>
                    <Row className="mt-5">
                        <Col className="mb-5 mb-xl-0" xl="12">
                            <Card className="shadow">
                                <CardHeader className="border-0">
                                    <Row className="align-items-center">
                                        <div className="col">
                                            <h3 className="mb-0">Reports</h3>
                                        </div>
                                        <div className="col text-right">
                                            <Link to="addreport">
                                                <p color="primary"
                                                   size="sm">
                                                    Create a Report
                                                </p>
                                            </Link>

                                        </div>
                                    </Row>
                                </CardHeader>

                                <Form className="card-header">
                                    <Row form>
                                        <Col md={4}>
                                            <FormGroup>
                                                <label
                                                    className="form-control-label"
                                                    htmlFor="input-dateStart">
                                                    From Date
                                                </label>
                                                <Input
                                                    name="startDate"
                                                    className="form-control-alternative"
                                                    type="date"
                                                    id="startDate"
                                                    onChange={this.handleInput}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                            <FormGroup>
                                                <label
                                                    className="form-control-label"
                                                    htmlFor="input-dateStart">
                                                    Up to Date
                                                </label>
                                                <Input
                                                    name="endDate"
                                                    id="endDate"
                                                    className="form-control-alternative"
                                                    type="date"
                                                    onChange={this.handleInput}
                                                />

                                            </FormGroup>
                                        </Col>
                                        <Col md={2} lg={2} xl={2} xs={3} sm={2}>
                                            <FormGroup>
                                                <label
                                                    className="form-control-label"
                                                    htmlFor="input-dateStart">
                                                    &nbsp;</label>
                                                <br/>
                                                <Button
                                                    className="form-control-alternative"
                                                    color="info"
                                                    onClick={this.filterDate}>
                                                    <i className="fa fa-search"></i> {this.state.isMobileVersion ? '' : 'Search'}
                                                </Button>
                                            </FormGroup>
                                        </Col>
                                        <Col md={2} lg={1} xl={2} xs={2} sm={2}>
                                            <FormGroup>
                                                <label
                                                    className="form-control-label"
                                                    htmlFor="input-dateStart"
                                                >&nbsp;</label>
                                                <br/>
                                                <Button
                                                    className="form-control-alternative"
                                                    color="info"
                                                    onClick={this.clearFilter}>
                                                    <i className="fa fa-trash"></i> {this.state.isMobileVersion ? '' : 'Clear'}
                                                </Button>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Form>
                                <Form className="card-header">

                                    <Row form>
                                        {this.state.activeTab === '1' ?
                                            <Col md={12}>
                                                <FormGroup>
                                                    <label
                                                        className="form-control-label"
                                                        htmlFor="input-dateStart">
                                                        Filter By Jobs
                                                    </label>
                                                    <br/>
                                                    <span>
                                                    <Button
                                                        className="form-control-alternative"
                                                        color={this.state.buttonActive === "1" ? "info" : "secondary"}
                                                        onClick={this.getOpen}>
                                                        {!this.state.isMobileVersion ? 'Open' : <small>Open</small>}
                                                    </Button>
                                                    <Button
                                                        className="form-control-alternative"
                                                        color={this.state.buttonActive === "2" ? "info" : "secondary"}
                                                        onClick={this.getClose}>
                                                        {!this.state.isMobileVersion ? 'Close' : <small>Close</small>}
                                                    </Button>
                                                    <Button
                                                        className="form-control-alternative"
                                                        color={this.state.buttonActive === "3" ? "info" : "secondary"}
                                                        onClick={this.getAll}>
                                                        {!this.state.isMobileVersion ? 'All' : <small>All</small>}
                                                    </Button>
                                                </span>
                                                </FormGroup>
                                            </Col>
                                            : null
                                        }
                                    </Row>
                                </Form>

                                <Nav tabs>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({active: this.state.activeTab === '1'})}
                                            onClick={() => {
                                                this.toggleTab('1');
                                            }}>
                                            P&L
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({active: this.state.activeTab === '2'})}
                                            onClick={() => {
                                                this.toggleTab('2');
                                            }}>
                                            Workers
                                        </NavLink>
                                    </NavItem>
                                </Nav>

                                <TabContent activeTab={this.state.activeTab}>
                                    <TabPane tabId="1">
                                        <ReportJobs jobs={this.state.jobs} openModal={this.handleOpenModal}
                                                    isMobileVersion={this.state.isMobileVersion}/>
                                    </TabPane>
                                    <TabPane tabId="2">
                                        <ReportWorkers workers={this.state.workers}
                                                       openModal={this.handleExpenseOpenModal}
                                                       isMobileVersion={this.state.isMobileVersion}/>
                                    </TabPane>
                                </TabContent>
                            </Card>
                        </Col>
                    </Row>
                </Container>
                <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                    <ModalHeader toggle={this.toggleModal}> Expense detail</ModalHeader>
                    <ModalBody>
                        {this.state.img && this.state.extension !== 'pdf' ?
                            <img width="100%" height="100%" src={this.state.img} alt="photo_url"/>
                            : null
                        }

                        {this.state.img && this.state.extension === 'pdf' ?
                            <PDFViewer
                                document={{
                                    url: pdfFile,
                                }}
                                navigation={CustomNavigation}
                            />
                            : null
                        }

                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggleModal}>Close</Button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}


const mapStateToProps = state => ({
    users: state.user.users,
    jobs: state.job.jobs
})

export default connect(mapStateToProps, {getUsers, getJobs})(Reports);
