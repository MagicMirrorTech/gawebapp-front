import axios from 'axios'
import Global from "../global";
import AxiosOffline from 'axios-offline'
import LocalForage from "localforage"
const baseURL = Global.url;

class AuthService {
    constructor() {

        let AxiosOfflineAdapter = AxiosOffline({
            defaultAdapter: axios.defaults.adapter, //require, basic adapter
            storageName: "axiosreply", //optional, default: "axios-stack"
            storageDriver: LocalForage.WEBSQL //optional, default: LocalForage.LOCALSTORAGE
        })

        this.service = axios.create({
            timeout: 30000,
            adapter: AxiosOfflineAdapter,
            baseURL,
            withCredentials: true
        })

        this.service.interceptors.response.use(async (response) => {
            if (response.headers.version !== Global.version) {
                await LocalForage.clear()
                return null;
            }else{
                return response;
            }
        }, (error) => {
            return Promise.reject(error.message);
        });

    }
    signup(data) {
        return this.service.post('/signup', data)
    }
    login(data) {
        return this.service.post('/login', data)
    }
    logout() {
        return this.service.get('/logout')
    }

    //clients
    getClients() {
        return this.service.get('/checkclients')
    }
    addClient(data) {
        return this.service.post('/createclient', data)
    }
    updateClient(id, data) {
        return this.service.patch('updateclient/' + id, data)
    }
    deleteClient(data) {
        return this.service.delete(`/deleteclient/${data}`)
    }
    //users
    getUsers() {
        return this.service.get('/getusers')
    }
    addWorker(data) {
        return this.service.post('/addworker', data)
    }
    updateWorker(id, data) {
        return this.service.patch('updateworker/' + id, data)
    }
    deleteWorker(data) {
        return this.service.delete(`/deleteworker/${data}`)
    }

    //estimates
    getEstimates(id = ""){
        return this.service.get('/checkestimates/'+ id)
    }
    getEstimate(id = ""){
        return this.service.get('/estimatedetail/'+ id)
    }
    addEstimate(data) {
        return this.service.post('/addestimate', data)
    }
    decline(data) {
        return this.service.patch(`/estimatedecline/${data}`)
    }
    deleteEstimate(data) {
        return this.service.delete(`/estimatedelete/${data}`)
    }
    sendEstimates(data){
        return this.service.post('/sendestimate', data)
    }
    updateEstimate(id, data) {
        return this.service.patch('/estimateupdate/' + id, data)
    }

    invoiceDelete(id, invoiceId) {
        return this.service.patch(`/invoicedelete/${id}/${invoiceId}`)
    }
    paidInvoice(data) {
        return this.service.patch(`/paidinvoice/${data}`)
    }
    convertInvoice(id, data) {
        return this.service.patch('/convertinvoice/'+ id, data)
    }
    updateInvoice(id, invoiceId, data) {
        return this.service.patch('/invoiceupdate/'+ id +'/' + invoiceId, data)
    }
    payInvoice(id, invoiceId, data) {
        return this.service.patch('/pay-invoice/'+ id +'/' + invoiceId, data)
    }
    sendInvoice(data) {
        return this.service.post('/sendinvoice/', data)
    }

    //jobs
    getJobs(id) {
        if (id){
            return this.service.get('/checkjobs/' + id)
        }else {
            return this.service.get('/checkjobs')
        }
    }
    openJobs() {
        return this.service.get('/openjobs')
    }
    closeJobs(){
        return this.service.get('/closeJobs')
    }
    addJob(data) {
        return this.service.post('/createjob', data)
    }
    convertJob(data) {
        return this.service.get(`/convertjob/${data}`)
    }
    closeJob(data) {
        return this.service.patch(`/closejob/${data}`)
    }
    addWorkers(id, data) {
        return this.service.patch('/addworkers/' + id, data)
    }
    addProjectManager (id, data) {
        return this.service.patch('/addpm/' + id, data)
    }
    addTime (estimateId, workerId, data) {
        return this.service.patch('/addtime/' + estimateId + "/" + workerId, data )
    }
    updateTime (estimateId, workerId, timeId, data) {
        return this.service.patch('/updatetime/' + estimateId + "/" + workerId + "/" + timeId, data )
    }
    removeTime (estimateId, workerId, timeId){
        return this.service.patch('/deletetime/' + estimateId + "/" + workerId + "/" + timeId)
    }
    pullWorker(data) {
        return this.service.patch(`/pullworker/${data}`)
    }

    //expense
    addExpense(id, data) {
        return this.service.patch('/addexpense/' + id, data)
    }
    updateExpense(id, expenseId, data) {
        return this.service.patch('/expenseupdate/' + id + '/' + expenseId, data)
    }
    removeExpense(id, expenseId) {
        return this.service.patch('/expensedelete/' + id + '/' + expenseId)
    }

}

export default AuthService
