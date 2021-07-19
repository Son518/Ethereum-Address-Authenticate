import React, { Component } from "react"
import axios from 'axios'
import Modal from 'react-bootstrap/Modal'
import * as ethUtil from 'ethereumjs-util';
import { Button } from "react-bootstrap"


export default class Login extends Component {
    constructor () {
        super()

        this.state = {
            address:"",
            privateKey: "",
            nonce: "",
            isOpen: false,
            modal_title: "",
            modal_body: ""
        }
        
        this.login = this.login.bind(this)
        this.changeHandler1 = this.changeHandler1.bind(this)
        this.changeHandler2 = this.changeHandler2.bind(this)
        this.showModal = this.showModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
    }

    componentDidMount() {
        // Get the token and set state
        axios.get('http://localhost:3030/token')
        .then(response => {
            console.log(response)
            this.setState({nonce: response.data})
        })
    }

    // Showing Modal
    showModal() {
        this.setState({isOpen: true})
    };

    // Hiding Modal
    hideModal() {
        this.setState({isOpen: false})
    };

    // Signing the message(token) using etheremjs-util
    sign(message, privateKey) {
        //get the Keccak hash of the message. 
        const hashedMessage = ethUtil.keccak(message)
        //Use the ecsign to sign the hash of the message.
        const signature = ethUtil.ecsign(hashedMessage, privateKey)
        return signature
    }

    // Do login with address and privateKey
    login() {
        var myContractAddress = this.state.address, // "0x48b631c30E912dA51A01416B439Cb9427E506fA6",
            token = this.state.nonce.toString(),
            myPrivateKey = this.state.privateKey

        // Convert the private to Buffer
        const privateKey = new Buffer(myPrivateKey, "hex")

        // Convert the token to buffer
        const message = Buffer.from(token, "utf-8");

        // Do signing
        const signature = this.sign(message, privateKey)

        console.log("signature: ", typeof signature)

        // Sending the signature, nonce and address to server to verify.
        axios.post('http://localhost:3030/auth', {
            address: myContractAddress,
            signature: signature,
            nonce: token
        })
        .then(response => {
            console.log(response)
            this.setState({modal_title: "Success", modal_body: response.data})
            this.showModal()
        }).catch(err=> {
            console.log(err)
            this.setState({modal_title: "Error", modal_body: "Authenticate failed!"})
            this.showModal()
        })
    }

    changeHandler1(ev) {
        this.setState({address: ev.target.value})
    }

    changeHandler2(ev) {
        this.setState({privateKey: ev.target.value})
    }

    render() {
        return (
            <>
            <form>
                <h3>Sign In</h3>

                <div className="form-group">
                    <label>Username</label>
                    <input type="text" className="form-control" placeholder="Enter ETH Address" onChange={this.changeHandler1} />
                </div>

                <div className="form-group mt-2">
                    <label>Password</label>
                    <input type="password" className="form-control" placeholder="Enter Key" onChange={this.changeHandler2} />
                </div>

                <button type="button" className="btn btn-primary btn-block mt-2" onClick={this.login}>Submit</button>
            </form>

            <Modal show={this.state.isOpen} onHide={this.hideModal}>
                <Modal.Header>
                    <Modal.Title>{this.state.modal_title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{this.state.modal_body}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.hideModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            </>
        )
    }
}